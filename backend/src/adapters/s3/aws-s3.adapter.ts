import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { 
  S3Client, 
  GetObjectCommand, 
  PutObjectCommand, 
  DeleteObjectCommand,
  CopyObjectCommand 
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Adapter, PresignedUrlRequest, PresignedUrlResponse } from './s3.adapter.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AWSS3Adapter implements S3Adapter {
  private readonly logger = new Logger(AWSS3Adapter.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>('BUCKET_NAME');
    
    if (!this.bucketName) {
      throw new Error('BUCKET_NAME environment variable is required');
    }

    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION', 'ap-southeast-1'),
    });

    this.logger.log(`S3 Adapter initialized with bucket: ${this.bucketName}`);
  }

  async generatePresignedUrl(key: string, operation: 'PUT' | 'GET'): Promise<string> {
    try {
      const command = operation === 'PUT' 
        ? new PutObjectCommand({ Bucket: this.bucketName, Key: key })
        : new GetObjectCommand({ Bucket: this.bucketName, Key: key });

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600, // 1 hour
      });

      this.logger.debug(`Generated ${operation} presigned URL for key: ${key}`);
      return signedUrl;
    } catch (error) {
      this.logger.error(`Failed to generate presigned URL for key ${key}:`, error);
      throw new Error(`Failed to generate presigned URL: ${error.message}`);
    }
  }

  async generateUploadUrl(request: PresignedUrlRequest): Promise<PresignedUrlResponse> {
    try {
      // Generate unique key with timestamp and UUID
      const timestamp = new Date().toISOString().split('T')[0];
      const uniqueId = uuidv4();
      const fileExtension = request.filename.split('.').pop();
      const key = `temp/uploads/${timestamp}/${uniqueId}.${fileExtension}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: request.contentType,
      });

      const uploadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600, // 1 hour
      });

      this.logger.log(`Generated upload URL for file: ${request.filename}`);

      return {
        uploadUrl,
        key,
        expiresIn: 3600,
      };
    } catch (error) {
      this.logger.error(`Failed to generate upload URL for ${request.filename}:`, error);
      throw new Error(`Failed to generate upload URL: ${error.message}`);
    }
  }

  async deleteObject(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`Deleted object with key: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete object ${key}:`, error);
      throw new Error(`Failed to delete object: ${error.message}`);
    }
  }

  async moveObject(sourceKey: string, destinationKey: string): Promise<void> {
    try {
      // Copy object to new location using CopyObjectCommand
      const copyCommand = new CopyObjectCommand({
        Bucket: this.bucketName,
        Key: destinationKey,
        CopySource: `${this.bucketName}/${sourceKey}`,
      });

      await this.s3Client.send(copyCommand);

      // Delete original object
      await this.deleteObject(sourceKey);

      this.logger.log(`Moved object from ${sourceKey} to ${destinationKey}`);
    } catch (error) {
      this.logger.error(`Failed to move object from ${sourceKey} to ${destinationKey}:`, error);
      throw new Error(`Failed to move object: ${error.message}`);
    }
  }
}