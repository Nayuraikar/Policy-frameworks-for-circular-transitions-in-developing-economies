from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib, numpy as np
from pathlib import Path

app = FastAPI(title="Circular Policy API")

# Allow React dev server to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE = Path(__file__).parent
model  = joblib.load(BASE / "models" / "recycling_intention_model.pkl")
scaler = joblib.load(BASE / "models" / "scaler.pkl")

# SEM β coefficients from your R output
SEM = {
    "FI_RI":   0.216,
    "PC_RI":  -0.115,
    "ATT_RI":  0.411,
    "PBC_RI":  0.402,
}

class PolicyInputs(BaseModel):
    fi:        float  # Financial Incentives 1–5
    pc:        float  # Privacy Concern 1–5
    ec:        float  # Environmental Concern 1–5
    aw:        float  # Policy Awareness 1–5
    age_num:   int    # 1–4
    edu_num:   int    # 1–4
    prior_exp: int    # 1–3

@app.post("/predict")
def predict(inp: PolicyInputs):
    vec = np.array([[
        inp.age_num, inp.edu_num, inp.prior_exp,
        inp.ec, inp.aw, inp.fi, inp.pc,
        # ATT_mean and PBC_mean estimated from SEM equations
        0.483*inp.ec + 0.320*inp.aw + 0.118*inp.fi - 0.150*inp.pc,
        0.769*inp.aw + 0.145*inp.fi,
    ]])
    scaled = scaler.transform(vec)
    prob   = float(model.predict_proba(scaled)[0][1])

    # 12-month forecast
    forecast = []
    adoption = prob
    for m in range(1, 13):
        fi_m = min(inp.fi * (1 + 0.05*(m-1)), 5.0)
        pc_m = max(inp.pc * (1 - 0.03*(m-1)), 1.0)
        delta = SEM["FI_RI"]*(fi_m - inp.fi) + SEM["PC_RI"]*(pc_m - inp.pc)
        adoption = float(np.clip(adoption + delta, 0.05, 0.97))
        savings  = (adoption - 0.6) * 2.0 if adoption > 0.6 else 0
        forecast.append({
            "month":      m,
            "adoption":   round(adoption * 100, 1),
            "diversion":  round(adoption * 1200),
            "budget":     round(8.5 - savings, 2),
        })

    return {
        "probability": round(prob, 4),
        "label":       "High Adoption" if prob >= 0.5 else "Low Adoption",
        "confidence":  "Strong" if abs(prob - 0.5) > 0.25 else "Moderate",
        "forecast":    forecast,
    }

@app.get("/health")
def health():
    return {"status": "ok"}