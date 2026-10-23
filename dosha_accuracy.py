"""
dosha_accuracy.py — Cross-validated accuracy evaluation for DoshaEngine
Run: python dosha_accuracy.py [path/to/balanced.csv]
"""

import sys
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.metrics import (
    accuracy_score, classification_report, confusion_matrix, ConfusionMatrixDisplay
)
from sklearn.preprocessing import LabelEncoder
import matplotlib.pyplot as plt

# ── Reuse mappings from dosha.py ──────────────────────────────────────────
from dosha import FEATURE_MAPS, FEATURE_COLS, DOSHA_MAP, REVERSE_MAP

def load_and_encode(csv_path: str):
    df = pd.read_csv(csv_path)

    for col, mapping in FEATURE_MAPS.items():
        if col in df.columns:
            df[col] = df[col].map(mapping)

    df["Dosha"] = df["Dosha"].map(DOSHA_MAP)
    df = df.dropna()

    X = df[FEATURE_COLS].astype(int)
    y = df["Dosha"].astype(int)
    return X, y


def evaluate(csv_path: str):
    print(f"\n{'='*55}")
    print(f"  Dosha Engine — Accuracy Evaluation")
    print(f"{'='*55}")

    X, y = load_and_encode(csv_path)
    print(f"\nDataset: {len(X)} rows | Label counts: {np.bincount(y.to_numpy()).tolist()}")

    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=None,
        random_state=42,
        n_jobs=-1,
        class_weight="balanced_subsample",
    )

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    # ── Cross-validated predictions ───────────────────────────────────────
    y_pred = cross_val_predict(model, X, y, cv=cv)

    acc = accuracy_score(y, y_pred)
    print(f"\n5-Fold Cross-Validated Accuracy: {acc * 100:.2f}%")

    # ── Per-class report ──────────────────────────────────────────────────
    target_names = [REVERSE_MAP[i] for i in sorted(REVERSE_MAP)]
    print("\nClassification Report:")
    print(classification_report(y, y_pred, target_names=target_names))

    # ── Confusion matrix ──────────────────────────────────────────────────
    cm = confusion_matrix(y, y_pred)
    print("Confusion Matrix (rows=actual, cols=predicted):")
    print(f"{'':>10} {'Vata':>8} {'Pitta':>8} {'Kapha':>8}")
    for i, row in enumerate(cm):
        print(f"{REVERSE_MAP[i]:>10} {row[0]:>8} {row[1]:>8} {row[2]:>8}")

    # ── Per-fold scores ───────────────────────────────────────────────────
    from sklearn.model_selection import cross_val_score
    fold_scores = cross_val_score(model, X, y, cv=cv, scoring="accuracy")
    print(f"\nPer-Fold Accuracies: {[f'{s*100:.1f}%' for s in fold_scores]}")
    print(f"Mean: {fold_scores.mean()*100:.2f}%  |  Std: {fold_scores.std()*100:.2f}%")

    # ── Feature importance ────────────────────────────────────────────────
    model.fit(X, y)
    importances = pd.Series(model.feature_importances_, index=FEATURE_COLS)
    importances = importances.sort_values(ascending=False)
    print(f"\nTop 10 Most Predictive Features:")
    for feat, score in importances.head(10).items():
        bar = "█" * int(score * 200)
        print(f"  {feat:<40} {score:.4f}  {bar}")

    # ── Optional: save confusion matrix plot ─────────────────────────────
    try:
        fig, ax = plt.subplots(figsize=(6, 5))
        ConfusionMatrixDisplay(cm, display_labels=target_names).plot(ax=ax, colorbar=False)
        ax.set_title(f"Dosha Classifier — {acc*100:.1f}% Accuracy (5-Fold CV)")
        plt.tight_layout()
        plt.savefig("dosha_confusion_matrix.png", dpi=150)
        print("\nConfusion matrix saved → dosha_confusion_matrix.png")
    except Exception as e:
        print(f"\n(Plot skipped: {e})")


if __name__ == "__main__":
    csv = sys.argv[1] if len(sys.argv) > 1 else "ayurvedic_dosha_dataset_balanced.csv"
    evaluate(csv)