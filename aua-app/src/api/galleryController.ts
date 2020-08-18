
import { getRepository } from 'typeorm';
import { assertRole } from '../utils';
import { v4 as uuidv4, validate as isUuid } from 'uuid';
import { Gallery } from '../entity/Gallery';
import { createGet, createDelete } from './genericControllerFactory';
import { handlerWrapper } from '../utils/asyncHandler';

export const listGallery = handlerWrapper(async (req, res) => {
  const { group } = req.query;
  const repo = getRepository(Gallery);

  let query = await repo.createQueryBuilder('x');
  if (group) {
    query = query.where('x.group = :group', { group });
  }
  const list = await query
    .orderBy('x.group', 'ASC')
    .addOrderBy('x.ordinal', 'ASC', 'NULLS LAST')
    .addOrderBy('x.createdAt', 'ASC')
    .getMany();

  res.json(list);
});

export const getGallery = createGet(Gallery);
// export const saveGallery = createSave(Gallery, 'admin');
export const deleteGallery = createDelete(Gallery, 'admin');

export const saveGallery = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const entity: Gallery = Object.assign({ id: uuidv4() }, req.body); // Allocate id if not specified.
  const { imageIdOrVideoUrl } = req.body;
  if (isUuid(imageIdOrVideoUrl)) {
    entity.type = 'image';
    entity.imageId = imageIdOrVideoUrl;
  } else {
    entity.type = 'video';
    entity.videoUrl = imageIdOrVideoUrl;
  }
  const repo = getRepository(Gallery);
  await repo.save(entity);
  res.sendStatus(200);
});