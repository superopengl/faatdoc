
import { getManager, getRepository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Portfolio } from '../entity/Portfolio';
import { User } from '../entity/User';
import { assert, assertRole } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { getUtcNow } from '../utils/getUtcNow';
import { guessDisplayNameFromFields } from '../utils/guessDisplayNameFromFields';

export const savePortfolio = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client');
  const portfolio = new Portfolio();

  const { user: { id: userId } } = req as any;

  const { id, fields, type } = req.body;
  portfolio.id = id || uuidv4();
  portfolio.userId = userId;
  portfolio.name = guessDisplayNameFromFields(fields);
  portfolio.fields = fields;
  portfolio.type = type;
  portfolio.lastUpdatedAt = getUtcNow();

  const repo = getRepository(Portfolio);
  await repo.save(portfolio);

  res.json();
});

async function listMyPortfolio(userId) {
  const list = await getRepository(Portfolio)
    .createQueryBuilder('x')
    .where({ userId, deleted: false })
    .orderBy('x.name', 'ASC')
    .select(['x.id', 'x.name', 'x.lastUpdatedAt'])
    .getMany();
  return list;
}

async function listAdminPortfolio() {
  const list = await getManager()
    .createQueryBuilder()
    .from(Portfolio, 'x')
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

export const listPortfolio = handlerWrapper(async (req, res) => {
  assertRole(req, 'client', 'admin');
  const { user: {id, role }} = req as any;
  const list = role === 'client' ? await listMyPortfolio(id) :
    role === 'admin' ? await listAdminPortfolio() :
      [];

  res.json(list);
});


export const getPortfolio = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client');
  const { id } = req.params;
  const repo = getRepository(Portfolio);
  const portfolio = await repo.findOne({ id, deleted: false });
  assert(portfolio, 404);

  res.json(portfolio);
});

export const deletePortfolio = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client');
  const { id } = req.params;
  const repo = getRepository(Portfolio);
  await repo.update({ id }, { deleted: true });

  res.json();
});