import * as AWS from "aws-sdk";
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

const bucketName = process.env.UPLOAD_S3_BUCKET
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)


export async function getAttachementUrl(todoId: string): Promise<string> {
  return `https://${bucketName}.s3.amazonaws.com/${todoId}`;
}

export async function getUploadUrlS3(todoId: string): Promise<string> {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: urlExpiration
  });
}
