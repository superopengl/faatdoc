
import { getRepository, getManager, getConnection } from 'typeorm';
import { User } from '../entity/User';
import { assert, assertRole } from '../utils/assert';
import { validatePasswordStrength } from '../utils/validatePasswordStrength';
import * as _ from 'lodash';
import { computeUserSecret } from '../utils/computeUserSecret';
import { Profile } from '../entity/Profile';
import { handlerWrapper } from '../utils/asyncHandler';
import { Role } from '../enums/Role';
import { ProfileImage } from '../entity/ProfileImage';
import { createProfileImageEntities } from '../utils/createProfileImageEntities';
import { createProfileEntity } from '../utils/createProfileEntity';
import { File } from '../entity/File';
import { v4 as uuidv4 } from 'uuid';


export const getProfile = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client');
  const { id, role } = (req as any).user as User;

  const profileRepo = getRepository(Profile);
  const profile = await profileRepo.findOne(id);

  res.json(profile);
});


export const updateProfile = handlerWrapper(async (req, res) => {
  assertRole(req, 'client');
  const { id, role } = (req as any).user as User;
  const payload = req.body;

  const userId = id;

  const profile = createProfileEntity(userId, payload);
  const profileImages = createProfileImageEntities(userId, payload.pictures);

  await getManager().transaction(async manager => {
    await manager.getRepository(ProfileImage).delete({ userId });
    await manager.save([profile, ...profileImages]);
  });

  res.json();
});

export const changePassword = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client');
  const { password, newPassword } = req.body;
  validatePasswordStrength(newPassword);

  const { user } = req as any;
  assert(password && newPassword && user.secret === computeUserSecret(password, user.salt), 400, 'Invalid password');

  const repo = getRepository(User);
  const newSalt = uuidv4();
  const newSecret = computeUserSecret(newPassword, newSalt);
  await repo.update(user.id, { secret: newSecret, salt: newSalt });

  res.json();
});

export const listClients = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');

  const clients = await getConnection()
    .createQueryBuilder()
    .from(User, 'u')
    .innerJoin(q => q.from(Profile, 'p').select('*'), 'p', 'u.id = p.id')
    .select([
      `u.id as id`,
      `"email"`,
      `"givenName"`,
      `"surname"`,
      `"company"`,
      `"createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Australia/Sydney'`,
      `"lastLoggedInAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Australia/Sydney'`,
      `"lastUpdatedAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Australia/Sydney'`,
      `"status"`,
      `"phone"`,
      `"tfn"`,
      `"abn"`,
      `"acn"`,
      `"address"`,
      `"dob"`,
      `"gender"`,
      `"remark"`,
      `"wechat"`,
      `"occupation"`,
      `"industry"`,
    ])
    .execute();

  res.json(clients);
});