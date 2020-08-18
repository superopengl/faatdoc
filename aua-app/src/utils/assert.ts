import * as httpAssert from 'http-assert';

export function assert(condition, httpCode = 500, message?) {
  httpAssert(condition, httpCode, message);
}

export const assertRole = (req, ...roles) => {
  if (roles && roles.length) {
    const { user } = req as any;
    assert(user && roles.some(r => r === user.role), 403, 'Invalid permission');
  }
};

