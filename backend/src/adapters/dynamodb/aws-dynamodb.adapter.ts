import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  QueryCommand,
  BatchGetItemCommand,
  BatchWriteItemCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { DynamoAdapter, QueryInput } from './dynamodb.adapter.interface';

@Injectable()
export class AWSDynamoAdapter implements DynamoAdapter {
  private readonly logger = new Logger(AWSDynamoAdapter.name);
  private readonly dynamoClient: DynamoDBClient;
  private readonly tableName: string;

  constructor(private configService: ConfigService) {
    this.tableName = this.configService.get<string>('TABLE_NAME');
    
    if (!this.tableName) {
      throw new Error('TABLE_NAME environment variable is required');
    }

    this.dynamoClient = new DynamoDBClient({
      region: this.configService.get<string>('AWS_REGION', 'ap-southeast-1'),
    });

    this.logger.log(`DynamoDB Adapter initialized with table: ${this.tableName}`);
  }

  async putItem<T>(tableName: string, item: T): Promise<void> {
    try {
      const command = new PutItemCommand({
        TableName: tableName || this.tableName,
        Item: marshall(item, { removeUndefinedValues: true }),
      });

      await this.dynamoClient.send(command);
      this.logger.debug(`Put item in table ${tableName || this.tableName}`);
    } catch (error) {
      this.logger.error(`Failed to put item in ${tableName || this.tableName}:`, error);
      throw new Error(`Failed to put item: ${error.message}`);
    }
  }

  async getItem<T>(tableName: string, key: any): Promise<T | null> {
    try {
      const command = new GetItemCommand({
        TableName: tableName || this.tableName,
        Key: marshall(key),
      });

      const result = await this.dynamoClient.send(command);
      
      if (!result.Item) {
        return null;
      }

      const item = unmarshall(result.Item) as T;
      this.logger.debug(`Retrieved item from table ${tableName || this.tableName}`);
      return item;
    } catch (error) {
      this.logger.error(`Failed to get item from ${tableName || this.tableName}:`, error);
      throw new Error(`Failed to get item: ${error.message}`);
    }
  }

  async queryItems<T>(tableName: string, query: QueryInput): Promise<T[]> {
    try {
      const command = new QueryCommand({
        TableName: tableName || this.tableName,
        IndexName: query.indexName,
        KeyConditionExpression: query.keyConditionExpression,
        ExpressionAttributeNames: query.expressionAttributeNames,
        ExpressionAttributeValues: query.expressionAttributeValues 
          ? marshall(query.expressionAttributeValues) 
          : undefined,
        FilterExpression: query.filterExpression,
        Limit: query.limit,
        ScanIndexForward: query.scanIndexForward,
      });

      const result = await this.dynamoClient.send(command);
      
      if (!result.Items) {
        return [];
      }

      const items = result.Items.map(item => unmarshall(item) as T);
      this.logger.debug(`Queried ${items.length} items from table ${tableName || this.tableName}`);
      return items;
    } catch (error) {
      this.logger.error(`Failed to query items from ${tableName || this.tableName}:`, error);
      throw new Error(`Failed to query items: ${error.message}`);
    }
  }

  async updateItem<T>(tableName: string, key: any, updates: Partial<T>): Promise<T> {
    try {
      // Build update expression
      const updateExpressions: string[] = [];
      const expressionAttributeNames: Record<string, string> = {};
      const expressionAttributeValues: Record<string, any> = {};

      Object.entries(updates).forEach(([field, value], index) => {
        const nameKey = `#field${index}`;
        const valueKey = `:value${index}`;
        
        updateExpressions.push(`${nameKey} = ${valueKey}`);
        expressionAttributeNames[nameKey] = field;
        expressionAttributeValues[valueKey] = value;
      });

      // Add updated_at timestamp
      const timestampKey = `#updatedAt`;
      const timestampValue = `:updatedAt`;
      updateExpressions.push(`${timestampKey} = ${timestampValue}`);
      expressionAttributeNames[timestampKey] = 'updated_at';
      expressionAttributeValues[timestampValue] = new Date().toISOString();

      const command = new UpdateItemCommand({
        TableName: tableName || this.tableName,
        Key: marshall(key),
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: marshall(expressionAttributeValues),
        ReturnValues: 'ALL_NEW',
      });

      const result = await this.dynamoClient.send(command);
      
      if (!result.Attributes) {
        throw new Error('No attributes returned from update operation');
      }

      const updatedItem = unmarshall(result.Attributes) as T;
      this.logger.debug(`Updated item in table ${tableName || this.tableName}`);
      return updatedItem;
    } catch (error) {
      this.logger.error(`Failed to update item in ${tableName || this.tableName}:`, error);
      throw new Error(`Failed to update item: ${error.message}`);
    }
  }

  async deleteItem(tableName: string, key: any): Promise<void> {
    try {
      const command = new DeleteItemCommand({
        TableName: tableName || this.tableName,
        Key: marshall(key),
      });

      await this.dynamoClient.send(command);
      this.logger.debug(`Deleted item from table ${tableName || this.tableName}`);
    } catch (error) {
      this.logger.error(`Failed to delete item from ${tableName || this.tableName}:`, error);
      throw new Error(`Failed to delete item: ${error.message}`);
    }
  }

  async batchGetItems<T>(tableName: string, keys: any[]): Promise<T[]> {
    try {
      const command = new BatchGetItemCommand({
        RequestItems: {
          [tableName || this.tableName]: {
            Keys: keys.map(key => marshall(key)),
          },
        },
      });

      const result = await this.dynamoClient.send(command);
      
      if (!result.Responses || !result.Responses[tableName || this.tableName]) {
        return [];
      }

      const items = result.Responses[tableName || this.tableName].map(item => unmarshall(item) as T);
      this.logger.debug(`Batch retrieved ${items.length} items from table ${tableName || this.tableName}`);
      return items;
    } catch (error) {
      this.logger.error(`Failed to batch get items from ${tableName || this.tableName}:`, error);
      throw new Error(`Failed to batch get items: ${error.message}`);
    }
  }

  async batchWriteItems<T>(tableName: string, items: T[]): Promise<void> {
    try {
      const putRequests = items.map(item => ({
        PutRequest: {
          Item: marshall(item, { removeUndefinedValues: true }),
        },
      }));

      const command = new BatchWriteItemCommand({
        RequestItems: {
          [tableName || this.tableName]: putRequests,
        },
      });

      await this.dynamoClient.send(command);
      this.logger.debug(`Batch wrote ${items.length} items to table ${tableName || this.tableName}`);
    } catch (error) {
      this.logger.error(`Failed to batch write items to ${tableName || this.tableName}:`, error);
      throw new Error(`Failed to batch write items: ${error.message}`);
    }
  }
}