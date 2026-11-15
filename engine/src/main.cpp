#include "JsonLoader.h"
#include "Player.h"
#include "PlayerRating.h"

#include <exception>
#include <iostream>

int main(int argc, char *argv[]) {

  const std::string filePath =
      (argc > 1) ? argv[1] : "private-data/bmg_team.json";

  try {
    // Load players
    std::vector<gwlb::Player> players = gwlb::loadPlayers(filePath);
  } catch (const std::exception &e) {
    std::cerr << "Error: " << e.what() << '\n';
    return 1;
  }
  gwlb::loadRequirements();
  gwlb::showPlayers();

  return 0;
}