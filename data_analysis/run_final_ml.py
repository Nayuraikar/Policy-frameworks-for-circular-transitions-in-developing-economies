import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.metrics import accuracy_score, classification_report, roc_curve, auc, confusion_matrix, ConfusionMatrixDisplay
import matplotlib.pyplot as plt
import shap

# 1. LOAD DATA
df = pd.read_csv("survey_clean.csv")
df['High_Adoption_Target'] = (df['RI_mean'] >= 3.5).astype(int)

features = [
    'age_num', 'edu_num', 'prior_recycling_num',
    'EC_mean', 'AW_mean', 'FI_mean', 'PC_mean', 'ATT_mean', 'PBC_mean'
]

df = df.dropna(subset=features + ['High_Adoption_Target'])
X = df[features]
y = df['High_Adoption_Target']

# 2. TRAIN / TEST SPLIT (80% Training, 20% Testing)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42, stratify=y)

# 3. INITIALIZE AND TRAIN THE XGBOOST MODEL
xgb_model = xgb.XGBClassifier(
    eval_metric='logloss',
    random_state=42,
    max_depth=4,
    learning_rate=0.1,
    n_estimators=100,
    reg_lambda=1.5
)
xgb_model.fit(X_train, y_train)

# 4. EVALUATE THE MODEL
y_pred = xgb_model.predict(X_test)
y_pred_proba = xgb_model.predict_proba(X_test)[:, 1]

accuracy = accuracy_score(y_test, y_pred)
fpr, tpr, thresholds = roc_curve(y_test, y_pred_proba)
roc_auc = auc(fpr, tpr)
report = classification_report(y_test, y_pred)
cm = confusion_matrix(y_test, y_pred)

# 5. CROSS VALIDATION
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(xgb_model, X, y, cv=cv, scoring='accuracy')
cv_mean = scores.mean()
cv_std = scores.std()

# 6. SHAP VALUES
explainer = shap.TreeExplainer(xgb_model)
shap_values = explainer.shap_values(X_test)
mean_abs_shap = np.abs(shap_values).mean(axis=0)
shap_feature_importance = pd.DataFrame({
    'Feature': features,
    'Mean |SHAP|': mean_abs_shap
}).sort_values(by='Mean |SHAP|', ascending=False)

# PRINT FINAL BLOCK
print("=== FINAL LOCKED XGBOOST METRICS ===")
print(f"Test Set N: {len(y_test)}")
print(f"Accuracy: {accuracy:.4f}")
print(f"AUC-ROC: {roc_auc:.4f}")
print("\nClassification Report:")
print(report)
print("Raw Confusion Matrix Array:")
print(repr(cm))
print(f"\n5-Fold CV Accuracy: {cv_mean:.3f} +/- {cv_std:.3f}")
print("\nSHAP Importance Ranking (Top to Bottom):")
print(shap_feature_importance.to_string(index=False))

# SAVE PLOTS TO ARTIFACTS DIR
artifact_dir = "/Users/nayana/.gemini/antigravity-ide/brain/9328d173-44cb-4132-bf55-1ac158fabac9"

disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=["Low Intention", "High Intention"])
fig, ax = plt.subplots(figsize=(6, 5))
disp.plot(cmap=plt.cm.Blues, ax=ax, values_format='d')
plt.title(f"Confusion Matrix (N={len(y_test)} Test Set)")
plt.savefig(f"{artifact_dir}/confusion_matrix_final.png", dpi=300, bbox_inches='tight')
plt.close()

plt.figure(figsize=(6, 5))
plt.plot(fpr, tpr, color='darkorange', lw=2, label=f'ROC curve (area = {roc_auc:.3f})')
plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--')
plt.xlim([0.0, 1.0])
plt.ylim([0.0, 1.05])
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.title('Receiver Operating Characteristic (ROC)')
plt.legend(loc="lower right")
plt.savefig(f"{artifact_dir}/roc_curve_final.png", dpi=300, bbox_inches='tight')
plt.close()

