
import { getRepository } from 'typeorm';
import { Business } from '../entity/Business';
import { createGet, createSave, createDelete } from './genericControllerFactory';
import { handlerWrapper } from '../utils/asyncHandler';

export const listBusiness = handlerWrapper(async (req, res) => {
  const { group } = req.query;
  const repo = getRepository(Business);

  let query = await repo.createQueryBuilder('x');
  if (group) {
    query = query.where(`:group = ANY (x.group)`, {group});
  }
  const list = await query
    .addOrderBy('x.ordinal', 'ASC', 'NULLS LAST')
    .addOrderBy('x.createdAt', 'ASC')
    .getMany();

  res.json(list);
});
export const getBusiness = createGet(Business);
export const saveBusiness = createSave(Business, 'admin');
export const deleteBusiness = createDelete(Business, 'admin');