"""
Build an evenly balanced Dosha CSV from ayurvedic_dosha_dataset (1).csv.

Uses the same validity rules as dosha.DoshaEngine (encoded features + Dosha map must succeed).
Undersamples each class to min(class counts). Output keeps original string labels.
"""
from pathlib import Path

import pandas as pd

from dosha import DOSHA_MAP, FEATURE_COLS, FEATURE_MAPS


def main():
    root = Path(__file__).resolve().parent
    src = root / "ayurvedic_dosha_dataset (1).csv"
    dst = root / "ayurvedic_dosha_dataset_balanced.csv"

    raw = pd.read_csv(src)
    work = raw.copy()
    for col, mapping in FEATURE_MAPS.items():
        if col in work.columns:
            work[col] = work[col].map(mapping)
    work["Dosha_num"] = work["Dosha"].map(DOSHA_MAP)

    valid_mask = work["Dosha_num"].notna()
    for col in FEATURE_COLS:
        if col not in work.columns:
            raise ValueError(f"Missing column {col!r} in CSV")
        valid_mask &= work[col].notna()

    df_valid = raw.loc[valid_mask].reset_index(drop=True)
    vc = df_valid["Dosha"].value_counts()
    n_min = int(vc.min())

    parts = []
    for label in vc.index:
        sub = df_valid[df_valid["Dosha"] == label]
        parts.append(sub.sample(n=n_min, random_state=42))

    balanced = pd.concat(parts, ignore_index=True).sample(frac=1, random_state=43)
    balanced.to_csv(dst, index=False)

    print(f"Wrote {dst}")
    print(f"Rows: {len(balanced)} (3 x {n_min})")
    print(balanced["Dosha"].value_counts().sort_index())


if __name__ == "__main__":
    main()
