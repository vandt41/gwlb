#include "JsonLoader.h"
#include "Player.h"
#include "PlayerRating.h"
#include "Position.h"

#include <nlohmann/json.hpp>

#include <fstream>
#include <iostream>
#include <ostream>
#include <stdexcept>
#include <string>
#include <vector>

namespace gwlb {

std::vector<Position> positions;
std::vector<Player> players;
std::string team_name;
using json = nlohmann::json;

std::vector<Player> loadPlayers(const std::filesystem::path &filePath) {
  // Open JSON file
  std::ifstream file(filePath);

  if (!file.is_open()) {
    throw std::runtime_error("Cannot open file: " + filePath.string());
  }

  // Parse JSON
  json data;
  file >> data;

  std::ifstream bf("private-data/badges.json");
  json badgesJson = json::parse(bf);
  if (!bf.is_open()) {
    throw std::runtime_error("Cannot open file: private-data/badges.json");
  }
  // load lookup table once
  std::unordered_map<std::string, std::string> badgeTable =
      badgesJson.get<std::unordered_map<std::string, std::string>>();

  if (data.contains("name")) {
    team_name = data["name"].get<std::string>();
  }
  // Validate JSON structure
  if (!data.contains("players") || !data["players"].is_array()) {
    throw std::runtime_error("Invalid JSON: expected a players array");
  }

  // Convert JSON objects into Player objects
  for (const auto &item : data["players"]) {
    Player player;

    player.id = item.at("id").get<int>();

    player.name = item.at("name").get<std::string>();

    player.pos_abbr = item.at("position_abbr").get<std::string>();
    if (player.pos_abbr == "CB") {
      player.pos_id = 1;
      player.pos = "Center Back";
    } else if (player.pos_abbr == "CM") {
      player.pos_id = 2;
      player.pos = "Central Midfielder";
    } else if (player.pos_abbr == "W") {
      player.pos_id = 3;
      player.pos = "Winger";
    } else if (player.pos_abbr == "ST") {
      player.pos_id = 4;
      player.pos = "Striker";
    }
    player.jersey_number = item.at("jersey_number").get<int>();

    player.attributes =
        item.at("attributes").get<std::unordered_map<std::string, double>>();

    // "Badges" is an array of badge names
    for (const auto &b : item.value("Badges", json::array())) {
      if (!b.is_string())
        continue;
      const std::string name = b.get<std::string>();

      auto it = badgeTable.find(name);
      if (it != badgeTable.end())
        player.badges[name] = it->second; // name -> description
      else
        player.badges[name] = ""; // name exists on player, no description
    }
    // for (auto it : player.badges) {
    //   std::cout << it.first << " :" << it.second;
    // }
    players.push_back(player);
  }

  return players;
}
void showPlayers() {
  std::cout << team_name;
  for (const auto &player : players) {

    std::cout << "\nPlayer ID: " << player.id;
    std::cout << "\nName: " << player.name;
    std::cout << "\nNo " << player.jersey_number;
    std::cout << "\nPosition: " << player.pos;

    std::cout << "\nAttributes:\n";

    for (const auto &[attribute, value] : player.attributes) {
      std::cout << "  " << attribute << ": " << value << '\n';
    }
    std::cout << "    OVR\n" << "    " << calculateRating(player.id);

    std::cout << "\n----------------------\n";
    std::cout << "  |" << player.pos_abbr << "| OVR " << player.pos << "\n"
              << "      " << positionRating(player.id, player.pos_id);
    std::cout << "\n----------------------\n";
  }
}

std::vector<Position> loadRequirements() {
  // Open JSON file
  const std::string filePath = "private-data/position_requirements.json";
  std::ifstream file(filePath);

  if (!file.is_open()) {
    throw std::runtime_error("Cannot open file: " + filePath);
  }

  // Parse JSON
  json data;
  file >> data;

  // Validate JSON structure
  if (!data.contains("positions") || !data["positions"].is_array()) {
    throw std::runtime_error(
        "Invalid JSON: expected a position requirements array");
  }

  // Convert JSON objects into Player objects
  for (const auto &item : data["positions"]) {
    Position position;
    position.pos_id = item.at("id").get<int>();

    position.pos_abbr = item.at("position_abbr").get<std::string>();

    position.name = item.at("name").get<std::string>();

    position.requirements =
        item.at("requirements").get<std::unordered_map<std::string, double>>();

    positions.push_back(position);
  }
  loadPositionWeights();
  return positions;
}

void showRequirementForPos(int pos_id) {
  for (const auto &pos : positions) {
    if (pos_id == pos.pos_id) {
      std::cout << "\nRequirements for " << pos.name << ":\n";

      for (const auto &[attribute, value] : pos.requirements) {
        std::cout << "  " << attribute << ": " << value << '\n';
      }
    }
  }
}

void loadPositionWeights() {
  for (auto &position : positions) {
    switch (position.pos_id) {
    // case POS_CB:
    //   position.weights = {{"pace", 0.035},       {"defending", 0.30},
    //                       {"positioning", 0.15}, {"physicality", 0.30},
    //                       {"passing", 0.25},     {"stamina", 0.065}};
    //   break;

    // case POS_CM:
    //   position.weights = {{"passing", 0.25},   {"positioning", 0.30},
    //                       {"stamina", 0.25},   {"physicality", 0.10},
    //                       {"defending", 0.07}, {"shooting", 0.03}};
    //   break;

    // case POS_W:
    //   position.weights = {{"pace", 0.30},    {"dribbling", 0.25},
    //                       {"passing", 0.10}, {"shooting", 0.05},
    //                       {"stamina", 0.25}, {"positioning", 0.05}};
    //   break;

    // case POS_ST:
    //   position.weights = {{"shooting", 0.30}, {"positioning", 0.10},
    //                       {"pace", 0.15},     {"physicality", 0.25},
    //                       {"stamina", 0.15},  {"passing", 0.05}};
    //   break;
    case POS_CB:
      position.weights = {{"pace", 0.2},        {"defending", 0.9},
                          {"positioning", 0.5}, {"physicality", 0.8},
                          {"passing", 0.5},     {"stamina", 0.2}};
      break;

    case POS_CM:
      position.weights = {{"passing", 0.7},   {"positioning", 0.8},
                          {"stamina", 0.7},   {"physicality", 0.3},
                          {"defending", 0.2}, {"shooting", 0.3}};
      break;

    case POS_W:
      position.weights = {{"pace", 0.7},    {"dribbling", 0.8},
                          {"passing", 0.5}, {"shooting", 0.2},
                          {"stamina", 0.7}, {"positioning", 0.2}};
      break;

    case POS_ST:
      position.weights = {{"shooting", 0.8}, {"positioning", 0.8},
                          {"pace", 0.6},     {"physicality", 0.8},
                          {"stamina", 0.5},  {"passing", 0.5}};
      break;

    default:
      break;
    }
  }
}
} // namespace gwlb