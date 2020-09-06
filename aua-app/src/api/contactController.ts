
import { getRepository, Not, IsNull } from 'typeorm';
import { User } from '../entity/User';
import { assert, assertRole } from '../utils/assert';
import * as _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { Portofolio } from '../entity/Portofolio';
import { handlerWrapper } from '../utils/asyncHandler';
import { getUtcNow } from '../utils/getUtcNow';
import { JobTemplate } from '../entity/JobTemplate';
import { Notification } from '../entity/Notification';
import { restartCronService } from '../services/cronService';
import { Lodgement } from '../entity/Lodgement';

export const saveContact = handlerWrapper(async (req, res) => {
  const { name, company, contact, message } = req.body;
  assert(name && contact && message, 404, `Invalid contact information`);

  // TODO: Send email

  res.json();
});
