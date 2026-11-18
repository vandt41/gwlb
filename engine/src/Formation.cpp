#include "Formation.h"
#include "Player.h"
#include <algorithm>
#include <iostream>
#include <vector>

std::vector<gwlb::Player>
joiningPlayers(const std::vector<gwlb::Player> &players,
               const std::vector<int> &players_ids) {
  std::vector<gwlb::Player> joining_players;

  for (int id : players_ids) {

    if (joining_players.size() >= 13) {
      std::cout << "Squad's full.\n";
      break;
    }

    auto it = std::find_if(
        players.begin(), players.end(),
        [id](const gwlb::Player &player) { return player.id == id; });

    if (it != players.end()) {
      joining_players.push_back(*it);
    } else {
      std::cout << "Player " << id << " not found\n";
    }
  }

  return joining_players;
}
