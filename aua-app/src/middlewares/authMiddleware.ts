
import { getRepository } from 'typeorm';
import { User } from '../entity/User';
import * as moment from 'moment';
import { getUtcNow } from '../utils/getUtcNow';

function sendSessionExpired(res) {
  return res.sendStatus(401);
}

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers['x-access-token'] || req.headers['authorization'] || req.cookies['session'];
    if (token) {
      const repo = getRepository(User);
      const user = await repo.findOne({ sessionId: token });
      if (!user) {
        // Session expired
        return sendSessionExpired(res);
      }

      const isExpired = !user.lastNudgedAt || moment(user.lastNudgedAt).add(24, 'hours').isBefore();
      if (isExpired) {
        user.sessionId = null;
        await repo.save(user);

        // Session expired
        return sendSessionExpired(res);
      }

      user.lastNudgedAt = getUtcNow();
      repo.save(user).catch(() => {});

      req.user = Object.freeze(user);
    }

    next();
  } catch (err) {
    next(err);
  }
};

