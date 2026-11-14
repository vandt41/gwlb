#pragma once

#include <string>
#include <unordered_map>
#include <vector>
namespace gwlb {

struct Player {
  int id{};

  int jersey_number{};

  std::string pos;
  std::string pos_id;

  std::string name;

  std::unordered_map<std::string, double> attributes;
};

extern std::vector<Player> players;
extern std::string team_name;

} // namespace gwlb