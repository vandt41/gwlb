#pragma once
#include <string>
#include <vector>
namespace gwlb {
struct AttributeWeight { std::string attribute; double weight{}; };
struct Position {
    std::string id;
    std::string name;
    std::vector<AttributeWeight> requirements;
};
}
