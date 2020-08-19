import { Profile } from '../entity/Profile';
import { getUtcNow } from './getUtcNow';

export function createProfileEntity(userId: string, payload: any): Profile {
  const profile = new Profile();
  profile.id = userId;
  profile.givenName = payload.givenName;
  profile.surname = payload.surname;
  profile.company = payload.company;
  profile.dob = payload.dob;
  profile.gender = payload.gender;
  profile.phone = payload.phone;
  profile.address = payload.address;
  profile.wechat = payload.wechat;
  profile.tfn = payload.tfn;
  profile.abn = payload.abn;
  profile.acn = payload.acn;
  profile.occupation = payload.occupation;
  profile.industry = payload.industry;
  profile.remark = payload.remark;
  profile.lastUpdatedAt = getUtcNow();

  return profile;
}
