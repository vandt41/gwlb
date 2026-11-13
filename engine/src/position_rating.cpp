#include "gwlb/position_rating.hpp"
#include <stdexcept>
namespace gwlb {
double calculatePositionRating(const Player& player, const Position& position) {
    double weightedTotal = 0.0;
    double totalWeight = 0.0;
    for (const auto& requirement : position.requirements) {
        if (requirement.weight < 0.0)
            throw std::invalid_argument("Position weights cannot be negative.");
        const auto it = player.attributes.find(requirement.attribute);
        const double value = it == player.attributes.end() ? 0.0 : it->second;
        if (value < 0.0 || value > 10.0)
            throw std::invalid_argument("Player attributes must be between 0 and 10.");
        weightedTotal += value * requirement.weight;
        totalWeight += requirement.weight;
    }
    if (totalWeight <= 0.0)
        throw std::invalid_argument("Position must have positive total weight.");
    return weightedTotal / totalWeight;
}
}
