
import * as moment from 'moment';
import { getConnection, getManager, getRepository, IsNull, In, Not } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { JobTemplate } from '../entity/JobTemplate';
import { Job } from '../entity/Job';
import { Message } from '../entity/Message';
import { User } from '../entity/User';
import { JobStatus } from '../types/JobStatus';
import { sendEmail, EmailRequest } from '../services/emailService';
import { assert, assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { generateJobByJobTemplateAndPortfolio } from '../utils/generateJobByJobTemplateAndPortfolio';
import { getUtcNow } from '../utils/getUtcNow';
import { guessDisplayNameFromFields } from '../utils/guessDisplayNameFromFields';
import { Portfolio } from '../entity/Portfolio';
import { File } from '../entity/File';
import * as _ from 'lodash';

export const generateJob = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client');
  const { jobTemplateId, portfolioId, name } = req.body;

  const Job = await generateJobByJobTemplateAndPortfolio(
    jobTemplateId,
    portfolioId,
    (j, p) => `${j.name} for ${p.name}`
  );

  // await getRepository(Job).save(Job);

  res.json(Job);
});

function validateJobStatusChange(oldStatus, newStatus) {
  const s = JobStatus;
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

async function sendJobStatusChangeEmail(job: Job) {
  const portfolio = await getRepository(Portfolio).findOne(job.portfolioId);
  const user = await getRepository(User).findOne(job.userId);
  const { id: jobId, status: jobStatus, docs: jobDocs, name: jobName } = job;
  const to = user.email;
  let template = null;
  const vars = {
    jobId,
    jobName,
    jobStatus
  };
  let attachments;
  let shouldBcc = false;

  switch (jobStatus) {
    case JobStatus.COMPLETE:
      template = 'jobComplete';
      shouldBcc = true;
      const fileIds = (jobDocs || []).filter(d => d.isFeedback).map(d => d.fileId);
      attachments = fileIds.length ?
        await getRepository(File)
          .createQueryBuilder()
          .where(`id IN (:...ids)`, { ids: fileIds })
          .select(['fileName as filename', 'location as path']) :
        [];
      break;

    default:
      break;
  }

  await sendEmail({
    to,
    template,
    vars,
    attachments,
    shouldBcc
  });
}

export const saveJob = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');

  const { user: { id: userId } } = req as any;

  const { id, name, jobTemplateId, portfolioId, fields, status, docs } = req.body;
  assert(name, 400, 'name is empty');

  const portfolio = await getRepository(Portfolio).findOne(portfolioId);
  assert(name, 404, 'portfolio is not found');

  const repo = getRepository(Job);
  let job: Job;
  if (id) {
    // Existing job save
    job = await repo.findOne(id);
    assert(job, 404, 'Job is not found');
    validateJobStatusChange(job.status, status);
  } else {
    // New job
    validateJobStatusChange(null, status);
    job = new Job();
    job.id = uuidv4();
    job.userId = portfolio.userId;
    job.jobTemplateId = jobTemplateId;
    job.portfolioId = portfolioId;
  }

  job.name = name;
  job.forWhom = guessDisplayNameFromFields(portfolio.fields);
  job.fields = fields;
  job.docs = docs;
  job.status = status;
  job.lastUpdatedAt = getUtcNow();

  if(status === JobStatus.COMPLETE) {
    await sendJobStatusChangeEmail(job);
  }

  await repo.save(job);

  res.json();
});

interface ISearchJobQuery {
  text?: string;
  page?: number;
  size?: number;
  status?: JobStatus[];
  assignee?: string;
  orderField?: string;
  orderDirection?: 'ASC' | 'DESC';
}

const defaultSearch: ISearchJobQuery = {
  page: 1,
  size: 50,
  status: [JobStatus.TODO, JobStatus.TO_SIGN],
  orderField: 'lastUpdatedAt',
  orderDirection: 'DESC'
};


export const searchJob = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const option: ISearchJobQuery = { ...defaultSearch, ...req.body };

  const { text, status, page, assignee, orderDirection, orderField } = option;
  const size = option.size;
  const skip = (page - 1) * size;
  const { role, id } = (req as any).user;

  let query = getManager()
    .createQueryBuilder()
    .from(Job, 'x')
    .where(`1 = 1`);
  if (role === 'client') {
    query = query.andWhere(`x."userId" = :id`, { id });
  }
  if (status?.length) {
    query = query.andWhere(`x.status IN (:...status)`, { status });
  }
  if (assignee) {
    query = query.andWhere('x."agentId" = :assignee', { assignee });
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
      // `x."signedAt" as "signedAt"`,
    ]);
  if (text) {
    query = query.andWhere('x.name ILIKE :text OR x."forWhom" ILIKE :text OR j.name ILIKE :text', { text: `%${text}%` });
  }
  const total = await query.getCount();
  const list = await query
    .orderBy(`"${orderField}"`, orderDirection)
    .offset(skip)
    .limit(size)
    .execute();

  res.json({ data: list, pagination: { page, size, total } });
});

