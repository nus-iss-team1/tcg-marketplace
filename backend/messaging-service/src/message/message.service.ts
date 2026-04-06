import { ForbiddenException, Injectable } from "@nestjs/common";
import { ulid } from "ulid";
import { DateTime } from "luxon";
import { RoomService } from "../room/room.service";
import { MessageRepository } from "../message/message.repository";
import { TransactItem } from "../dynamodb/dynamodb.type";
import { CreateMessageDto, DeleteMessageDto, EditMessageDto } from "./dto/message.dto";
import { generateConversationId } from "./utils/conversation-id";
import { MessageCursor } from "./types/message.type";

@Injectable()
export class MessageService {
  constructor(
    private readonly roomService: RoomService,
    private readonly messageRepository: MessageRepository
  ) {}

  async getMessages(userId: string, conversationId: string, cursor?: string) {
    const room = await this.roomService.getRoom(userId, conversationId);

    if (!room) {
      throw new ForbiddenException("Room does not exist or you are not authorised");
    }

    const decodedCursor: MessageCursor | undefined = cursor
      ? (JSON.parse(Buffer.from(cursor, "base64").toString()) as MessageCursor)
      : undefined;

    const result = await this.messageRepository.queryMessages(conversationId, decodedCursor);

    return {
      data: result.items,
      nextCursor: result.nextCursor
        ? Buffer.from(JSON.stringify(result.nextCursor)).toString("base64")
        : null
    };
  }

  async createMessage(userId: string, params: CreateMessageDto, userName?: string) {
    const { recipientId, content, messageType, replyTo, listingId, listingGameName } = params;
    const conversationId = generateConversationId(userId, recipientId);
    const messageId = ulid();
    const now = DateTime.now().toMillis();
    const transactItems: TransactItem[] = [];

    // if room doesn't exist - create room
    const room = await this.roomService.getRoom(userId, conversationId);
    const listingChanged = listingId && listingGameName && (!room || room.listingId !== listingId || room.listingGameName !== listingGameName);

    if (!room) {
      transactItems.push(
        ...this.roomService.getCreateRoomScript(
          conversationId,
          userId,
          recipientId,
          now,
          userName,
          undefined,
          messageId,
          content,
          listingId,
          listingGameName
        )
      );
    }

    // create message and version
    transactItems.push(
      this.messageRepository.buildCreateMessage(
        conversationId,
        messageId,
        userId,
        content,
        messageType,
        1,
        replyTo || null,
        now
      ),
      this.messageRepository.buildCreateVersion(conversationId, messageId, userId, 1, content, now)
    );

    const latestMessageId = room?.latestMessageId ?? null;
    if (
      room &&
      (latestMessageId === null || latestMessageId.toUpperCase() < messageId.toUpperCase())
    ) {
      // update room with latest message (and listing context if changed)
      transactItems.push(
        ...this.roomService.getUpdateLatestMessageScript(
          conversationId,
          userId,
          recipientId,
          messageId,
          userId,
          content,
          now,
          listingChanged ? listingId : undefined,
          listingChanged ? listingGameName : undefined
        )
      );
    } else if (room && listingChanged) {
      // listing changed but message isn't latest — update listing context separately
      transactItems.push(
        ...this.roomService.getUpdateListingContextScript(
          conversationId,
          userId,
          recipientId,
          listingId,
          listingGameName
        )
      );
    }

    return await this.messageRepository.createMessage(conversationId, messageId, transactItems);
  }

  async editMessage(userId: string, params: EditMessageDto) {
    const { conversationId, messageId, content } = params;
    const now = DateTime.now().toMillis();
    const transactItems: TransactItem[] = [];

    const message = await this.messageRepository.getMessage(conversationId, messageId);
    if (message.senderId !== userId || message.deleted) {
      throw new ForbiddenException("Message does not exist or you are not authorised");
    }

    const room = await this.roomService.getRoom(userId, conversationId);
    if (!room) {
      throw new ForbiddenException("Room does not exist or you are not authorised");
    }

    const newVersion = message.version + 1;

    transactItems.push(
      this.messageRepository.buildUpdateContent(
        conversationId,
        messageId,
        content,
        newVersion,
        now
      ),
      this.messageRepository.buildCreateVersion(
        conversationId,
        messageId,
        userId,
        newVersion,
        content,
        now
      )
    );

    // update room with latest message content
    if (messageId.toUpperCase() === room.latestMessageId?.toUpperCase()) {
      transactItems.push(
        ...this.roomService.getUpdateLatestMessageScript(
          conversationId,
          userId,
          room.recipientId,
          messageId,
          userId,
          content,
          room.updatedAt
        )
      );
    }

    return await this.messageRepository.editMessage(conversationId, messageId, transactItems);
  }

  async deleteMessage(userId: string, params: DeleteMessageDto) {
    const { conversationId, messageId } = params;
    const transactItems: TransactItem[] = [];

    const message = await this.messageRepository.getMessage(conversationId, messageId);
    if (message.senderId !== userId || message.deleted) {
      throw new ForbiddenException("Message does not exist or you are not authorised");
    }

    const room = await this.roomService.getRoom(userId, conversationId);
    if (!room) {
      throw new ForbiddenException("Room does not exist or you are not authorised");
    }
    const latestMessageId = room.latestMessageId ? room.latestMessageId.toUpperCase() : null;

    // update room with latest message content
    if (latestMessageId && messageId.toUpperCase() === latestMessageId) {
      transactItems.push(
        ...this.roomService.getUpdateLatestMessageScript(
          conversationId,
          userId,
          room.recipientId,
          messageId,
          userId,
          "Message deleted",
          room.updatedAt
        )
      );
    }

    return await this.messageRepository.deleteMessage(conversationId, messageId);
  }
}
