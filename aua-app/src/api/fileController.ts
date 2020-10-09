
import { getRepository } from 'typeorm';
import { File } from '../entity/File';
import { assert } from '../utils';
import { handlerWrapper } from '../utils/asyncHandler';
import * as path from 'path';
import * as fse from 'fs-extra';
import * as fs from 'fs';
import { uuidToRelativePath } from '../utils/uuidToRelativePath';
import { assertRole } from '../utils';
import { getUtcNow } from '../utils/getUtcNow';
import { Job } from '../entity/Job';
import { getS3ObjectStream, uploadToS3 } from '../utils/uploadToS3';

export const downloadFile = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client', 'agent');
  const { id } = req.params;
  const { user: { id: userId, role } } = req as any;

  const repo = getRepository(File);
  const file = await repo.findOne(id);
  assert(file, 404);

  if (role === 'client') {
    // Only record the read by client
    file.lastReadAt = getUtcNow();
    await repo.save(file);
  }

  const { fileName, mime } = file;

  const stream = getS3ObjectStream(id, fileName);
  res.setHeader('Content-type', mime);
  res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
  
  stream.pipe(res);
});

export const getFile = handlerWrapper(async (req, res) => {
  const { id } = req.params;
  const repo = getRepository(File);
  const file = await repo.findOne(id);
  assert(file, 404);
  res.json(file);
});

export const searchFileList = handlerWrapper(async (req, res) => {
  const { ids } = req.body;
  const files = await getRepository(File)
    .createQueryBuilder()
    .where('id IN(:...ids)', { ids })
    .getMany();
  res.json(files);
});


export const uploadFile = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client', 'agent');
  const { id } = req.params;
  assert(id, 404, 'Image ID not specified');
  const { file } = (req as any).files;
  assert(file, 404, 'No file uploaded');
  const { name, data, mimetype, md5 } = file;

  const location = await uploadToS3(id, name, data);

  const entity: File = {
    id,
    fileName: name,
    mime: mimetype,
    location,
    md5,
  };

  const repo = getRepository(File);
  await repo.insert(entity);

  res.json(entity);
});