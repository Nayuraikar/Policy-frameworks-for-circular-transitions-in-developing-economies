# ==============================================================================
# SCRIPT: 00_setup.R
# PURPOSE: Load required libraries and map the project directory
# ==============================================================================

# 1. Load the full statistical and data manipulation toolkit
packages <- c("psych", "lavaan", "semTools", "seminr", "dplyr", 
              "ggplot2", "readr", "corrplot", "tidyr")

# Install missing packages automatically
installed_packages <- packages %in% rownames(installed.packages())
if(any(!installed_packages)) {
  install.packages(packages[!installed_packages])
}

# Load all libraries quietly
invisible(lapply(packages, library, character.only = TRUE))

# 2. Map directories to current working directory
# We assume the user runs the script from this project folder
PROJECT_DIR <- getwd()

# For simplicity, we will read and write from this main project folder
RAW_DATA   <- PROJECT_DIR
CLEAN_DATA <- PROJECT_DIR
ANALYSIS   <- PROJECT_DIR

cat("Setup complete. All libraries loaded and directories mapped.\n")