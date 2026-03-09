import { field } from "../../dynamodb/dynamodb.util";

export const GameLookup = {
  gameId: field({
    type: "string",
    pk: true,
    hidden: true
  }), // value: game
  meta: field({
    type: "string",
    sk: true,
    hidden: true
  }), // value: META
  gameName: field({
    type: "string"
  })
};

export const CardLookup = {
  gameId: field({
    type: "string",
    pk: true,
    hidden: true
  }), // value: card
  meta: field({
    type: "string",
    sk: true,
    hidden: true
  }), // value: card#<cardName>#<rarity>
  gameName: field({
    type: "string"
  }),
  cardName: field({
    type: "string"
  }),
  cardId: field({
    type: "string",
    optional: true
  }),
  setName: field({
    type: "string",
    optional: true
  }),
  rarity: field({
    type: "string"
  }),
  isActive: field({
    type: "boolean",
    hidden: true
  }),
  createdAt: field({
    type: "number",
    hidden: true
  })
};

export type Game = {
  gameId: string;
  meta: string;
  gameName: string;
};

export type Card = {
  gameId: string;
  meta: string;
  gameName: string;
  cardName: string;
  cardId?: string;
  setName?: string;
  rarity: string;
  isActive: boolean;
  createdAt: number;
};
