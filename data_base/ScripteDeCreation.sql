-- Create a database
CREATE DATABASE IF NOT EXISTS webshop183;
USE webshop183;

-- 1: Create roles
CREATE ROLE IF NOT EXISTS 'user';
CREATE ROLE IF NOT EXISTS 'admin';

-- 2: Grant permissions to roles
GRANT SELECT, INSERT, UPDATE, DELETE ON webshop183.* TO 'user';
GRANT ALL PRIVILEGES ON webshop183.* TO 'admin';

-- 3: Assign roles to users
GRANT 'user' TO 'username'@'localhost';    -- Regular user
GRANT 'admin' TO 'admin_username'@'localhost';   -- Admin user

-- 4: Activate roles for users (optional)
SET DEFAULT ROLE 'user' TO 'username'@'localhost';
SET DEFAULT ROLE 'admin' TO 'admin_username'@'localhost';

-- 5: Verify the grants
SHOW GRANTS FOR 'username'@'localhost';
SHOW GRANTS FOR 'admin_username'@'localhost';

-- Create Users table
CREATE TABLE IF NOT EXISTS Users (
  id INT AUTO_INCREMENT PRIMARY KEY,        -- User's unique ID
  username VARCHAR(255) NOT NULL UNIQUE,    -- Username (unique for each user)
  password VARCHAR(255) NOT NULL,           -- Password (hashed and salted)
  role ENUM('user', 'admin') DEFAULT 'user', -- Role: 'user' or 'admin', default is 'user'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Creation timestamp
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- Updated timestamp
);