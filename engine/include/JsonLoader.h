#pragma once

#include "Position.h"

#include <filesystem>
#include <vector>

#include <nlohmann/json.hpp>
using json = nlohmann::json;
namespace gwlb {

void loadPlayers(const std::filesystem::path &filePath);
std::vector<Position> loadRequirements();

void loadSquad();

void showRequirementForPos(int pos_id);
void loadPositionWeights();
void loadBadges();
void showPlayers();

} // namespace gwlb

json LoadJson(const std::string &filename);
void SaveJson(const std::string &filename, const json &data);