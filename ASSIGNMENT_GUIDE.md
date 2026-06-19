# Xeno Implementation Internship — Assignment Guide

**Deadline:** Friday, 19 June 2026 (EOD)  
**Submission form:** https://docs.google.com/forms/d/e/1FAIpQLSdnEUgr8zDa32jbWmzXQ6LbYygd6qgaHJReM9WQyAjvRJ_-5g/viewform

This document covers **what to do**, **how to submit**, and **ready answers** for Parts 1–3.

---

## Quick overview

| Part | What it tests | How to submit |
|------|---------------|---------------|
| **Part 1** | SQL basics + data review | One PDF (with screenshots) |
| **Part 2** | Data transformation | Same PDF |
| **Part 3** | Analytics & reporting | Same PDF |
| **Part 4** | Web app (transaction validator) | Google Form (URL + video + write-up) |

---

# PARTS 1–3 (SQL) — What to do

## Step 1: Install MySQL

1. Download and install **MySQL Server** + **MySQL Workbench** (or use command line).
2. Start the MySQL service.
3. Remember your **username** and **password** (usually `root`).

## Step 2: Load the customer data

**Dataset:** `TAM_INTERN_TABLE.xlsx` (or use the pre-exported `data/customers.csv`)

**Table name must be:** `customers`

**Columns:**

| Column | Type |
|--------|------|
| customer_id | INT |
| full_name | VARCHAR |
| email | VARCHAR |
| phone_number | BIGINT |
| city | VARCHAR |
| signup_date | DATE |

### Option A — MySQL Workbench (easiest)

1. Open MySQL Workbench → connect to your server.
2. Create a database, e.g. `xeno_assignment`.
3. **Server → Data Import → Import from Self-Contained File**
4. Select `data/customers.csv`
5. Target schema: `xeno_assignment`
6. Set table name to **`customers`**
7. Start import → verify with `SELECT COUNT(*) FROM customers;` → should return **300**.

### Option B — Python script

```powershell
cd "c:\Abhishek Walia\transaction"
python -m pip install mysql-connector-python pandas openpyxl
python scripts/load_customers_mysql.py --user root --password YOUR_PASSWORD --database xeno_assignment
```

### Option C — Run setup SQL manually

Open and run `sql/00_setup_customers.sql`, then import `data/customers.csv`.

## Step 3: Create the orders table (for Part 1, Q5)

Run this once (included in `sql/00_setup_customers.sql`):

```sql
CREATE TABLE IF NOT EXISTS orders (
    customer_id INT NOT NULL,
    order_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (order_id)
);

INSERT IGNORE INTO orders (customer_id, order_id, amount) VALUES
(251212, 1001, 499.00),
(848133, 1002, 1299.00);
```

## Step 4: Run all SQL queries

Run queries from these files in order:

| File | Content |
|------|---------|
| `sql/01_part1_queries.sql` | Part 1 queries |
| `sql/02_part2_transformations.sql` | Part 2 transformations |
| `sql/03_part3_analytics.sql` | Part 3 analytics |

**Reference date used everywhere:** `2025-04-16`

## Step 5: Take screenshots

For **every query**, take a screenshot showing:

- The SQL query in the editor
- The result/output below it

## Step 6: Create the PDF

Structure your PDF exactly like this:

```
1. Cover page
   - Your full name
   - College name
   - Course name

2. Part 1 — SQL & Data Familiarity
   - Q1: Your 3-line answer (copy from below)
   - Q2: Each query as text + screenshot of result

3. Part 2 — Data Transformation & Enrichment
   - Each task: query as text + screenshot (show new column / new table)

4. Part 3 — Analytics & Reporting
   - Each query: query as text + screenshot of result
```

**Rules:** PDF only · Max 100 MB · Do **not** put Part 4 in this PDF.

---

# PART 1 — Answers

## Q1. Data review steps (max 3 lines)

