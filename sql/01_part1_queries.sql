-- Part 1: SQL & Data Familiarity
-- Reference date: 2025-04-16

-- 1. All customers from Delhi
SELECT *
FROM customers
WHERE city = 'Delhi';

-- 2. Signups in the last 30 days from 2025-04-16
SELECT COUNT(*) AS signup_count_last_30_days
FROM customers
WHERE signup_date BETWEEN DATE_SUB('2025-04-16', INTERVAL 30 DAY) AND '2025-04-16';

-- 3. Unique cities
SELECT DISTINCT city
FROM customers
ORDER BY city;

-- 4. Top 3 cities by signups
SELECT city, COUNT(*) AS signup_count
FROM customers
GROUP BY city
ORDER BY signup_count DESC, city ASC
LIMIT 3;

-- 5. Customers who have never placed an order
SELECT c.*
FROM customers c
LEFT JOIN orders o
  ON c.customer_id = o.customer_id
WHERE o.customer_id IS NULL;
