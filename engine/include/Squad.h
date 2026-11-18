#pragma once

#include <vector>

namespace gwlb {

struct Squad {
  int formation_id;

  std::vector<int> GK;
  std::vector<int> CB;
  std::vector<int> CM;
  std::vector<int> WS;
  std::vector<int> ST;
  int OVR;
};

} // namespace gwlb