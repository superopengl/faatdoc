
import { getRepository, IsNull } from 'typeorm';
import { Lodgement } from '../entity/Lodgement';
import { Notification } from '../entity/Notification';
import { assert, assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { getUtcNow } from '../utils/getUtcNow';

async function listNotificationForClient(clientId) {
  const list = await getRepository(Notification)
    .createQueryBuilder('x')
    .where({ clientUserId: clientId, deleted: false })
    .orderBy('"createdAt"', 'DESC')
    .select([
      'id',
      '"createdAt"',
      'content',
      '"readAt"'
    ])
    .execute();
  return list;
}

async function listNotificationForAgent(agentId) {
  const list = await getRepository(Notification)
    .createQueryBuilder('x')
    .where({ agentUserId: agentId, deleted: false })
    .innerJoin(q => q.from(Lodgement, 'l').select('*'), 'l', `l.id = x."lodgementId"`)
    .orderBy('"createdAt"', 'DESC')
    .select([
      'x.id as id',
      'x."createdAt" as "createdAt"',
      'l.id as "lodgementId"',
      'l."forWhom" as "forWhom"',
      'l.name as name',
      'content',
      '"readAt"'
    ])
    .execute();
  return list;
}

async function listNotificationForAdmin() {
  const list = await getRepository(Notification)
    .createQueryBuilder('x')
    .where({deleted: false})
    .innerJoin(q => q.from(Lodgement, 'l').select('*'), 'l', `l.id = x."lodgementId"`)
    .orderBy('"createdAt"', 'DESC')
    .select([
      'x.id as id',
      'x."createdAt" as "createdAt"',
      'l.id as "lodgementId"',
      'l."forWhom" as "forWhom"',
      'l.name as name',
      'content',
      '"readAt"'
    ])
    .execute();
  return list;
}

export const listNotification = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { user: { id, role } } = req as any;
  let list: Promise<any>;
  switch (role) {
    case 'client':
      list = await listNotificationForClient(id);
      break;
    case 'agent':
      list = await listNotificationForAgent(id);
      break;
    case 'admin':
      list = await listNotificationForAdmin();
      break;
    default:
      assert(false, 500, `Unsupported role ${role}`);
  }

  res.json(list);
});

export const getNotification = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { id } = req.params;
  const { user: { id: userId, role } } = req as any;
  const repo = getRepository(Notification);
  const query: any = { id, deleted: false };
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
  const {user: {role, id}} = req as any;
  const query: any = {
    deleted: false,
    readAt: IsNull()
  };
  if (role === 'client') {
    query.clientUserId = id;
  }

  const count = await repo.count(query);

  res.json(count);
});

export const deleteNotification = handlerWrapper(async (req, res) => {
  assertRole(req, 'client');
  const { id } = req.params;
  const { user: { id: userId } } = req as any;
  const repo = getRepository(Notification);

  await repo.update({id, clientUserId: userId}, {deleted: true});

  res.json();
});