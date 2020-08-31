
import * as aws from 'aws-sdk';
import { getRepository } from 'typeorm';
import { File } from '../entity/File';
import { assert } from '../utils';
import { handlerWrapper } from '../utils/asyncHandler';
import { awsConfig } from '../utils/awsConfig';
import * as path from 'path';
import * as fse from 'fs-extra';
import * as fs from 'fs';
import { uuidToRelativePath } from '../utils/uuidToRelativePath';
import { assertRole } from '../utils';

function getDirByFileId(uuid) {
  const localPath = process.env.AUA_FILE_STORAGE_PATH;
  assert(localPath, 500, `AUA_FILE_STORAGE_PATH is not configured`);
  const env = process.env.NODE_ENV;
  const subDir = uuidToRelativePath(uuid);
  const relative = `${env}/${subDir}`;
  const full = path.resolve(localPath, relative);

  return {
    full,
    relative
  };
}

function getFilePathByFileId(uuid, name) {
  const { full, relative } = getDirByFileId(uuid);
  return {
    full: path.resolve(full, name),
    relative: `${relative}/${name}`
  };
}

export const downloadFile = handlerWrapper(async (req, res) => {
  const { id } = req.params;
  const file = await getRepository(File).findOne(id);
  assert(file, 404);

  const fullPath = path.resolve(process.env.AUA_FILE_STORAGE_PATH, file.location);

  res.download(fullPath);
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
  const { full, relative } = getFilePathByFileId(id, name);

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