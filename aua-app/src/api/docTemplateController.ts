
import { getRepository } from 'typeorm';
import { assert, assertRole } from '../utils/assert';
import * as _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { handlerWrapper } from '../utils/asyncHandler';
import { getUtcNow } from '../utils/getUtcNow';
import { DocTemplate } from '../entity/DocTemplate';
import * as moment from 'moment';
import * as markdownpdf from 'markdown-pdf';
import * as fs from 'fs';
import * as stringToStream from 'string-to-stream';

function extractVariables(md: string) {
  const pattern = /\{\{[a-zA-Z]+\}\}/ig;
  const all = (md.match(pattern) || []).map(x => x.replace(/^\{\{/, '').replace(/\}\}$/, ''));
  const set = new Set(all);
  return Array.from(set);
}

export const saveDocTemplate = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const docTemplate = new DocTemplate();

  const { id, name, md } = req.body;
  assert(name, 400, 'name is empty');
  docTemplate.id = id || uuidv4();
  docTemplate.name = name;
  docTemplate.md = md;
  docTemplate.variables = extractVariables(md);
  docTemplate.lastUpdatedAt = getUtcNow();

  const repo = getRepository(DocTemplate);
  await repo.save(docTemplate);

  res.json();
});

export const listDocTemplates = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');

  const list = await getRepository(DocTemplate)
    .createQueryBuilder('x')
    .orderBy('x.createdAt', 'ASC')
    .select(['id', 'name', 'variables', `"createdAt"`, '"lastUpdatedAt"'])
    .execute();

  res.json(list);
});

export const getDocTemplate = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client', 'agent');
  const { id } = req.params;
  const repo = getRepository(DocTemplate);
  const docTemplate = await repo.findOne(id);
  assert(docTemplate, 404);

  res.json(docTemplate);
});

export const deleteDocTemplate = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const { id } = req.params;
  const repo = getRepository(DocTemplate);
  await repo.delete({ id });

  res.json();
});

export const applyDocTemplate = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { id } = req.params;
  const { variables: inboundVariables } = req.body;
  const repo = getRepository(DocTemplate);
  const docTemplate = await repo.findOne(id);
  assert(docTemplate, 404);

  const { variables } = docTemplate;

  const usedVars = variables.reduce((pre, cur) => {
    const pattern = `{{${cur}}}`;
    const replacement = pattern === `{{now}}` ? moment(getUtcNow()).format('D MMM YYYY') : _.get(inboundVariables, cur, '');
    pre[cur] = replacement;
    return pre;
  }, {});

  res.json({
    usedVars,
  });
});

export const renderPdfFromDocTemplate = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { id } = req.params;
  const { variables: inboundVariables } = req.body;
  const repo = getRepository(DocTemplate);
  const docTemplate = await repo.findOne(id);
  assert(docTemplate, 404);

  const { name, md, variables } = docTemplate;

  const renderedMarkdown = variables.reduce((pre, cur) => {
    const pattern = `{{${cur}}}`;
    const replacement = pattern === `{{now}}` ? moment(getUtcNow()).format('D MMM YYYY') : _.get(inboundVariables, cur, '');

    return pre.replace(pattern, replacement);
  }, md);


  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${name}.pdf`);

  stringToStream(renderedMarkdown)
    .pipe(markdownpdf())
    .pipe(res);
});

