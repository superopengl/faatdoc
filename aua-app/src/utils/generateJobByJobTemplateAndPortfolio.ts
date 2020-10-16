
import { getRepository, In } from 'typeorm';
import { assert } from './assert';
import * as _ from 'lodash';
import { Job } from '../entity/Job';
import { GenDoc } from '../types/GenDoc';
import { getUtcNow } from './getUtcNow';
import { JobTemplate } from '../entity/JobTemplate';
import { Portfolio } from '../entity/Portfolio';
import { JobStatus } from '../types/JobStatus';
import { guessDisplayNameFromFields } from './guessDisplayNameFromFields';
import { v4 as uuidv4 } from 'uuid';
import { DocTemplate } from '../entity/DocTemplate';
import { JobDoc } from '../types/JobDoc';


function prefillFieldsWithProtofolio(jobTemplateFields, portfolioFields) {
  if (!portfolioFields) return jobTemplateFields;

  const map = new Map(portfolioFields.map(({ name, value }) => [name, value]));
  const fields = jobTemplateFields.map(jobTemplate => (
    {
      ...jobTemplate,
      value: map.get(jobTemplate.name)
    }
  ));

  return fields;
}

function mapDocTemplatesToGenDocs(docTemplates: DocTemplate[]): JobDoc[] {
  return docTemplates.map(x => {
    const jobDoc = new JobDoc();
    jobDoc.docTemplateId = x.id;
    // docTemplateName: x.name,
    // docTemplateDescription: x.description,
    jobDoc.variables = x.variables.map(name => ({ name, value: undefined }));
    jobDoc.fileName = `${x.name}.pdf`;
    return jobDoc;
  });
}

export const generateJobByJobTemplateAndPortfolio = async (jobTemplateId, portfolioId, genName: (job: JobTemplate, porto: Portfolio) => string) => {
  assert(jobTemplateId, 400, 'jobTemplateId is not specified');
  assert(portfolioId, 400, 'jobTemplateId is not specified');

  const jobTemplateRepo = getRepository(JobTemplate);
  const jobTemplate = await jobTemplateRepo.findOne(jobTemplateId);
  assert(jobTemplate, 404, 'jobTemplate is not found');

  const portfolioRepo = getRepository(Portfolio);
  const portfolio = await portfolioRepo.findOne(portfolioId);
  assert(portfolio, 404, 'portfolio is not found');

  const docTemplates = jobTemplate.docTemplateIds.length ?
    await getRepository(DocTemplate).find({ where: { id: In(jobTemplate.docTemplateIds) } }) :
    [];

  const job = new Job();

  const fields = prefillFieldsWithProtofolio(jobTemplate.fields, portfolio.fields);

  // job.id = uuidv4();
  job.name = genName(jobTemplate, portfolio);
  job.forWhom = guessDisplayNameFromFields(portfolio.fields);
  job.userId = portfolio.userId;
  job.jobTemplateId = jobTemplateId;
  job.portfolioId = portfolioId;
  job.fields = fields;
  job.docs = mapDocTemplatesToGenDocs(docTemplates);
  job.lastUpdatedAt = getUtcNow();
  job.status = JobStatus.TODO;

  return job;
};