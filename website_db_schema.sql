-- Create and use database
CREATE DATABASE IF NOT EXISTS ecommerce_db;
USE ecommerce_db;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    phone VARCHAR(20),
    address TEXT,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    category_id INT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Cart table
CREATE TABLE cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (user_id, product_id)
);

-- Orders table
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    shipping_cost DECIMAL(10, 2) DEFAULT 0,
    final_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned') DEFAULT 'pending',
    shipping_address TEXT NOT NULL,
    billing_address TEXT,
    payment_method VARCHAR(50),
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Order items table (FIXED - added missing semicolon)
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Reviews table
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    order_id INT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    comment TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    helpful_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    UNIQUE KEY unique_user_product_review (user_id, product_id)
);

-- Wishlist table (Simple addition)
CREATE TABLE wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product_wishlist (user_id, product_id)
);

-- Insert sample categories
INSERT INTO categories (name, description) VALUES
('Electronics', 'Electronic devices and gadgets'),
('Clothing', 'Fashion and apparel'),
('Books', 'Books and literature'),
('Sports', 'Sports and fitness equipment'),
('Home & Garden', 'Home improvement and garden supplies');

-- Insert sample products
INSERT INTO products (name, description, price, stock_quantity, category_id, image_url) VALUES
-- Electronics (Category 1)
('Smartphone', 'Latest smartphone with advanced features', 699.99, 50, 1, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'),
('Laptop', 'High-performance laptop for work and gaming', 1299.99, 30, 1, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400'),
('Wireless Headphones', 'Premium noise-cancelling headphones', 199.99, 75, 1, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'),
('Tablet', '10-inch tablet with high-resolution display', 399.99, 45, 1, 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400'),
('Smart Watch', 'Fitness tracking smartwatch', 249.99, 65, 1, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'),
('Bluetooth Speaker', 'Portable wireless speaker', 79.99, 90, 1, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400'),
('Gaming Console', 'Next-gen gaming console', 499.99, 20, 1, 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400'),
('Digital Camera', 'Professional DSLR camera', 899.99, 15, 1, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400'),
('Wireless Mouse', 'Ergonomic wireless computer mouse', 29.99, 120, 1, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400'),
('Keyboard', 'Mechanical gaming keyboard', 149.99, 55, 1, 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400'),
('Monitor', '27-inch 4K computer monitor', 349.99, 35, 1, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400'),
('USB Cable', 'High-speed USB-C cable', 14.99, 200, 1, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'),
('Power Bank', '20000mAh portable charger', 39.99, 85, 1, 'https://images.unsplash.com/photo-1609592806717-0e0b7c3b7c4a?w=400'),
('Webcam', 'HD video conference camera', 69.99, 70, 1, 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400'),
('Router', 'High-speed WiFi router', 129.99, 40, 1, 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=400'),

-- Clothing (Category 2)
('T-Shirt', 'Comfortable cotton t-shirt', 19.99, 100, 2, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'),
('Jeans', 'Classic blue denim jeans', 59.99, 80, 2, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400'),
('Hoodie', 'Warm pullover hoodie', 49.99, 60, 2, 'https://images.unsplash.com/photo-1556821840-3a9fbc86339e?w=400'),
('Dress Shirt', 'Formal business shirt', 39.99, 70, 2, 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400'),
('Sweater', 'Cozy wool sweater', 69.99, 45, 2, 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400'),
('Jacket', 'Waterproof outdoor jacket', 129.99, 35, 2, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400'),
('Shorts', 'Summer casual shorts', 29.99, 90, 2, 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400'),
('Polo Shirt', 'Classic polo shirt', 34.99, 75, 2, 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400'),
('Blazer', 'Professional business blazer', 149.99, 25, 2, 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400'),
('Scarf', 'Warm winter scarf', 24.99, 95, 2, 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=400'),
('Hat', 'Stylish baseball cap', 19.99, 110, 2, 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=400'),
('Socks', 'Comfortable cotton socks (3-pack)', 12.99, 150, 2, 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=400'),
('Belt', 'Genuine leather belt', 44.99, 65, 2, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400'),
('Tie', 'Silk business tie', 29.99, 80, 2, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'),
('Pajamas', 'Comfortable sleepwear set', 39.99, 55, 2, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'),

-- Books (Category 3)
('JavaScript Book', 'Complete guide to modern JavaScript', 39.99, 40, 3, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'),
('Python Programming', 'Learn Python from scratch', 44.99, 35, 3, 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400'),
('Web Design Handbook', 'Modern web design principles', 34.99, 50, 3, 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400'),
('Data Science Guide', 'Complete data science handbook', 54.99, 30, 3, 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400'),
('Fiction Novel', 'Bestselling mystery novel', 16.99, 75, 3, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'),
('Cookbook', 'Healthy recipes for beginners', 29.99, 60, 3, 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400'),
('History Book', 'World history comprehensive guide', 42.99, 45, 3, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'),
('Self-Help Book', 'Personal development guide', 24.99, 85, 3, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'),
('Art Book', 'Modern art techniques', 49.99, 25, 3, 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400'),
('Travel Guide', 'Europe travel handbook', 27.99, 70, 3, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'),
('Biography', 'Famous entrepreneur biography', 32.99, 55, 3, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'),
('Science Textbook', 'Physics fundamentals', 89.99, 20, 3, 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400'),
('Poetry Collection', 'Contemporary poetry anthology', 19.99, 40, 3, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'),
('Business Book', 'Entrepreneurship strategies', 37.99, 65, 3, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'),
('Children Book', 'Educational picture book', 14.99, 90, 3, 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400'),

-- Sports (Category 4)
('Running Shoes', 'Comfortable athletic running shoes', 89.99, 60, 4, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400'),
('Basketball', 'Official size basketball', 24.99, 80, 4, 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400'),
('Tennis Racket', 'Professional tennis racket', 149.99, 35, 4, 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400'),
('Yoga Mat', 'Non-slip exercise yoga mat', 34.99, 95, 4, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'),
('Dumbbells', 'Adjustable weight dumbbells', 79.99, 45, 4, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'),
('Soccer Ball', 'FIFA approved soccer ball', 29.99, 70, 4, 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400'),
('Swimming Goggles', 'Anti-fog swimming goggles', 19.99, 85, 4, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'),
('Bicycle Helmet', 'Safety cycling helmet', 49.99, 55, 4, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'),
('Golf Clubs', 'Professional golf club set', 299.99, 15, 4, 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400'),
('Resistance Bands', 'Exercise resistance bands set', 24.99, 100, 4, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'),
('Water Bottle', 'Insulated sports water bottle', 16.99, 120, 4, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'),
('Jump Rope', 'Speed training jump rope', 12.99, 90, 4, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'),
('Exercise Ball', 'Stability fitness ball', 29.99, 65, 4, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'),
('Boxing Gloves', 'Professional boxing gloves', 59.99, 40, 4, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'),
('Foam Roller', 'Muscle recovery foam roller', 39.99, 75, 4, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'),

-- Garden Tools (Category 5)
('Garden Tools Set', 'Complete gardening tools kit', 79.99, 25, 5, 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'),
('Watering Can', 'Large capacity watering can', 19.99, 60, 5, 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'),
('Pruning Shears', 'Sharp garden pruning scissors', 24.99, 85, 5, 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'),
('Garden Hose', '50ft expandable garden hose', 39.99, 45, 5, 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'),
('Plant Pots', 'Ceramic plant pots set', 34.99, 70, 5, 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'),
('Fertilizer', 'Organic plant fertilizer', 16.99, 95, 5, 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'),
('Garden Gloves', 'Protective gardening gloves', 12.99, 110, 5, 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'),
('Shovel', 'Heavy-duty garden shovel', 29.99, 55, 5, 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'),
('Rake', 'Leaf and debris rake', 22.99, 65, 5, 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'),
('Seeds Pack', 'Vegetable seeds variety pack', 14.99, 80, 5, 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'),
('Wheelbarrow', 'Heavy-duty garden wheelbarrow', 129.99, 20, 5, 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'),
('Sprinkler', 'Automatic lawn sprinkler', 49.99, 40, 5, 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'),
('Mulch', 'Organic garden mulch bag', 18.99, 75, 5, 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'),
('Garden Kneeler', 'Padded garden kneeling pad', 27.99, 50, 5, 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'),
('Greenhouse Kit', 'Small backyard greenhouse', 199.99, 15, 5, 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'),

-- Home & Kitchen (Category 6)
('Coffee Maker', 'Programmable drip coffee maker', 89.99, 45, 6, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400'),
('Blender', 'High-speed kitchen blender', 79.99, 55, 6, 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400'),
('Toaster', '4-slice stainless steel toaster', 49.99, 65, 6, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400'),
('Microwave', 'Countertop microwave oven', 129.99, 35, 6, 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=400'),
('Knife Set', 'Professional kitchen knife set', 99.99, 40, 6, 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=400'),
('Cutting Board', 'Bamboo cutting board', 24.99, 85, 6, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400'),
('Cookware Set', 'Non-stick cookware set', 149.99, 30, 6, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400'),
('Dish Set', 'Ceramic dinner plate set', 69.99, 50, 6, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'),
('Vacuum Cleaner', 'Bagless upright vacuum', 179.99, 25, 6, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'),
('Air Fryer', 'Digital air fryer', 119.99, 40, 6, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400'),
('Slow Cooker', '6-quart slow cooker', 59.99, 60, 6, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400'),
('Food Processor', 'Multi-function food processor', 89.99, 35, 6, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400'),
('Stand Mixer', 'Heavy-duty stand mixer', 249.99, 20, 6, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400'),
('Rice Cooker', 'Digital rice cooker', 69.99, 45, 6, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400'),
('Pressure Cooker', 'Electric pressure cooker', 99.99, 55, 6, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400'),

-- Beauty & Personal Care (Category 7)
('Hair Dryer', 'Professional ionic hair dryer', 79.99, 50, 7, 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400'),
('Electric Toothbrush', 'Rechargeable electric toothbrush', 49.99, 70, 7, 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=400'),
('Skincare Set', 'Complete skincare routine set', 89.99, 40, 7, 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400'),
('Perfume', 'Designer fragrance', 129.99, 35, 7, 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400'),
('Makeup Kit', 'Professional makeup set', 99.99, 45, 7, 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400'),
('Shampoo', 'Organic hair shampoo', 19.99, 90, 7, 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400'),
('Face Mask', 'Hydrating face mask pack', 24.99, 80, 7, 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400'),
('Nail Polish', 'Long-lasting nail polish set', 29.99, 65, 7, 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400'),
('Body Lotion', 'Moisturizing body lotion', 16.99, 95, 7, 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400'),
('Sunscreen', 'SPF 50 sunscreen lotion', 22.99, 75, 7, 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400');


-- Insert sample users
INSERT INTO users (username, email, password, first_name, last_name, phone, address, role) VALUES
('admin', 'admin@ecommerce.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', '+1234567890', '123 Admin Street, Admin City, AC 12345', 'admin'),
('john_doe', 'john@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John', 'Doe', '+1987654321', '456 Main Street, New York, NY 10001', 'user'),
('jane_smith', 'jane@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jane', 'Smith', '+1122334455', '789 Oak Avenue, Los Angeles, CA 90210', 'user');

-- Insert sample cart items
INSERT INTO cart (user_id, product_id, quantity) VALUES
(2, 1, 1),
(2, 4, 1),
(3, 2, 1),
(3, 5, 2);

-- Insert sample wishlist items
INSERT INTO wishlist (user_id, product_id) VALUES
(2, 2),
(2, 3),
(3, 1),
(3, 6);

-- Insert sample orders
INSERT INTO orders (user_id, order_number, total_amount, tax_amount, shipping_cost, final_amount, status, shipping_address, payment_method, payment_status) VALUES
(2, 'ORD-2025-001', 899.98, 71.99, 15.00, 986.97, 'delivered', '456 Main Street, New York, NY 10001', 'Credit Card', 'completed'),
(3, 'ORD-2025-002', 1299.99, 103.99, 20.00, 1423.98, 'shipped', '789 Oak Avenue, Los Angeles, CA 90210', 'PayPal', 'completed');

-- Insert sample order items
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES
(1, 1, 1, 699.99, 699.99),
(1, 4, 1, 199.99, 199.99),
(2, 2, 1, 1299.99, 1299.99);

-- Insert sample reviews
INSERT INTO reviews (user_id, product_id, order_id, rating, title, comment, is_verified) VALUES
(2, 1, 1, 5, 'Amazing Phone!', 'Great camera quality and battery life. Highly recommended!', TRUE),
(2, 4, 1, 4, 'Good Headphones', 'Sound quality is excellent, but could be more comfortable for long use.', TRUE),
(3, 2, 2, 5, 'Perfect Laptop', 'Fast performance and great for both work and gaming. Love it!', TRUE);

-- Display all data
SELECT 'CATEGORIES' as Table_Name;
SELECT * FROM categories;

SELECT 'PRODUCTS' as Table_Name;
SELECT * FROM products;

SELECT 'USERS' as Table_Name;
SELECT * FROM users;

SELECT 'CART' as Table_Name;
SELECT c.id, u.username, p.name as product_name, c.quantity, p.price, (p.price * c.quantity) as subtotal
FROM cart c
JOIN users u ON c.user_id = u.id
JOIN products p ON c.product_id = p.id;

SELECT 'ORDERS' as Table_Name;
SELECT o.id, o.order_number, u.username, o.status, o.payment_status, o.final_amount, o.created_at
FROM orders o
JOIN users u ON o.user_id = u.id;

SELECT 'REVIEWS' as Table_Name;
SELECT r.id, u.username, p.name as product_name, r.rating, r.title, r.comment
FROM reviews r
JOIN users u ON r.user_id = u.id
JOIN products p ON r.product_id = p.id;

-- Show database structure
SHOW DATABASES;
USE ecommerce_db;
SHOW TABLES;
DESCRIBE users;
DESCRIBE products;
DESCRIBE orders;
ALTER TABLE categories ADD CONSTRAINT unique_category_name UNIQUE (name);

SELECT *
FROM categories c1
WHERE c1.created_at = (
    SELECT MAX(c2.created_at)
    FROM categories c2
    WHERE c2.name = c1.name
);

SELECT *
FROM products p1
WHERE p1.created_at = (
    SELECT MAX(p2.created_at)
    FROM products p2
    WHERE p2.name = p1.name
);

DELETE FROM products;
DELETE FROM categories;