cmake_minimum_required(VERSION 3.24)
project(StackAnvilOreUiShaper VERSION 1.0 LANGUAGES C CXX)

include(FetchContent)
include(CTest)
find_package(Git REQUIRED)

file(READ "${CMAKE_CURRENT_SOURCE_DIR}/source.json" source_pin)
string(JSON HARFBUZZ_VERSION GET "${source_pin}" version)
string(JSON HARFBUZZ_SHA256 GET "${source_pin}" sha256)
string(JSON source_url GET "${source_pin}" url)
set(STACKANVIL_HARFBUZZ_ARCHIVE
    "${source_url}"
    CACHE STRING "Pinned HarfBuzz archive URL or local archive path")
file(SHA256 "${CMAKE_CURRENT_SOURCE_DIR}/compatibility.patch" COMPATIBILITY_SHA256)

# Keep the engine independent of the game's FreeType library. Java supplies font callbacks.
set(BUILD_SHARED_LIBS ON CACHE BOOL "" FORCE)
foreach(option IN ITEMS HB_BUILD_SUBSET HB_BUILD_RASTER HB_BUILD_VECTOR HB_BUILD_GPU
        HB_BUILD_UTILS HB_HAVE_FREETYPE HB_HAVE_GLIB HB_HAVE_ICU HB_HAVE_CAIRO
        HB_HAVE_GOBJECT HB_HAVE_INTROSPECTION)
    set(${option} OFF CACHE BOOL "" FORCE)
endforeach()
set(CMAKE_MSVC_RUNTIME_LIBRARY "MultiThreaded$<$<CONFIG:Debug>:Debug>")

FetchContent_Declare(harfbuzz
    URL "${STACKANVIL_HARFBUZZ_ARCHIVE}"
    URL_HASH "SHA256=${HARFBUZZ_SHA256}"
    DOWNLOAD_EXTRACT_TIMESTAMP TRUE
    PATCH_COMMAND "${CMAKE_COMMAND}"
        "-DGIT_EXECUTABLE=${GIT_EXECUTABLE}"
        "-DPATCH=${CMAKE_CURRENT_SOURCE_DIR}/compatibility.patch"
        "-DPATCH_SHA256=${COMPATIBILITY_SHA256}"
        -P "${CMAKE_CURRENT_SOURCE_DIR}/apply-patch.cmake")
FetchContent_MakeAvailable(harfbuzz)
target_compile_definitions(harfbuzz PRIVATE HB_EXPERIMENTAL_API STACKANVIL_OREUI_COMPATIBILITY)
set_target_properties(harfbuzz PROPERTIES OUTPUT_NAME stackanvil_oreui_harfbuzz)
set_property(TARGET harfbuzz PROPERTY VERSION)
set_property(TARGET harfbuzz PROPERTY SOVERSION)

string(TOLOWER "${CMAKE_SYSTEM_PROCESSOR}" processor)
if(MSVC AND CMAKE_VS_PLATFORM_NAME)
    # Visual Studio can target ARM64 while CMake itself runs as an x64 process.
    string(TOLOWER "${CMAKE_VS_PLATFORM_NAME}" processor)
endif()
if(processor MATCHES "^(amd64|x86_64|x64)$")
    set(architecture x64)
elseif(processor MATCHES "^(aarch64|arm64)$")
    set(architecture arm64)
else()
    message(FATAL_ERROR "Unsupported OreUI shaper architecture: ${CMAKE_SYSTEM_PROCESSOR}")
endif()
if(CMAKE_SYSTEM_NAME STREQUAL "Linux")
    set(platform linux)
elseif(CMAKE_SYSTEM_NAME STREQUAL "Windows")
    set(platform windows)
elseif(CMAKE_SYSTEM_NAME STREQUAL "Darwin")
    set(platform macos)
else()
    message(FATAL_ERROR "Unsupported OreUI shaper platform: ${CMAKE_SYSTEM_NAME}")
endif()

set(resource "assets/viafabricplus-bedrock/oreui-shaper/${platform}-${architecture}")
install(FILES "$<TARGET_FILE:harfbuzz>" "${harfbuzz_SOURCE_DIR}/COPYING"
    DESTINATION "${resource}" COMPONENT OreUiShaper)
file(GENERATE OUTPUT "${CMAKE_CURRENT_BINARY_DIR}/manifest-$<CONFIG>.cmake" CONTENT
"set(library_name \"$<TARGET_FILE_NAME:harfbuzz>\")\ninclude(\"${CMAKE_CURRENT_BINARY_DIR}/write-manifest.cmake\")\n")
configure_file(write-manifest.cmake.in write-manifest.cmake @ONLY)
install(SCRIPT "${CMAKE_CURRENT_BINARY_DIR}/manifest-$<CONFIG>.cmake" COMPONENT OreUiShaper)

if(BUILD_TESTING)
    add_executable(oreui-shaping-test tests/shaping.cpp)
    target_compile_features(oreui-shaping-test PRIVATE cxx_std_11)
    target_include_directories(oreui-shaping-test PRIVATE "${harfbuzz_SOURCE_DIR}/src"
        "${harfbuzz_BINARY_DIR}/src")
    target_link_libraries(oreui-shaping-test PRIVATE harfbuzz)
    # Windows resolves a linked DLL beside the executable.
    add_custom_command(TARGET oreui-shaping-test POST_BUILD COMMAND "${CMAKE_COMMAND}" -E
        copy_if_different "$<TARGET_FILE:harfbuzz>" "$<TARGET_FILE_DIR:oreui-shaping-test>")
    add_test(NAME oreui-shaping COMMAND oreui-shaping-test)
endif()
