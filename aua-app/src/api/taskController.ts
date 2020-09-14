
import * as moment from 'moment';
import { getConnection, getManager, getRepository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { JobTemplate } from '../entity/JobTemplate';
import { Task } from '../entity/Task';
import { Notification } from '../entity/Notification';
import { User } from '../entity/User';
import { TaskStatus } from '../enums/TaskStatus';
import { sendEmail } from '../services/emailService';
import { assert, assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { generateTaskByJobTemplateAndPortofolio } from '../utils/generateTaskByJobTemplateAndPortofolio';
import { getUtcNow } from '../utils/getUtcNow';
import { guessDisplayNameFromFields } from '../utils/guessDisplayNameFromFields';

export const generateTask = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client');
  const { jobTemplateId, portofolioId, name } = req.body;

  const task = await generateTaskByJobTemplateAndPortofolio(
    jobTemplateId,
    portofolioId,
    (j, p) => `${j.name} for ${p.name}`
  );

  await getRepository(Task).save(task);

  res.json(task);
});

function validateTaskStatusChange(oldStatus, newStatus) {
  const s = TaskStatus;
  let nextStatii = [];
  switch (oldStatus) {
    case null:
    case undefined:
      nextStatii = [s.TODO];
    case s.TODO:
      nextStatii = [s.TODO, s.TO_SIGN, s.COMPLETE];
    case s.TO_SIGN:
      nextStatii = [s.COMPLETE];
    case s.COMPLETE:
    default:
  }

  return nextStatii.includes(newStatus);
}


export const saveTask = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client');

  const { user: { id: userId } } = req as any;

  const { id, name, jobTemplateId, portofolioId, fields, status } = req.body;
  assert(name, 400, 'name is empty');

  let task: Task;
  if (id) {
    // Existing lodgment save
    task = await getRepository(Task).findOne(id);
    assert(task, 404, 'Lodgment is not found');
    validateTaskStatusChange(task.status, status);
  } else {
    // New lodgment
    validateTaskStatusChange(null, status);
    task = new Task();
    task.id = uuidv4();
    task.userId = userId;
    task.jobTemplateId = jobTemplateId;
    task.portofolioId = portofolioId;
  }

  task.name = name;
  task.forWhom = guessDisplayNameFromFields(fields);
  task.fields = fields;
  task.status = status;
  task.lastUpdatedAt = getUtcNow();

  const repo = getRepository(Task);
  await repo.save(task);

  res.json();
});

interface ISearchTaskQuery {
  text?: string;
  page?: number;
  size?: number;
  status?: TaskStatus[];
  assignee?: string;
  orderField?: string;
  orderDirection?: 'ASC' | 'DESC';
}

const defaultSearch: ISearchTaskQuery = {
  page: 1,
  size: 50,
  status: [TaskStatus.TODO, TaskStatus.TO_SIGN],
  orderField: 'lastUpdatedAt',
  orderDirection: 'DESC'
};


export const searchTask = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const option: ISearchTaskQuery = { ...defaultSearch, ...req.body };

  const { text, status, page, assignee, orderDirection, orderField } = option;
  const size = option.size;
  const skip = (page - 1) * size;

  let query = getManager()
    .createQueryBuilder()
    .from(Task, 'x');
  if (status?.length) {
    query = query.where(`x.status IN (:...status)`, { status });
  }
  if (assignee) {
    query = query.where('x."agentId" = :assignee', { assignee });
  }
  query = query.innerJoin(q => q.from(JobTemplate, 'j').select('*'), 'j', 'j.id = x."jobTemplateId"')
    .innerJoin(q => q.from(User, 'u').select('*'), 'u', 'x."userId" = u.id')
    .select([
      `x.id as id`,
      `x.name as name`,
      `x."forWhom" as "forWhom"`,
      `u.email as email`,
      `x."createdAt" as "createdAt"`,
      `j.name as "jobTemplateName"`,
      `x.agentId as "agentId"`,
      `x.status as status`,
      `x."lastUpdatedAt" as "lastUpdatedAt"`,
      `x."signedAt" as "signedAt"`,
    ]);
  if (text) {
    query = query.where('x.name ILIKE :text OR x."forWhom" ILIKE :text OR j.name ILIKE :text', { text: `%${text}%` });
  }
  const total = await query.getCount();
  const list = await query
    .orderBy(`x."${orderField}"`, orderDirection)
    .skip(skip)
    .take(size)
    .execute();

  res.json({ data: list, pagination: { page, size, total } });
});

export const listTask = handlerWrapper(async (req, res) => {
  assertRole(req, 'client');
  const query = getConnection()
    .createQueryBuilder()
    .from(Task, 'x')
    .orderBy('x.createdAt', 'DESC')
    .where(
      'x.userId = :userId AND x.status != :status',
      {
        userId: (req as any).user.id,
        status: TaskStatus.ARCHIVE
      })
    .select([
      `x.id as id`,
      `x.name as name`,
      `x."forWhom" as "forWhom"`,
      `x."createdAt" as "createdAt"`,
      `x."lastUpdatedAt" as "lastUpdatedAt"`,
      `x.agentId as "agentId"`,
      `x.status as status`,
    ]);

  const list = await query.execute();
  res.json(list);
});

export const getTask = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client');
  const { id } = req.params;
  const repo = getRepository(Task);
  const task = await repo.findOne(id);
  assert(task, 404);

  res.json(task);
});

export const deleteTask = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id } = req.params;
  const repo = getRepository(Task);

  await repo.update(id, { status: TaskStatus.ARCHIVE });

  res.json();
});


export const assignTask = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id } = req.params;
  const { agentId } = req.body;

  await getRepository(Task).update(id, { agentId });

  res.json();
});

export const signTask = handlerWrapper(async (req, res) => {
  assertRole(req, 'client');
  const { id } = req.params;

  const now = getUtcNow();
  await getRepository(Task).update(id, {
    signedAt: now,
    lastUpdatedAt: now,
    status: TaskStatus.SIGNED
  });

  res.json();
});

export const completeTask = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  const repo = getRepository(Task);
  const task = await repo.findOne(id);
  assert(task, 404);
  assert(['todo', 'to_sign', 'signed'].includes(task.status), 400, 'Status invalid');

  await repo.update(id, { status: TaskStatus.COMPLETE });

  res.json();
});

async function sendTaskMessage(task, senderId, content) {
  const user = await getRepository(User).findOne(task.userId);
  assert(user, 404);

  const message = new Notification();
  message.sender = senderId;
  message.taskId = task.id;
  message.clientUserId = task.userId;
  message.agentUserId = task.agentId;
  message.content = content;

  await getRepository(Notification).save(message);

  sendEmail({
    to: user.email,
    vars: {
      name: task.name
    },
    templateName: 'taskNotification'
  }).catch(() => {});
}

export const notifyTask = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { id } = req.params;
  const { content } = req.body;

  const task = await getRepository(Task).findOne(id);
  assert(task, 404);

  await sendTaskMessage(task, (req as any).user.id, content);

  res.json();
});

export const listTaskNotifies = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { id } = req.params;
  const { from, size } = req.query;
  const {user: {role, id: userId}} = req as any;

  let query = getRepository(Notification).createQueryBuilder()
    .where(`"taskId" = :id`, { id });
  if (role === 'client') {
    query = query.where(`"clientUserId" = :userId`, { userId });
  }
  if (from) {
    query = query.where(`"createdAt" >= :from`, { from: moment(`${from}`).toDate() });
  }

  query = query.orderBy('"createdAt"', 'DESC')
    .limit(+size || 20);

  const list = await query.getMany();

  res.json(list);
});
