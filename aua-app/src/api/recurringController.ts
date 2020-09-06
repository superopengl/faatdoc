
import { getRepository } from 'typeorm';
import { User } from '../entity/User';
import { assert, assertRole } from '../utils/assert';
import * as _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { Portofolio } from '../entity/Portofolio';
import { handlerWrapper } from '../utils/asyncHandler';
import { getUtcNow } from '../utils/getUtcNow';
import { JobTemplate } from '../entity/JobTemplate';
import { Recurring } from '../entity/Recurring';
import { executeRecurring, restartCronService } from '../services/cronService';

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

  // Restart cron service if any recurring changes
  restartCronService(false);

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
      `j.id as "jobTemplateId"`,
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

  const lodgement = await executeRecurring(id);

  res.json(lodgement);
});