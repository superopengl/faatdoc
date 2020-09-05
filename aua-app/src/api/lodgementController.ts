
import { getRepository, getManager, getConnection, In } from 'typeorm';
import { User } from '../entity/User';
import { assert, assertRole } from '../utils/assert';
import { validatePasswordStrength } from '../utils/validatePasswordStrength';
import * as _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { UserStatus } from '../enums/UserStatus';
import { computeUserSecret } from '../utils/computeUserSecret';
import { Lodgement } from '../entity/Lodgement';
import { handlerWrapper } from '../utils/asyncHandler';
import { createProfileEntity } from '../utils/createProfileEntity';
import { sendEmail } from '../services/emailService';
import { getForgotPasswordHtmlEmail, getForgotPasswordTextEmail, getSignUpHtmlEmail, getSignUpTextEmail } from '../utils/emailTemplates';
import * as moment from 'moment';
import { logError } from '../utils/logger';
import { getUtcNow } from '../utils/getUtcNow';
import { generateLodgementByJobTemplateAndPortofolio } from '../utils/generateLodgementByJobTemplateAndPortofolio';
import { json } from 'body-parser';
import { JobTemplate } from '../entity/JobTemplate';
import { Portofolio } from '../entity/Portofolio';
import { LodgementStatus } from '../enums/LodgementStatus';
import e = require('express');
import { normalizeFieldNameToVar } from '../utils/normalizeFieldNameToVar';
import { Message } from '../entity/Message';
import { AnalysisSchemeLanguage } from 'aws-sdk/clients/cloudsearch';
import { guessDisplayNameFromFields } from '../utils/guessDisplayNameFromFields';


export const generateLodgement = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client');
  const { jobTemplateId, portofolioId, name } = req.body;

  const lodgement = await generateLodgementByJobTemplateAndPortofolio(
    jobTemplateId,
    portofolioId,
    (j, p) => `New ${j.name} for ${p.name}`
  );

  res.json(lodgement);
});

function validateLodgementStatusChange(oldStatus, newStatus) {
  const s = LodgementStatus;
  let nextStatii = [];
  switch (oldStatus) {
    case null:
    case undefined:
      nextStatii = [s.DRAFT, s.SUBMITTED];
    case s.DRAFT:
      nextStatii = [s.DRAFT, s.SUBMITTED];
      break;
    case s.SUBMITTED:
      nextStatii = [s.DRAFT, s.TO_SIGN, s.DONE];
    case s.TO_SIGN:
      nextStatii = [s.DONE];
    case s.DONE:
    default:
  }

  return nextStatii.includes(newStatus);
}


export const saveLodgement = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client');

  const { user: { id: userId } } = req;

  const { id, name, jobTemplateId, portofolioId, fields, status } = req.body;
  assert(name, 400, 'name is empty');

  let lodgement: Lodgement;
  if (id) {
    // Existing lodgment save
    lodgement = await getRepository(Lodgement).findOne(id);
    assert(lodgement, 404, 'Lodgment is not found');
    validateLodgementStatusChange(lodgement.status, status);
  } else {
    // New lodgment
    validateLodgementStatusChange(null, status);
    lodgement = new Lodgement();
    lodgement.id = uuidv4();
    lodgement.userId = userId;
    lodgement.jobTemplateId = jobTemplateId;
    lodgement.portofolioId = portofolioId;
  }

  lodgement.name = name;
  lodgement.forWhom = guessDisplayNameFromFields(fields);
  lodgement.fields = fields;
  lodgement.status = status;
  lodgement.lastUpdatedAt = getUtcNow();

  const repo = getRepository(Lodgement);
  await repo.save(lodgement);

  res.json(null);
});

interface ISearchLodgementQuery {
  text?: string;
  page?: number;
  size?: number;
  status?: LodgementStatus[];
  assignee?: string;
  orderField?: string;
  orderDirection?: 'ASC' | 'DESC';
}

const defaultSearch: ISearchLodgementQuery = {
  page: 1,
  size: 50,
  status: [LodgementStatus.SUBMITTED, LodgementStatus.TO_SIGN],
  orderField: 'lastUpdatedAt',
  orderDirection: 'DESC'
};


export const searchLodgement = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const option: ISearchLodgementQuery = { ...defaultSearch, ...req.body };

  const { text, status, page, assignee, orderDirection, orderField } = option;
  const size = option.size;
  const skip = (page - 1) * size;

  let query = getManager()
    .createQueryBuilder()
    .from(Lodgement, 'x');
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

export const listLodgement = handlerWrapper(async (req, res) => {
  assertRole(req, 'client');
  const query = getConnection()
    .createQueryBuilder()
    .from(Lodgement, 'x')
    .orderBy('x.createdAt', 'DESC')
    .where(
      'x.userId = :userId AND x.status != :status',
      {
        userId: req.user.id,
        status: LodgementStatus.ARCHIVE
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

export const getLodgement = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client');
  const { id } = req.params;
  const repo = getRepository(Lodgement);
  const lodgement = await repo.findOne(id);
  assert(lodgement, 404);

  res.json(lodgement);
});

export const deleteLodgement = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client');
  const { id } = req.params;
  const repo = getRepository(Lodgement);
  const lodgement = await repo.findOne(id);
  if (lodgement.status === LodgementStatus.DRAFT) {
    // If it's a draft then hard delete it.
    await repo.delete(id);
  } else {
    // If it's not a draft then soft delete it.
    await repo.update(id, { status: LodgementStatus.ARCHIVE });
  }

  res.json();
});


export const assignLodgement = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id } = req.params;
  const { agentId } = req.body;

  await getRepository(Lodgement).update(id, { agentId });

  res.json();
});

export const signLodgement = handlerWrapper(async (req, res) => {
  assertRole(req, 'client');
  const { id } = req.params;

  const now = getUtcNow();
  await getRepository(Lodgement).update(id, {
    signedAt: now,
    lastUpdatedAt: now,
    status: LodgementStatus.SIGNED
  });

  res.json();
});

export const completeLodgement = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  const repo = getRepository(Lodgement);
  const lodgement = await repo.findOne(id);
  assert(lodgement, 404);
  assert(['submitted', 'to_sign', 'signed'].includes(lodgement.status), 400, 'Status invalid');

  await repo.update(id, { status: LodgementStatus.DONE });

  res.json();
});

export const newLodgmentMessage = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { id } = req.params;
  const { content } = req.body;

  const lodgement = await getRepository(Lodgement).findOne(id);
  assert(lodgement, 404);

  const message = new Message();
  message.lodgementId = id;
  message.sender = req.user.id;
  message.clientUserId = lodgement.userId;
  message.agentUserId = lodgement.agentId;
  message.content = content;

  const repo = getRepository(Message);
  await repo.save(message);

  res.json();
});

export const listLodgementMessage = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { id } = req.params;
  const { from, size } = req.query;

  let query = getRepository(Message).createQueryBuilder()
    .where(`"lodgementId" = :id`, { id });
  if (req.user.role === 'client') {
    query = query.where(`"clientUserId" = :userId`, { userId: req.user.id });
  }
  if (from) {
    query = query.where(`"createdAt" >= :from`, { from: moment(from).toDate() });
  }

  query = query.orderBy('"createdAt"', 'DESC')
    .limit(size || 20);

  const list = await query.getMany();

  res.json(list);
});
