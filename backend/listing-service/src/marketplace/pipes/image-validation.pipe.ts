import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { MAX_SIZE } from "../../s3/constants/s3.constant";

@Injectable()
export class ImageUploadPipe implements PipeTransform {
  constructor(
    private readonly maxSize = MAX_SIZE, // 10MB
    private readonly allowedTypes = ["image/jpeg", "image/png"]
  ) {}

  transform(file?: Express.Multer.File): Express.Multer.File | undefined {
    if (!file) {
      return file;
    }

    if (!this.allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException("Invalid image type");
    }

    if (file.size > this.maxSize) {
      throw new BadRequestException("Image exceed 10MB");
    }

    return file;
  }
}
