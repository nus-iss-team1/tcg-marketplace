import {
  PutCommandOutput,
  GetCommandOutput,
  UpdateCommandOutput,
  DeleteCommandOutput,
  QueryCommandOutput,
  ScanCommandOutput,
  DeleteCommandInput,
  GetCommandInput,
  PutCommandInput,
  QueryCommandInput,
  ScanCommandInput,
  UpdateCommandInput
} from "@aws-sdk/lib-dynamodb";

type DynamoType =
  | "string"
  | "number"
  | "boolean"
  | "binary"
  | "list"
  | "map"
  | "stringSet"
  | "numberSet"
  | "binarySet";

export type FieldOptions = {
  type: DynamoType;
  attribute?: Record<string, string>;
  pk?: boolean;
  sk?: boolean;
  gsi?: Record<string, "pk" | "sk">;
  optional?: boolean;
  hidden?: boolean;
};

export type DynamoCommandInput =
  | PutCommandInput
  | GetCommandInput
  | QueryCommandInput
  | ScanCommandInput
  | UpdateCommandInput
  | DeleteCommandInput;

export type DynamoCommandOutput =
  | PutCommandOutput
  | GetCommandOutput
  | QueryCommandOutput
  | ScanCommandOutput
  | UpdateCommandOutput
  | DeleteCommandOutput;
