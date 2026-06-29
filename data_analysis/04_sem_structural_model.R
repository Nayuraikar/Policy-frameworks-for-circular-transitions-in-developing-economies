# ==============================================================================
# SCRIPT: 03_sem_structural.R
# PURPOSE: Full Structural Model (Hypothesis Testing)
# ==============================================================================

# 1. Initialize environment
source("00_project_setup.R")

# Load the clean dataset
cat("\nLoading clean dataset for SEM...\n")
df <- read_csv(file.path(CLEAN_DATA, "survey_clean.csv"))

# ── DEFINE THE FULL STRUCTURAL MODEL ──
# This includes the measurement model (the items) AND the structural paths (the hypotheses)
sem_model <- '
  # Measurement model (CFA)
  EC  =~ EC1  + EC2  + EC3  + EC4  + EC5
  AW  =~ AW1  + AW2  + AW3  + AW4  + AW5
  FI  =~ FI1  + FI2  + FI3  + FI4  + FI5
  PC  =~ PC1  + PC2  + PC3  + PC4  + PC5
  ATT =~ ATT1 + ATT2 + ATT3 + ATT4 + ATT5
  PBC =~ PBC1 + PBC2 + PBC3 + PBC4 + PBC5
  RI  =~ RI1  + RI2  + RI3  + RI4  + RI5

  # Structural paths (Hypothesis Testing)
  # Predicting the Mediators (ATT and PBC)
  ATT ~ EC + AW + FI + PC       
  PBC ~ EC + AW + FI             
  
  # Predicting the Dependent Variable (RI)
  RI  ~ ATT + PBC + EC + AW + FI + PC   
'

# ── RUN THE FULL SEM ──
cat("\nRunning full Structural Equation Model. This may take a moment...\n")
sem_fit <- sem(sem_model, data = df, estimator = "MLR", std.lv = TRUE)

# ── 1. CHECK OVERALL MODEL FIT ──
cat("\n=== STRUCTURAL MODEL FIT INDICES ===\n")
fit_indices <- fitMeasures(sem_fit, c("cfi","tli","rmsea","srmr"))
print(round(fit_indices, 3))

# ── 2. EXTRACT HYPOTHESIS RESULTS (Path Coefficients) ──
cat("\n=== HYPOTHESIS TESTING RESULTS (Path Coefficients) ===\n")

paths <- standardizedSolution(sem_fit) |>
  filter(op == "~") |>
  select(lhs, rhs, est.std, pvalue) |>
  rename(Dependent = lhs, Predictor = rhs, Beta = est.std, p_value = pvalue) |>
  mutate(
    # Add significance stars for easy reading
    Significance = case_when(
      p_value < 0.001 ~ "***",
      p_value < 0.01  ~ "**",
      p_value < 0.05  ~ "*",
      TRUE            ~ "ns"
    ),
    Supported = ifelse(p_value < 0.05, "YES", "NO")
  )

print(as.data.frame(paths), row.names = FALSE)

# ── 3. EXTRACT R-SQUARED VALUES ──
cat("\n=== R-SQUARED (Variance Explained) ===\n")
r2 <- lavInspect(sem_fit, "rsquare")
print(round(r2, 3))
cat("\n[Target: RI R-squared ideally > 0.50]\n")

# Save results for your manuscript
write.csv(paths, file.path(ANALYSIS, "sem_path_coefficients.csv"), row.names = FALSE)
cat("\nPath coefficients saved successfully.\n")