> I would first inspect headers, data types, null values, duplicate rows, and invalid formats so the schema is clean before import.  
> Then I would standardize emails, phone numbers, and dates to consistent formats and verify record counts against the source file.  
> Finally, I would run a small staging import and basic validation queries before loading the full dataset into production tables.

## Q2. SQL queries + expected results

### 1. All customers from Delhi

```sql
SELECT *
FROM customers
WHERE city = 'Delhi';
```

**Result:** 42 rows

---

### 2. Signups in the last 30 days (today = 16 April 2025)

```sql
SELECT COUNT(*) AS signup_count_last_30_days
FROM customers
WHERE signup_date BETWEEN DATE_SUB('2025-04-16', INTERVAL 30 DAY) AND '2025-04-16';
```

**Result:** 85

---

### 3. Unique cities

```sql
SELECT DISTINCT city
FROM customers
ORDER BY city;
```

**Result:**

| city |
|------|
| Ahmedabad |
| Bangalore |
| Chennai |
| Delhi |
| Hyderabad |
| Kolkata |
| Mumbai |
| Pune |

---

### 4. Top 3 cities by signups

```sql
SELECT city, COUNT(*) AS signup_count
FROM customers
GROUP BY city
ORDER BY signup_count DESC, city ASC
LIMIT 3;
```

**Result:**

| city | signup_count |
|------|--------------|
| Pune | 44 |
| Delhi | 42 |
| Kolkata | 41 |

---

### 5. Customers who never placed an order

```sql
SELECT c.*
FROM customers c
LEFT JOIN orders o
  ON c.customer_id = o.customer_id
WHERE o.customer_id IS NULL;
```

**Result:** 298 rows (300 total customers minus 2 sample orders)

---

# PART 2 — Answers

### 1. Add `is_gmail` column (Yes / No)

```sql
ALTER TABLE customers
ADD COLUMN is_gmail VARCHAR(3);

UPDATE customers
SET is_gmail = CASE
  WHEN LOWER(COALESCE(SUBSTRING_INDEX(email, '@', -1), '')) = 'gmail.com' THEN 'Yes'
  ELSE 'No'
END;
```

**Screenshot:** Show a few rows with `email` and `is_gmail`.

---

### 2. Extract first name into `first_name`

```sql
ALTER TABLE customers
ADD COLUMN first_name VARCHAR(100);

UPDATE customers
SET first_name = SUBSTRING_INDEX(TRIM(full_name), ' ', 1);
```

**Screenshot:** Show `full_name` and `first_name` side by side.

---

### 3. Add `signup_month` column

```sql
ALTER TABLE customers
ADD COLUMN signup_month VARCHAR(20);

UPDATE customers
SET signup_month = MONTHNAME(signup_date);
```

**Screenshot:** Show `signup_date` and `signup_month`.

---

### 4. Gmail signups by day of week

```sql
SELECT
  DAYNAME(signup_date) AS signup_day,
  COUNT(*) AS gmail_signup_count
FROM customers
WHERE LOWER(COALESCE(SUBSTRING_INDEX(email, '@', -1), '')) = 'gmail.com'
GROUP BY DAYOFWEEK(signup_date), DAYNAME(signup_date)
ORDER BY DAYOFWEEK(signup_date);
```

**Result:**

| signup_day | gmail_signup_count |
|------------|-------------------|
| Monday | 5 |
| Tuesday | 6 |
| Wednesday | 4 |
| Thursday | 1 |
| Friday | 9 |
| Saturday | 2 |
| Sunday | 7 |

---

### 5. Create `vip_customers` table

```sql
CREATE TABLE vip_customers AS
SELECT *
FROM customers
WHERE city IN ('Delhi', 'Mumbai', 'Bangalore')
  AND signup_date BETWEEN DATE_SUB('2025-04-16', INTERVAL 60 DAY) AND '2025-04-16';
```

