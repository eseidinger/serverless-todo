import * as AWS from "aws-sdk";

const s3 = new AWS.S3({
  signatureVersion: 'v4'
})

const bucketName = process.env.UPLOAD_S3_BUCKET
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)


export function getAttachementUrl(todoId: string): string {
  return `https://${bucketName}.s3.amazonaws.com/${todoId}`;
}

export function getUploadUrlS3(todoId: string): string {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: urlExpiration
  });
}
