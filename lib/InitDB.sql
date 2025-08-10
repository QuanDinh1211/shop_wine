-- ==============================
-- Tạo database
-- ==============================
CREATE DATABASE IF NOT EXISTS wine_shop;
USE wine_shop;

-- ==============================
-- Bảng Countries
-- ==============================
CREATE TABLE Countries (
    country_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- ==============================
-- Bảng WineTypes
-- ==============================
CREATE TABLE WineTypes (
    wine_type_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- ==============================
-- Bảng Grapes
-- ==============================
CREATE TABLE Grapes (
    grape_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- ==============================
-- Bảng Pairings
-- ==============================
CREATE TABLE Pairings (
    pairing_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- ==============================
-- Bảng Wines
-- ==============================
CREATE TABLE Wines (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    wine_type_id INT NOT NULL,
    country_id INT NOT NULL,
    region VARCHAR(100),
    year INT,
    price DECIMAL(15, 2) NOT NULL,
    original_price DECIMAL(15, 2),
    rating DECIMAL(3, 1),
    reviews INT DEFAULT 0,
    description TEXT,
    images JSON,
    in_stock BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    alcohol DECIMAL(4, 1),
    volume INT,
    winery VARCHAR(255),
    serving_temp VARCHAR(50),
    FOREIGN KEY (country_id) REFERENCES Countries(country_id),
    FOREIGN KEY (wine_type_id) REFERENCES WineTypes(wine_type_id)
);

-- ==============================
-- Bảng WineGrapes
-- ==============================
CREATE TABLE WineGrapes (
    wine_id VARCHAR(50),
    grape_id INT,
    PRIMARY KEY (wine_id, grape_id),
    FOREIGN KEY (wine_id) REFERENCES Wines(id),
    FOREIGN KEY (grape_id) REFERENCES Grapes(grape_id)
);

-- ==============================
-- Bảng WinePairings
-- ==============================
CREATE TABLE WinePairings (
    wine_id VARCHAR(50),
    pairing_id INT,
    PRIMARY KEY (wine_id, pairing_id),
    FOREIGN KEY (wine_id) REFERENCES Wines(id),
    FOREIGN KEY (pairing_id) REFERENCES Pairings(pairing_id)
);

-- ==============================
-- Bảng Customers
-- ==============================
CREATE TABLE Customers (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NULL,
    isAdmin BOOLEAN DEFAULT FALSE
);

-- ==============================
-- Bảng PasswordResetTokens
-- ==============================
CREATE TABLE PasswordResetTokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id VARCHAR(50) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES Customers(id) ON DELETE CASCADE
);

-- ==============================
-- Bảng Orders
-- ==============================
CREATE TABLE Orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    order_code VARCHAR(50) NOT NULL UNIQUE,
    customer_id VARCHAR(50) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(15, 2) NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    shipping_address TEXT NOT NULL,
    payment_method ENUM('cod', 'bank', 'card') NOT NULL,
    notes TEXT,
    FOREIGN KEY (customer_id) REFERENCES Customers(id)
);

-- ==============================
-- Bảng OrderItems (giữ nguyên wine_id, thêm hỗ trợ phụ kiện)
-- ==============================
CREATE TABLE OrderItems (
    order_item_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    wine_id VARCHAR(50) NULL, -- giữ để code cũ không lỗi
    product_id VARCHAR(50) NOT NULL,
    product_type ENUM('wine', 'accessory') DEFAULT 'wine',
    quantity INT NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id),
    FOREIGN KEY (wine_id) REFERENCES Wines(id)
    -- product_id cho phụ kiện sẽ liên kết Accessories khi product_type = 'accessory'
);

-- ==============================
-- Bảng AccessoryTypes
-- ==============================
CREATE TABLE AccessoryTypes (
    accessory_type_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- ==============================
-- Bảng Accessories
-- ==============================
CREATE TABLE Accessories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    accessory_type_id INT NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    original_price DECIMAL(15, 2),
    description TEXT,
    images JSON,
    in_stock BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    brand VARCHAR(100),
    material VARCHAR(100),
    color VARCHAR(50),
    size VARCHAR(50),
    FOREIGN KEY (accessory_type_id) REFERENCES AccessoryTypes(accessory_type_id)
);



-- ==============================
-- Bảng ContactMessages
-- ==============================
CREATE TABLE ContactMessages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================
-- Bảng NewsletterSubscribers
-- ==============================
CREATE TABLE NewsletterSubscribers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================
-- Insert dữ liệu mẫu
-- ==============================

-- Countries
INSERT INTO Countries (name) VALUES ('France'), ('Italy'), ('Spain');

-- WineTypes
INSERT INTO WineTypes (name) VALUES ('red'), ('white'), ('rose'), ('sparkling');

-- Grapes
INSERT INTO Grapes (name) VALUES 
('Syrah'), ('Grenache'), ('Mourvèdre'), ('Nebbiolo'), 
('Chardonnay'), ('Cinsault'), ('Pinot Noir'), 
('Tempranillo'), ('Garnacha');

-- Pairings
INSERT INTO Pairings (name) VALUES 
('Thịt nướng'), ('Phô mai'), ('Sô cô la đen'), ('Thịt bò'),
('Nấm truffle'), ('Phô mai cứng'), ('Hải sản'), 
('Phô mai dê'), ('Salad'), ('Phô mai nhẹ'), 
('Caviar'), ('Hàu'), ('Dessert'), ('Thịt cừu'), 
('Jamón'), ('Phô mai Manchego');

-- Customers
INSERT INTO Customers (id, email, password, name, isAdmin) VALUES 
('1', 'admin@wine.com', '$10$yRaqmquqiuHYSs1GYSY06u7TB/mAFos6oCwD5lFURsmiD0cNOpJZ2', 'Admin User', TRUE),
('2', 'user@wine.com',  '$10$yRaqmquqiuHYSs1GYSY06u7TB/mAFos6oCwD5lFURsmiD0cNOpJZ2', 'Regular User', FALSE);

-- Wines
-- INSERT INTO Wines (id, name, wine_type_id, country_id, region, year, price, original_price, rating, reviews, description, images, in_stock, featured, alcohol, volume, winery, serving_temp)
-- VALUES 
-- ('1', 'Châteauneuf-du-Pape Rouge 2019', 1, 1, 'Rhône Valley', 2019, 2500000, 2800000, 4.8, 127, 'Một chai rượu vang đỏ đặc biệt...', '["img1","img2"]', TRUE, TRUE, 14.5, 750, 'Domaine de la Côte', '16-18°C'),
-- ('2', 'Barolo DOCG 2018', 1, 2, 'Piedmont', 2018, 3200000, NULL, 4.9, 89, 'Rượu vang đỏ cao cấp...', '["img1","img2"]', TRUE, TRUE, 15, 750, 'Antinori', '18-20°C');

-- AccessoryTypes
INSERT INTO AccessoryTypes (name) VALUES ('Ly rượu'), ('Bình thở'), ('Dụng cụ mở rượu'), ('Quà tặng');

-- Accessories
INSERT INTO Accessories (id, name, accessory_type_id, price, original_price, description, images, brand, material, color, size, featured, in_stock)
VALUES 
('A1', 'Ly rượu vang Bordeaux Crystal', 1, 350000, 450000, 'Ly thủy tinh pha lê cao cấp Riedel, thiết kế tối ưu cho rượu vang đỏ', '["https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg","https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg"]', 'Riedel', 'Pha lê', 'Trong suốt', '500ml', 1, 1),
('A2', 'Bình thở rượu vang Premium', 2, 1200000, 1500000, 'Bình thủy tinh cao cấp giúp rượu thở tốt hơn, tăng hương vị', '["https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg"]', 'Schott Zwiesel', 'Thủy tinh', 'Trong suốt', '1.5L', 1, 1),
('A3', 'Dụng cụ mở rượu vang chuyên nghiệp', 3, 250000, 300000, 'Dụng cụ mở rượu vang đa năng, dễ sử dụng', '["https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg"]', 'Vacu Vin', 'Thép không gỉ', 'Bạc', 'Tiêu chuẩn', 1, 1),
('A4', 'Ly rượu vang trắng Chardonnay', 1, 280000, 350000, 'Ly chuyên dụng cho rượu vang trắng', '["https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg"]', 'Riedel', 'Pha lê', 'Trong suốt', '400ml', 0, 1),
('A5', 'Bộ quà tặng rượu vang cao cấp', 4, 800000, 1000000, 'Bộ quà tặng gồm ly, dụng cụ mở rượu và túi đựng', '["https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg"]', 'Premium Gift', 'Hỗn hợp', 'Đen', 'Bộ 3 món', 1, 1),
('A6', 'Ly rượu vang sủi Champagne', 1, 420000, 500000, 'Ly chuyên dụng cho rượu sủi và champagne', '["https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg"]', 'Riedel', 'Pha lê', 'Trong suốt', '200ml', 0, 1),
('A7', 'Bình thở rượu vang mini', 2, 450000, 600000, 'Bình thở rượu vang kích thước nhỏ gọn', '["https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg"]', 'Schott Zwiesel', 'Thủy tinh', 'Trong suốt', '750ml', 0, 1),
('A8', 'Dụng cụ mở rượu vang điện tử', 3, 1500000, 1800000, 'Dụng cụ mở rượu vang tự động, tiện lợi', '["https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg"]', 'Electric Corkscrew', 'Nhựa + Thép', 'Đen', 'Tiêu chuẩn', 1, 1);