**Result:** 32 rows in `vip_customers`

**Screenshot:** `SELECT COUNT(*) FROM vip_customers;` or first few rows.

---

# PART 3 — Answers

### 1. Monthly signup count (past 6 months)

```sql
SELECT
  DATE_FORMAT(signup_date, '%Y-%m') AS signup_month,
  COUNT(*) AS signup_count
FROM customers
WHERE signup_date BETWEEN DATE_SUB('2025-04-16', INTERVAL 6 MONTH) AND '2025-04-16'
GROUP BY DATE_FORMAT(signup_date, '%Y-%m')
ORDER BY signup_month;
```

**Result:**

| signup_month | signup_count |
|--------------|--------------|
| 2024-10 | 6 |
| 2024-11 | 7 |
| 2024-12 | 6 |
| 2025-01 | 8 |
| 2025-02 | 7 |
| 2025-03 | 58 |
| 2025-04 | 35 |

---

### 2. Cities with more than 20 customers

```sql
SELECT city, COUNT(*) AS customer_count
FROM customers
GROUP BY city
HAVING COUNT(*) > 20
ORDER BY customer_count DESC, city ASC;
```

**Result:**

| city | customer_count |
|------|----------------|
| Pune | 44 |
| Delhi | 42 |
| Kolkata | 41 |
| Bangalore | 41 |
| Hyderabad | 39 |
| Ahmedabad | 36 |
| Chennai | 33 |
| Mumbai | 24 |

---

### 3. Date with highest number of signups

```sql
WITH daily_signups AS (
  SELECT signup_date, COUNT(*) AS signup_count
  FROM customers
  GROUP BY signup_date
),
max_signups AS (
  SELECT MAX(signup_count) AS highest_signup_count
  FROM daily_signups
)
SELECT d.signup_date, d.signup_count
FROM daily_signups d
JOIN max_signups m
  ON d.signup_count = m.highest_signup_count
ORDER BY d.signup_date;
```

**Result:** Highest count is **5**, tied on these dates:

- 2025-03-26
- 2025-03-28
- 2025-03-29
- 2025-03-31
- 2025-04-11
- 2025-04-14

---

### 4. Add signup day column + day with most signups

```sql
ALTER TABLE customers
ADD COLUMN signup_day VARCHAR(20);

UPDATE customers
SET signup_day = DAYNAME(signup_date);

SELECT signup_day, COUNT(*) AS signup_count
FROM customers
GROUP BY signup_day
ORDER BY signup_count DESC
LIMIT 1;
```

**Result:** **Friday** with **51** signups

---

# PART 4 — What to do

## What you built

A **Transaction Validation Platform**:

- **Frontend:** Next.js (upload UI, schema display, results + downloads)
- **Backend:** FastAPI (validation, cleaned CSV, error CSV, chunk splitting)
- **Config:** `backend/app/config/validation_rules.json` (phone rules, date formats, field types)

## What the app validates

| Check | Details |
|-------|---------|
| Required columns | order_id, order_date, customer_id, customer_name, country, phone_number, product_id, product_name, quantity, unit_price, payment_mode, payment_status |
| Phone numbers | India = 10 digits, Singapore = 8 digits, United States = 10 digits |
| Dates | Multiple formats: `YYYY-MM-DD`, `DD-MM-YYYY`, `MM/DD/YYYY`, with optional time |
| Data integrity | Missing values, duplicates, invalid numbers, allowed payment modes/statuses |

## Test locally before deploying

**Terminal 1 — Backend (port 8005):**

```powershell
cd "c:\Abhishek Walia\transaction\backend"
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8005
```

**Terminal 2 — Frontend (port 3005):**

```powershell
cd "c:\Abhishek Walia\transaction\frontend"
npm run dev -- --port 3005
```

**Test file:** `data/sample_transactions.csv` (not `customers.csv`)

Expected result: **6 valid rows**, **4 invalid rows**, chunk files generated.

