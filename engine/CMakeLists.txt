cmake_minimum_required(VERSION 3.20)

project(gwlb_engine VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

find_package(nlohmann_json CONFIG REQUIRED)

add_executable(gwlb_engine
    src/main.cpp
    src/PlayerRating.cpp
    src/JsonLoader.cpp
    src/SquadAnalyzer.cpp
)

target_include_directories(gwlb_engine
    PRIVATE
        ${CMAKE_CURRENT_SOURCE_DIR}/include
)

target_link_libraries(gwlb_engine
    PRIVATE
        nlohmann_json::nlohmann_json
)