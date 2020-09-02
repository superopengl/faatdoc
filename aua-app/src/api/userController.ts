
import { getRepository, getManager, getConnection } from 'typeorm';
import { User } from '../entity/User';
import { assert, assertRole } from '../utils/assert';
import { validatePasswordStrength } from '../utils/validatePasswordStrength';
import * as _ from 'lodash';
import { computeUserSecret } from '../utils/computeUserSecret';
import { Portofolio } from '../entity/Portofolio';
import { handlerWrapper } from '../utils/asyncHandler';
import { Role } from '../enums/Role';
import { createProfileEntity } from '../utils/createProfileEntity';
import { File } from '../entity/File';
import { v4 as uuidv4 } from 'uuid';
import { Agent } from '../entity/Agent';
import { UserStatus } from '../enums/UserStatus';
import { UserRole } from 'aws-sdk/clients/workmail';
import { Lodgement } from '../entity/Lodgement';

export const getProfile = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client');
  const { id, role } = (req as any).user as User;

  const profileRepo = getRepository(Portofolio);
  const profile = await profileRepo.findOne(id);

  res.json(profile);
});


export const updateProfile = handlerWrapper(async (req, res) => {
  assertRole(req, 'client');
  const { id, role } = (req as any).user as User;
  const payload = req.body;

  const userId = id;

  const profile = createProfileEntity(userId, payload);

  await getManager().transaction(async manager => {
    // await manager.getRepository(ProfileImage).delete({ userId });
    await manager.save([profile]);
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
  assertRole(req, 'admin', 'agent');

  const list = await getConnection()
    .createQueryBuilder()
    .from(User, 'u')
    .where(`u.status != :status`, {status: UserStatus.Disabled})
    .where(`u.role = :role`, {role: 'client'})
    .leftJoin(q => q.from(Portofolio, 'p').select('*'), 'p', 'u.id = p."userId"')
    .leftJoin(l => l.from(Lodgement, 'l').select('*'), 'l', 'p.id = l."portofolioId"')
    .select([
      `u.id AS id`,
      `u.email AS email`,
      `u."lastLoggedInAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Australia/Sydney' AS "lastLoggedInAt"`,
    ])
    .execute();

  res.json(list);
});


export const listAgents = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');

  const clients = await getConnection()
    .createQueryBuilder()
    .from(User, 'u')
    .innerJoin(q => q.from(Agent, 'a').select('*'), 'a', 'u.id = a.id')
    .select([
      `u.id as id`,
      `u.email as email`,
      `a."givenName" as "givenName"`,
      `a.surname as surname`,
    ])
    .execute();

  res.json(clients);
});
