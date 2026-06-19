-- Part 2: Data Transformation & Enrichment
-- Reference date: 2025-04-16

-- 1. Gmail domain flag
ALTER TABLE customers
ADD COLUMN is_gmail VARCHAR(3);

UPDATE customers
SET is_gmail = CASE
  WHEN LOWER(COALESCE(SUBSTRING_INDEX(email, '@', -1), '')) = 'gmail.com' THEN 'Yes'
  ELSE 'No'
END;

SELECT customer_id, email, is_gmail
FROM customers
LIMIT 10;

-- 2. First name extraction
ALTER TABLE customers
ADD COLUMN first_name VARCHAR(100);

UPDATE customers
SET first_name = SUBSTRING_INDEX(TRIM(full_name), ' ', 1);

SELECT customer_id, full_name, first_name
FROM customers
LIMIT 10;

-- 3. Signup month
ALTER TABLE customers
ADD COLUMN signup_month VARCHAR(20);

UPDATE customers
SET signup_month = MONTHNAME(signup_date);

SELECT customer_id, signup_date, signup_month
FROM customers
LIMIT 10;

-- 4. Gmail signups by day of week
SELECT
  DAYNAME(signup_date) AS signup_day,
  COUNT(*) AS gmail_signup_count
FROM customers
WHERE LOWER(COALESCE(SUBSTRING_INDEX(email, '@', -1), '')) = 'gmail.com'
GROUP BY DAYOFWEEK(signup_date), DAYNAME(signup_date)
ORDER BY DAYOFWEEK(signup_date);

-- 5. VIP customers table
DROP TABLE IF EXISTS vip_customers;

CREATE TABLE vip_customers AS
SELECT *
FROM customers
WHERE city IN ('Delhi', 'Mumbai', 'Bangalore')
  AND signup_date BETWEEN DATE_SUB('2025-04-16', INTERVAL 60 DAY) AND '2025-04-16';

SELECT COUNT(*) AS vip_customer_count FROM vip_customers;
