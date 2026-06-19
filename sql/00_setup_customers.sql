-- Xeno Assignment: load TAM_INTERN_TABLE.xlsx into MySQL as `customers`
-- Prerequisite: import the Excel/CSV file with table name `customers`.
-- Expected columns: customer_id, full_name, email, phone_number, city, signup_date

CREATE TABLE IF NOT EXISTS customers (
    customer_id INT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number BIGINT NOT NULL,
    city VARCHAR(100) NOT NULL,
    signup_date DATE NOT NULL
);

-- Optional orders table for Part 1, query 5
CREATE TABLE IF NOT EXISTS orders (
    customer_id INT NOT NULL,
    order_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (order_id),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

-- Sample orders (remove or replace with real data if available)
INSERT IGNORE INTO orders (customer_id, order_id, amount) VALUES
(251212, 1001, 499.00),
(848133, 1002, 1299.00);
