import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AWSS3Adapter } from '../adapters/s3/aws-s3.adapter';
import { AWSDynamoAdapter } from '../adapters/dynamodb/aws-dynamodb.adapter';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'S3_ADAPTER',
      useClass: AWSS3Adapter,
    },
    {
      provide: 'DYNAMO_ADAPTER',
      useClass: AWSDynamoAdapter,
    },
    AWSS3Adapter,
    AWSDynamoAdapter,
  ],
  exports: [
    'S3_ADAPTER',
    'DYNAMO_ADAPTER',
    AWSS3Adapter,
    AWSDynamoAdapter,
  ],
})
export class AWSModule {}