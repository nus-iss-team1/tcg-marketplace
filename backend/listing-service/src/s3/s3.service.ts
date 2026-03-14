import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ulid } from "ulid";
import { BASE_FOLDER } from "./constants/s3.constant";

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

  async uploadImage(file: Express.Multer.File, listingId: string) {
    const fileExtension = file.originalname.split(".").pop();
    const key = `${BASE_FOLDER}/${listingId}/${ulid()}.${fileExtension}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype
      })
    );

    return key;
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
