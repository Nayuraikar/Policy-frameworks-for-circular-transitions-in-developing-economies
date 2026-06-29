# Policy Frameworks for Circular Transitions in Developing Economies

This repository contains the full dataset, R analytical scripts, and Machine Learning predictive models used in the study investigating recycling intentions in developing economies.

## Repository Structure

All data files, analysis scripts, and model artifacts are maintained in the root directory for straightforward execution.

### Data Files
* `survey_responses_raw.csv` – Original survey dataset (N=253)
* `survey_clean.csv` – Cleaned dataset with construct means (N=252)
* `pilot_test_raw.csv` / `pilot_200.csv` – Pilot testing data for reliability testing

### R Analytical Scripts (SEM & Moderation)
Scripts are numbered in execution order. Ensure your working directory is set to this repository before running.
* `00_project_setup.R` – Loads required libraries (lavaan, psych, etc.)
* `01_data_cleaning.R` – Cleans raw data and computes mean scores
* `02_descriptives_and_normality.R` – Computes descriptive stats and normality checks
* `03_confirmatory_factor_analysis.R` – Runs CFA for validity/reliability
* `04_sem_structural_model.R` – Runs the main Structural Equation Model
* `05_sem_mediation.R` – Performs mediation analysis with bootstrapping
* `06_sem_multigroup_moderation.R` – Performs multigroup SEM moderation (H8, H9)
* `06b_path_analysis_h8.R` & `06c_path_analysis_h9.R` – Robust path analysis with bootstrapped SEs for subgroup comparisons

### Machine Learning Predictive Model
* `07_ml_predictive_model.ipynb` – Jupyter Notebook training an XGBoost classifier for predicting High/Low adoption
* `recycling_intention_model.pkl` – Saved trained ML model
* `scaler.pkl` – Saved feature scaler

### Usage & Installation

This repository contains both R (Statistical Analysis) and Python (Machine Learning) components.

#### 1. R Statistical Analysis (SEM & Moderation)

**Prerequisites:** You need R installed (and optionally RStudio).

**Running the scripts:**
1. Open RStudio and set this folder as your working directory (`Session -> Set Working Directory -> Choose Directory...`).
2. Open and run `00_project_setup.R` first. This script will automatically detect and install all necessary R packages (`lavaan`, `psych`, `semTools`, `dplyr`, `ggplot2`, etc.).
3. Run the remaining scripts in numerical order (`01` through `06c`). The scripts will output their results directly to the R console and save any cleaned data automatically.

#### 2. Python Machine Learning Model

**Prerequisites:** You need Python 3.8+ installed. It is highly recommended to use a virtual environment.

**Installation:**
Open a terminal in this folder and install the required Python libraries:
```bash
pip install pandas scikit-learn xgboost matplotlib jupyter
```

**Running the notebook:**
Launch Jupyter in your terminal:
```bash
jupyter notebook
```
Open `07_ml_predictive_model.ipynb` and run all cells sequentially to view the model evaluation metrics, precision/recall scores, and feature importance graphs.
