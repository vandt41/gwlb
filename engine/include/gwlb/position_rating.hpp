#pragma once
#include "gwlb/player.hpp"
#include "gwlb/position.hpp"
namespace gwlb {
// Weighted suitability score from 0 to 10. Missing attributes count as zero.
double calculatePositionRating(const Player& player, const Position& position);
}
