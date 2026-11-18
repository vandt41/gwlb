#pragma once

#include "Player.h"
#include "Position.h"

#include <filesystem>
#include <vector>

namespace gwlb {

void loadPlayers(const std::filesystem::path &filePath);
std::vector<Position> loadRequirements();

void showPlayers();
void showRequirementForPos(int pos_id);
void loadPositionWeights();
void loadBadges();
} // namespace gwlb