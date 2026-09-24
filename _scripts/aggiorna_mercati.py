# -*- coding: utf-8 -*-
"""
SoldiChiari — Aggiorna dati mercati (gratis, no API key)
Fonti: Yahoo Finance chart API (indici/valute/materie) + CoinGecko (cripto EUR)
Scrive: assets/data/mercati.json
Uso: python scripts/aggiorna_mercati.py
Preserva il blocco "tassi_italia" (compilato dal cron con web_search su BCE/BTP).
"""
import json, os, sys, urllib.request
from datetime import datetime, timezone, timedelta

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "data", "mercati.json")
UA = {"User-Agent": "Mozilla/5.0"}

YAHOO = [
    # (simbolo yahoo, nome visualizzato, categoria, unita)
    ("^GSPC",      "S&P 500",            "indici",  "punti"),
    ("^IXIC",      "Nasdaq Composite",   "indici",  "punti"),
    ("FTSEMIB.MI", "FTSE MIB (Milano)",  "indici",  "punti"),
    ("EURUSD=X",   "Euro / Dollaro",     "valute",  "$"),
    ("GC=F",       "Oro (future)",       "materie", "$/oz"),
    ("^TNX",       "Rend. Treasury USA 10 anni", "tassi", "%"),
]

COINGECKO_IDS = {
    "bitcoin":  ("BTC", "Bitcoin"),
    "ethereum": ("ETH", "Ethereum"),
    "solana":   ("SOL", "Solana"),
}

def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read().decode())

def yahoo_quote(sym):
    d = fetch(f"https://query1.finance.yahoo.com/v8/finance/chart/{urllib.request.quote(sym)}?range=1d&interval=1d")
    m = d["chart"]["result"][0]["meta"]
    price = m.get("regularMarketPrice")
    prev = m.get("chartPreviousClose") or m.get("previousClose")
    chg = None
    if price is not None and prev:
        chg = round((price - prev) / prev * 100, 2)
    return price, chg

def main():
    dati = {}
    if os.path.exists(OUT):
        try:
            dati = json.load(open(OUT, encoding="utf-8"))
        except Exception:
            dati = {}

    out = {
        "aggiornato": datetime.now(timezone(timedelta(hours=2))).strftime("%Y-%m-%d %H:%M"),
        "fonte_indici": "Yahoo Finance (aggiornamento quotidiano automatico)",
        "fonte_cripto": "CoinGecko (live nel browser)",
        "indici": [], "valute": [], "materie": [], "tassi": [], "cripto": [],
        # preservato dal cron (valori reali BCE/BTP con fonte):
        "tassi_italia": dati.get("tassi_italia", {}),
        "errori": [],
    }

    for sym, nome, cat, unita in YAHOO:
        try:
            price, chg = yahoo_quote(sym)
            if price is None:
                raise ValueError("prezzo vuoto")
            out[cat].append({"nome": nome, "simbolo": sym, "prezzo": price,
                             "var_pct": chg, "unita": unita})
        except Exception as e:
            out["errori"].append(f"{sym}: {e}")

    try:
        ids = ",".join(COINGECKO_IDS)
        d = fetch(f"https://api.coingecko.com/api/v3/simple/price?ids={ids}&vs_currencies=eur&include_24hr_change=true")
        for cg_id, (ticker, nome) in COINGECKO_IDS.items():
            if cg_id in d:
                out["cripto"].append({
                    "nome": nome, "ticker": ticker,
                    "prezzo_eur": d[cg_id]["eur"],
                    "var_24h_pct": round(d[cg_id].get("eur_24h_change", 0), 2),
                })
    except Exception as e:
        out["errori"].append(f"coingecko: {e}")

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    ok = sum(len(out[k]) for k in ("indici", "valute", "materie", "tassi", "cripto"))
    print(f"mercati.json scritto: {ok} valori, errori={len(out['errori'])}")
    if out["errori"]:
        print("ERRORI:", out["errori"])
        sys.exit(1 if ok == 0 else 0)

if __name__ == "__main__":
    main()
