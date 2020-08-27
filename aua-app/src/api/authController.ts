
import { getRepository, getManager, getConnection } from 'typeorm';
import { User } from '../entity/User';
import { assert, assertRole } from '../utils/assert';
import { validatePasswordStrength } from '../utils/validatePasswordStrength';
import * as _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { UserStatus } from '../enums/UserStatus';
import { computeUserSecret } from '../utils/computeUserSecret';
import { Portofolio } from '../entity/Portofolio';
import { handlerWrapper } from '../utils/asyncHandler';
import { createProfileEntity } from '../utils/createProfileEntity';
import { sendEmail } from '../services/emailService';
import { getForgotPasswordHtmlEmail, getForgotPasswordTextEmail, getSignUpHtmlEmail, getSignUpTextEmail } from '../utils/emailTemplates';
import * as moment from 'moment';
import { logError } from '../utils/logger';
import { getUtcNow } from '../utils/getUtcNow';
import { Role } from '../enums/Role';

export const getAuthUser = handlerWrapper(async (req, res) => {
  const { user } = (req as any);
  res.json(user || null);
});


export const login = handlerWrapper(async (req, res) => {
  const user: User = {
    ...req.user,
    lastLoggedInAt: getUtcNow(),
    resetPasswordToken: null,
    status: UserStatus.Enabled
  };


  await getRepository(User).save(user);

  res.cookie('session', user.sessionId, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    expires: moment(getUtcNow()).add(24, 'hours').toDate()
  });

  const returnedUser = _.pick(user, ['id', 'email', 'memberId', 'role', 'sessionId', 'lastLoggedInAt', 'expiryDate', 'status']);
  res.json(returnedUser);
});

export const logout = handlerWrapper(async (req, res) => {
  const { user: { id } } = req as any;
  const repo = getRepository(User);
  repo.update({ id: id }, { sessionId: null }).catch(() => { });
  res.clearCookie('session');
  res.json();
});


function createUserEntity(payload): User {
  const { email, password, role } = payload;
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


async function createUser(payload): Promise<User> {
  const user = createUserEntity(payload);

  const repo = getRepository(User);
  await repo.save(user);

  return user;
}


export const signup = handlerWrapper(async (req, res) => {
  const payload = req.body;

  const result = await createUser(payload);

  const { id, email } = result;

  const name = `user`;
  const url = process.env.AUA_DOMAIN_NAME;
  // Non-blocking sending email
  sendEmail({
    subject: 'Welcome to AU Accounting Office',
    to: email,
    htmlBody: getSignUpHtmlEmail(name, url),
    textBody: getSignUpTextEmail(name, url),
    shouldBcc: true
  }).catch(err => logError(err, req, res, 'error at sending out email'));

  const info = {
    id,
    email
  };

  res.json(info);
});

export const forgotPassword = handlerWrapper(async (req, res) => {
  const email = req.body.email.toLowerCase();
  const userRepo = getRepository(User);
  const user = await userRepo.findOne({ email });
  if (!user) {
    res.json();
    return;
  }

  const { id, role } = user;

  const resetPasswordToken = uuidv4();
  user.resetPasswordToken = resetPasswordToken;
  user.status = UserStatus.ResetPassword;

  const { fields: { givenName, surname } } = await getRepository(Portofolio).findOne(id);
  const name = `${givenName} ${surname}`;

  const url = `${process.env.AUA_DOMAIN_NAME}/reset_password/${resetPasswordToken}/`;
  await sendEmail({
    subject: 'Forgot Password',
    to: email,
    htmlBody: getForgotPasswordHtmlEmail(name, url),
    textBody: getForgotPasswordTextEmail(name, url),
    shouldBcc: false
  });

  await userRepo.save(user);

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