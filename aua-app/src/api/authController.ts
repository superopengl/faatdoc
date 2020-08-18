
import { getRepository, getManager, getConnection } from 'typeorm';
import { User } from '../entity/User';
import { assert, assertRole } from '../utils/assert';
import { validatePasswordStrength } from '../utils/validatePasswordStrength';
import * as _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { UserStatus } from '../enums/UserStatus';
import { computeUserSecret } from '../utils/computeUserSecret';
import { BusinessProfile } from '../entity/BusinessProfile';
import { IndividualProfile } from '../entity/IndividualProfile';
import { handlerWrapper } from '../utils/asyncHandler';
import { createProfileImageEntities } from '../utils/createProfileImageEntities';
import { createBusinessProfileEntity } from '../utils/createBusinessProfileEntity';
import { createIndividualProfileEntity } from '../utils/createIndividualProfileEntity';
import { sendEmail } from '../services/emailService';
import { getForgotPasswordHtmlEmail, getForgotPasswordTextEmail, getSignUpHtmlEmail, getSignUpTextEmail } from '../utils/emailTemplates';
import * as moment from 'moment';
import { logError } from '../utils/logger';
import { getUtcNow } from '../utils/getUtcNow';

function getMembershipExpirationDate() {
  const theYear = moment().year();
  const expiryYear =  theYear <= 2021 ? moment('2021-12-31') : moment();
  return expiryYear.endOf('year').toDate();
}

export const login = handlerWrapper(async (req, res) => {
  const { name, password } = req.body;

  const repo = getRepository(User);

  const user: User = await repo
    .createQueryBuilder()
    .where(
      '(LOWER("memberId") = LOWER(:name) OR LOWER(email) = LOWER(:name)) AND status != :status',
      {
        name,
        status: UserStatus.Disabled
      })
    .getOne();
  assert(user, 400, 'User or password is not valid');

  // Validate passpord
  const hash = computeUserSecret(password, user.salt);
  assert(hash === user.secret, 400, 'User or password is not valid');

  // Reissue session
  const utcNow = getUtcNow();
  user.sessionId = uuidv4();
  user.lastLoggedInAt = utcNow;
  user.lastNudgedAt = utcNow;
  user.resetPasswordToken = null;
  user.status = UserStatus.Enabled;

  await repo.save(user);

  const returnedUser = _.pick(user, ['id', 'email', 'memberId', 'role', 'sessionId', 'lastLoggedInAt', 'expiryDate', 'status']);
  res.json(returnedUser);
});

export const logout = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'business', 'individual');
  const { user: { id } } = req as any;
  const repo = getRepository(User);
  await repo.update({ id: id }, { sessionId: null });

  res.json();
});

async function nextSequence(sequenceName): Promise<string> {
  const number = await getManager()
    .query(`SELECT nextval('${sequenceName}')`);

  return `${number[0].nextval}`.padStart(4, '0');
}

async function nextIndividualMemberId() {
  const number = await nextSequence('individual_member_id');
  return `ME${number}`;
}


async function nextBusinessMemberId() {
  const number = await nextSequence('business_member_id');
  return `BU${number}`;
}

function createUserEntity(payload, role, memberId): User {
  const { email, password } = payload;
  validatePasswordStrength(password);

  const id = uuidv4();
  const salt = uuidv4();

  const user = new User();
  user.id = id;
  user.email = email.toLowerCase();
  user.memberId = memberId.toUpperCase();
  user.secret = computeUserSecret(password, salt);
  user.salt = salt;
  user.role = role;
  user.status = UserStatus.Enabled;
  user.expiryDate = getMembershipExpirationDate();

  return user;
}

async function createBusinessUser(payload, specifiedMemberId = null): Promise<{ user: User, profile: BusinessProfile }> {
  const memberId = specifiedMemberId || await nextBusinessMemberId();
  const user = createUserEntity(payload, 'business', memberId);
  const profile = createBusinessProfileEntity(user.id, payload);
  const profileImages = createProfileImageEntities(user.id, payload.pictures);

  await getManager().transaction(async manager => {
    await manager.save([user, profile, ...profileImages]);
  });

  return { user, profile };
}

async function createIndividualUser(payload, specifiedMemberId = null): Promise<{ user: User, profile: IndividualProfile }> {
  const memberId = specifiedMemberId || await nextIndividualMemberId();
  const user = createUserEntity(payload, 'individual', memberId);
  const profile = createIndividualProfileEntity(user.id, payload);
  const profileImages = createProfileImageEntities(user.id, payload.pictures);

  await getManager().transaction(async manager => {
    await manager.save([user, profile, ...profileImages]);
  });

  return { user, profile };
}


export const signup = handlerWrapper(async (req, res) => {
  const payload = req.body;
  const { type } = req.query;
  assert(type, 400, `'type' query parameter is missing`);
  const isBusiness = type === 'business';
  const isIndividual = type === 'individual';
  assert(isBusiness || isIndividual, 400, `Unsupported type ${type}`);

  const isAdmin = _.get(req, 'user.role') === 'admin';
  const isGuest = _.get(req, 'user') === undefined;
  assert(isAdmin && /(ME|BU)[0-9]{4}/i.test(payload.memberId), 400, 'Invalid member ID');

  const canSignUp = isGuest || isAdmin;

  // payload.email = payload.email.toLowerCase();
  const specifiedMemberId = isAdmin ? payload.memberId : null;
  let result;
  if (type === 'business') {
    result = await createBusinessUser(payload, specifiedMemberId);
  } else if (type === 'individual') {
    result = await createIndividualUser(payload, specifiedMemberId);
  } else {
    assert(false, 500, 'Invalid code path');
  }

  const { user: { id, email, memberId, expiryDate }, profile: { name } } = result;

  const url = process.env.AUA_DOMAIN_NAME;
  // Non-blocking sending email
  sendEmail({
    subject: 'Welcome to AUA Allied',
    to: email,
    htmlBody: getSignUpHtmlEmail(name, memberId, url, expiryDate),
    textBody: getSignUpTextEmail(name, memberId, url, expiryDate),
    shouldBcc: true
  }).catch(err => logError(err, req, res, 'error at sending out email'));

  const info = {
    id,
    email,
    memberId
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

  const { id, role, memberId } = user;

  const resetPasswordToken = uuidv4();
  user.resetPasswordToken = resetPasswordToken;
  user.status = UserStatus.ResetPassword;

  let name = '';
  switch (role) {
    case 'business':
      name = (await getRepository(BusinessProfile).findOne(id)).name;
      break;
    case 'individual':
      name = (await getRepository(IndividualProfile).findOne(id)).name;
      break;
    default:
      break;
  }

  const url = `${process.env.AUA_DOMAIN_NAME}/reset_password/${resetPasswordToken}/`;
  await sendEmail({
    subject: 'Forgot Password',
    to: email,
    htmlBody: getForgotPasswordHtmlEmail(name, memberId, url),
    textBody: getForgotPasswordTextEmail(name, memberId, url),
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