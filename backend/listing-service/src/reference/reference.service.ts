import { Injectable } from "@nestjs/common";
import { ReferenceRepository } from "./reference.repository";

@Injectable()
export class ReferenceService {
  constructor(private readonly referenceRepo: ReferenceRepository) {}

  async retrieveGameName() {
    return await this.referenceRepo.retrieveGameName();
  }

  async retrieveCardDetail(gameName: string, cardName?: string) {
    return await this.referenceRepo.retrieveCardDetail(
      gameName.toLowerCase(),
      cardName?.toLowerCase()
    );
  }
}
