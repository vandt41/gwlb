#pragma once

#include <string>
#include <unordered_map>
#include <vector>
namespace gwlb {

struct Player {
  int id{};
  int pos_id;

  int jersey_number{};

  std::string pos;
  std::string pos_abbr;

  std::string name;

  std::unordered_map<std::string, double> attributes;
  std::vector<std::string> badges;
};

extern std::vector<Player> players;
extern std::string team_name;

} // namespace gwlb