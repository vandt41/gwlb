#pragma once

#include <string>
#include <unordered_map>
#include <vector>

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
