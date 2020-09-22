
import { getRepository, IsNull, getManager } from 'typeorm';
import { Job } from '../entity/Job';
import { Message } from '../entity/Message';
import { assert, assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { getUtcNow } from '../utils/getUtcNow';

async function listMessageForClient(clientId, pagenation, unreadOnly) {
   const query =  getManager()
    .createQueryBuilder()
    .select('*')
    .from(q => q.from(Message, 'x')
      .where(`"clientUserId" = :id`, { id: clientId })
      .andWhere(`deleted = false`)
      .andWhere(unreadOnly ? `"readAt" IS NULL` : '1 = 1')
      .orderBy('"jobId"')
      .addOrderBy('"createdAt"', 'DESC')
      .distinctOn(['"jobId"'])
    , 'x')
    .innerJoin(q => q.from(Job, 'l').select('*'), 'l', `l.id = x."jobId"`)
    .offset(pagenation.skip)
    .limit(pagenation.limit)
    .select([
      'x.id as id',
      'x."jobId" as "jobId"',
      'x."createdAt" as "createdAt"',
      'l.id as "jobId"',
      'l."forWhom" as "forWhom"',
      'l.name as name',
      'content',
      '"readAt"'
    ]);

  const list = await query.execute();
  return list;
}

async function listMessageForAgent(agentId, pagenation, unreadOnly) {
  const query =  getManager()
  .createQueryBuilder()
  .select('*')
  .from(q => q.from(Message, 'x')
    .where(`"agentUserId" = :id`, { id: agentId })
    .andWhere(`deleted = false`)
    .andWhere(unreadOnly ? `"readAt" IS NULL` : '1 = 1')
    .orderBy('"jobId"')
    .addOrderBy('"createdAt"', 'DESC')
    .distinctOn(['"jobId"'])
  , 'x')
  .innerJoin(q => q.from(Job, 'l').select('*'), 'l', `l.id = x."jobId"`)
  .offset(pagenation.skip)
  .limit(pagenation.limit)
  .select([
    'x.id as id',
    'x."jobId" as "jobId"',
    'x."createdAt" as "createdAt"',
    'l.id as "jobId"',
    'l."forWhom" as "forWhom"',
    'l.name as name',
    'content',
    '"readAt"'
  ]);
  const list = await query.execute();
  return list;
}

async function listMessageForAdmin(pagenation, unreadOnly) {
  const query = getManager()
    .createQueryBuilder()
    .select('*')
    .from(q => q.from(Message, 'x')
      .where(`deleted = false`)
      .andWhere(unreadOnly ? `"readAt" IS NULL` : '1 = 1')
      .orderBy('"jobId"')
      .addOrderBy('"createdAt"', 'DESC')
      .distinctOn(['"jobId"'])
    , 'x')
    .innerJoin(q => q.from(Job, 'l').select('*'), 'l', `l.id = x."jobId"`)
    .offset(pagenation.skip)
    .limit(pagenation.limit)
    .select([
      'x.id as id',
      'x."jobId" as "jobId"',
      'x."createdAt" as "createdAt"',
      'l.id as "jobId"',
      'l."forWhom" as "forWhom"',
      'l.name as name',
      'content',
      '"readAt"'
    ]);
  const list = await query.execute();
  return list;
}

export const listMessage = handlerWrapper(async (req, res) => {
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
      list = await listMessageForClient(id, pagenation, unreadOnly);
      break;
    case 'agent':
      list = await listMessageForAgent(id, pagenation, unreadOnly);
      break;
    case 'admin':
      list = await listMessageForAdmin(pagenation, unreadOnly);
      break;
    default:
      assert(false, 500, `Unsupported role ${role}`);
  }

  res.json(list);
});

export const getMessage = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { id } = req.params;
  const { user: { id: userId, role } } = req as any;
  const repo = getRepository(Message);
  const query: any = { id, deleted: false };
  const isClient = role === 'client';
  if (isClient) {
    query.clientUserId = userId;
  }

  const result = await repo.createQueryBuilder('x')
    .where(query)
    .innerJoin(q => q.from(Job, 'l').select('*'), 'l', `l.id = x.jobId`)
    .select([
      `x.id as id`,
      `x.content as content`,
      `x."createdAt" as "createdAt"`,
      `x."readAt" as "readAt"`,
      `x."jobId" as "jobId"`,
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

export const getMessageUnreadCount = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const repo = getRepository(Message);
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

export const deleteMessage = handlerWrapper(async (req, res) => {
  assertRole(req, 'client');
  const { id } = req.params;
  const { user: { id: userId } } = req as any;
  const repo = getRepository(Message);

  await repo.update({ id, clientUserId: userId }, { deleted: true });

  res.json();
});