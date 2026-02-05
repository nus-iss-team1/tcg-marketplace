import { Controller, Post, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { AWSS3Adapter } from '../adapters/s3/aws-s3.adapter';
import { PresignedUrlRequest, PresignedUrlResponse } from '../adapters/s3/s3.adapter.interface';

@Controller('media')
export class MediaController {
  private readonly logger = new Logger(MediaController.name);

  constructor(private readonly s3Adapter: AWSS3Adapter) {}

  @Post('presign')
  @HttpCode(HttpStatus.OK)
  async generatePresignedUrl(@Body() request: PresignedUrlRequest): Promise<PresignedUrlResponse> {
    this.logger.log(`Generating presigned URL for file: ${request.filename}`);
    
    // Validate content type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(request.contentType)) {
      throw new Error(`Invalid content type: ${request.contentType}`);
    }

    // Validate filename
    if (!request.filename || request.filename.length > 255) {
      throw new Error('Invalid filename');
    }

    try {
      const response = await this.s3Adapter.generateUploadUrl(request);
      this.logger.log(`Successfully generated presigned URL for: ${request.filename}`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to generate presigned URL: ${error.message}`);
      throw error;
    }
  }
}