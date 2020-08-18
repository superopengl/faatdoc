
import * as aws from 'aws-sdk';
import { getRepository } from 'typeorm';
import { Image } from '../entity/Image';
import { assert } from '../utils';
import { handlerWrapper } from '../utils/asyncHandler';
import { awsConfig } from '../utils/awsConfig';

export const getImage = handlerWrapper(async (req, res) => {
  const { id } = req.params;
  const repo = getRepository(Image);
  const image = repo.findOne(id);
  assert(image, 404);
  res.json(image);
});


function getS3Service() {
  awsConfig();
  return new aws.S3();
}

// Upload your image to S3
async function uploadToS3(id, data): Promise<string> {
  const bucketName = process.env.AUA_S3_BUCKET;
  const prefix = process.env.AUA_IMAGE_PREFIX;

  assert(prefix && id, 404, `image path cannot be composed '${bucketName}/${prefix}/${id}'`);

  const s3 = getS3Service();

  const opt = {
    Bucket: bucketName,
    Key: `${prefix}/${id}`,
    Body: data
  };
  const resp = await s3.upload(opt).promise();

  // return the S3's path to the image
  return resp.Location;
}

export const uploadImage = handlerWrapper(async (req, res) => {
  // assertRole(req, 'admin', 'business', 'individual');
  const { id } = req.params;
  assert(id, 404, 'Image ID not specified');
  const { file } = (req as any).files;
  assert(file, 404, 'No file uploaded');
  const { name, data, mimetype, md5 } = file;

  const location = await uploadToS3(id, data);

  const image: Image = {
    id,
    fileName: name,
    mime: mimetype,
    location,
    md5
  };

  const repo = getRepository(Image);
  await repo.insert(image);

  res.json(image);
});