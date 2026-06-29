source("00_project_setup.R")
df <- read_csv("survey_clean.csv", show_col_types = FALSE)
cfa_model <- '
  EC  =~ EC1  + EC2  + EC3  + EC4  + EC5
  AW  =~ AW1  + AW2  + AW3  + AW4  + AW5
  FI  =~ FI1  + FI2  + FI3  + FI4  + FI5
  PC  =~ PC1  + PC2  + PC3  + PC4  + PC5
  ATT =~ ATT1 + ATT2 + ATT3 + ATT4 + ATT5
  PBC =~ PBC1 + PBC2 + PBC3 + PBC4 + PBC5
  RI  =~ RI1  + RI2  + RI3  + RI4  + RI5
'
cfa_fit <- cfa(cfa_model, data = df, estimator = "MLR", std.lv = TRUE)
cr_values <- semTools::compRelSEM(cfa_fit)
ave_values <- semTools::AVE(cfa_fit)
print(class(cr_values))
print(class(ave_values))
print(ave_values)
