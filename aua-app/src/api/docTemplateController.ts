
import { getRepository } from 'typeorm';
import { assert, assertRole } from '../utils/assert';
import * as _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { handlerWrapper } from '../utils/asyncHandler';
import { getUtcNow } from '../utils/getUtcNow';
import { DocTemplate } from '../entity/DocTemplate';
import * as moment from 'moment';
import * as markdownpdf from 'markdown-pdf';
import * as stringToStream from 'string-to-stream';
import { uploadToS3 } from '../utils/uploadToS3';
import * as MarkdownIt from 'markdown-it';
import * as markdownItPdf from 'markdown-it-pdf';

const mdParser = new MarkdownIt().use(markdownItPdf);

function extractVariables(md: string) {
  const pattern = /\{\{[a-zA-Z]+\}\}/ig;
  const all = (md.match(pattern) || []).map(x => x.replace(/^\{\{/, '').replace(/\}\}$/, ''));
  const set = new Set(all);
  return Array.from(set);
}

export const saveDocTemplate = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin');
  const docTemplate = new DocTemplate();

  const { id, name, description, md } = req.body;
  assert(name, 400, 'name is empty');
  docTemplate.id = id || uuidv4();
  docTemplate.name = name;
  docTemplate.description = description;
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
    .select(['id', 'name', 'description', 'variables', `"createdAt"`, '"lastUpdatedAt"'])
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

  const { variables, description, name } = docTemplate;

  const usedVars = variables.reduce((pre, cur) => {
    const pattern = `{{${cur}}}`;
    const replacement = pattern === `{{now}}` ? moment(getUtcNow()).format('D MMM YYYY') : _.get(inboundVariables, cur, '');
    pre[cur] = replacement;
    return pre;
  }, {});

  res.json({
    name,
    description,
    usedVars,
  });
});

async function mdToPdfBuffer(md) {
  return new Promise((resolve, reject) => {
    markdownpdf().from.string(md).to.buffer(null, function (err, PdfBuffer) {
      if (err) {
        reject(err);
      } else {
        resolve(PdfBuffer);
      }
    });
  });
}

export const createPdfFromDocTemplate = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'agent', 'client');
  const { id } = req.params;
  const { variables: inboundVariables } = req.body;
  const repo = getRepository(DocTemplate);
  const docTemplate = await repo.findOne(id);
  assert(docTemplate, 404);

  const { name, md, variables } = docTemplate;

  const filledMarkdown = variables.reduce((pre, cur) => {
    const pattern = new RegExp(`{{${cur}}}`, 'g');
    const replacement = cur === `now` ? moment(getUtcNow()).format('D MMM YYYY') : inboundVariables[cur];

    assert(replacement !== undefined, 400, `Variable '${cur}' is missing`);
    return pre.replace(pattern, replacement);
  }, md);


  const pdfFileId = uuidv4();
  const pdfFileName = `${name}.pdf`;

  const data = await mdToPdfBuffer(filledMarkdown);

  const location = await uploadToS3(pdfFileId, pdfFileName, data);

  const result = {
    id: pdfFileId,
    name: pdfFileName,
    location,
  };

  res.json(result);
});

