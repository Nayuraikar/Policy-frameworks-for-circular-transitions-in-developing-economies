# ==============================================================================
# SCRIPT: 05_moderation.R
# PURPOSE: Multi-Group Analysis (MGA) for Moderation (H8: Age, H9: Experience)
# FIX: Switched to Unstandardized Estimates (est) and added an NA safety net.
# ==============================================================================

source("00_project_setup.R")

cat("\nLoading clean dataset for Moderation...\n")
df <- read_csv(file.path(CLEAN_DATA, "survey_clean.csv"))

# ── 1. CREATE MODERATION GROUPS & CLEAN NAs ──
# Create the Prior Experience split
df$exp_split <- ifelse(df$prior_recycling_num <= 3, "Low Experience", "High Experience")

# Safety mechanism: Drop any row where age_split or exp_split is blank 
# This prevents Lavaan from crashing or throwing the "missing values" warning.
df <- df |> filter(!is.na(age_split) & !is.na(exp_split))

cat("Running moderation on N =", nrow(df), "valid respondents.\n")

# ── 2. DEFINE THE UNCONSTRAINED MODEL ──
mod_model <- '
  EC  =~ EC1  + EC2  + EC3  + EC4  + EC5
  AW  =~ AW1  + AW2  + AW3  + AW4  + AW5
  FI  =~ FI1  + FI2  + FI3  + FI4  + FI5
  PC  =~ PC1  + PC2  + PC3  + PC4  + PC5
  ATT =~ ATT1 + ATT2 + ATT3 + ATT4 + ATT5
  PBC =~ PBC1 + PBC2 + PBC3 + PBC4 + PBC5
  RI  =~ RI1  + RI2  + RI3  + RI4  + RI5

  ATT ~ EC + AW + FI + PC       
  PBC ~ EC + AW + FI             
  RI  ~ ATT + PBC + EC + AW + FI + PC
'

# ── HELPER FUNCTION TO COMPARE GROUPS ──
compare_groups <- function(fit_model) {
  levels <- lavInspect(fit_model, "group.label")
  
  # Extract Unstandardized Estimates ('est') for accurate group comparison
  ests <- parameterEstimates(fit_model) |>
    filter(op == "~") |>
    select(Dependent = lhs, Predictor = rhs, Group = group, Beta = est, pvalue = pvalue)
  
  g1 <- ests |> filter(Group == 1) |> select(Dependent, Predictor, Beta_G1 = Beta, p_G1 = pvalue)
  g2 <- ests |> filter(Group == 2) |> select(Dependent, Predictor, Beta_G2 = Beta, p_G2 = pvalue)
  
  comp <- left_join(g1, g2, by = c("Dependent", "Predictor")) |>
    mutate(
      Sig_G1 = ifelse(p_G1 < 0.05, "*", "ns"),
      Sig_G2 = ifelse(p_G2 < 0.05, "*", "ns"),
      Diff = round(abs(Beta_G1 - Beta_G2), 3)
    ) |>
    arrange(desc(Diff)) # Sort by the biggest differences
  
  cat("\nGroup 1:", levels[1], " |  Group 2:", levels[2], "\n")
  
  comp$Beta_G1 <- round(comp$Beta_G1, 3)
  comp$Beta_G2 <- round(comp$Beta_G2, 3)
  
  final_output <- comp |> select(Dependent, Predictor, Beta_G1, Sig_G1, Beta_G2, Sig_G2, Diff)
  print(as.data.frame(final_output), row.names = FALSE)
}

# ── 3. TEST H8: AGE MODERATION ──
cat("\n=== H8: AGE MODERATION ===\n")
fit_age <- sem(mod_model, data = df, group = "age_split", estimator = "MLR")
compare_groups(fit_age)

# ── 4. TEST H9: PRIOR EXPERIENCE MODERATION ──
cat("\n=== H9: PRIOR EXPERIENCE MODERATION ===\n")
fit_exp <- sem(mod_model, data = df, group = "exp_split", estimator = "MLR")
compare_groups(fit_exp)