-- Part 3: Analytics & Reporting
-- Reference date: 2025-04-16

-- 1. Monthly signup count for the past 6 months
SELECT
  DATE_FORMAT(signup_date, '%Y-%m') AS signup_month,
  COUNT(*) AS signup_count
FROM customers
WHERE signup_date BETWEEN DATE_SUB('2025-04-16', INTERVAL 6 MONTH) AND '2025-04-16'
GROUP BY DATE_FORMAT(signup_date, '%Y-%m')
ORDER BY signup_month;

-- 2. Cities with more than 20 customers
SELECT city, COUNT(*) AS customer_count
FROM customers
GROUP BY city
HAVING COUNT(*) > 20
ORDER BY customer_count DESC, city ASC;

-- 3. Date(s) with the highest number of signups
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

-- 4. Signup day column and day with highest signups
ALTER TABLE customers
ADD COLUMN signup_day VARCHAR(20);

UPDATE customers
SET signup_day = DAYNAME(signup_date);

SELECT signup_day, COUNT(*) AS signup_count
FROM customers
GROUP BY signup_day
ORDER BY signup_count DESC
LIMIT 1;
