#include "PlayerRating.h"
#include "Squad.h"
#include <nlohmann/json.hpp>
using json = nlohmann::json;

json CalculateSquatRating(
    const json &uncalculated,
    const std::unordered_map<std::string, int> &position_ids);
void showSquadRatings(gwlb::Squad squad);

void SaveJson(const std::string &filename, const json &data);
json LoadJson(const std::string &filename);