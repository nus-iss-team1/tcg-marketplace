import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
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

  private sanitizeFilename(filename: string) {
    return filename
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9.-]/g, "");
  }

  async uploadImage(file: Express.Multer.File, listingId: string) {
    const key = `${BASE_FOLDER}/${listingId}/${this.sanitizeFilename(file.originalname)}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype
      })
    );

    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
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
