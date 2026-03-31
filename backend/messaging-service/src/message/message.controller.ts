import { Body, Controller, Delete, Get, Patch, Post, Query } from "@nestjs/common";
import { MessageService } from "./message.service";
import { CreateMessageDto, DeleteMessageDto, EditMessageDto } from "./dto/message.dto";
import { WsCurrentUser } from "../web-socket/ws-current-user.decorator";

@Controller("message")
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async createMessage(@WsCurrentUser("sub") userId: string, @Body() body: CreateMessageDto) {
    return await this.messageService.createMessage(userId, body);
  }

  @Patch()
  async updateMessage(@WsCurrentUser("sub") userId: string, @Body() body: EditMessageDto) {
    return await this.messageService.editMessage(userId, body);
  }

  @Delete()
  async DeleteMessageDto(@WsCurrentUser("sub") userId: string, @Body() body: DeleteMessageDto) {
    return await this.messageService.deleteMessage(userId, body);
  }

  @Get()
  async getMessages(
    @WsCurrentUser("sub") userId: string,
    @Query("conversationId") conversationId: string,
    @Query() cursor?: string
  ) {
    return await this.messageService.getMessages(userId, conversationId, cursor);
  }
}
