
import { getRepository, Not, IsNull } from 'typeorm';
import { User } from '../entity/User';
import { assert, assertRole } from '../utils/assert';
import * as _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { Portofolio } from '../entity/Portofolio';
import { handlerWrapper } from '../utils/asyncHandler';
import { getUtcNow } from '../utils/getUtcNow';
import { JobTemplate } from '../entity/JobTemplate';
import { Notification } from '../entity/Notification';
import { restartCronService } from '../services/cronService';
import { Lodgement } from '../entity/Lodgement';

export const listNotification = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const role = req.user.role;
  const filter: any = {};
  switch (role) {
    case 'client':
      filter.clientUserId = req.user.id;
      break;
    case 'agent':
      filter.agentUserId = req.user.id;
      break;
    default:
      break;
  }

  const list = await getRepository(Notification)
    .createQueryBuilder('x')
    .where(filter)
    .orderBy('"createdAt"', 'DESC')
    .select([
      'id',
      '"createdAt"',
      'content',
      '"readAt"'
    ])
    .execute();

  res.json(list);
});

export const getNotification = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { id } = req.params;
  const { user: { id: userId, role } } = req;
  const repo = getRepository(Notification);
  const query: any = { id };
  const isClient = role === 'client';
  if (isClient) {
    query.clientUserId = userId;
  }

  const result = await repo.createQueryBuilder('x')
    .where(query)
    .innerJoin(q => q.from(Lodgement, 'l').select('*'), 'l', `l.id = x.lodgementId`)
    .select([
      `x.id as id`,
      `x.content as content`,
      `x."createdAt" as "createdAt"`,
      `x."readAt" as "readAt"`,
      `x."lodgementId" as "lodgementId"`,
      `l."name" as name`,
      `l."forWhom" as "forWhom"`,
    ])
    .execute();

  const item = result[0];
  assert(item, 404);

  if (isClient) {
    await repo.update(query, { readAt: getUtcNow() });
  }

  res.json(item);
});

export const getNotificationUnreadCount = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const repo = getRepository(Notification);
  const query: any = {
    readAt: IsNull()
  };
  if (req.user.role === 'client') {
    query.clientUserId = req.user.id;
  }

  const count = await repo.count(query);

  res.json(count);
});