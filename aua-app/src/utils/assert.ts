import * as httpAssert from 'http-assert';
import * as _ from 'lodash';

export function assert(condition, httpCode = 500, message?) {
  httpAssert(condition, httpCode, message);
}

export const assertRole = (req, ...roles) => {
  if (roles && roles.length) {
    assert(req.cookies['session'], 401, 'Session expired');
    assert(roles.some(r => r === _.get(req, 'user.role')), 403, 'Invalid permission');
  }
};

