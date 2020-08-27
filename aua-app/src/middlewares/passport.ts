import * as passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { getRepository } from 'typeorm';
import { User } from '../entity/User';
import { computeUserSecret } from '../utils/computeUserSecret';
import { UserStatus } from '../enums/UserStatus';
import { assert } from '../utils';
import { getUtcNow } from '../utils/getUtcNow';

passport.use(new LocalStrategy({
  usernameField: 'name',
  passwordField: 'password'
}, async (name, password, done) => {
  try {
    const repo = getRepository(User);
    const user: User = await repo
      .createQueryBuilder()
      .where(
        'LOWER(email) = LOWER(:name) AND status != :status',
        {
          name,
          status: UserStatus.Disabled
        })
      .getOne();

    assert(user, 400, 'User or password is not valid');

    // Validate passpord
    const hash = computeUserSecret(password, user.salt);
    assert(hash === user.secret, 400, 'User or password is not valid');

    user.lastLoggedInAt = getUtcNow();
    getRepository(User).save(user).catch(() => {});

    done(null, Object.freeze(user));
  } catch (err) {
    done(err);
  }
}));

passport.serializeUser((user: User, done) => {
  done(null, user?.sessionId);
});

passport.deserializeUser(async (id, done) => {
  try {
    if (!id) {
      return done(null, null);
    }
    const repo = getRepository(User);
    const user = await repo.findOne({ sessionId: id });

    if (!user) {
      return done(null, false);
    }
  } catch (err) {
    done(err);
  }
});

export default passport;