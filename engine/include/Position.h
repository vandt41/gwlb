#pragma once

#include <string>
#include <unordered_map>
#include <vector>

#define POS_GK 0
#define POS_CB 1
#define POS_CM 2
#define POS_WS 3
#define POS_ST 4

namespace gwlb {

struct Position {
  int pos_id;
  std::string pos_abbr;
  std::string name;

  std::unordered_map<std::string, double> requirements;
  std::unordered_map<std::string, double> weights;
};
extern std::vector<Position> positions;
} // namespace gwlb

const std::unordered_map<std::string, int> position_ids = {{"GK", POS_GK},
                                                           {"CB", POS_CB},
                                                           {"CM", POS_CM},
                                                           {"WG", POS_WS},
                                                           {"ST", POS_ST}};
