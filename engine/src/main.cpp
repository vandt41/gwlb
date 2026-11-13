#include "gwlb/json_loader.hpp"
#include "gwlb/position_rating.hpp"
#include <exception>
#include <filesystem>
#include <iomanip>
#include <iostream>
int main(int argc, char* argv[]) {
    if (argc != 3) {
        std::cerr << "Usage: gwlb_engine <players_private.json> <position_requirements.json>\n";
        return 1;
    }
    try {
        const auto players = gwlb::loadPlayers(std::filesystem::path(argv[1]));
        const auto positions = gwlb::loadPositions(std::filesystem::path(argv[2]));
        std::cout << std::fixed << std::setprecision(2);
        for (const auto& player : players) {
            std::cout << "\n" << player.name << " (ID " << player.id << ")\n";
            for (const auto& position : positions)
                std::cout << "  " << position.name << ": "
                          << gwlb::calculatePositionRating(player, position) << "/10\n";
        }
    } catch (const std::exception& error) {
        std::cerr << "GWLB engine error: " << error.what() << '\n';
        return 1;
    }
    return 0;
}
