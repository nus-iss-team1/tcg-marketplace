import { buildProjection } from "../../dynamodb/dynamodb.util";
import { MessagingPlatformSchema } from "../../dynamodb/messaging.schema";

type MessageKey = keyof typeof MessagingPlatformSchema;

const MessageViews = {
  overview: [
    "conversationId",
    "meta",
    "userId",
    "messageId",
    "senderId",
    "content",
    "messageType",
    "reaction",
    "replyTo",
    "createdAt",
    "updatedAt"
  ]
} as const satisfies Record<string, readonly MessageKey[]>;

export const MessageProjections = {
  overview: buildProjection(MessagingPlatformSchema, MessageViews.overview)
};
