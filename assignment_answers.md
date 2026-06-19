# Xeno Assignment Answers

Source dataset: `TAM_INTERN_TABLE.xlsx` loaded into MySQL as `customers`

Reference date used where specified: `2025-04-16`

## Part 1: SQL and Data Familiarity

### Q1. Data review steps in not more than 3 lines

I would first inspect headers, data types, null values, duplicate rows, and invalid formats so the schema is clean before import.  
Then I would standardize emails, phone numbers, and dates to consistent formats and verify record counts against the source file.  
Finally, I would run a small staging import and basic validation queries before loading the full dataset into production tables.

### Q2. SQL queries and answers

#### 1. Display all customers from Delhi

```sql
SELECT *
FROM customers
WHERE city = 'Delhi';
```

Result summary: `42` rows returned.

#### 2. Count the number of signups in the last 30 days from April 16, 2025

```sql
SELECT COUNT(*) AS signup_count_last_30_days
FROM customers
WHERE signup_date BETWEEN DATE_SUB('2025-04-16', INTERVAL 30 DAY) AND '2025-04-16';
```

Result: `85`

#### 3. List unique cities where customers are based

```sql
SELECT DISTINCT city
FROM customers
ORDER BY city;
```

Result:

- Ahmedabad
- Bangalore
- Chennai
- Delhi
- Hyderabad
- Kolkata
- Mumbai
- Pune

#### 4. List the top 3 cities by number of signups

```sql
SELECT city, COUNT(*) AS signup_count
FROM customers
GROUP BY city
ORDER BY signup_count DESC, city ASC
LIMIT 3;
```

Result:

- Pune: `44`
- Delhi: `42`
- Kolkata: `41`

#### 5. Find customers who have never placed an order

```sql
SELECT c.*
FROM customers c
LEFT JOIN orders o
  ON c.customer_id = o.customer_id
WHERE o.customer_id IS NULL;
```

Result summary: query provided; actual result depends on the contents of the `orders` table, which was not included in the shared data.

## Part 2: Data Transformation and Enrichment

### 1. Add a column to show whether the email domain is `gmail.com`

```sql
ALTER TABLE customers
ADD COLUMN is_gmail VARCHAR(3);

UPDATE customers
SET is_gmail = CASE
  WHEN LOWER(COALESCE(SUBSTRING_INDEX(email, '@', -1), '')) = 'gmail.com' THEN 'Yes'
  ELSE 'No'
END;
```

### 2. Extract the first name from `full_name`

```sql
ALTER TABLE customers
ADD COLUMN first_name VARCHAR(100);

UPDATE customers
SET first_name = SUBSTRING_INDEX(TRIM(full_name), ' ', 1);
```

### 3. Add a `signup_month` column

```sql
ALTER TABLE customers
ADD COLUMN signup_month VARCHAR(20);

UPDATE customers
SET signup_month = MONTHNAME(signup_date);
```

### 4. Report the number of Gmail customers signing up on each day of the week

```sql
SELECT
  DAYNAME(signup_date) AS signup_day,
  COUNT(*) AS gmail_signup_count
FROM customers
WHERE LOWER(COALESCE(SUBSTRING_INDEX(email, '@', -1), '')) = 'gmail.com'
GROUP BY DAYOFWEEK(signup_date), DAYNAME(signup_date)
ORDER BY DAYOFWEEK(signup_date);
```

Result:

- Monday: `5`
- Tuesday: `6`
- Wednesday: `4`
- Thursday: `1`
- Friday: `9`
- Saturday: `2`
- Sunday: `7`

### 5. Create `vip_customers` for Delhi, Mumbai, and Bangalore signups in the last 60 days from April 16, 2025

```sql
CREATE TABLE vip_customers AS
SELECT *
FROM customers
WHERE city IN ('Delhi', 'Mumbai', 'Bangalore')
  AND signup_date BETWEEN DATE_SUB('2025-04-16', INTERVAL 60 DAY) AND '2025-04-16';
```

Result summary: `32` rows inserted into `vip_customers`.

## Part 3: Analytics and Reporting

### 1. Monthly signup count for the six-month lookback window from October 16, 2024 to April 16, 2025

```sql
SELECT
  DATE_FORMAT(signup_date, '%Y-%m') AS signup_month,
  COUNT(*) AS signup_count
FROM customers
WHERE signup_date BETWEEN DATE_SUB('2025-04-16', INTERVAL 6 MONTH) AND '2025-04-16'
GROUP BY DATE_FORMAT(signup_date, '%Y-%m')
ORDER BY signup_month;
```

Result:

- 2024-10: `6`
- 2024-11: `7`
- 2024-12: `6`
- 2025-01: `8`
- 2025-02: `7`
- 2025-03: `58`
- 2025-04: `35`

### 2. Cities with more than 20 customers

```sql
SELECT city, COUNT(*) AS customer_count
FROM customers
GROUP BY city
HAVING COUNT(*) > 20
ORDER BY customer_count DESC, city ASC;
```

Result:

- Pune: `44`
- Delhi: `42`
- Kolkata: `41`
- Bangalore: `41`
- Hyderabad: `39`
- Ahmedabad: `36`
- Chennai: `33`
- Mumbai: `24`

### 3. Find the date with the highest number of signups

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

Result: the highest signup count is `5`, and it is tied across these dates:

- 2025-03-26
- 2025-03-28
- 2025-03-29
- 2025-03-31
- 2025-04-11
- 2025-04-14

### 4. Add a new column for signup day and find the day with the highest number of signups

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

Result:

- Friday: `51`
