
import { getRepository, getManager } from 'typeorm';
import { User } from '../entity/User';
import { assert, assertRole } from '../utils/assert';
import { validatePasswordStrength } from '../utils/validatePasswordStrength';
import * as _ from 'lodash';
import { computeUserSecret } from '../utils/computeUserSecret';
import { BusinessProfile } from '../entity/BusinessProfile';
import { IndividualProfile } from '../entity/IndividualProfile';
import { handlerWrapper } from '../utils/asyncHandler';
import { Role } from '../enums/Role';
import { ProfileImage } from '../entity/ProfileImage';
import { createProfileImageEntities } from '../utils/createProfileImageEntities';
import { createBusinessProfileEntity } from '../utils/createBusinessProfileEntity';
import { createIndividualProfileEntity } from '../utils/createIndividualProfileEntity';
import { Image } from '../entity/Image';

async function updateBusinessProfile(userId, payload) {
  const profile = createBusinessProfileEntity(userId, payload);
  const profileImages = createProfileImageEntities(userId, payload.pictures);

  await getManager().transaction(async manager => {
    await manager.getRepository(ProfileImage).delete({userId});
    await manager.save([profile, ...profileImages]);
  });
}

async function updateIndividualProfile(userId, payload) {
  const profile = createIndividualProfileEntity(userId, payload);
  const profileImages = createProfileImageEntities(userId, payload.pictures);

  await getManager().transaction(async manager => {
    await manager.getRepository(ProfileImage).delete({userId});
    await manager.save([profile, ...profileImages]);
  });
}

async function getProfilePictures(userId: string): Promise<Image[]> {
  const profileImageRepo = getRepository(ProfileImage);
  const entities: ProfileImage[] = await profileImageRepo
    .createQueryBuilder('x')
    // .select(['x.imageId'])
    .where({ userId })
    .orderBy('x.ordinal', 'ASC')
    .getMany();

  if (!entities.length) return [];

  const imageIdsMap = new Map(entities.map(x => [x.imageId, x.ordinal]));

  const imageRepo = getRepository(Image);
  const images: Image[] = await imageRepo
    .createQueryBuilder('x')
    .where('x.id IN (:...imageIds)', { imageIds: Array.from(imageIdsMap.keys()) })
    .getMany();

  return _.sortBy(images, [img => imageIdsMap.get(img.id)]);
}

export const getProfile = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'business', 'individual');
  const { id, role } = (req as any).user as User;
  let profile = null;

  switch (role) {
    case Role.Business:
      const businessProfileRepo = getRepository(BusinessProfile);
      profile = await businessProfileRepo.findOne(id);
      break;
    case Role.Individual:
      const individualProfileRepo = getRepository(IndividualProfile);
      profile = await individualProfileRepo.findOne(id);
      break;
    case Role.Admin:
      profile = {};
      break;
    default:
      assert(false, 400, `Invalid role ${role}`);
      break;
  }

  profile.pictures = await getProfilePictures(id);

  res.json(profile);
});


export const updateProfile = handlerWrapper(async (req, res) => {
  assertRole(req, 'business', 'individual');
  const { id, role } = (req as any).user as User;
  const payload = req.body;
  switch (role) {
    case Role.Business:
      await updateBusinessProfile(id, payload);
      break;
    case Role.Individual:
      await updateIndividualProfile(id, payload);
      break;
    default:
      assert(false, 400, `Invalid role ${role}`);
      break;
  }

  res.json();
});

export const changePassword = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'business', 'individual');
  const { password, newPassword } = req.body;
  validatePasswordStrength(newPassword);

  const { user } = req as any;
  assert(password && newPassword && user.secret === computeUserSecret(password, user.salt), 400, 'Invalid password');

  const repo = getRepository(User);
  await repo.update(user.id, { secret: computeUserSecret(newPassword, user.salt) });

  res.json();
});