export const listJob = handlerWrapper(async (req, res) => {
  assertRole(req, 'client');
  const clientId = (req as any).user.id;

  const query = getManager()
    .createQueryBuilder()
    .from(Job, 'j')
    .where({
      userId: clientId,
      status: Not(JobStatus.ARCHIVE)
    })
    .leftJoin(q => q.from(Message, 'x')
      .where(`"clientUserId" = :id`, { id: clientId })
      .andWhere(`"readAt" IS NULL`)
      .orderBy('"jobId"')
      .addOrderBy('"createdAt"', 'DESC')
      .distinctOn(['"jobId"'])
      , 'x', `j.id = x."jobId"`)
    .orderBy('j."lastUpdatedAt"', 'DESC')
    .select([
      `j.id as id`,
      `j.name as name`,
      `j."forWhom" as "forWhom"`,
      `j."createdAt" as "createdAt"`,
      `j."lastUpdatedAt" as "lastUpdatedAt"`,
      `j."agentId" as "agentId"`,
      `j.status as status`,
      `x."createdAt" as "lastUnreadMessageAt"`
    ]);

  const list = await query.execute();
  res.json(list);
});

export const getJob = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client');
  const { id } = req.params;
  const repo = getRepository(Job);
  const job = await repo.findOne(id);
  assert(job, 404);

  res.json(job);
});

export const deleteJob = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id } = req.params;
  const repo = getRepository(Job);

  await repo.update(id, { status: JobStatus.ARCHIVE });

  res.json();
});


export const assignJob = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id } = req.params;
  const { agentId } = req.body;

  await getRepository(Job).update(id, { agentId });

  res.json();
});

export const signJobDoc = handlerWrapper(async (req, res) => {
  assertRole(req, 'client');
  const { id } = req.params;
  const jobRepo = getRepository(Job);
  const job = await jobRepo.findOne(id);
  assert(job, 404);
  const { files } = req.body;

  if (files?.length) {
    const now = getUtcNow();
    job.docs.filter(d => d.requiresSign && files.includes(d.fileId)).forEach(d => d.signedAt = now);
  }

  const unsignedFileCount = job.docs.filter(d => d.requiresSign && !d.signedAt).length;
  if (unsignedFileCount === 0) {
    job.status = JobStatus.SIGNED;
  }

  await jobRepo.save(job);

  res.json();
});

export const completeJob = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  const repo = getRepository(Job);
  const job = await repo.findOne(id);
  assert(job, 404);
  assert(['todo', 'to_sign', 'signed'].includes(job.status), 400, 'Status invalid');

  await repo.update(id, { status: JobStatus.COMPLETE });

  res.json();
});

async function sendJobMessage(Job, senderId, content) {
  const user = await getRepository(User).findOne(Job.userId);
  assert(user, 404);

  const message = new Message();
  message.sender = senderId;
  message.jobId = Job.id;
  message.clientUserId = Job.userId;
  message.agentUserId = Job.agentId;
  message.content = content;

  await getRepository(Message).save(message);

  sendEmail({
    to: user.email,
    vars: {
      name: Job.name
    },
    template: 'jobMessage'
  }).catch(() => { });
}

export const notifyJob = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { id } = req.params;
  const { content } = req.body;
  assert(content, 404);

  const job = await getRepository(Job).findOne(id);
  assert(job, 404);

  await sendJobMessage(job, (req as any).user.id, content);

  res.json();
});

export const listJobNotifies = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { id } = req.params;
  const { from, size } = req.query;
  const { user: { role, id: userId } } = req as any;
  const isClient = role === 'client';

  let query = getRepository(Message).createQueryBuilder()
    .where(`"jobId" = :id`, { id });
  if (isClient) {
    query = query.andWhere(`"clientUserId" = :userId`, { userId });
  }
  if (from) {
    query = query.andWhere(`"createdAt" >= :from`, { from: moment(`${from}`).toDate() });
  }

  query = query.orderBy('"createdAt"', 'DESC')
    .limit(+size || 20);

  const list = await query.getMany();

  res.json(list);
});


export const markJobNotifyRead = handlerWrapper(async (req, res) => {
  assertRole(req, 'client');
  const { id } = req.params;
  const { user: { role, id: userId } } = req as any;

  // Mark notification read
  await getRepository(Message).update({ jobId: id, clientUserId: userId }, { readAt: getUtcNow() });

  res.json();
});