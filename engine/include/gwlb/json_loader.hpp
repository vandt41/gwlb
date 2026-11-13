#pragma once
#include "gwlb/player.hpp"
#include "gwlb/position.hpp"
#include <filesystem>
#include <vector>
namespace gwlb {
std::vector<Player> loadPlayers(const std::filesystem::path& path);
std::vector<Position> loadPositions(const std::filesystem::path& path);
}
