import pandas as pd
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier
from sklearn.metrics import classification_report, accuracy_score

df = pd.read_csv("survey_clean.csv")
features = ['age_num', 'edu_num', 'prior_recycling_num', 'EC_mean', 'AW_mean', 'FI_mean', 'PC_mean', 'ATT_mean', 'PBC_mean']
df['High_Adoption_Target'] = (df['RI_mean'] >= 3.5).astype(int)

df_clean = df.dropna(subset=features + ['High_Adoption_Target'])
X = df_clean[features]
y = df_clean['High_Adoption_Target']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42, stratify=y)
model = XGBClassifier(random_state=42, eval_metric='logloss')
model.fit(X_train, y_train)
y_pred = model.predict(X_test)

print("\n=== 08 ML PREDICTIVE MODEL (XGBOOST) ===")
print("Accuracy:", accuracy_score(y_test, y_pred))
print(classification_report(y_test, y_pred))
