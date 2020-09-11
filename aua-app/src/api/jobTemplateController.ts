
import { getRepository } from 'typeorm';
import { assert, assertRole } from '../utils/assert';
import * as _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { handlerWrapper } from '../utils/asyncHandler';
import { getUtcNow } from '../utils/getUtcNow';
import { JobTemplate } from '../entity/JobTemplate';

export const saveJobTemplate = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const jobTemplate = new JobTemplate();

  const { id, name, fields } = req.body;
  assert(name, 400, 'name is empty');
  jobTemplate.id = id || uuidv4();
  jobTemplate.name = name;
  jobTemplate.fields = fields;
  jobTemplate.lastUpdatedAt = getUtcNow();

  const repo = getRepository(JobTemplate);
  await repo.save(jobTemplate);

  res.json();
});

export const listJobTemplates = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client', 'agent');

  const list = await getRepository(JobTemplate)
    .createQueryBuilder('x')
    .orderBy('x.createdAt', 'ASC')
    .select(['id', 'name', `"createdAt"`, '"lastUpdatedAt"'])
    .execute();

  res.json(list);
});

export const getJobTemplate = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client', 'agent');
  const { id } = req.params;
  const repo = getRepository(JobTemplate);
  const jobTemplate = await repo.findOne(id);
  assert(jobTemplate, 404);

  res.json(jobTemplate);
});

export const deleteJobTemplate = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client', 'agent');
  const { id } = req.params;
  const repo = getRepository(JobTemplate);
  await repo.delete({ id });

  res.json();
});