export interface DynamoAdapter {
  putItem<T>(tableName: string, item: T): Promise<void>;
  getItem<T>(tableName: string, key: any): Promise<T | null>;
  queryItems<T>(tableName: string, query: QueryInput): Promise<T[]>;
  updateItem<T>(tableName: string, key: any, updates: Partial<T>): Promise<T>;
  deleteItem(tableName: string, key: any): Promise<void>;
  batchGetItems<T>(tableName: string, keys: any[]): Promise<T[]>;
  batchWriteItems<T>(tableName: string, items: T[]): Promise<void>;
}

export interface QueryInput {
  indexName?: string;
  keyConditionExpression: string;
  expressionAttributeNames?: Record<string, string>;
  expressionAttributeValues?: Record<string, any>;
  filterExpression?: string;
  limit?: number;
  scanIndexForward?: boolean;
}

export interface ListingItem {
  PK: string;
  SK: string;
  id: string;
  title: string;
  description?: string;
  price: number;
  category: string;
  user_id: string;
  status: 'active' | 'sold' | 'inactive';
  images: string[];
  created_at: string;
  updated_at: string;
  GSI1PK: string;
  GSI1SK: string;
  GSI2PK?: string;
  GSI2SK?: string;
}