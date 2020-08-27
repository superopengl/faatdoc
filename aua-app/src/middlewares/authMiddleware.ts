
import { getRepository } from 'typeorm';
import { User } from '../entity/User';
import * as moment from 'moment';
import { getUtcNow } from '../utils/getUtcNow';
import { verifyJwtFromCookie, attachJwtCookie } from '../utils/jwt';

export const authMiddleware = async (req, res, next) => {
  try {
    const user = verifyJwtFromCookie(req);
    if (user) {
      // Logged in users
      const { id } = user;
      getRepository(User).update(id, { lastNudgedAt: getUtcNow() }).catch(() => { });
      req.user = Object.freeze(user);
      attachJwtCookie(user, res);
    } else {
      // Guest user (hasn't logged in)
    }
    next();
  } catch (err) {
    next(err);
  }
};

