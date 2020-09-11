
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
import { getUtcNow } from '../utils/getUtcNow';
import { Lodgement } from '../entity/Lodgement';

function getS3Service() {
  awsConfig();
  return new aws.S3();
}

// Upload your image to S3
async function uploadToS3(id, name, data): Promise<string> {
  const bucketName = process.env.AUA_S3_BUCKET;
  const prefix = process.env.AUA_FILE_PREFIX;

  const key = `${prefix}/${id}/${name}`;
  assert(prefix && id, 404, `image path cannot be composed '${bucketName}/${key}'`);

  const s3 = getS3Service();

  const opt = {
    Bucket: bucketName,
    Key: key,
    Body: data
  };
  const resp = await s3.upload(opt).promise();

  // return the S3's path to the image
  return resp.Location;
}


export const downloadFile = handlerWrapper(async (req, res) => {
  assertRole(req, 'admin', 'client', 'agent');
  const { id } = req.params;
  const { user: {id: userId, role} } = req as any;

  const repo = getRepository(File);
  const file = await repo.findOne(id);
  assert(file, 404);

  if (role === 'client') {
    // Only record the read by client
    file.lastReadAt = getUtcNow();
    await repo.save(file);
  }

  res.redirect(file.location);
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