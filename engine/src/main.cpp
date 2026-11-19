#include "Formation.h"
#include "JsonLoader.h"

#include "PlayerRating.h"
#include "Squad.h"
#include "SquadAnalyzer.h"

#include <exception>
#include <iostream>

int main(int argc, char *argv[]) {

  const std::string filePath =
      (argc > 1) ? argv[1] : "frontend/vanilla/data/bmg_team.json";

  try {
    // Load players
    gwlb::loadPlayers(filePath);
  } catch (const std::exception &e) {
    std::cerr << "Error: " << e.what() << '\n';
    return 1;
  }
  CalculateAllPlayerRatings();
  gwlb::Squad A{.formation_id = FORMATION_2_3_1,
                .CB = {2, 13},
                .CM = {11},
                .WS = {8, 7},
                .ST = {4}};
  showSquadRatings(A);
  gwlb::showPlayers();
  return 0;
}