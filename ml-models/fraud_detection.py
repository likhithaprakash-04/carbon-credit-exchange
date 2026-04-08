import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (classification_report, confusion_matrix,
                              roc_auc_score, precision_recall_curve)
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
import json
import os

print("🤖 Carbon Credit Fraud Detection System")
print("=" * 50)

# ── Load Data ────────────────────────────────────────────────────────────────
df = pd.read_csv("../data/carbon_transactions.csv")
print(f"✅ Loaded {len(df)} transactions")
print(f"   Fraud cases: {df['is_fraud'].sum()} ({df['is_fraud'].mean()*100:.1f}%)")

# ── Feature Engineering ──────────────────────────────────────────────────────
print("\n🔧 Engineering features...")

df["value_log"] = np.log1p(df["total_value_usd"])
df["amount_log"] = np.log1p(df["amount_credits"])
df["price_zscore"] = (df["price_per_credit"] - df["price_per_credit"].mean()) / df["price_per_credit"].std()
df["high_value_flag"] = (df["total_value_usd"] > df["total_value_usd"].quantile(0.95)).astype(int)
df["rapid_tx_flag"] = (df["days_since_last_tx"] < 2).astype(int)
df["new_buyer_flag"] = (df["buyer_tx_count"] < 3).astype(int)
df["price_spike_flag"] = (df["price_deviation_pct"].abs() > 50).astype(int)
df["risk_score"] = (df["high_value_flag"] + df["rapid_tx_flag"] +
                    df["new_buyer_flag"] + df["price_spike_flag"])

features = [
    "amount_credits", "price_per_credit", "total_value_usd",
    "days_since_last_tx", "buyer_tx_count", "seller_tx_count",
    "price_deviation_pct", "value_log", "amount_log",
    "price_zscore", "high_value_flag", "rapid_tx_flag",
    "new_buyer_flag", "price_spike_flag", "risk_score"
]

X = df[features]
y = df["is_fraud"]

# ── Train/Test Split ─────────────────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# ── Train Random Forest ──────────────────────────────────────────────────────
print("\n🌲 Training Random Forest Classifier...")
rf_model = RandomForestClassifier(
    n_estimators=200,
    max_depth=10,
    min_samples_split=5,
    class_weight="balanced",
    random_state=42,
    n_jobs=-1
)
rf_model.fit(X_train_scaled, y_train)

y_pred = rf_model.predict(X_test_scaled)
y_prob = rf_model.predict_proba(X_test_scaled)[:, 1]
auc_score = roc_auc_score(y_test, y_prob)

print(f"\n📊 Model Performance:")
print(f"   ROC-AUC Score: {auc_score:.4f}")
print(f"\n{classification_report(y_test, y_pred, target_names=['Legitimate','Fraud'])}")

# Cross validation
cv_scores = cross_val_score(rf_model, X_train_scaled, y_train, cv=5, scoring="roc_auc")
print(f"   Cross-Val AUC: {cv_scores.mean():.4f} (+/- {cv_scores.std()*2:.4f})")

# ── Train Isolation Forest (Anomaly Detection) ───────────────────────────────
print("\n🔍 Training Isolation Forest (Anomaly Detection)...")
iso_model = IsolationForest(
    contamination=0.08,
    n_estimators=200,
    random_state=42,
    n_jobs=-1
)
iso_model.fit(X_train_scaled)
iso_pred = iso_model.predict(X_test_scaled)
iso_fraud = (iso_pred == -1).astype(int)
iso_auc = roc_auc_score(y_test, iso_fraud)
print(f"   Isolation Forest AUC: {iso_auc:.4f}")

# ── Feature Importance Chart ─────────────────────────────────────────────────
print("\n📈 Generating charts...")
os.makedirs("../docs/charts", exist_ok=True)

importances = pd.Series(rf_model.feature_importances_, index=features)
importances = importances.sort_values(ascending=True)

fig, axes = plt.subplots(2, 2, figsize=(14, 10))
fig.suptitle("Carbon Credit Fraud Detection — ML Analysis", fontsize=14, fontweight="bold")

# Chart 1: Feature Importance
importances.plot(kind="barh", ax=axes[0,0], color="steelblue")
axes[0,0].set_title("Feature Importance (Random Forest)")
axes[0,0].set_xlabel("Importance Score")

# Chart 2: Confusion Matrix
cm = confusion_matrix(y_test, y_pred)
sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", ax=axes[0,1],
            xticklabels=["Legitimate","Fraud"],
            yticklabels=["Legitimate","Fraud"])
axes[0,1].set_title("Confusion Matrix")
axes[0,1].set_ylabel("Actual")
axes[0,1].set_xlabel("Predicted")

# Chart 3: Fraud vs Legit transaction value distribution
df[df["is_fraud"]==0]["total_value_usd"].clip(upper=500000).hist(
    bins=50, ax=axes[1,0], alpha=0.7, label="Legitimate", color="green")
df[df["is_fraud"]==1]["total_value_usd"].clip(upper=500000).hist(
    bins=50, ax=axes[1,0], alpha=0.7, label="Fraud", color="red")
axes[1,0].set_title("Transaction Value: Fraud vs Legitimate")
axes[1,0].set_xlabel("Total Value (USD)")
axes[1,0].legend()

# Chart 4: Price deviation distribution
df[df["is_fraud"]==0]["price_deviation_pct"].clip(-100,200).hist(
    bins=50, ax=axes[1,1], alpha=0.7, label="Legitimate", color="green")
df[df["is_fraud"]==1]["price_deviation_pct"].clip(-100,200).hist(
    bins=50, ax=axes[1,1], alpha=0.7, label="Fraud", color="red")
axes[1,1].set_title("Price Deviation: Fraud vs Legitimate")
axes[1,1].set_xlabel("Price Deviation (%)")
axes[1,1].legend()

plt.tight_layout()
plt.savefig("../docs/charts/fraud_detection_analysis.png", dpi=150, bbox_inches="tight")
print("✅ Chart saved to docs/charts/fraud_detection_analysis.png")

# ── Save Models ──────────────────────────────────────────────────────────────
os.makedirs("../ml-models/saved", exist_ok=True)
joblib.dump(rf_model, "../ml-models/saved/fraud_rf_model.pkl")
joblib.dump(iso_model, "../ml-models/saved/fraud_iso_model.pkl")
joblib.dump(scaler, "../ml-models/saved/scaler.pkl")

# Save model metadata
metadata = {
    "model": "RandomForestClassifier",
    "auc_score": round(auc_score, 4),
    "cv_auc_mean": round(cv_scores.mean(), 4),
    "features": features,
    "trained_on": len(X_train),
    "fraud_rate": round(df["is_fraud"].mean(), 4)
}
with open("../ml-models/saved/model_metadata.json", "w") as f:
    json.dump(metadata, f, indent=2)

print("✅ Models saved to ml-models/saved/")
print("\n🎉 ML Training Complete!")
print(f"   Final AUC Score: {auc_score:.4f}")
print("   Ready for API integration")