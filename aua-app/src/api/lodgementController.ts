
import { getRepository, getManager, getConnection } from 'typeorm';
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
import { json } from 'body-parser';
import { JobTemplate } from '../entity/JobTemplate';
import { Portofolio } from '../entity/Portofolio';
import { LodgementStatus } from '../enums/LodgementStatus';
import e = require('express');
import { normalizeFieldNameToVar } from '../utils/normalizeFieldNameToVar';
import { LodgementLog } from '../entity/LodgementLog';
import { Message } from '../entity/Message';
import { MessageType } from '../enums/MessageType';
import { AnalysisSchemeLanguage } from 'aws-sdk/clients/cloudsearch';


function prefillFieldsWithProtofolio(jobTemplateFields, portofolioFields) {
  if (!portofolioFields) return jobTemplateFields;

  const map = new Map(portofolioFields.map(({ name, value }) => [name, value]));
  const fields = jobTemplateFields.map(jf => (
    {
      ...jf,
      value: map.get(jf.name)
    }
  ));

  return fields;
}

export const generateLodgement = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client');
  const { jobTemplateId, portofolioId, name } = req.body;
  assert(jobTemplateId, 400, 'jobTemplateId is not specified');

  const jobTemplateRepo = getRepository(JobTemplate);
  const jobTemplate = await jobTemplateRepo.findOne(jobTemplateId);
  assert(jobTemplate, 404, 'jobTemplate is not found');

  let portofolio: Portofolio = null;
  if (portofolioId) {
    const portofolioRepo = getRepository(Portofolio);
    portofolio = await portofolioRepo.findOne(portofolioId);
    assert(portofolio, 404, 'portofolio is not found');
  }

  const lodgement = new Lodgement();

  const { user: { id: userId } } = req;
  const fields = prefillFieldsWithProtofolio(jobTemplate.fields, portofolio?.fields);

  lodgement.name = `New ${jobTemplate.name} for ${portofolio.name}`;
  lodgement.userId = userId;
  lodgement.jobTemplateId = jobTemplateId;
  lodgement.portofolioId = portofolioId;
  lodgement.fields = fields;
  lodgement.lastUpdatedAt = getUtcNow();
  lodgement.status = LodgementStatus.DRAFT;

  // This API create an empty lodgment for clients. No need to save to database.
  // const repo = getRepository(Lodgement);
  // await repo.save(lodgement);

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

    lodgement.fields = fields;
    lodgement.status = status;
  } else {
    // New lodgment
    validateLodgementStatusChange(null, status);
    lodgement = new Lodgement();
    lodgement.id = id || uuidv4();
    lodgement.userId = userId;
    lodgement.name = name;
    lodgement.jobTemplateId = jobTemplateId;
    lodgement.portofolioId = portofolioId;
    lodgement.fields = fields;
    lodgement.status = status;
  }

  lodgement.lastUpdatedAt = getUtcNow();

  const repo = getRepository(Lodgement);
  await repo.save(lodgement);

  res.json(null);
});

export const listLodgement = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client');
  const { user: { role } } = req;

  let query = getConnection()
    .createQueryBuilder()
    .from(Lodgement, 'x')
    .orderBy('x.createdAt', 'DESC');
  if (role === 'client') {
    query = query.where('x.userId = :userId', { userId: req.user.id })
      .select([
        `x.id as id`,
        `x.name as name`,
        `x."createdAt" as "createdAt"`,
        `x.agentId as "agentId"`,
        `x.status as status`,
      ]);
  } else if (role === 'admin') {
    query = query.innerJoin(q => q.from(JobTemplate, 'j').select('*'), 'j', 'j.id = x."jobTemplateId"')
      .select([
        `x.id as id`,
        `x.name as name`,
        `x."createdAt" as "createdAt"`,
        `j.name as "jobTemplateName"`,
        `x.agentId as "agentId"`,
        `x.status as status`,
      ]);
  } else {
    assert(false, 400, 'Impossible code path');
  }
  query = query;

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
  await repo.delete({ id });

  res.json(null);
});


export const assignLodgment = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id } = req.params;
  const { agentId } = req.body;
  assert(agentId, 400, 'Missing agentId in request body');

  await getRepository(Lodgement).update(id, { agentId });

  res.json();
});

export const requstSignLodgement = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;

  await getRepository(Lodgement).update(id, { status: LodgementStatus.TO_SIGN });

  res.json();
});

export const completeLodgement = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  const repo =  getRepository(Lodgement);
  const lodgement = await repo.findOne(id);
  assert(lodgement, 404);
  assert(['submitted', 'to_sign'].includes(lodgement.status), 400, 'Status invalid');

  await repo.update(id, { status: LodgementStatus.DONE });

  res.json();
});

export const archiveLodgement = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;

  await getRepository(Lodgement).update(id, { status: LodgementStatus.ARCHIVE });

  res.json();
});

export const logLodgmentEvent = handlerWrapper(async (req, res) => {
  assertRole(req, 'client');
  const { id, event } = req.params;
  const repo = getRepository(Lodgement);
  const lodgement = await repo.findOne(id);
  assert(lodgement, 404);

  const lodgementLog = new LodgementLog();
  lodgementLog.lodgementId = id;
  lodgementLog.event = event;
  lodgementLog.extra = req.body;

  await getRepository(LodgementLog).save(lodgementLog);

  res.json();
});

export const newLodgmentMessage = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent');
  const { id } = req.params;
  const { content } = req.body;

  const lodgement = await getRepository(Lodgement).findOne(id);
  assert(lodgement, 404);

  const message = new Message();
  message.lodgementId = id;
  message.type = MessageType.OUTBOUND;
  message.clientUserId = lodgement.userId;
  message.agentUserId = req.user.id;
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
    .where({ lodgementId: id });
  if (req.user.role === 'client') {
    query = query.where({ clientUserId: req.user.id });
  }
  if (from) {
    query = query.where(`"createdAt" >= :from`, { from: moment(from).toDate() })
  }

  query = query.orderBy('"createdAt"', 'DESC')
    .limit(size || 20);

  const list = await query.getMany();

  res.json(list);
});
