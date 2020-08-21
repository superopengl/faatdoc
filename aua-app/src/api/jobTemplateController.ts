
import { getRepository, getManager, getConnection } from 'typeorm';
import { User } from '../entity/User';
import { assert, assertRole } from '../utils/assert';
import { validatePasswordStrength } from '../utils/validatePasswordStrength';
import * as _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { UserStatus } from '../enums/UserStatus';
import { computeUserSecret } from '../utils/computeUserSecret';
import { Profile } from '../entity/Profile';
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

  res.json(null);
});

export const listJobTemplates = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client', 'agent');

  const repo = getRepository(JobTemplate);
  const list = await repo.find({});

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

  res.json(null);
});