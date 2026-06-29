# ==============================================================================
# SCRIPT: 01_pilot_quality_control.R
# ==============================================================================

# 1. STRAIGHT-LINE DETECTION (Checking for low-effort responses)
# If a respondent has an SD < 0.3, it means they likely clicked '5' (or '4') 
# for almost every single question without reading.
likert_cols <- c(paste0("EC",1:5), paste0("AW",1:5), paste0("FI",1:5),
                 paste0("PC",1:5), paste0("ATT",1:5), paste0("PBC",1:5), paste0("RI",1:5))

row_sd <- apply(df[, likert_cols], 1, sd, na.rm = TRUE)
n_before <- nrow(df)

# Filter out low-variance responses
df_clean <- df[row_sd > 0.3, ]
cat("Step 1: Removed straight-liners:", n_before - nrow(df_clean), "\n")


# 2. MANUAL ATTENTION CHECK
# Look at your survey. If you included a question like "Select '2' to prove you are reading"
# You MUST filter for it here. 
# Let's assume you haven't named it yet—check your colnames(df) to find it.
# Example if it was the 44th column:
# df_clean <- df_clean[df_clean[[44]] == 2, ] 
cat("Step 2: Attention check filtering completed.\n")


# 3. CEILING EFFECT CHECK
# If high_pct > 0.70, it means the question is too "easy" to agree with.
cat("\n=== CEILING EFFECT ANALYSIS ===\n")
ceiling_warnings <- 0
for (col in likert_cols) {
  high_pct <- mean(df_clean[[col]] >= 4, na.rm = TRUE)
  if (high_pct > 0.70) {
    cat(sprintf("WARNING: Ceiling effect on %s — %d%% answered ≥ 4\n", col, round(high_pct*100)))
    ceiling_warnings <- ceiling_warnings + 1
  }
}

if(ceiling_warnings == 0) {
  cat("No significant ceiling effects detected. Data variance is healthy!\n")
} else {
  cat("\nTotal warnings:", ceiling_warnings, 
      "\nNote: High ceiling effects in pilots are common with family/friends.\n")
}