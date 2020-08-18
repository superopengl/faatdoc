import { IndividualProfile } from '../entity/IndividualProfile';

export function createIndividualProfileEntity(userId: string, payload: any): IndividualProfile {
  const profile = new IndividualProfile();
  profile.id = userId;
  profile.name = payload.name;
  profile.secondaryName = payload.secondaryName;
  profile.phone = payload.phone;
  profile.referrer = payload.referrer;
  profile.approvalDirector = payload.approvalDirector;
  profile.address = payload.address;
  profile.dob = payload.dob;
  profile.gender = payload.gender;
  profile.wechat = payload.wechat;
  profile.facebook = payload.facebook;
  profile.instagram = payload.instagram;
  profile.skype = payload.skype;
  profile.occupation = payload.occupation;
  profile.hobby = payload.hobby;

  return profile;
}
