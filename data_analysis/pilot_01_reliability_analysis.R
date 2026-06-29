# ==============================================================================
# SCRIPT: 00_pilot_reliability.R
# PURPOSE: Load pilot data, rename columns, and run Cronbach's Alpha
# ==============================================================================

# 1. LOAD DATA & ENVIRONMENT
source("pilot_00_setup.R")

# Ensure the file exists before reading
file_path <- file.path(CLEAN_DATA, "pilot_test_raw.csv")
if (!file.exists(file_path)) {
  stop("File not found: ", file_path)
}

df <- read_csv(file_path)

# 2. RENAME COLUMNS (From long sentences to short codes)
# Based on your previous check, columns 9-43 contain the 35 Likert items
colnames(df)[9:43] <- c(
  paste0("EC",  1:5), # Environmental Concern
  paste0("AW",  1:5), # Awareness
  paste0("FI",  1:5), # Financial Incentives
  paste0("PC",  1:5), # Privacy Concerns
  paste0("ATT", 1:5), # Attitude
  paste0("PBC", 1:5), # Perceived Behavioral Control
  paste0("RI",  1:5)  # Recycling Intention
)

# 3. DEFINE CONSTRUCTS
constructs <- list(
  EC  = paste0("EC",  1:5),
  AW  = paste0("AW",  1:5),
  FI  = paste0("FI",  1:5),
  PC  = paste0("PC",  1:5),
  ATT = paste0("ATT", 1:5),
  PBC = paste0("PBC", 1:5),
  RI  = paste0("RI",  1:5)
)

# 4. DATA CLEANING (Straight-line Detection)
# It is best to check for straight-liners BEFORE running Alpha
likert_cols <- unlist(constructs)
row_sd <- apply(df[, likert_cols], 1, sd, na.rm = TRUE)
df_clean <- df[row_sd > 0.3, ] # Removes those with no variation

cat("\n--- Data Cleaning Summary ---\n")
cat("Total responses loaded:", nrow(df), "\n")
cat("Valid responses after removing straight-liners:", nrow(df_clean), "\n")

# 5. RUN ALPHA ANALYSIS
cat("\n=== CRONBACH'S ALPHA RESULTS ===\n")
for (name in names(constructs)) {
  cols <- constructs[[name]]
  
  # check.keys=TRUE is vital in case any items were interpreted inversely
  a <- psych::alpha(df_clean[, cols], check.keys=TRUE)
  
  alpha_val <- a$total$raw_alpha
  status <- ifelse(alpha_val >= 0.7, "[OK - PASS]", "[BELOW 0.7 — REVISE ITEMS]")
  
  cat(sprintf("%s: alpha = %.3f %s\n", name, alpha_val, status))
  
  # DIAGNOSTIC: If Alpha is low, show which item to fix/drop
  if(alpha_val < 0.7) {
    cat("   Troubleshooting: Look at r.drop (anything < 0.30 is a problem item):\n")
    print(round(a$item.stats$r.drop, 3))
    cat("\n")
  }
}

# 6. CEILING EFFECT CHECK
cat("\n=== CEILING EFFECT CHECK (>70% answering 4 or 5) ===\n")
for (col in likert_cols) {
  high_pct <- mean(df_clean[[col]] >= 4, na.rm = TRUE)
  if (high_pct > 0.70) {
    cat(sprintf("WARNING: %s — %.1f%% answered ≥ 4\n", col, high_pct * 100))
  }
}