cmake_minimum_required(VERSION 3.20)
project(gwlb_engine VERSION 0.1.0 LANGUAGES CXX)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

find_package(nlohmann_json 3.2.0 REQUIRED)

add_library(gwlb_engine_lib src/json_loader.cpp src/position_rating.cpp)
target_include_directories(gwlb_engine_lib PUBLIC include)
target_link_libraries(gwlb_engine_lib PUBLIC nlohmann_json::nlohmann_json)

add_executable(gwlb_engine src/main.cpp)
target_link_libraries(gwlb_engine PRIVATE gwlb_engine_lib)

enable_testing()
add_executable(gwlb_engine_tests tests/test_position_rating.cpp)
target_link_libraries(gwlb_engine_tests PRIVATE gwlb_engine_lib)
add_test(NAME position_rating_tests COMMAND gwlb_engine_tests)
