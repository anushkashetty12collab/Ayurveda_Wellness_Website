import pandas as pd
import numpy as np

np.random.seed(42)
n = 500

body_types  = ["Thin", "Medium", "Heavy"]
skins       = ["Dry", "Normal", "Oily"]
digestions  = ["Irregular", "Strong", "Slow"]
sleeps      = ["Light", "Moderate", "Heavy"]

# Rule-based: Thin+Dry+Irregular+Light → Vata, etc.
rows = []
for _ in range(n):
    b = np.random.choice(body_types)
    s = np.random.choice(skins)
    d = np.random.choice(digestions)
    sl = np.random.choice(sleeps)
    
    scores = {"Vata": 0, "Pitta": 0, "Kapha": 0}
    if b == "Thin":   scores["Vata"]  += 2
    if b == "Medium": scores["Pitta"] += 2
    if b == "Heavy":  scores["Kapha"] += 2
    if s == "Dry":    scores["Vata"]  += 2
    if s == "Normal": scores["Pitta"] += 1
    if s == "Oily":   scores["Kapha"] += 2
    if d == "Irregular": scores["Vata"] += 2
    if d == "Strong":    scores["Pitta"] += 2
    if d == "Slow":      scores["Kapha"] += 2
    if sl == "Light":    scores["Vata"]  += 2
    if sl == "Moderate": scores["Pitta"] += 1
    if sl == "Heavy":    scores["Kapha"] += 2
    
    dosha = max(scores, key=scores.get)
    rows.append([b, s, d, sl, dosha])

df = pd.DataFrame(rows, columns=["Body_Type","Skin","Digestion","Sleep","Dosha"])
df.to_csv("dosh_dataset.csv", index=False)
print(df["Dosha"].value_counts())