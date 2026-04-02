import { buildProjection } from "../../dynamodb/dynamodb.util";
import { MessagingPlatformSchema } from "../../dynamodb/messaging.schema";

type RoomKey = keyof typeof MessagingPlatformSchema;

const RoomViews = {
  overview: [
    "conversationId",
    "meta",
    "userId",
    "recipientId",
    "latestMessage",
    "latestMessageId",
    "lastSeenMessageId",
    "muted",
    "pinned",
    "archived",
    "updatedAt"
  ]
} as const satisfies Record<string, readonly RoomKey[]>;

export const RoomProjections = {
  overview: buildProjection(MessagingPlatformSchema, RoomViews.overview)
};
