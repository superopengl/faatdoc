
import { getRepository } from 'typeorm';
import { assert } from './assert';
import * as _ from 'lodash';
import { Job } from '../entity/Job';
import { getUtcNow } from './getUtcNow';
import { JobTemplate } from '../entity/JobTemplate';
import { Portofolio } from '../entity/Portofolio';
import { JobStatus } from '../enums/JobStatus';
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

export const generateJobByJobTemplateAndPortofolio = async (jobTemplateId, portofolioId, genName: (job: JobTemplate, porto: Portofolio) => string) => {
  assert(jobTemplateId, 400, 'jobTemplateId is not specified');
  assert(portofolioId, 400, 'jobTemplateId is not specified');

  const jobTemplateRepo = getRepository(JobTemplate);
  const jobTemplate = await jobTemplateRepo.findOne(jobTemplateId);
  assert(jobTemplate, 404, 'jobTemplate is not found');

  const portofolioRepo = getRepository(Portofolio);
  const portofolio = await portofolioRepo.findOne(portofolioId);
  assert(portofolio, 404, 'portofolio is not found');

  const job = new Job();

  const fields = prefillFieldsWithProtofolio(jobTemplate.fields, portofolio.fields);

  // job.id = uuidv4();
  job.name = genName(jobTemplate, portofolio);
  job.forWhom = guessDisplayNameFromFields(portofolio.fields);
  job.userId = portofolio.userId;
  job.jobTemplateId = jobTemplateId;
  job.portofolioId = portofolioId;
  job.fields = fields;
  job.lastUpdatedAt = getUtcNow();
  job.status = JobStatus.TODO;

  return job;
}