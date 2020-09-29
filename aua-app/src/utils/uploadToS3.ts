import { assert } from '.';
import * as aws from 'aws-sdk';
import { awsConfig } from './awsConfig';

function getS3Service() {
  awsConfig();
  return new aws.S3();
}// Upload your image to S3

export async function uploadToS3(id, name, data): Promise<string> {
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
