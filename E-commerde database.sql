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

INSERT INTO products (name, description, price, stock_quantity, category_id, image_url) VALUES
('Apple iPhone 15 Pro Max', 'Features a titanium frame, USB-C charging, and advanced camera capabilities.', 1199.99, 40, 1, 'https://images.unsplash.com/photo-1726732970014-f2df88c87dd3?w=400'),
('Samsung Galaxy S25 Ultra', 'Boasts a 200MP camera, AI-enhanced performance, and a 6.8-inch AMOLED display.', 1099.99, 35, 1, 'https://images.unsplash.com/photo-1681651585822-b2edab241341?w=400'),
('Sony WH-1000XM6 Headphones', 'Offers improved noise cancellation, longer battery life, and enhanced comfort.', 349.99, 60, 1, 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400'),
('Dell XPS 15 (2025 Edition)', 'Equipped with Intel''s 15th Gen processors and an OLED display option.', 1899.99, 25, 1, 'https://images.unsplash.com/photo-1622286346003-c5c7e63b1088?w=400'),
('Fitbit Charge 6', 'Introduces advanced health metrics, improved battery life, and a sleeker design.', 179.99, 80, 1, 'https://images.unsplash.com/photo-1532288744908-b37abee2ed71?w=400'),
('Levi''s 501 Original Fit Jeans', 'A timeless classic with a modern twist, featuring sustainable materials.', 89.99, 100, 2, 'https://images.unsplash.com/photo-1564322955382-5dda5a13efb8?w=400'),
('Nike Dri-FIT Pro T-Shirt', 'Enhanced moisture-wicking technology and a more breathable fabric.', 29.99, 120, 2, 'https://images.unsplash.com/photo-1585032767761-878270336a0b?w=400'),
('The North Face Summit Series Jacket', 'Lightweight, packable, and designed for extreme conditions.', 299.99, 50, 2, 'https://images.unsplash.com/photo-1576829572019-355fc11f7b68?w=400'),
('Adidas Ultraboost 2025 Running Shorts', 'Combines comfort with performance, featuring a new ergonomic design.', 49.99, 75, 2, 'https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?w=400'),
('Patagonia Recycled Fleece Hoodie', 'Made from 100% recycled materials, offering warmth and sustainability.', 139.99, 65, 2, 'https://images.unsplash.com/photo-1614744919005-a5d1eb00f537?w=400'),
('The Alchemist', 'A modern classic that continues to inspire readers worldwide.', 14.99, 200, 3, 'https://images.thegreatestbooks.org/ohjxpnwzvw5lk2naqg38sqe2a3d4'),
('To Kill a Mockingbird', 'A poignant tale of racial injustice and moral growth.', 12.99, 180, 3, 'https://plus.unsplash.com/premium_photo-1667239474298-844804eca38f?q=80'),
('1984', 'A dystopian novel exploring themes of surveillance and totalitarianism.', 15.99, 150, 3, 'https://images.unsplash.com/photo-1622609184693-58079bb6742f?w=400'),
('The Hobbit', 'An epic fantasy adventure that introduces readers to Middle-earth.', 16.99, 160, 3, 'https://images.unsplash.com/photo-1613575363165-5a67fadc017c?w=400'),
('Becoming', 'A memoir detailing the former First Lady''s journey and experiences.', 18.99, 140, 3, 'https://images.unsplash.com/photo-1580888737814-ec3385f41dfa?w=400'),
('Nike Air Zoom Pegasus 2025', 'A versatile running shoe known for its comfort and durability.', 130.00, 90, 4, 'https://images.unsplash.com/photo-1718417286278-b383b8a8ad6d?w=400'),
('Wilson Pro Staff 2025 Tennis Racket', 'Offers precision and control for advanced players.', 249.99, 40, 4, 'https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?w=400'),
('Adidas Predator 2025 Soccer Cleats', 'Designed for agility and traction on the field.', 120.00, 70, 4, 'https://images.unsplash.com/photo-1650874832448-f567c89b9236?w=400'),
('Yonex Astrox 100ZZ Badminton Racket', 'Provides power and maneuverability for competitive play.', 200.00, 30, 4, 'https://images.unsplash.com/photo-1586768402600-714186e09479?w=400'),
('Philips Hue Smart Light Bulb (2025 Edition)', 'Features enhanced color options and improved energy efficiency.', 59.99, 110, 5, 'https://images.unsplash.com/photo-1532007271951-c487760934ae?w=400'),
('Instant Pot Pro Plus', 'A multi-functional cooker with smart connectivity and a sleek design.', 149.99, 80, 5, 'https://images.unsplash.com/photo-1582693115346-6347108a1a4f?w=400'),
('Weber Genesis II Smart Grill', 'Equipped with smart technology for precise cooking control.', 899.99, 20, 5, 'https://images.unsplash.com/photo-1495732140334-940c8108c072?w=400'),
('Dyson V15 Detect Vacuum Cleaner', 'Offers laser illumination and advanced filtration for deep cleaning.', 699.99, 25, 5, 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400');


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


-- Note: Only “image_url” values have changed where marked;
-- all other 24 products are unchanged from your original insert.

