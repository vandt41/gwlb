#pragma once
#include <string>
#include <unordered_map>
namespace gwlb {
struct Player {
    int id{};
    std::string name;
    std::unordered_map<std::string, double> attributes;
};
}
