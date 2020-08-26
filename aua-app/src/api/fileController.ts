
import * as aws from 'aws-sdk';
import { getRepository } from 'typeorm';
import { File } from '../entity/File';
import { assert } from '../utils';
import { handlerWrapper } from '../utils/asyncHandler';
import { awsConfig } from '../utils/awsConfig';
import * as path from 'path';
import * as fse from 'fs-extra';
import { uuidToRelativePath } from '../utils/uuidToRelativePath';
import { assertRole } from '../utils';

function getPathByFileId(uuid) {
  const localPath = process.env.AUA_FILE_STORAGE_PATH;
  const env = process.env.NODE_ENV;
  const subDir = uuidToRelativePath(uuid);
  const relative = `${env}/${subDir}`;
  const full = path.resolve(localPath, relative);

  return {
    full,
    relative
  };
}

export const downloadFile = handlerWrapper(async (req, res) => {
  const { id } = req.params;
  // const repo = getRepository(File);
  // const file = await repo.findOne(id);
  // assert(file, 404);

  const { full } = getPathByFileId(id);
  res.download(full);
});

export const getFile = handlerWrapper(async (req, res) => {
  const { id } = req.params;
  const repo = getRepository(File);
  const image = await repo.findOne(id);
  assert(image, 404);
  res.json(image);
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
  const { full, relative } = getPathByFileId(id);

  await fse.outputFile(full, data);

  const entity: File = {
    id,
    fileName: name,
    mime: mimetype,
    location: relative,
    md5
  };

  const repo = getRepository(File);
  await repo.insert(entity);

  res.json(entity);
});