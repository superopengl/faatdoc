import { assert } from './assert';
import { ProfileImage } from '../entity/ProfileImage';

export function createProfileImageEntities(userId: string, pictures: string[] = []): Array<ProfileImage> {
  assert(userId, 400, 'Cannot create member_image entity');
  if (!pictures)
    return [];
  return pictures.filter(x => !!x).map((imageId, index) => {
    const memberImage = new ProfileImage();
    memberImage.userId = userId;
    memberImage.imageId = imageId;
    memberImage.ordinal = index + 1;
    return memberImage;
  });
}


