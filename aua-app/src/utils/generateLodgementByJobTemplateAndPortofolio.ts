
import { getRepository } from 'typeorm';
import { assert } from './assert';
import * as _ from 'lodash';
import { Lodgement } from '../entity/Lodgement';
import { getUtcNow } from './getUtcNow';
import { JobTemplate } from '../entity/JobTemplate';
import { Portofolio } from '../entity/Portofolio';
import { LodgementStatus } from '../enums/LodgementStatus';
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

export const generateLodgementByJobTemplateAndPortofolio = async (jobTemplateId, portofolioId, genName: (job: JobTemplate, porto: Portofolio) => string) => {
  assert(jobTemplateId, 400, 'jobTemplateId is not specified');
  assert(portofolioId, 400, 'jobTemplateId is not specified');

  const jobTemplateRepo = getRepository(JobTemplate);
  const jobTemplate = await jobTemplateRepo.findOne(jobTemplateId);
  assert(jobTemplate, 404, 'jobTemplate is not found');

  const portofolioRepo = getRepository(Portofolio);
  const portofolio = await portofolioRepo.findOne(portofolioId);
  assert(portofolio, 404, 'portofolio is not found');

  const lodgement = new Lodgement();

  const fields = prefillFieldsWithProtofolio(jobTemplate.fields, portofolio?.fields);

  lodgement.id = uuidv4();
  lodgement.name = genName(jobTemplate, portofolio);
  lodgement.forWhom = guessDisplayNameFromFields(fields);
  lodgement.userId = portofolio.userId;
  lodgement.jobTemplateId = jobTemplateId;
  lodgement.portofolioId = portofolioId;
  lodgement.fields = fields;
  lodgement.lastUpdatedAt = getUtcNow();
  lodgement.status = LodgementStatus.DRAFT;

  return lodgement;
}