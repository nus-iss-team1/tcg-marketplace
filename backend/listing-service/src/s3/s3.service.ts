import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ulid } from "ulid";
import sharp from "sharp";
import { IMAGE_FOLDER, THUMBNAIL_FOLDER } from "./constants/s3.constant";

@Injectable()
export class S3Service {
  private s3: S3Client;
  private region: string;
  private bucket: string;

  constructor(configService: ConfigService) {
    this.region = configService.getOrThrow<string>("AWS_REGION");
    this.bucket = configService.getOrThrow<string>("AWS_S3_BUCKET");

    this.s3 = new S3Client({
      region: this.region
    });
  }

  async uploadImage(file: Express.Multer.File, listingId: string, frontImage: boolean) {
    const filename = ulid();
    const fileExtension = file.originalname.split(".").pop();
    const imageKey = `${IMAGE_FOLDER}/${listingId}/${filename}.${fileExtension}`;
    let thumbnailKey = "";

    // insert original file into s3
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: imageKey,
        Body: file.buffer,
        ContentType: file.mimetype
      })
    );

    if (frontImage) {
      thumbnailKey = `${THUMBNAIL_FOLDER}/${listingId}/${filename}.${fileExtension}`;

      // create thumbnail
      const thumbnailBuffer = await sharp(file.buffer)
        .resize(300, 300, { fit: "inside" })
        .jpeg({ quality: 80 })
        .toBuffer();

      // insert thumbnail into s3
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: thumbnailKey,
          Body: thumbnailBuffer,
          ContentType: file.mimetype
        })
      );
    }

    return [imageKey, thumbnailKey];
  }

  async deleteObject(key: string) {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key
      })
    );
  }
}
