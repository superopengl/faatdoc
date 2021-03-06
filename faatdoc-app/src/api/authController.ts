
import { getRepository, getConnection } from 'typeorm';
import { User } from '../entity/User';
import { assert, assertRole } from '../utils/assert';
import { validatePasswordStrength } from '../utils/validatePasswordStrength';
import * as _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { UserStatus } from '../types/UserStatus';
import { computeUserSecret } from '../utils/computeUserSecret';
import { handlerWrapper } from '../utils/asyncHandler';
import { sendEmail } from '../services/emailService';
import { getUtcNow } from '../utils/getUtcNow';
import { Role } from '../types/Role';
import * as jwt from 'jsonwebtoken';
import { attachJwtCookie, clearJwtCookie } from '../utils/jwt';
import { getEmailRecipientName } from '../utils/getEmailRecipientName';

export const getAuthUser = handlerWrapper(async (req, res) => {
  const { user } = (req as any);
  res.json(user || null);
});

async function getLoginUser(email) {
  const repo = getRepository(User);
  const user: User = await repo
    .createQueryBuilder()
    .where(
      'LOWER(email) = LOWER(:email) AND status != :status',
      {
        email,
        status: UserStatus.Disabled
      })
    .getOne();
  return user;
}

function sanitizeUser(user: User) {
  return _.pick(user, ['id', 'email', 'givenName', 'surname', 'role', 'lastLoggedInAt', 'status', 'loginType']);
}

export const login = handlerWrapper(async (req, res) => {
  const { name, password } = req.body;

  const user = await getLoginUser(name);

  assert(user, 400, 'User or password is not valid');

  // Validate passpord
  const hash = computeUserSecret(password, user.salt);
  assert(hash === user.secret, 400, 'User or password is not valid');

  user.lastLoggedInAt = getUtcNow();
  user.resetPasswordToken = null;
  user.status = UserStatus.Enabled;

  await getRepository(User).save(user);

  attachJwtCookie(user, res);

  res.json(sanitizeUser(user));
});

export const logout = handlerWrapper(async (req, res) => {
  clearJwtCookie(res);
  res.json();
});


function createUserEntity(email, password, role): User {
  validatePasswordStrength(password);
  assert([Role.Client, Role.Agent].includes(role), 400, `Unsupported role ${role}`);

  const id = uuidv4();
  const salt = uuidv4();

  const user = new User();
  user.id = id;
  user.email = email.toLowerCase();
  user.secret = computeUserSecret(password, salt);
  user.salt = salt;
  user.role = role;
  user.status = UserStatus.Enabled;

  return user;
}


async function createNewLocalUser(payload): Promise<User> {
  const { email, password, role } = payload;
  const user = createUserEntity(email, password, role);

  const repo = getRepository(User);
  await repo.save(user);

  return user;
}


export const signin = handlerWrapper(async (req, res) => {
  const payload = req.body;

  const result = await createNewLocalUser(payload);

  const { id, email } = result;

  // Non-blocking sending email
  sendEmail({
    template: 'welcome',
    to: email,
    vars: {
      email
    },
    shouldBcc: true
  });

  const info = {
    id,
    email
  };

  res.json(info);
});

async function setUserToResetPasswordStatus(user: User) {
  const userRepo = getRepository(User);
  const resetPasswordToken = uuidv4();
  user.resetPasswordToken = resetPasswordToken;
  user.status = UserStatus.ResetPassword;

  const url = `${process.env.AUA_DOMAIN_NAME}/reset_password/${resetPasswordToken}/`;
  await sendEmail({
    to: user.email,
    template: 'resetPassword',
    vars: {
      toWhom: getEmailRecipientName(user),
      url
    },
    shouldBcc: false
  });

  await userRepo.save(user);
}

export const forgotPassword = handlerWrapper(async (req, res) => {
  const email = req.body.email.toLowerCase();
  const userRepo = getRepository(User);
  const user = await userRepo.findOne({ email });
  if (!user) {
    res.json();
    return;
  }

  await setUserToResetPasswordStatus(user);

  res.json();
});

export const resetPassword = handlerWrapper(async (req, res) => {
  const { token, password } = req.body;
  validatePasswordStrength(password);

  const salt = uuidv4();
  const secret = computeUserSecret(password, salt);

  await getConnection()
    .createQueryBuilder()
    .update(User)
    .set({
      secret,
      salt,
      resetPasswordToken: null,
      status: UserStatus.Enabled
    })
    .where({
      resetPasswordToken: token,
      status: UserStatus.ResetPassword
    })
    .execute();

  res.json();
});

export const retrievePassword = handlerWrapper(async (req, res) => {
  const { token } = req.params;
  assert(token, 400, 'Invalid token');

  const userRepo = getRepository(User);
  const user = await userRepo.findOne({ resetPasswordToken: token });

  assert(user, 401, 'Token expired');

  const url = `${process.env.AUA_DOMAIN_NAME}/reset_password?token=${token}`;
  res.redirect(url);
});

export const impersonate = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { email } = req.body;
  assert(email, 400, 'Invalid email');

  const user = await getLoginUser(email);

  assert(user, 404, 'User not found');

  attachJwtCookie(user, res);

  res.json(sanitizeUser(user));
});

export const handleInviteUser = async user => {
  const resetPasswordToken = uuidv4();
  user.resetPasswordToken = resetPasswordToken;
  user.status = UserStatus.ResetPassword;

  const url = `${process.env.AUA_DOMAIN_NAME}/reset_password/${resetPasswordToken}/`;
  await sendEmail({
    to: user.email,
    template: 'inviteUser',
    vars: {
      toWhom: getEmailRecipientName(user),
      email: user.email,
      url
    },
    shouldBcc: false
  });

  await getRepository(User).save(user);
}

export const inviteUser = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { email, role } = req.body;
  assert(email, 400, 'Invalid email');

  const existingUser = await getLoginUser(email);
  assert(!existingUser, 400, 'User exists');

  const user = createUserEntity(email, uuidv4(), role || 'client');

  await handleInviteUser(user);

  res.json();
});

async function decodeEmailFromGoogleToken(token) {
  assert(token, 400, 'Empty code payload');
  const secret = process.env.AUA_GOOGLE_SSO_CLIENT_SECRET;
  const decoded = jwt.decode(token, secret);
  const { email, given_name: givenName, family_name: surname } = decoded;
  assert(email, 400, 'Invalid Google token');
  return {email, givenName, surname};
}

export const ssoGoogle = handlerWrapper(async (req, res) => {
  const { token } = req.body;

  const {email, givenName, surname} = await decodeEmailFromGoogleToken(token);

  const repo = getRepository(User);
  let user = await repo
    .createQueryBuilder()
    .where(
      'LOWER(email) = LOWER(:email)',
      { email })
    .getOne();


  if (!user) {
    user = createUserEntity(email, uuidv4(), 'client');
    user.status = UserStatus.Enabled;
  }

  user.givenName = givenName || user.givenName;
  user.surname = surname || user.surname;
  user.loginType = 'google';
  user.lastLoggedInAt = getUtcNow();
  user.lastNudgedAt = getUtcNow();

  await getRepository(User).save(user);

  attachJwtCookie(user, res);

  res.json(sanitizeUser(user));
});