
import { getRepository } from 'typeorm';
import { assert, assertRole } from '../utils';
import { v4 as uuidv4 } from 'uuid';
import { handlerWrapper } from '../utils/asyncHandler';

export function createList(entityType, ...roles) {
  return handlerWrapper(async (req, res) => {
    assertRole(req, ...roles);
    const repo = getRepository(entityType);
    const entities = await repo.createQueryBuilder('x')
      // .select(['x.id'])
      // .where('x.status = :status', {status: 'enabled'})
      .orderBy('x.ordinal', 'ASC', 'NULLS LAST')
      .addOrderBy('x.createdAt', 'ASC')
      .getMany();
    // const list = entities.map(x => (x as any).id);
    res.json(entities);
  });
}

export function createGet(entityType, ...roles) {
  return handlerWrapper(async (req, res) => {
    assertRole(req, ...roles);
    const { id } = req.params;
    const repo = getRepository(entityType);
    const item = await repo.findOne(id);
    assert(item, 404);
    res.json(item);
  });
}

export function createSave(entityType, ...roles) {
  return handlerWrapper(async (req, res) => {
    assertRole(req, ...roles);
    const entity = Object.assign({ id: uuidv4() }, req.body); // Allocate id if not specified.
    const repo = getRepository(entityType);
    await repo.save(entity);
    res.sendStatus(200);
  });
}

export function createDelete(entityType, ...roles) {
  return handlerWrapper(async (req, res) => {
    assertRole(req, ...roles);
    const { id } = req.params;
    const repo = getRepository(entityType);
    await repo.delete({ id });
    res.sendStatus(200);
  });
}