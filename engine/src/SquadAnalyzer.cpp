#include "SquadAnalyzer.h"
#include "Formation.h"
#include "Position.h"
#include <iostream>
gwlb::Squad CalculateSquatRating(gwlb::Squad squad) {
  gwlb::Squad squad_ratings;
  int total = 0;
  squad_ratings.formation_id = squad.formation_id;
  for (const auto &player : squad.CB) {
    total += positionRating(player, POS_CB);
    squad_ratings.CB.push_back(positionRating(player, POS_CB));
  }
  for (const auto &player : squad.CM) {
    squad_ratings.CM.push_back(positionRating(player, POS_CM));
    total += positionRating(player, POS_CM);
  }
  for (const auto &player : squad.WS) {
    squad_ratings.WS.push_back(positionRating(player, POS_WS));
    total += positionRating(player, POS_WS);
  }
  for (const auto &player : squad.ST) {
    squad_ratings.ST.push_back(positionRating(player, POS_ST));
    total += positionRating(player, POS_ST);
  }
  squad_ratings.OVR = (int)total / 6;
  return squad_ratings;
}

void showSquadRatings(gwlb::Squad squad) {
  gwlb::Squad squad_ratings = CalculateSquatRating(squad);
  if (squad.formation_id == FORMATION_1_3_2)
    std::cout << "Formation: 1-3-2\n";
  else if (squad.formation_id == FORMATION_2_3_1)
    std::cout << "Formation: 2-3-1\n";
  else if (squad.formation_id == FORMATION_3_2_1)
    std::cout << "Formation: 3-2-1\n";
  // ST
  if (squad.formation_id == FORMATION_1_3_2)
    std::cout << "\t  ";
  else
    std::cout << "\t   ";
  for (const auto &player : squad_ratings.ST) {
    std::cout << player << " ";
  }

  // CM - WS
  std::cout << "\n";
  if (squad.formation_id == FORMATION_3_2_1) {
    std::cout << "\t ";
    for (const auto &player : squad_ratings.CM) {
      std::cout << player << " ";
    }
  } else {
    std::cout << "\t";
    std::cout << squad_ratings.WS[0] << " " << squad_ratings.CM[0] << " "
              << squad_ratings.WS[1];
  }
  // CB
  std::cout << "\n";
  if (squad.formation_id == FORMATION_1_3_2) {
    std::cout << "\t  ";
    std::cout << squad_ratings.CB[0];
  } else if (squad.formation_id == FORMATION_3_2_1) {
    std::cout << "\t";
    std::cout << squad_ratings.WS[0] << " " << squad_ratings.CB[0] << " "
              << squad_ratings.WS[1];
  } else {
    std::cout << "\t  ";
    for (const auto &player : squad_ratings.CB) {
      std::cout << player << " ";
    }
  }
  std::cout << "\n";
  std::cout << "\t   " << "GK";
  std::cout << "\n";
  std::cout << "OVR: " << squad_ratings.OVR;
  std::cout << "\n";
}
