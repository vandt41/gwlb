#include "JsonLoader.h"
#include "Player.h"
#include "PlayerRating.h"
#include "Position.h"

#include <nlohmann/json.hpp>

#include <fstream>
#include <iostream>
#include <ostream>
#include <stdexcept>

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
    player.pos_id = item.at("position_id").get<int>();

    player.name = item.at("name").get<std::string>();

    player.pos = item.at("primary_position").get<std::string>();
    player.pos_abbr = item.at("position_abbr").get<std::string>();

    player.jersey_number = item.at("jersey_number").get<int>();

    player.attributes =
        item.at("attributes").get<std::unordered_map<std::string, double>>();

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
    case POS_CB:
      position.weights = {{"pace", 0.035},       {"defending", 0.30},
                          {"positioning", 0.15}, {"physicality", 0.30},
                          {"passing", 0.25},     {"stamina", 0.065}};
      break;

    case POS_CM:
      position.weights = {{"passing", 0.30},   {"positioning", 0.20},
                          {"stamina", 0.30},   {"physicality", 0.1},
                          {"defending", 0.07}, {"shooting", 0.03}};
      break;

    case POS_W:
      position.weights = {{"pace", 0.30},    {"dribbling", 0.25},
                          {"passing", 0.10}, {"shooting", 0.05},
                          {"stamina", 0.25}, {"positioning", 0.05}};
      break;

    case POS_ST:
      position.weights = {{"shooting", 0.15}, {"positioning", 0.35},
                          {"pace", 0.05},     {"physicality", 0.20},
                          {"stamina", 0.15},  {"passing", 0.10}};
      break;

    default:
      break;
    }
  }
}
} // namespace gwlb