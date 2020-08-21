import { Portofolio } from '../entity/Portofolio';
import { getUtcNow } from './getUtcNow';

export function createProfileEntity(userId: string, payload: any): Portofolio {
  const profile = new Portofolio();
  profile.id = userId;
  profile.name = payload.name;
  profile.fields = payload.fields;
  profile.lastUpdatedAt = getUtcNow();

  return profile;
}
