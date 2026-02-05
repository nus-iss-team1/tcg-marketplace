import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { AWSDynamoAdapter } from '../adapters/dynamodb/aws-dynamodb.adapter';
import { ListingItem } from '../adapters/dynamodb/dynamodb.adapter.interface';
import { v4 as uuidv4 } from 'uuid';

interface CreateListingRequest {
  title: string;
  description?: string;
  price: number;
  category: 'vintage' | 'modern' | 'sealed' | 'singles';
  images?: string[];
}

interface GetListingsQuery {
  category?: string;
  limit?: string; // Will be parsed to number
  lastKey?: string;
}

@Controller('listings')
export class ListingsController {
  private readonly logger = new Logger(ListingsController.name);

  constructor(private readonly dynamoAdapter: AWSDynamoAdapter) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getListings(@Query() query: GetListingsQuery): Promise<ListingItem[]> {
    this.logger.log(`Retrieving listings with query: ${JSON.stringify(query)}`);
    
    try {
      if (query.category) {
        // Parse limit to number
        const limit = query.limit ? parseInt(query.limit, 10) : 20;
        
        // Query by category using GSI1
        const queryInput = {
          indexName: 'GSI1',
          keyConditionExpression: 'GSI1PK = :category',
          expressionAttributeValues: {
            ':category': `CATEGORY#${query.category}`,
          },
          scanIndexForward: false, // Most recent first
          limit: limit,
        };

        const listings = await this.dynamoAdapter.queryItems<ListingItem>(null, queryInput);
        this.logger.log(`Retrieved ${listings.length} listings for category: ${query.category}`);
        return listings;
      } else {
        // For now, return empty array - would need scan operation for all listings
        // In production, consider implementing pagination with GSI
        this.logger.log('Retrieved all listings (not implemented - would require scan)');
        return [];
      }
    } catch (error) {
      this.logger.error(`Failed to retrieve listings: ${error.message}`);
      throw error;
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createListing(@Body() request: CreateListingRequest): Promise<ListingItem> {
    this.logger.log(`Creating listing: ${request.title}`);
    
    // Validate request
    if (!request.title || request.title.length > 200) {
      throw new Error('Invalid title');
    }
    
    if (request.price < 0) {
      throw new Error('Price must be non-negative');
    }

    if (!['vintage', 'modern', 'sealed', 'singles'].includes(request.category)) {
      throw new Error('Invalid category');
    }

    try {
      const listingId = uuidv4();
      const now = new Date().toISOString();
      
      // For now, using a placeholder user ID - would come from authentication
      const userId = 'user-placeholder';

      const listing: ListingItem = {
        PK: `LISTING#${listingId}`,
        SK: 'METADATA',
        id: listingId,
        title: request.title,
        description: request.description,
        price: request.price,
        category: request.category,
        user_id: userId,
        status: 'active',
        images: request.images || [],
        created_at: now,
        updated_at: now,
        GSI1PK: `CATEGORY#${request.category}`,
        GSI1SK: now,
        GSI2PK: `USER#${userId}`,
        GSI2SK: `STATUS#active`,
      };

      await this.dynamoAdapter.putItem(null, listing);
      this.logger.log(`Successfully created listing: ${listingId}`);
      return listing;
    } catch (error) {
      this.logger.error(`Failed to create listing: ${error.message}`);
      throw error;
    }
  }
}