
import { assert } from '../utils/assert';
import * as _ from 'lodash';

export const securityAdminAuthMiddleware = (req, res, next) => {
  assert(_.get(req, 'user.role') === 'admin', 403, 'Access denied.');
  next();
};

export const securityBusinessAuthMiddleware = (req, res, next) => {
  assert(_.get(req, 'user.role') === 'business', 403, 'Access denied.');
  next();
};

export const securityIndividualAuthMiddleware = (req, res, next) => {
  assert(_.get(req, 'user.role') === 'individual', 403, 'Access denied.');
  next();
};
