#include "gwlb/position_rating.hpp"
#include <cassert>
#include <cmath>
#include <iostream>
int main() {
    gwlb::Player player{1, "Test Player", {{"pace", 8.0}, {"passing", 6.0}}};
    gwlb::Position winger{"WM", "Winger", {{"pace", 0.5}, {"passing", 0.5}}};
    assert(std::abs(gwlb::calculatePositionRating(player, winger) - 7.0) < 1e-9);
    gwlb::Position missing{"ST", "Striker", {{"shooting", 1.0}}};
    assert(std::abs(gwlb::calculatePositionRating(player, missing)) < 1e-9);
    std::cout << "All position rating tests passed.\n";
}
