
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
import { json } from 'body-parser';
import { normalizeFieldNameToVar } from '../utils/normalizeFieldNameToVar';
import { guessDisplayNameFromFields } from '../utils/guessDisplayNameFromFields';


export const savePortofolio = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client');
  const portofolio = new Portofolio();

  const { user: { id: userId } } = req;

  const { id, fields, type } = req.body;
  portofolio.id = id || uuidv4();
  portofolio.userId = userId;
  portofolio.name = guessDisplayNameFromFields(fields);
  portofolio.fields = fields;
  portofolio.type = type;
  portofolio.lastUpdatedAt = getUtcNow();

  const repo = getRepository(Portofolio);
  await repo.save(portofolio);

  res.json(null);
});

export const listPortofolio = handlerWrapper(async (req, res) => {
  assertRole(req, 'client');

  const list = await getRepository(Portofolio)
    .createQueryBuilder('x')
    .where({userId: req.user.id})
    .orderBy('x.name', 'ASC')
    .select(['x.id', 'x.name', 'x.lastUpdatedAt'])
    .getMany();

  res.json(list);
});

export const getPortofolio = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client');
  const { id } = req.params;
  const repo = getRepository(Portofolio);
  const portofolio = await repo.findOne(id);
  assert(portofolio, 404);

  res.json(portofolio);
});

export const deletePortofolio = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client');
  const { id } = req.params;
  const repo = getRepository(Portofolio);
  await repo.delete({ id });

  res.json(null);
});