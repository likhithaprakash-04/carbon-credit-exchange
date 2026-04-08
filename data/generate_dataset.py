import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta

random.seed(42)
np.random.seed(42)

# ── 1. Carbon Projects Dataset ──────────────────────────────────────────────
projects = []
methodologies = ["VCS VM0015", "VCS VM0038", "Gold Standard", "VCS VM0033", "ACR", "CAR"]
countries = ["Brazil", "India", "Kenya", "Indonesia", "China", "USA", "Colombia", "Vietnam"]
project_types = ["Reforestation", "Solar Farm", "Wind Energy", "Mangrove", "Cookstoves", "Biogas"]

for i in range(200):
    ptype = random.choice(project_types)
    country = random.choice(countries)
    projects.append({
        "project_id": f"VCS-{1000+i}",
        "project_name": f"{country} {ptype} Project {i+1}",
        "methodology": random.choice(methodologies),
        "country": country,
        "project_type": ptype,
        "vintage_year": random.randint(2018, 2023),
        "total_credits_issued": random.randint(1000, 500000),
        "credits_retired": random.randint(0, 50000),
        "price_per_credit_usd": round(random.uniform(3.0, 45.0), 2),
        "verification_body": random.choice(["Verra", "Gold Standard", "SCS Global", "Bureau Veritas"]),
        "is_verified": random.choice([True, True, True, False]),
        "latitude": round(random.uniform(-60, 70), 4),
        "longitude": round(random.uniform(-180, 180), 4),
        "co2_reduced_tonnes": random.randint(500, 200000),
        "sdg_goals_count": random.randint(1, 8)
    })

df_projects = pd.DataFrame(projects)
df_projects.to_csv("verra_projects.csv", index=False)
print(f"✅ Generated {len(df_projects)} carbon projects")

# ── 2. Trading Transactions Dataset ─────────────────────────────────────────
transactions = []
start_date = datetime(2020, 1, 1)

for i in range(2000):
    is_fraud = random.random() < 0.08  # 8% fraud rate
    base_price = random.uniform(3.0, 45.0)
    
    if is_fraud:
        # Fraud patterns: abnormal price, huge volume, rapid repeat
        price = base_price * random.uniform(3.0, 8.0)   # price spike
        amount = random.randint(50000, 500000)            # huge volume
        time_since_last = random.randint(0, 2)           # rapid repeat
    else:
        price = base_price * random.uniform(0.9, 1.1)
        amount = random.randint(10, 5000)
        time_since_last = random.randint(1, 30)

    tx_date = start_date + timedelta(days=random.randint(0, 1500))
    
    transactions.append({
        "transaction_id": f"TX-{100000+i}",
        "project_id": f"VCS-{random.randint(1000, 1199)}",
        "buyer_address": f"0x{random.randint(10**39, 10**40-1):040x}"[:42],
        "seller_address": f"0x{random.randint(10**39, 10**40-1):040x}"[:42],
        "amount_credits": amount,
        "price_per_credit": round(price, 2),
        "total_value_usd": round(price * amount, 2),
        "transaction_date": tx_date.strftime("%Y-%m-%d"),
        "days_since_last_tx": time_since_last,
        "buyer_tx_count": random.randint(1, 200),
        "seller_tx_count": random.randint(1, 200),
        "price_deviation_pct": round((price - base_price) / base_price * 100, 2),
        "is_fraud": int(is_fraud)
    })

df_tx = pd.DataFrame(transactions)
df_tx.to_csv("carbon_transactions.csv", index=False)
print(f"✅ Generated {len(df_tx)} transactions ({df_tx['is_fraud'].sum()} fraud cases)")

# ── 3. Carbon Price History Dataset ─────────────────────────────────────────
prices = []
price = 10.0
date = datetime(2018, 1, 1)

for i in range(365 * 6):  # 6 years daily
    price += random.uniform(-0.8, 1.0)
    price = max(3.0, min(80.0, price))
    prices.append({
        "date": date.strftime("%Y-%m-%d"),
        "price_usd": round(price, 2),
        "volume_credits": random.randint(10000, 500000),
        "market": random.choice(["EU ETS", "California", "Voluntary", "RGGI"]),
        "year": date.year,
        "month": date.month
    })
    date += timedelta(days=1)

df_prices = pd.DataFrame(prices)
df_prices.to_csv("carbon_prices.csv", index=False)
print(f"✅ Generated {len(df_prices)} price history records")

print("\n📁 All datasets saved in data/ folder:")
print("   - verra_projects.csv      (200 carbon projects)")
print("   - carbon_transactions.csv (2000 transactions)")
print("   - carbon_prices.csv       (6 years price history)")