#include "gwlb/json_loader.hpp"
#include <nlohmann/json.hpp>
#include <fstream>
#include <stdexcept>
namespace gwlb {
namespace {
nlohmann::json readJson(const std::filesystem::path& path) {
    std::ifstream input(path);
    if (!input) throw std::runtime_error("Cannot open JSON file: " + path.string());
    nlohmann::json document;
    input >> document;
    return document;
}
}
std::vector<Player> loadPlayers(const std::filesystem::path& path) {
    const auto document = readJson(path);
    std::vector<Player> result;
    for (const auto& item : document.at("players")) {
        Player player;
        player.id = item.at("id").get<int>();
        player.name = item.at("name").get<std::string>();
        for (auto it = item.at("attributes").begin(); it != item.at("attributes").end(); ++it)
            player.attributes[it.key()] = it.value().get<double>();
        result.push_back(std::move(player));
    }
    return result;
}
std::vector<Position> loadPositions(const std::filesystem::path& path) {
    const auto document = readJson(path);
    std::vector<Position> result;
    for (const auto& item : document.at("positions")) {
        Position position;
        position.id = item.at("id").get<std::string>();
        position.name = item.value("name", position.id);
        for (auto it = item.at("requirements").begin(); it != item.at("requirements").end(); ++it)
            position.requirements.push_back({it.key(), it.value().get<double>()});
        result.push_back(std::move(position));
    }
    return result;
}
}
