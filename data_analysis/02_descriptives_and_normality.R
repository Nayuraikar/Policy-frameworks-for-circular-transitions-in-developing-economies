# ==============================================================================
# SCRIPT: 02a_descriptives.R
# PURPOSE: Preliminary Analysis - Descriptives, Normality, and Correlations
# FIX: Swapped MVN package for psych::mardia to fix the version error
# ==============================================================================

# 1. Initialize environment
source("00_project_setup.R")

# Load the clean dataset (N = 252)
cat("\nLoading clean dataset...\n")
df <- read_csv(file.path(CLEAN_DATA, "survey_clean.csv"))

# Define our Likert items
all_likert <- c(paste0("EC",1:5), paste0("AW",1:5), paste0("FI",1:5),
                paste0("PC",1:5), paste0("ATT",1:5), paste0("PBC",1:5),
                paste0("RI",1:5))

# ── 1. DESCRIPTIVE STATISTICS ──
cat("\n=== DESCRIPTIVE STATISTICS (Item Level) ===\n")
desc <- psych::describe(df[, all_likert])
print(round(desc[, c("mean","sd","skew","kurtosis","min","max")], 3))

# ── 2. MULTIVARIATE NORMALITY TEST (Using psych package) ──
# This tests if the data follows a perfectly normal bell curve across all variables.
cat("\n=== MARDIA'S MULTIVARIATE NORMALITY TEST ===\n")
mardia_result <- psych::mardia(df[, all_likert], plot = FALSE)
# The output will show p-values for skew and kurtosis. If they are < 0.05, 
# the data is non-normal (which is expected) and we will use the MLR estimator next.

# ── 3. CONSTRUCT-LEVEL CORRELATION MATRIX ──
# Checking to ensure distinct variables aren't overlapping too much (multicollinearity).
construct_means <- df[, paste0(c("EC","AW","FI","PC","ATT","PBC","RI"), "_mean")]
construct_corr  <- cor(construct_means, use = "complete.obs")

cat("\n=== CONSTRUCT-LEVEL CORRELATIONS ===\n")
print(round(construct_corr, 3))

# ── 4. VISUAL CORRELATION PLOT ──
# This will generate a visual matrix in your RStudio Plots pane.
corrplot(construct_corr, method = "color", type = "upper", 
         tl.cex = 0.8, tl.col = "black", addCoef.col = "black", 
         number.cex = 0.7, title = "Construct Correlation Matrix",
         mar=c(0,0,1,0))