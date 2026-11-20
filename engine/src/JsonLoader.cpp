#include "JsonLoader.h"
#include "Player.h"
#include "PlayerRating.h"
#include "Position.h"
#include "Squad.h"

#include <fstream>
#include <iostream>

namespace gwlb {

std::vector<Position> positions;
std::vector<Player> players;
std::vector<Player> gks;
std::vector<std::string> available_players;
Squad Squads;
std::string team_name;
using json = nlohmann::json;

void loadPlayers(const std::filesystem::path &filePath) {

  json data = LoadJson(filePath);
  json badgesJson = LoadJson("frontend/vanilla/data/badges.json");

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
      player.pos_id = POS_CB;
      player.pos = "Center Back";
    } else if (player.pos_abbr == "CM") {
      player.pos_id = POS_CM;
      player.pos = "Central Midfielder";
    } else if (player.pos_abbr == "W") {
      player.pos_id = POS_WS;
      player.pos = "Winger";
    } else if (player.pos_abbr == "ST") {
      player.pos_id = POS_ST;
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
    players.push_back(player);
  }

  // Convert JSON objects into GK objects
  for (const auto &item : data["GK"]) {
    Player gk;

    gk.id = item.at("id").get<int>();

    gk.name = item.at("name").get<std::string>();

    gk.pos_abbr = item.at("position_abbr").get<std::string>();
    gk.pos_id = POS_GK;
    gk.pos = "Goal Keeper";

    gk.jersey_number = item.at("jersey_number").get<int>();

    gk.attributes =
        item.at("attributes").get<std::unordered_map<std::string, double>>();

    // "Badges" is an array of badge names
    for (const auto &b : item.value("Badges", json::array())) {
      if (!b.is_string())
        continue;
      const std::string name = b.get<std::string>();

      auto it = badgeTable.find(name);
      if (it != badgeTable.end())
        gk.badges[name] = it->second; // name -> description
      else
        gk.badges[name] = ""; // name exists on player, no description
    }
    gks.push_back(gk);
  }
  loadRequirements();
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
    std::cout << "      OVR\n" << "      " << calculatePlayerOVR(player.id);

    std::cout << "\n----------------------\n";

    std::cout << "  |" << player.pos_abbr << "|OVR\n"
              << "      " << positionRating(player.id, player.pos_id);
    std::cout << "\n----------------------\n";

    std::cout << "Badges:\n";
    for (auto it : player.badges) {
      std::cout << it.first << "\n";
    }
    std::cout << "----------------------\n";
  }
  // gk
  for (const auto &gk : gks) {

    std::cout << "\nPlayer ID: " << gk.id;
    std::cout << "\nName: " << gk.name;
    std::cout << "\nNo " << gk.jersey_number;
    std::cout << "\nPosition: " << gk.pos;

    std::cout << "\nAttributes:\n";

    for (const auto &[attribute, value] : gk.attributes) {
      std::cout << "  " << attribute << ": " << value << '\n';
    }
    std::cout << "  |" << gk.pos_abbr << "|OVR\n"
              << "      " << positionRating(gk.id, gk.pos_id);
    std::cout << "\n----------------------\n";

    std::cout << "Badges:\n";
    for (auto it : gk.badges) {
      std::cout << it.first << "\n";
    }
    std::cout << "----------------------\n";
  }
}

std::vector<Position> loadRequirements() {
  // Open JSON file
  json data = LoadJson("frontend/vanilla/data/position_requirements.json");
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
      position.weights = {{"pace", 0.2},        {"defending", 0.9},
                          {"positioning", 0.5}, {"physicality", 0.8},
                          {"passing", 0.5},     {"stamina", 0.2}};
      break;

    case POS_CM:
      position.weights = {{"passing", 0.7},   {"positioning", 0.8},
                          {"stamina", 0.7},   {"physicality", 0.3},
                          {"defending", 0.2}, {"shooting", 0.3}};
      break;

    case POS_WS:
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

json LoadJson(const std::string &filename) {
  std::ifstream file(filename);

  if (!file.is_open())
    throw std::runtime_error("Cannot open " + filename);

  json data;
  file >> data;

  return data;
}

void SaveJson(const std::string &filename, const json &data) {
  std::filesystem::path path(filename);

  std::filesystem::create_directories(path.parent_path());

  std::ofstream file(path);

  if (!file.is_open())
    throw std::runtime_error("Cannot write to " + filename);

  file << data.dump(4);
}