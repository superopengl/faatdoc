
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
import { CronLock } from '../entity/CronLock';

export const saveRecurring = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id, nameTemplate, portofolioId, jobTemplateId, cron, dueDay } = req.body;

  const recurring = new Recurring();
  recurring.id = id || uuidv4();
  recurring.nameTemplate = nameTemplate;
  recurring.portofolioId = portofolioId;
  recurring.jobTemplateId = jobTemplateId;
  recurring.cron = cron;
  recurring.dueDay = dueDay;
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
    .leftJoin(q => q.from(JobTemplate, 'j'), 'j', 'j.id = x."jobTemplateId"')
    .leftJoin(q => q.from(Portofolio, 'p'), 'p', 'p.id = x."portofolioId"')
    .leftJoin(q => q.from(User, 'u'), 'u', 'u.id = p."userId"')
    .orderBy('x.lastUpdatedAt', 'DESC')
    .select([
      'x.id as id',
      'x."nameTemplate" as "nameTemplate"',
      'x."dueDay" as "dueDay"',
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

export const healthCheckRecurring = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');

  const expected = process.env.GIT_HASH;
  const lock = await getRepository(CronLock).findOne({key: 'cron-singleton-lock'});
  const actual = lock?.gitHash;
  const healthy = actual === expected;

  const result = {
    error: healthy ? null : `Expecting ${expected} but got ${actual}`,
    lock,
  };

  res.json(result);
});

