import { BusinessProfile } from '../entity/BusinessProfile';
export function createBusinessProfileEntity(userId: string, payload: any): BusinessProfile {
  const profile = new BusinessProfile();
  profile.id = userId;
  profile.name = payload.name;
  profile.secondaryName = payload.secondaryName;
  profile.phone = payload.phone;
  profile.referrer = payload.referrer;
  profile.approvalDirector = payload.approvalDirector;
  profile.address = payload.address;
  profile.contact = payload.contact;
  profile.facebook = payload.facebook;
  profile.instagram = payload.instagram;
  profile.website = payload.website;
  profile.remark = payload.remark;

  return profile;
}

