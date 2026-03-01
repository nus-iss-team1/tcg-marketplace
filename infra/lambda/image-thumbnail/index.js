import sharp from "sharp";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

const s3 = new S3Client({ region: process.env.AWS_REGION });

export const handler = async (event) => {
  const record = event.Records[0];
  const bucket = record.s3.bucket.name;
  const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

  // ignore thumbnail folder
  if (key.startsWith("thumbnails/")) {
    return;
  }

  // retrieve the newly stored image
  const getObject = await s3.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );

  // configure image size to thumbnail
  const imgBuffer = await streamToBuffer(getObject.Body);
  const resizedImg = await sharp(imgBuffer).resize(200, 200).toBuffer();
  const thumbnailKey = key.replace("images/", "thumbnails/");

  // insert thumbnail into s3
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: thumbnailKey,
      Body: resizedImg,
      ContentType: "image/jpeg",
    }),
  );

  const streamToBuffer = async (stream) => {
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  };
};
