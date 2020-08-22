
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
import { getLabelFromName } from '../utils/getLabelFromName';


function prefillFieldsWithProtofolio(jobTemplateFields, portofolioFields) {
  if (!portofolioFields) return jobTemplateFields;

  const map = new Map(Object.entries(portofolioFields).map(([k, v]) => [getLabelFromName(k), v]));
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

  lodgement.userId = userId;
  lodgement.jobTemplateId = jobTemplateId;
  lodgement.portofolioId = portofolioId;
  lodgement.fields = fields;
  lodgement.lastUpdatedAt = getUtcNow();

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
      nextStatii = [s.READY, s.TO_REVISE];
      break;
    case s.TO_REVISE:
      nextStatii = [s.SUBMITTED, s.TO_REVISE];
      break;
    case s.READY:
      nextStatii = [s.TO_SIGN, s.DONE];
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

  const repo = getRepository(Lodgement);
  const list = await repo.find({});

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