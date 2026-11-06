execute_process(COMMAND "${GIT_EXECUTABLE}" apply --reverse --check "${PATCH}"
    RESULT_VARIABLE already_applied OUTPUT_QUIET ERROR_QUIET)
if(already_applied EQUAL 0)
    return()
endif()
execute_process(COMMAND "${GIT_EXECUTABLE}" apply --check "${PATCH}"
    RESULT_VARIABLE check_result ERROR_VARIABLE check_error)
if(NOT check_result EQUAL 0)
    message(FATAL_ERROR "Cannot apply OreUI compatibility patch: ${check_error}")
endif()
execute_process(COMMAND "${GIT_EXECUTABLE}" apply "${PATCH}"
    RESULT_VARIABLE apply_result ERROR_VARIABLE apply_error)
if(NOT apply_result EQUAL 0)
    message(FATAL_ERROR "Cannot apply OreUI compatibility patch: ${apply_error}")
endif()
