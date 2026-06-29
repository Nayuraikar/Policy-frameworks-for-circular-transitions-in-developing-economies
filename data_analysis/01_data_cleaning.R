# ==============================================================================
# SCRIPT: 01_data_cleaning.R
# PURPOSE: Full data cleaning pipeline for EL Research (Phase 5)
# FIX: Bulletproofed demographic recoding to prevent NA generation in Lavaan
# ==============================================================================

# 1. Initialize the environment from your setup file
source("00_project_setup.R")

# 2. Load the raw CSV
cat("\nLoading raw survey data...\n")
df_raw <- read_csv(file.path(RAW_DATA, "survey_responses_raw.csv"))

# ── STEP 1: RENAME COLUMNS (Exactly 43 columns) ──
# Translating Google Forms' long text questions into our short conceptual codes.
colnames(df_raw) <- c(
  "timestamp", 
  "age", "education", "occupation", "city",
  "prior_recycling", "infrastructure", "area_type",
  paste0("EC",  1:5),
  paste0("AW",  1:5),
  paste0("FI",  1:5),
  paste0("PC",  1:5),
  paste0("ATT", 1:5),
  paste0("PBC", 1:5),
  paste0("RI",  1:5)
)

# Remove the timestamp column so our dataframe only contains analytical data
df <- df_raw |> select(-timestamp)

# Define all 35 Likert columns for matrix operations
likert_cols <- c(paste0("EC",1:5), paste0("AW",1:5), paste0("FI",1:5),
                 paste0("PC",1:5), paste0("ATT",1:5), paste0("PBC",1:5),
                 paste0("RI",1:5))

# ── STEP 2: REMOVE STRAIGHT-LINERS ──
# This identifies respondents who clicked the same number (e.g., all 3s or all 5s) 
# down the entire page without reading. A standard deviation < 0.3 flags these low-effort responses.
row_sd <- apply(df |> select(all_of(likert_cols)), 1, sd, na.rm = TRUE)
n_before <- nrow(df)
df <- df[row_sd > 0.3, ]
cat("Removed straight-liners:", n_before - nrow(df), "\n")

# ── STEP 3: MISSING VALUE HANDLING ──
# If a respondent missed a question, it's mathematically acceptable to impute the mean 
# of that column, provided the missing data accounts for less than 5% of the total responses.
pct_missing <- colSums(is.na(df)) / nrow(df) * 100
for (col in likert_cols) {
  if (pct_missing[col] > 0 && pct_missing[col] < 5) {
    df[[col]][is.na(df[[col]])] <- round(mean(df[[col]], na.rm = TRUE))
  } else if (pct_missing[col] >= 5) {
    cat("WARNING:", col, "has", round(pct_missing[col],1), "% missing — investigate!\n")
  }
}

# ── STEP 4: BULLETPROOF DEMOGRAPHIC RECODING FOR MODERATION ──
# Converting categorical demographic text strings into ordinal numeric values. 
# We use %in% with multiple string variations to catch spaces, hyphens, and en-dashes
# that Google Forms frequently injects into CSV exports.

df$age_num <- case_when(
  df$age %in% c("Under 18", "Under 18 ") ~ 16,
  df$age %in% c("18 - 24", "18-24", "18–24") ~ 21,
  df$age %in% c("25 - 34", "25-34", "25–34") ~ 29,
  df$age %in% c("35 - 44", "35-44", "35–44") ~ 39,
  df$age %in% c("45 - 60", "45-60", "45–60") ~ 52,
  df$age %in% c("Above 60", "Above 60 ", "Above") ~ 65,
  TRUE ~ NA_real_ # Fallback safety mechanism
)

# Automatically create the categorical split for Multi-Group Moderation (Younger vs Older)
df$age_split <- ifelse(df$age_num <= 21, "Younger", "Older")

df$edu_num <- case_when(
  df$education %in% c("High school/10+2", "High school / 10+2") ~ 1,
  df$education %in% c("Undergraduate (pursuing)", "Undergraduate(pursuing)") ~ 2,
  df$education %in% c("Undergraduate (completed)", "Undergraduate(completed)") ~ 3,
  df$education == "Postgraduate" ~ 4,
  df$education == "Doctoral" ~ 5,
  TRUE ~ NA_real_
)

df$prior_recycling_num <- case_when(
  df$prior_recycling %in% c("Never", "Never ") ~ 1,
  df$prior_recycling %in% c("Rarely (a few times a year)", "Rarely") ~ 2,
  df$prior_recycling %in% c("Sometimes (about once a month)", "Sometimes") ~ 3,
  df$prior_recycling %in% c("Often (weekly)", "Often") ~ 4,
  df$prior_recycling %in% c("Always (daily)", "Always") ~ 5,
  TRUE ~ NA_real_
)

# ── STEP 5: COMPUTE CONSTRUCT MEANS ──
# Creating a single aggregated score for each of your 7 theoretical constructs.
for (c in c("EC","AW","FI","PC","ATT","PBC","RI")) {
  df[[paste0(c, "_mean")]] <- rowMeans(df[, paste0(c, 1:5)], na.rm = TRUE)
}

# ── STEP 6: FINAL DATA QUALITY REPORT ──
cat("\n=== FINAL DATA QUALITY REPORT ===\n")
cat("Starting Raw N:", nrow(df_raw), "\n")
cat("Final Clean N:", nrow(df), "\n")
cat("Target N (minimum):", 250, "\n")

# Verify the demographic parsing worked
missing_ages <- sum(is.na(df$age_num))
if(missing_ages > 0) {
  cat("WARNING: Could not parse", missing_ages, "age values. Check raw CSV formatting.\n")
} else {
  cat("Demographics parsed successfully: No missing values detected.\n")
}

cat("Status:", ifelse(nrow(df) >= 250,
                      "[PASS - proceed to analysis]",
                      "[FAIL - collect more responses]"), "\n\n")

# ── STEP 7: SAVE CLEAN DATASET ──
write_csv(df, file.path(CLEAN_DATA, "survey_clean.csv"))
cat("Clean data saved successfully as 'survey_clean.csv'.\n")