import re

dest_file = "/Users/nayana/.gemini/antigravity-ide/brain/9328d173-44cb-4132-bf55-1ac158fabac9/analysis_results.md"

with open(dest_file, "r") as f:
    content = f.read()

new_ml_output = """=== FINAL LOCKED XGBOOST METRICS ===
Test Set N: 51
Accuracy: 0.8039
AUC-ROC: 0.9136

Classification Report:
              precision    recall  f1-score   support

           0       0.82      0.75      0.78        24
           1       0.79      0.85      0.82        27

    accuracy                           0.80        51
   macro avg       0.81      0.80      0.80        51
weighted avg       0.80      0.80      0.80        51

Raw Confusion Matrix Array:
array([[18,  6],
       [ 4, 23]])

5-Fold CV Accuracy: 0.777 +/- 0.036

SHAP Importance Ranking (Top to Bottom):
            Feature  Mean |SHAP|
           PBC_mean     0.822821
            PC_mean     0.768350
           ATT_mean     0.701150
            AW_mean     0.639526
            FI_mean     0.532151
            age_num     0.228860
            edu_num     0.201031
prior_recycling_num     0.141015
            EC_mean     0.081677
"""

# Replace the old section
content = re.sub(r'=== 08 ML PREDICTIVE MODEL \(XGBOOST\) ===.*', new_ml_output, content, flags=re.DOTALL)

with open(dest_file, "w") as f:
    f.write(content)
