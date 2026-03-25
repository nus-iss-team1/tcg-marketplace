import { field } from "../../dynamodb/dynamodb.util";

export const UserProfileSchema = {
  userId: field({ type: "string", pk: true }),
  displayName: field({ type: "string" }),
  address: field({ type: "string", optional: true }),
  bio: field({ type: "string", optional: true }),
  preferredPayment: field({
    type: "map",
    attribute: { cash: "boolean", paynow: "boolean", bank: "boolean" },
    optional: true
  }),
  joinedAt: field({ type: "number" })
};

export type UserProfile = {
  userId: string;
  displayName: string;
  address?: string;
  bio?: string;
  preferredPayment?: {
    cash: boolean;
    paynow: boolean;
    bank: boolean;
  };
  joinedAt: number;
};
