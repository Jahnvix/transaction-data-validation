"""
Load data/customers.csv into MySQL as the `customers` table.

Usage:
  python scripts/load_customers_mysql.py --host localhost --user root --password YOUR_PASSWORD --database xeno_assignment

Requires: pip install mysql-connector-python pandas openpyxl
"""

from __future__ import annotations

import argparse
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "data" / "customers.csv"


def main() -> None:
    parser = argparse.ArgumentParser(description="Load customers CSV into MySQL.")
    parser.add_argument("--host", default="localhost")
    parser.add_argument("--port", type=int, default=3306)
    parser.add_argument("--user", default="root")
    parser.add_argument("--password", default="")
    parser.add_argument("--database", default="xeno_assignment")
    args = parser.parse_args()

    import mysql.connector

    if not CSV_PATH.exists():
        raise SystemExit(f"Missing {CSV_PATH}. Run the XLSX export step first.")

    df = pd.read_csv(CSV_PATH)
    connection = mysql.connector.connect(
        host=args.host,
        port=args.port,
        user=args.user,
        password=args.password,
    )
    cursor = connection.cursor()
    cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{args.database}`")
    cursor.execute(f"USE `{args.database}`")
    cursor.execute("DROP TABLE IF EXISTS customers")
    cursor.execute(
        """
        CREATE TABLE customers (
            customer_id INT PRIMARY KEY,
            full_name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            phone_number BIGINT NOT NULL,
            city VARCHAR(100) NOT NULL,
            signup_date DATE NOT NULL
        )
        """
    )

    insert_sql = (
        "INSERT INTO customers (customer_id, full_name, email, phone_number, city, signup_date) "
        "VALUES (%s, %s, %s, %s, %s, %s)"
    )
    rows = [
        (
            int(row.customer_id),
            row.full_name,
            row.email,
            int(row.phone_number),
            row.city,
            row.signup_date,
        )
        for row in df.itertuples(index=False)
    ]
    cursor.executemany(insert_sql, rows)
    connection.commit()
    cursor.execute("SELECT COUNT(*) FROM customers")
    count = cursor.fetchone()[0]
    cursor.close()
    connection.close()
    print(f"Loaded {count} rows into `{args.database}`.customers")


if __name__ == "__main__":
    main()
