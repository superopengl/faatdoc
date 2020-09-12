
import { getRepository } from 'typeorm';
import { assert } from './assert';
import * as _ from 'lodash';
import { Task } from '../entity/Task';
import { getUtcNow } from './getUtcNow';
import { JobTemplate } from '../entity/JobTemplate';
import { Portofolio } from '../entity/Portofolio';
import { TaskStatus } from '../enums/TaskStatus';
import { guessDisplayNameFromFields } from './guessDisplayNameFromFields';
import { v4 as uuidv4 } from 'uuid';


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

export const generateTaskByJobTemplateAndPortofolio = async (jobTemplateId, portofolioId, genName: (job: JobTemplate, porto: Portofolio) => string) => {
  assert(jobTemplateId, 400, 'jobTemplateId is not specified');
  assert(portofolioId, 400, 'jobTemplateId is not specified');

  const jobTemplateRepo = getRepository(JobTemplate);
  const jobTemplate = await jobTemplateRepo.findOne(jobTemplateId);
  assert(jobTemplate, 404, 'jobTemplate is not found');

  const portofolioRepo = getRepository(Portofolio);
  const portofolio = await portofolioRepo.findOne(portofolioId);
  assert(portofolio, 404, 'portofolio is not found');

  const task = new Task();

  const fields = prefillFieldsWithProtofolio(jobTemplate.fields, portofolio?.fields);

  task.id = uuidv4();
  task.name = genName(jobTemplate, portofolio);
  task.forWhom = guessDisplayNameFromFields(fields);
  task.userId = portofolio.userId;
  task.jobTemplateId = jobTemplateId;
  task.portofolioId = portofolioId;
  task.fields = fields;
  task.lastUpdatedAt = getUtcNow();
  task.status = TaskStatus.DRAFT;

  return task;
}