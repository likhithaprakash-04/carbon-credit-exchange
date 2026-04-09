import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import MinMaxScaler
import joblib
import json

print("🔮 Training Carbon Price Predictor...")

df = pd.read_csv("../data/carbon_prices.csv")
df['date'] = pd.to_datetime(df['date'])
df = df.sort_values('date').reset_index(drop=True)

# Feature engineering
df['day_of_year'] = df['date'].dt.dayofyear
df['month'] = df['date'].dt.month
df['year'] = df['date'].dt.year
df['price_lag1'] = df['price_usd'].shift(1)
df['price_lag7'] = df['price_usd'].shift(7)
df['price_lag30'] = df['price_usd'].shift(30)
df['rolling_mean_7'] = df['price_usd'].rolling(7).mean()
df['rolling_mean_30'] = df['price_usd'].rolling(30).mean()
df['rolling_std_7'] = df['price_usd'].rolling(7).std()
df['price_momentum'] = df['price_usd'] - df['price_lag7']
df = df.dropna()

features = ['day_of_year','month','year','price_lag1','price_lag7',
            'price_lag30','rolling_mean_7','rolling_mean_30',
            'rolling_std_7','price_momentum','volume_credits']

X = df[features]
y = df['price_usd']

split = int(len(df) * 0.8)
X_train, X_test = X[:split], X[split:]
y_train, y_test = y[:split], y[split:]

model = GradientBoostingRegressor(
    n_estimators=300, max_depth=5,
    learning_rate=0.05, random_state=42
)
model.fit(X_train, y_train)

score = model.score(X_test, y_test)
print(f"✅ R² Score: {score:.4f}")

# Generate 30-day forecast
last_row = df.iloc[-1].copy()
forecasts = []
current_price = float(last_row['price_usd'])
current_date = pd.Timestamp('2024-01-01')

for i in range(30):
    future_date = current_date + pd.Timedelta(days=i+1)
    feat = {
        'day_of_year': future_date.dayofyear,
        'month': future_date.month,
        'year': future_date.year,
        'price_lag1': current_price,
        'price_lag7': current_price * 0.98,
        'price_lag30': current_price * 0.95,
        'rolling_mean_7': current_price,
        'rolling_mean_30': current_price * 0.97,
        'rolling_std_7': 1.2,
        'price_momentum': current_price * 0.02,
        'volume_credits': 250000
    }
    pred = model.predict(pd.DataFrame([feat]))[0]
    pred = float(np.clip(pred, current_price*0.92, current_price*1.08))
    forecasts.append({
        "date": future_date.strftime("%Y-%m-%d"),
        "predicted_price": round(pred, 2),
        "lower_bound": round(pred * 0.94, 2),
        "upper_bound": round(pred * 1.06, 2)
    })
    current_price = pred

with open("../data/price_forecast.json", "w") as f:
    json.dump({
        "model_r2": round(score, 4),
        "generated_at": "2024-01-01",
        "forecasts": forecasts
    }, f, indent=2)

joblib.dump(model, "saved/price_predictor.pkl")
print("✅ Forecast saved to data/price_forecast.json")
print(f"📈 30-day forecast: ${forecasts[0]['predicted_price']} → ${forecasts[-1]['predicted_price']}")