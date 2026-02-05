export interface S3Adapter {
  generatePresignedUrl(key: string, operation: 'PUT' | 'GET'): Promise<string>;
  deleteObject(key: string): Promise<void>;
}

export interface PresignedUrlRequest {
  filename: string;
  contentType: string;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  key: string;
  expiresIn: number;
}