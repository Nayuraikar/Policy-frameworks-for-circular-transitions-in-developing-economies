import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay, roc_curve, auc
import matplotlib.pyplot as plt
import shap

# Paths
artifact_dir = "/Users/nayana/.gemini/antigravity-ide/brain/9328d173-44cb-4132-bf55-1ac158fabac9"

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

# 2. TRAIN MODEL
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42, stratify=y)

xgb_model = xgb.XGBClassifier(
    eval_metric='logloss',
    random_state=42,
    max_depth=4,
    learning_rate=0.1,
    n_estimators=100,
    reg_lambda=1.5
)
xgb_model.fit(X_train, y_train)

# 3. CONFUSION MATRIX
y_pred = xgb_model.predict(X_test)
cm = confusion_matrix(y_test, y_pred)
disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=["Low Intention", "High Intention"])
fig, ax = plt.subplots(figsize=(6, 5))
disp.plot(cmap=plt.cm.Blues, ax=ax, values_format='d')
plt.title("Confusion Matrix (N=51 Test Set)")
plt.savefig(f"{artifact_dir}/confusion_matrix.png", dpi=300, bbox_inches='tight')
plt.close()

# 4. ROC CURVE
y_pred_proba = xgb_model.predict_proba(X_test)[:, 1]
fpr, tpr, thresholds = roc_curve(y_test, y_pred_proba)
roc_auc = auc(fpr, tpr)

plt.figure(figsize=(6, 5))
plt.plot(fpr, tpr, color='darkorange', lw=2, label=f'ROC curve (area = {roc_auc:.3f})')
plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--')
plt.xlim([0.0, 1.0])
plt.ylim([0.0, 1.05])
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.title('Receiver Operating Characteristic (ROC)')
plt.legend(loc="lower right")
plt.savefig(f"{artifact_dir}/roc_curve.png", dpi=300, bbox_inches='tight')
plt.close()

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

print("\n=== EVALUATION RESULTS ===")
print("Confusion Matrix:")
print(cm)
print(f"\n5-Fold CV Accuracy: {cv_mean:.3f} +/- {cv_std:.3f}")
print("\nSHAP Feature Ranking (Top to Bottom):")
print(shap_feature_importance.to_string(index=False))

