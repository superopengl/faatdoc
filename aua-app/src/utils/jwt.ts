
import * as jwt from 'jsonwebtoken';
import { User } from '../entity/User';
import { getUtcNow } from './getUtcNow';
import * as moment from 'moment';
import { UserRole } from 'aws-sdk/clients/workmail';
import { assert } from './assert';

const cookieName = 'jwt';
const isProd = process.env.NODE_ENV === 'prod';

export function attachJwtCookie(user: { id: string, email: string, role: UserRole }, res) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    expires: moment(getUtcNow()).add(24, 'hours').toDate()
  };
  const token = jwt.sign(payload, JwtSecret);

  res.cookie(cookieName, token, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    expires: moment(getUtcNow()).add(24, 'hours').toDate(),
    signed: false,
    sameSite: isProd ? 'strict' : undefined,
    secure: isProd ? true : undefined,
 
  });

}

export const JwtSecret = 'techseeding.aua';

export function verifyJwtFromCookie(req): { id: string, email: string, role: UserRole } {
  const token = req.cookies[cookieName];
  let user = null;
  if (token) {
    user = jwt.verify(token, JwtSecret);
    const { expires } = user;
    assert(moment(expires).isAfter(), 401, 'Token expired');
  }

  return user;
}

export function clearJwtCookie(res) {
  res.clearCookie(cookieName);
}