import requests
import json
import time
import os

games = {
  "Pokemon TCG": "https://api.opentcg.org/cards?game=pokemon",
  "One Piece Card Game": "https://api.opentcg.org/cards?game=one-piece",
  "Magic: The Gathering": "https://api.opentcg.org/cards?game=magic",
  "Yu-Gi-Oh!": "https://api.opentcg.org/cards?game=yugioh",
  "Digimon Card Game": "https://api.opentcg.org/cards/?game=digimon",
  "Star Wars: Unlimited": "https://api.opentcg.org/cards/?game=star-wars"
}

# bitesize for testing
page_size = 30

output_folder = "data"
os.makedirs(output_folder, exist_ok=True)

data_list = []

for game_name, base_url in games.items():
  print(f"\nFetching {page_size} cards for {game_name}...")
  page = 1

  unique_set = set()

  data_list.append({
    "gameId": "gamedata",
    "meta": f"GAME#{game_name}".lower(),
    "gameName": game_name
  })

  url = f"{base_url}&page={page}&limit={page_size}"
  response = requests.get(url)

  if response.status_code != 200:
    print(f"Failed to fetch {game_name}: {response.status_code}")
    break

  cards = response.json()
  if not cards:
    break  # no more cards

  unique_count = 0
  for card in cards:
    # extract card details
    card_id = card.get("collector_number") or ""
    card_name = card.get("card_name") or card.get("name") or ""
    set_name = card.get("set_name") or card.get("set") or ""
    rarity = card.get("rarity") or ""

    # skip if exist in unique_set
    if (game_name, card_name, card_id, set_name, rarity) in unique_set:
      continue
    unique_set.add((game_name, card_name, card_id, set_name, rarity))

    data_list.append({
      "gameId": "carddata",
      "meta": f"CARD#{card_name}#{rarity}".lower(),
      "gameName": game_name,
      "cardName": card_name,
      "cardId": card_id,
      "setName": set_name,
      "rarity": rarity,
      "isActive": True,
      "createdAt": int(time.time() * 1000)
    })
    unique_count += 1

  print(f"{len(cards)} fetched, {unique_count} unique cards + 1 game data, total count: {len(data_list)}")
  time.sleep(1)

# Save cards in single JSON file
filename = os.path.join(output_folder, "bitesize-gamecard.json")
with open(filename, "w") as f:
  json.dump(data_list, f, indent=2)

print(f"Done! Saved {len(data_list)} cards to {filename}.")
