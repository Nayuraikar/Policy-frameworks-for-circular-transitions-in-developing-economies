# ==============================================================================
# SCRIPT: 02b_cfa.R
# PURPOSE: Measurement Model (Confirmatory Factor Analysis)
# ==============================================================================

source("00_project_setup.R")

# Load the clean dataset
cat("\nLoading clean dataset for CFA...\n")
df <- read_csv(file.path(CLEAN_DATA, "survey_clean.csv"))

# ── DEFINE THE MEASUREMENT MODEL ──
cfa_model <- '
  EC  =~ EC1  + EC2  + EC3  + EC4  + EC5
  AW  =~ AW1  + AW2  + AW3  + AW4  + AW5
  FI  =~ FI1  + FI2  + FI3  + FI4  + FI5
  PC  =~ PC1  + PC2  + PC3  + PC4  + PC5
  ATT =~ ATT1 + ATT2 + ATT3 + ATT4 + ATT5
  PBC =~ PBC1 + PBC2 + PBC3 + PBC4 + PBC5
  RI  =~ RI1  + RI2  + RI3  + RI4  + RI5
'

# ── RUN CFA ──
# estimator = "MLR" is used to handle the non-normality in the survey data
cat("\nRunning CFA model. This may take a few seconds...\n")
cfa_fit <- cfa(cfa_model, data = df, estimator = "MLR", std.lv = TRUE)

# ── 1. CHECK MODEL FIT INDICES ──
cat("\n=== MODEL FIT INDICES ===\n")
fit_indices <- fitMeasures(cfa_fit, c("cfi","tli","rmsea","rmsea.ci.lower","rmsea.ci.upper","srmr"))
print(round(fit_indices, 3))
cat("\n[TARGETS: CFI/TLI > 0.90 | RMSEA < 0.08 | SRMR < 0.08]\n")

# ── 2. EXTRACT FACTOR LOADINGS ──
cat("\n=== STANDARDIZED FACTOR LOADINGS ===\n")
loadings_table <- standardizedSolution(cfa_fit) |>
  filter(op == "=~") |>
  select(lhs, rhs, est.std, pvalue) |>
  rename(Construct = lhs, Item = rhs, Loading = est.std, p_value = pvalue)
print(as.data.frame(loadings_table), row.names = FALSE)
cat("\n[TARGET: All Loadings ideally > 0.60 or 0.70. Anything < 0.50 is a red flag]\n")

# ── 3. COMPOSITE RELIABILITY (CR) AND AVE (UPDATED SYNTAX) ──
cat("\n=== RELIABILITY (CR) & CONVERGENT VALIDITY (AVE) ===\n")
cr_values <- semTools::compRelSEM(cfa_fit)
ave_values <- semTools::AVE(cfa_fit)
rel_table_modern <- rbind(CR = cr_values, AVE = ave_values)
print(round(rel_table_modern, 3))
cat("\n[TARGETS: CR > 0.70 | AVE > 0.50]\n")

# ── 4. HTMT DISCRIMINANT VALIDITY ──
cat("\n=== HTMT DISCRIMINANT VALIDITY ===\n")
htmt_result <- semTools::htmt(cfa_model, df)
print(round(htmt_result, 3))
cat("\n[TARGET: All values < 0.85 (Strict) or < 0.90 (Lenient)]\n")