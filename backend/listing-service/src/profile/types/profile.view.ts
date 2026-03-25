import { buildProjection } from "../../dynamodb/dynamodb.util";
import { UserProfileSchema } from "./profile.schema";

type ProfileKey = keyof typeof UserProfileSchema;

const ProfileViews = {
  full: [
    "userId",
    "displayName",
    "address",
    "bio",
    "preferredPayment",
    "joinedAt"
  ]
} as const satisfies Record<string, readonly ProfileKey[]>;

export const ProfileProjections = {
  full: buildProjection(UserProfileSchema, ProfileViews.full)
};
