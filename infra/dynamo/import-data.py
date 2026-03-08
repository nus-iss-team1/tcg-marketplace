import json
import os
import boto3
from dotenv import load_dotenv

load_dotenv()

TABLE_NAME = os.getenv("DYNAMO_TABLE_NAME")
REGION = os.getenv("AWS_REGION")
ENV = os.getenv("ENV", "dev")
DEV_FILE = os.getenv("DEV_FILE")

data_folder = "./data"

dynamodb = boto3.resource(
  "dynamodb",
  region_name=REGION,
  aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
  aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
)

table = dynamodb.Table(TABLE_NAME)

import_count = 0

files = [f for f in os.listdir(data_folder) if f.endswith(".json")]

if ENV == "dev":
  import_files = [DEV_FILE]
else:
  import_files = [f for f in files if f != DEV_FILE]

print(f"Running in {ENV.upper()} mode")
print(f"Files to import: {import_files}\n")

for filename in import_files:
  filepath = os.path.join(data_folder, filename)

  print(f"Processing file: {filename}")

  with open(filepath, "r") as f:
    items = json.load(f)

  with table.batch_writer() as batch:
    for item in items:
      batch.put_item(Item=item)
      import_count += 1

  print(f"Finished {filename} ({len(items)} items)")

print(f"\nImport complete. Total count: {import_count}")
