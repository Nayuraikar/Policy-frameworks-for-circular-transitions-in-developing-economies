# ==============================================================================
# SCRIPT: 04_sem_mediation_moderation.R
# PURPOSE: Indirect Effects (Mediation) & Multi-Group Analysis (Moderation)
# ==============================================================================

source("00_project_setup.R")

cat("\nLoading clean dataset...\n")
df <- read_csv(file.path(CLEAN_DATA, "survey_clean.csv"))

# ── 1. MEDIATION ANALYSIS (Testing the Indirect Paths) ──
mediation_model <- '
  # Measurement Model
  EC  =~ EC1  + EC2  + EC3  + EC4  + EC5
  AW  =~ AW1  + AW2  + AW3  + AW4  + AW5
  FI  =~ FI1  + FI2  + FI3  + FI4  + FI5
  PC  =~ PC1  + PC2  + PC3  + PC4  + PC5
  ATT =~ ATT1 + ATT2 + ATT3 + ATT4 + ATT5
  PBC =~ PBC1 + PBC2 + PBC3 + PBC4 + PBC5
  RI  =~ RI1  + RI2  + RI3  + RI4  + RI5

  # Direct Paths (naming the coefficients for math)
  ATT ~ a1*EC + a2*AW + a3*FI + a4*PC       
  PBC ~ b1*EC + b2*AW + b3*FI             
  RI  ~ c1*ATT + c2*PBC + d1*EC + d2*AW + d3*FI + d4*PC

  # Indirect Effects (Multiplying the paths)
  ind_EC_ATT_RI := a1 * c1
  ind_AW_ATT_RI := a2 * c1
  ind_AW_PBC_RI := b2 * c2
  ind_FI_ATT_RI := a3 * c1
  ind_FI_PBC_RI := b3 * c2
  ind_PC_ATT_RI := a4 * c1

  # Total Effects
  total_EC := d1 + (a1 * c1) + (b1 * c2)
  total_AW := d2 + (a2 * c1) + (b2 * c2)
'

cat("\nRunning Mediation Model (Bootstrapping for strict accuracy)...\n")
# Using 1000 bootstrap samples to generate highly accurate p-values for indirect effects
set.seed(42)
med_fit <- sem(mediation_model, data = df, se = "bootstrap", bootstrap = 1000)

cat("\n=== MEDIATION (INDIRECT EFFECTS) RESULTS ===\n")
med_results <- parameterEstimates(med_fit, standardized = TRUE) |>
  filter(op == ":=") |>
  select(lhs, est, pvalue) |>
  rename(Specific_Path = lhs, Estimate = est, p_value = pvalue) |>
  mutate(Significant = ifelse(p_value < 0.05, "YES", "NO"))
print(as.data.frame(med_results), row.names = FALSE)


# ── 2. MODERATION ANALYSIS (Multi-Group SEM based on Age) ──
# Splitting the sample into Younger (<= 24) and Older (> 24) using the recoded numeric column
df$age_split <- ifelse(df$age_num <= 21, "Younger", "Older")

cat("\n=== MODERATION ANALYSIS (Age Group Differences) ===\n")
cat("Testing if the policy drivers differ between demographics...\n")

# We run the structural model again, but tell lavaan to group by age
mod_fit <- sem(mediation_model, data = df, group = "age_split")

# We test for structural invariance (do the paths fundamentally change between groups?)
cat("\nExtracting differences in path significance between Younger and Older groups:\n")
mod_results <- parameterEstimates(mod_fit) |>
  filter(op == "~") |>
  select(lhs, rhs, group, est, pvalue) |>
  rename(Dependent = lhs, Predictor = rhs, Group = group, Beta = est, p_value = pvalue)

# Print a comparison of the key paths
print(as.data.frame(mod_results), row.names = FALSE)