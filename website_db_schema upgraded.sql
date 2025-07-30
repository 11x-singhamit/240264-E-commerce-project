-- 1. Create and use the database
CREATE DATABASE IF NOT EXISTS ecommerce_db;
USE ecommerce_db;

-- 2. Users Table
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

-- 3. Categories Table
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Products Table
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

-- 5. Cart Table
CREATE TABLE cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (user_id, product_id)
);

-- 6. Wishlist Table
CREATE TABLE wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product_wishlist (user_id, product_id)
);

-- 7. Orders Table
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

-- 8. Order Items Table
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

-- 9. Reviews Table
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    order_id INT,
    rating INT CHECK (rating >= 1 AND rating <= 5),
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

-- Insert sample categories
INSERT INTO categories (name, description) VALUES
('Electronics', 'Electronic gadgets and devices'),
('Clothing', 'Clothing and fashion'),
('Books', 'Books and learning materials'),
('Sports', 'Sports equipment and gear'),
('Home & Garden', 'Home appliances and gardening tools');

-- Insert sample products
INSERT INTO products (name, description, price, stock_quantity, category_id, image_url) VALUES
('Smartphone', 'Latest smartphone with advanced features', 699.99, 50, 1, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'),
('Laptop', 'High-performance laptop for work and gaming', 1299.99, 30, 1, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400'),
('T-Shirt', 'Comfortable cotton t-shirt', 19.99, 100, 2, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400');
INSERT INTO products (name, description, price, stock_quantity, category_id, image_url) VALUES
('iPhone', 'If you are looking for an affordable iPhone', 1299, 50, 1, 'https://asset.conrad.com/media10/isa/160267/c1/-/en/003329495PI00/image.jpg?x=400&y=400&format=jpg&ex=400&ey=400&align=center');
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
(2, 'ORD-2025-001', 899.98, 71.99, 15.00, 986.97, 'delivered', '456 Main Street', 'Credit Card', 'completed'),
(3, 'ORD-2025-002', 1299.99, 103.99, 20.00, 1423.98, 'shipped', '789 Oak Avenue', 'PayPal', 'completed');

-- Insert sample order items
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES
(1, 1, 1, 699.99, 699.99),
(1, 4, 1, 199.99, 199.99),
(2, 2, 1, 1299.99, 1299.99);

-- Insert sample reviews
INSERT INTO reviews (user_id, product_id, order_id, rating, title, comment, is_verified) VALUES
(2, 1, 1, 5, 'Amazing!', 'Excellent quality and performance.', TRUE),
(2, 4, 1, 4, 'Good', 'Nice t-shirt, soft fabric.', TRUE),
(3, 2, 2, 5, 'Perfect Laptop', 'Super fast and reliable.', TRUE);


-- Show total products in each category
SELECT c.name AS Category, COUNT(p.id) AS Product_Count
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
GROUP BY c.name;

-- Show all orders with user name
SELECT o.order_number, u.username, o.final_amount, o.status
FROM orders o
JOIN users u ON o.user_id = u.id;

-- Show reviews for a product
SELECT p.name AS Product, r.rating, r.title, r.comment
FROM reviews r
JOIN products p ON r.product_id = p.id;

SELECT * FROM users;
SELECT * FROM categories;
SELECT * FROM products;

delete from  products;
SELECT * FROM order_items;

