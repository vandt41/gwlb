#pragma once

#include "Player.h"
#include "Position.h"

#include <filesystem>
#include <vector>

namespace gwlb {

std::vector<Player> loadPlayers(const std::filesystem::path &filePath);
std::vector<Position> loadRequirements();

void showPlayers();
void showRequirementForPos(std::string pos_abbr);
void loadPositionWeights();

} // namespace gwlb