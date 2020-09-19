
import { getRepository, IsNull } from 'typeorm';
import { Task } from '../entity/Task';
import { Notification } from '../entity/Notification';
import { assert, assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { getUtcNow } from '../utils/getUtcNow';

async function listNotificationForClient(clientId, pagenation, unreadOnly) {
  let query = getRepository(Notification)
    .createQueryBuilder('x')
    .where({ clientUserId: clientId, deleted: false });
  if (unreadOnly) {
    query = query.andWhere(`"readAt" IS NULL`);
  }
  query = query
    .innerJoin(q => q.from(Task, 't').select(['id', 'name', '"forWhom"']), 't', `t.id = x."taskId"`)
    .orderBy('"createdAt"', 'DESC')
    .offset(pagenation.skip)
    .limit(pagenation.limit)
    .select([
      'x.id',
      'name',
      '"forWhom"',
      '"taskId"',
      '"createdAt"',
      'content',
      '"readAt"'
    ]);
  
  const list = await query.execute();
  return list;
}

async function listNotificationForAgent(agentId, pagenation, unreadOnly) {
  let query = getRepository(Notification)
    .createQueryBuilder('x')
    .where({ agentUserId: agentId, deleted: false });
  if (unreadOnly) {
    query = query.andWhere(`"readAt" IS NULL`);
  }
  query = query.innerJoin(q => q.from(Task, 'l').select('*'), 'l', `l.id = x."taskId"`)
    .orderBy('"createdAt"', 'DESC')
    .offset(pagenation.skip)
    .limit(pagenation.limit)
    .select([
      'x.id as id',
      '"taskId"',
      'x."createdAt" as "createdAt"',
      'l.id as "taskId"',
      'l."forWhom" as "forWhom"',
      'l.name as name',
      'content',
      '"readAt"'
    ]);
  const list = await query.execute();
  return list;
}

async function listNotificationForAdmin(pagenation, unreadOnly) {
  let query = getRepository(Notification)
    .createQueryBuilder('x')
    .where({ deleted: false });
  if (unreadOnly) {
    query = query.andWhere(`"readAt" IS NULL`);
  }
  query = query.innerJoin(q => q.from(Task, 'l').select('*'), 'l', `l.id = x."taskId"`)
    .orderBy('"createdAt"', 'DESC')
    .offset(pagenation.skip)
    .limit(pagenation.limit)
    .select([
      'x.id as id',
      '"taskId"',
      'x."createdAt" as "createdAt"',
      'l.id as "taskId"',
      'l."forWhom" as "forWhom"',
      'l.name as name',
      'content',
      '"readAt"'
    ]);
  const list = await query.execute();
  return list;
}

export const listNotification = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { user: { id, role } } = req as any;
  const { page, size, unreadOnly } = req.body;
  assert(page >= 0 && size > 0, 400, 'Invalid page and size parameter');

  const pagenation = {
    skip: page * size,
    limit: size,
  };

  let list: Promise<any>;
  switch (role) {
    case 'client':
      list = await listNotificationForClient(id, pagenation, unreadOnly);
      break;
    case 'agent':
      list = await listNotificationForAgent(id, pagenation, unreadOnly);
      break;
    case 'admin':
      list = await listNotificationForAdmin(pagenation, unreadOnly);
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
    .innerJoin(q => q.from(Task, 'l').select('*'), 'l', `l.id = x.taskId`)
    .select([
      `x.id as id`,
      `x.content as content`,
      `x."createdAt" as "createdAt"`,
      `x."readAt" as "readAt"`,
      `x."taskId" as "taskId"`,
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
  const { user: { role, id } } = req as any;
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

  await repo.update({ id, clientUserId: userId }, { deleted: true });

  res.json();
});