suppressMessages(library(dplyr))
suppressMessages(library(readr))
suppressMessages(library(lavaan))

df <- read_csv("survey_clean.csv", show_col_types = FALSE)
df$exp_split <- ifelse(df$prior_recycling_num <= 3, "Low Experience", "High Experience")

path_model <- '
  ATT_mean ~ EC_mean + AW_mean + FI_mean + PC_mean       
  PBC_mean ~ EC_mean + AW_mean + FI_mean             
  RI_mean  ~ ATT_mean + PBC_mean + EC_mean + AW_mean + FI_mean + PC_mean
'

cat("\n=== H9: PRIOR EXPERIENCE MODERATION (PATH ANALYSIS w/ BOOTSTRAP) ===\n")
set.seed(42)
fit_path_exp <- sem(path_model, data = df, group = "exp_split", se = "bootstrap", bootstrap = 1000)

ests <- parameterEstimates(fit_path_exp) %>%
  filter(op == "~") %>%
  select(Dependent = lhs, Predictor = rhs, Group = group, Beta = est, pvalue = pvalue, ci.lower, ci.upper)

g1 <- ests %>% filter(Group == 1) %>% select(Dependent, Predictor, Beta_G1 = Beta, p_G1 = pvalue, ci_L_G1=ci.lower, ci_U_G1=ci.upper)
g2 <- ests %>% filter(Group == 2) %>% select(Dependent, Predictor, Beta_G2 = Beta, p_G2 = pvalue, ci_L_G2=ci.lower, ci_U_G2=ci.upper)

comp <- left_join(g1, g2, by = c("Dependent", "Predictor")) %>%
  mutate(
    Diff = round(abs(Beta_G1 - Beta_G2), 3),
    Sig_G1 = ifelse(p_G1 < 0.05, "*", "ns"),
    Sig_G2 = ifelse(p_G2 < 0.05, "*", "ns")
  ) %>%
  arrange(desc(Diff))

comp$Beta_G1 <- round(comp$Beta_G1, 3)
comp$Beta_G2 <- round(comp$Beta_G2, 3)
comp$p_G1_exact <- round(comp$p_G1, 4)
comp$p_G2_exact <- round(comp$p_G2, 4)
comp$ci_L_G1 <- round(comp$ci_L_G1, 3)
comp$ci_U_G1 <- round(comp$ci_U_G1, 3)
comp$ci_L_G2 <- round(comp$ci_L_G2, 3)
comp$ci_U_G2 <- round(comp$ci_U_G2, 3)

comp$CI_G1 <- paste0("[", comp$ci_L_G1, ", ", comp$ci_U_G1, "]")
comp$CI_G2 <- paste0("[", comp$ci_L_G2, ", ", comp$ci_U_G2, "]")

levels <- lavInspect(fit_path_exp, "group.label")
cat("\nGroup 1:", levels[1], "(N =", sum(df$exp_split == levels[1], na.rm=TRUE), ") |  Group 2:", levels[2], "(N =", sum(df$exp_split == levels[2], na.rm=TRUE), ")\n\n")

final_out <- comp %>% select(Dependent, Predictor, Beta_G1, p_G1_exact, Sig_G1, CI_G1, Beta_G2, p_G2_exact, Sig_G2, CI_G2, Diff)
print(as.data.frame(final_out), row.names = FALSE)
