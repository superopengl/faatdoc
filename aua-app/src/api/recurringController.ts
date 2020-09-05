
import { getRepository, getManager, getConnection } from 'typeorm';
import { User } from '../entity/User';
import { assert, assertRole } from '../utils/assert';
import { validatePasswordStrength } from '../utils/validatePasswordStrength';
import * as _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { UserStatus } from '../enums/UserStatus';
import { computeUserSecret } from '../utils/computeUserSecret';
import { Portofolio } from '../entity/Portofolio';
import { handlerWrapper } from '../utils/asyncHandler';
import { createProfileEntity } from '../utils/createProfileEntity';
import { sendEmail } from '../services/emailService';
import { getForgotPasswordHtmlEmail, getForgotPasswordTextEmail, getSignUpHtmlEmail, getSignUpTextEmail } from '../utils/emailTemplates';
import * as moment from 'moment';
import { logError } from '../utils/logger';
import { getUtcNow } from '../utils/getUtcNow';
import { Role } from '../enums/Role';
import { JobTemplate } from '../entity/JobTemplate';
import { json } from 'body-parser';
import { normalizeFieldNameToVar } from '../utils/normalizeFieldNameToVar';
import { Recurring } from '../entity/Recurring';
import { generateLodgementByJobTemplateAndPortofolio } from '../utils/generateLodgementByJobTemplateAndPortofolio';
import { Lodgement } from '../entity/Lodgement';
import { LodgementStatus } from '../enums/LodgementStatus';

export const saveRecurring = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id, nameTemplate, portofolioId, jobTemplateId, cron } = req.body;

  const recurring = new Recurring();
  recurring.id = id || uuidv4();
  recurring.nameTemplate = nameTemplate;
  recurring.portofolioId = portofolioId;
  recurring.jobTemplateId = jobTemplateId;
  recurring.cron = cron;
  recurring.lastUpdatedAt = getUtcNow();

  const repo = getRepository(Recurring);
  await repo.save(recurring);

  res.json();
});

export const listRecurring = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');

  const list = await getRepository(Recurring)
    .createQueryBuilder('x')
    .innerJoin(q => q.from(JobTemplate, 'j'), 'j', 'j.id = x."jobTemplateId"')
    .innerJoin(q => q.from(Portofolio, 'p'), 'p', 'p.id = x."portofolioId"')
    .innerJoin(q => q.from(User, 'u'), 'u', 'u.id = p."userId"')
    .orderBy('x.lastUpdatedAt', 'DESC')
    .select([
      'x.id as id',
      'x."nameTemplate" as "nameTemplate"',
      'u.email as email',
      'j.name as "jobTemplateName"',
      'p.name as "portofolioName"',
      'x.cron as cron',
      'x."lastUpdatedAt" as "lastUpdatedAt"'
    ])
    .execute();

  res.json(list);
});

export const getRecurring = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id } = req.params;
  const repo = getRepository(Recurring);
  const recurring = await repo.findOne(id);
  assert(recurring, 404);

  res.json(recurring);
});

export const deleteRecurring = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id } = req.params;
  const repo = getRepository(Recurring);
  await repo.delete({ id });

  res.json();
});

export const runRecurring = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id } = req.params;
  const recurring = await getRepository(Recurring).findOne({ id });
  assert(recurring, 404);

  const { jobTemplateId, portofolioId, nameTemplate } = recurring;

  const lodgement = await generateLodgementByJobTemplateAndPortofolio(
    jobTemplateId,
    portofolioId,
    (j, p) => `Test`
  );

  const lodgementId = uuidv4();
  lodgement.id = lodgementId;
  lodgement.status = LodgementStatus.SUBMITTED;

  await getRepository(Lodgement).save(lodgement);

  res.json(lodgement);
});