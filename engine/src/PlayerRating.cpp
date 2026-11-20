#include "PlayerRating.h"
#include "JsonLoader.h"
#include "Player.h"
#include "Position.h"
#include <iostream>
#include <nlohmann/json.hpp>
using json = nlohmann::json;
int calculatePlayerOVR(int player_id) {
  int rating = 0;

  for (const auto &player : gwlb::players) {
    rating = 0;

    if (player_id == player.id) {
      int i = 0;
      for (const auto &[key, value] : player.attributes) {
        i++;
        rating += value;
      }
      rating = (int)(rating /= i);

      return rating;
    }
  }
  for (const auto &gk : gwlb::gks) {
    rating = 0;

    if (player_id == gk.id) {
      int i = 0;
      for (const auto &[key, value] : gk.attributes) {
        i++;
        rating += value;
      }
      rating = (int)(rating /= i);

      return rating;
    }
  }
  std::cout << "Player id not found!\n";
  return 0;
}

int positionRating(int player_id, int pos_id) {
  if (pos_id == POS_GK) {
    double sum = 0;
    const gwlb::Player *gk = nullptr;
    for (const auto &gk : gwlb::gks) {
      if (gk.id == player_id) {
        for (const auto &[key, val] : gk.attributes) {
          sum += val;
        }
        sum /= (double)6;
        return sum;
      }
    }
  }
  // 1. Find the player
  const gwlb::Player *player = nullptr;
  for (const auto &p : gwlb::players) {
    if (p.id == player_id) {
      player = &p;
      break;
    }
  }
  if (!player) {
    std::cout << "Player id " << player_id << " not found!\n";
    return 0;
  }

  // 2. Find the position
  const gwlb::Position *position = nullptr;
  for (const auto &pos : gwlb::positions) {
    if (pos.pos_id == pos_id) {
      position = &pos;
      break;
    }
  }
  if (!position) {
    std::cout << "Position id " << pos_id << " not found!\n";
    return 0;
  }

  // 3. Weighted average: score = Σ(player_attr * requirement) / Σ(requirement)
  double weighted_sum = 0, weight_sum = 0;
  for (const auto &[attr, req] : position->requirements) {
    auto it = player->attributes.find(attr);
    if (it == player->attributes.end())
      continue;

    double v = it->second;
    double w = position->weights.count(attr) ? position->weights.at(attr) : 1.0;

    double eff = req * w; // requirement acts as importance too
    weighted_sum += v * eff;
    weight_sum += eff;
  }
  double score = weight_sum > 0 ? weighted_sum / weight_sum : 0.0;
  return (int)(score);
}
void CalculateAllPlayerRatings() {
  json result = json::object();

  for (const auto &player : gwlb::players) {
    result[std::to_string(player.id)] = {
        positionRating(player.id, POS_CB), positionRating(player.id, POS_CM),
        positionRating(player.id, POS_WS), positionRating(player.id, POS_ST),
        calculatePlayerOVR(player.id)};
  }
  for (const auto &gk : gwlb::gks) {
    result[std::to_string(gk.id)] = calculatePlayerOVR(gk.id);
  }
  SaveJson("frontend/vanilla/data/players_ovrs.json", result);
}