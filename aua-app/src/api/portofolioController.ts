
import { getManager, getRepository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Portofolio } from '../entity/Portofolio';
import { User } from '../entity/User';
import { assert, assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { getUtcNow } from '../utils/getUtcNow';
import { guessDisplayNameFromFields } from '../utils/guessDisplayNameFromFields';

export const savePortofolio = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client');
  const portofolio = new Portofolio();

  const { user: { id: userId } } = req as any;

  const { id, fields, type } = req.body;
  portofolio.id = id || uuidv4();
  portofolio.userId = userId;
  portofolio.name = guessDisplayNameFromFields(fields);
  portofolio.fields = fields;
  portofolio.type = type;
  portofolio.lastUpdatedAt = getUtcNow();

  const repo = getRepository(Portofolio);
  await repo.save(portofolio);

  res.json();
});

async function listMyPortofolio(userId) {
  const list = await getRepository(Portofolio)
    .createQueryBuilder('x')
    .where({ userId, deleted: false })
    .orderBy('x.name', 'ASC')
    .select(['x.id', 'x.name', 'x.lastUpdatedAt'])
    .getMany();
  return list;
}

async function listAdminPortofolio() {
  const list = await getManager()
    .createQueryBuilder()
    .from(Portofolio, 'x')
    .where({ deleted: false })
    .innerJoin(q => q.from(User, 'u').where(`u.role = 'client'`), 'u', 'u.id = x."userId"')
    .orderBy('x.name', 'ASC')
    .select([
      'x.id as id',
      'x.name as name',
      'u.email as email'
    ])
    .execute();
  return list;
}

export const listPortofolio = handlerWrapper(async (req, res) => {
  assertRole(req, 'client', 'admin');
  const { user: {id, role }} = req as any;
  const list = role === 'client' ? await listMyPortofolio(id) :
    role === 'admin' ? await listAdminPortofolio() :
      [];

  res.json(list);
});


export const getPortofolio = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client');
  const { id } = req.params;
  const repo = getRepository(Portofolio);
  const portofolio = await repo.findOne({ id, deleted: false });
  assert(portofolio, 404);

  res.json(portofolio);
});

export const deletePortofolio = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client');
  const { id } = req.params;
  const repo = getRepository(Portofolio);
  await repo.update({ id }, { deleted: true });

  res.json();
});