**API docs:** http://localhost:8005/docs

## Deploy (required for submission)

### 1. Push code to GitHub

```powershell
cd "c:\Abhishek Walia\transaction"
git add .
git commit -m "Xeno assignment submission"
git push
```

### 2. Deploy backend on Render

1. Go to https://render.com → New **Web Service**
2. Connect your GitHub repo
3. **Root directory:** `backend`
4. **Build command:** `pip install -r requirements.txt`
5. **Start command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add environment variable:
   - `BACKEND_CORS_ORIGINS` = your Vercel frontend URL (e.g. `https://your-app.vercel.app`)
7. Deploy → copy the public URL (e.g. `https://your-api.onrender.com`)

### 3. Deploy frontend on Vercel

1. Go to https://vercel.com → Import project
2. **Root directory:** `frontend`
3. Add environment variable:
   - `NEXT_PUBLIC_API_BASE_URL` = your Render backend URL
4. Deploy → copy the public URL (e.g. `https://your-app.vercel.app`)

### 4. Update Render CORS

Go back to Render → set `BACKEND_CORS_ORIGINS` to your Vercel URL → redeploy if needed.

## Record walkthrough video (~2 minutes)

Upload to **YouTube (Unlisted)** or **Loom**. Show:

1. Open the live hosted URL
2. Upload `sample_transactions.csv`
3. Click **Validate and process CSV**
4. Show valid/invalid row counts
5. Download cleaned CSV, error CSV, and chunk files
6. Briefly mention config-driven validation (phone rules, date formats)

## Part 4 write-up (paste into Google Form)

```
I built a config-driven FastAPI + Next.js platform: validation rules live in JSON, the backend validates phone/date/numeric fields and splits valid rows into chunks, and the frontend is a single upload workspace. I chose not to add auth, persistent job history, or async queue processing to keep the MVP focused on the assignment workflow and fast local testing.
```

## Part 4 — Submit on Google Form

| Field | What to paste |
|-------|---------------|
| Hosted product URL | Your Vercel frontend URL |
| Walkthrough video link | YouTube/Loom public or unlisted link |
| Approach write-up | Text above (2–3 lines) |

**Do not** put Part 4 links inside the Parts 1–3 PDF.

---

# Final checklist

### Parts 1–3 PDF

- [ ] MySQL installed and running
- [ ] `customers` table loaded (300 rows)
- [ ] `orders` table created for Q5
- [ ] All queries run successfully
- [ ] Screenshot for every query
- [ ] Cover page with name, college, course
- [ ] Exported as single PDF (< 100 MB)

### Part 4 Google Form

- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel
- [ ] CORS configured (frontend URL in backend env)
- [ ] Live URL tested with sample CSV
- [ ] 2-minute walkthrough video recorded and uploaded
- [ ] Approach write-up ready
- [ ] All 3 fields submitted on Google Form

### Interview prep

- [ ] Keep MySQL installed — next round may involve live SQL walkthrough
- [ ] Be ready to explain your Part 4 code and design choices
- [ ] Mention AI tools you used and how

---

## Project file reference

```
transaction/
├── ASSIGNMENT_GUIDE.md          ← this file
├── assignment_answers.md        ← answers only (no steps)
├── part4_approach.txt           ← Part 4 write-up for form
├── TAM_INTERN_TABLE.xlsx        ← original dataset
├── data/
│   ├── customers.csv            ← for MySQL (Parts 1–3)
│   └── sample_transactions.csv  ← for Part 4 testing
├── sql/
│   ├── 00_setup_customers.sql
│   ├── 01_part1_queries.sql
│   ├── 02_part2_transformations.sql
│   └── 03_part3_analytics.sql
├── scripts/
│   └── load_customers_mysql.py
├── backend/                     ← FastAPI (Part 4)
└── frontend/                    ← Next.js (Part 4)
```
