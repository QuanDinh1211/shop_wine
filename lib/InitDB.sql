-- Tạo database
CREATE DATABASE IF NOT EXISTS wine_shop;
USE wine_shop;

-- Tạo bảng Countries
CREATE TABLE Countries (
    country_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Tạo bảng WineTypes
CREATE TABLE WineTypes (
    wine_type_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Tạo bảng Grapes
CREATE TABLE Grapes (
    grape_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Tạo bảng Pairings
CREATE TABLE Pairings (
    pairing_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Tạo bảng Wines (đã sửa để khớp với JSON)
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
    images JSON, -- Lưu mảng images dưới dạng JSON
    in_stock BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    alcohol DECIMAL(4, 1),
    volume INT,
    winery VARCHAR(255),
    serving_temp VARCHAR(50),
    FOREIGN KEY (country_id) REFERENCES Countries(country_id),
    FOREIGN KEY (wine_type_id) REFERENCES WineTypes(wine_type_id)
);

-- Tạo bảng WineGrapes (quan hệ nhiều-nhiều giữa Wines và Grapes)
CREATE TABLE WineGrapes (
    wine_id VARCHAR(50),
    grape_id INT,
    PRIMARY KEY (wine_id, grape_id),
    FOREIGN KEY (wine_id) REFERENCES Wines(id),
    FOREIGN KEY (grape_id) REFERENCES Grapes(grape_id)
);

-- Tạo bảng WinePairings (quan hệ nhiều-nhiều giữa Wines và Pairings)
CREATE TABLE WinePairings (
    wine_id VARCHAR(50),
    pairing_id INT,
    PRIMARY KEY (wine_id, pairing_id),
    FOREIGN KEY (wine_id) REFERENCES Wines(id),
    FOREIGN KEY (pairing_id) REFERENCES Pairings(pairing_id)
);

-- Tạo bảng PasswordResetTokens
CREATE TABLE PasswordResetTokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id VARCHAR(50) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES Customers(id) ON DELETE CASCADE
);

-- Tạo bảng Customers (đã sửa từ yêu cầu trước)
CREATE TABLE Customers (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NULL,
    isAdmin BOOLEAN DEFAULT FALSE
);

-- Tạo bảng Orders
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



-- Tạo bảng OrderItems
CREATE TABLE OrderItems (
    order_item_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    wine_id VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id),
    FOREIGN KEY (wine_id) REFERENCES Wines(id)
);

-- Tạo bảng ContactMessages 
CREATE TABLE ContactMessages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng NewsletterSubscribers 
CREATE TABLE NewsletterSubscribers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chèn dữ liệu mẫu cho Customers với mật khẩu '123456' đã mã hóa
INSERT INTO Customers (id, email, password, name, isAdmin)
VALUES 
    ('1', 'admin@wine.com', '$2b$10$kkACqy5xtiEZ1tJ8Kn5GTOAEXu5UZmveYjTl8zz53nyW6DCBI9sM2', 'Admin User', TRUE),
    ('2', 'user@wine.com', '$2b$10$kkACqy5xtiEZ1tJ8Kn5GTOAEXu5UZmveYjTl8zz53nyW6DCBI9sM2', 'Regular User', FALSE);


-- Chèn dữ liệu mẫu cho Countries
INSERT INTO Countries (name) 
VALUES ('France'), ('Italy'), ('Spain');

-- Chèn dữ liệu mẫu cho WineTypes
INSERT INTO WineTypes (name) 
VALUES ('red'), ('white'), ('rose'), ('sparkling');

-- Chèn dữ liệu mẫu cho Grapes
INSERT INTO Grapes (name) 
VALUES ('Syrah'), ('Grenache'), ('Mourvèdre'), ('Nebbiolo'), ('Chardonnay'), ('Cinsault'), ('Pinot Noir'), ('Tempranillo'), ('Garnacha');

-- Chèn dữ liệu mẫu cho Pairings
INSERT INTO Pairings (name) 
VALUES ('Thịt nướng'), ('Phô mai'), ('Sô cô la đen'), ('Thịt bò'), ('Nấm truffle'), ('Phô mai cứng'), ('Hải sản'), ('Phô mai dê'), ('Salad'), ('Phô mai nhẹ'), ('Caviar'), ('Hàu'), ('Dessert'), ('Thịt cừu'), ('Jamón'), ('Phô mai Manchego');

-- Chèn dữ liệu mẫu cho Wines (dựa trên JSON của em)
INSERT INTO Wines (id, name, wine_type_id, country_id, region, year, price, original_price, rating, reviews, description, images, in_stock, featured, alcohol, volume, winery, serving_temp)
VALUES 
    ('1', 'Châteauneuf-du-Pape Rouge 2019', 1, 1, 'Rhône Valley', 2019, 2500000, 2800000, 4.8, 127, 'Một chai rượu vang đỏ đặc biệt từ vùng Châteauneuf-du-Pape danh tiếng. Hương vị phức tạp với note của quả mọng đen, gia vị và một chút khói.', '["https://images.pexels.com/photos/1407244/pexels-photo-1407244.jpeg", "https://images.pexels.com/photos/1407249/pexels-photo-1407249.jpeg"]', TRUE, TRUE, 14.5, 750, 'Domaine de la Côte', '16-18°C'),
    ('2', 'Barolo DOCG 2018', 1, 2, 'Piedmont', 2018, 3200000, NULL, 4.9, 89, 'Rượu vang đỏ cao cấp từ vùng Barolo, Italy. Được làm từ nho Nebbiolo 100%, mang hương vị sang trọng và độ phức tạp cao.', '["https://images.pexels.com/photos/1407242/pexels-photo-1407242.jpeg", "https://images.pexels.com/photos/1407245/pexels-photo-1407245.jpeg"]', TRUE, TRUE, 15, 750, 'Antinori', '18-20°C'),
    ('3', 'Chablis Premier Cru 2020', 2, 1, 'Burgundy', 2020, 1800000, NULL, 4.6, 156, 'Rượu vang trắng tinh tế từ vùng Chablis. Hương vị tươi mát với note khoáng chất đặc trưng và độ axit cân bằng.', '["https://images.pexels.com/photos/1407248/pexels-photo-1407248.jpeg", "https://images.pexels.com/photos/1407250/pexels-photo-1407250.jpeg"]', TRUE, FALSE, 12.5, 750, 'Louis Michel', '8-10°C'),
    ('4', 'Côtes de Provence Rosé 2021', 3, 1, 'Provence', 2021, 950000, NULL, 4.4, 203, 'Rượu vang hồng thanh lịch từ Provence với màu hồng nhạt đặc trưng. Hương vị tươi mát, hoàn hảo cho mùa hè.', '["https://images.pexels.com/photos/1407246/pexels-photo-1407246.jpeg", "https://images.pexels.com/photos/1407247/pexels-photo-1407247.jpeg"]', TRUE, FALSE, 13, 750, 'Château d''Esclans', '6-8°C'),
    ('5', 'Dom Pérignon 2012', 4, 1, 'Champagne', 2012, 8500000, NULL, 4.9, 78, 'Champagne đỉnh cao từ Dom Pérignon. Sự kết hợp hoàn hảo giữa Chardonnay và Pinot Noir tạo nên hương vị tinh tế và bong bóng mịn màng.', '["https://images.pexels.com/photos/1407251/pexels-photo-1407251.jpeg", "https://images.pexels.com/photos/1407252/pexels-photo-1407252.jpeg"]', TRUE, TRUE, 12.5, 750, 'Dom Pérignon', '6-8°C'),
    ('6', 'Rioja Reserva 2017', 1, 3, 'La Rioja', 2017, 1400000, NULL, 4.5, 145, 'Rượu vang đỏ Tây Ban Nha với thời gian ủ dài trong thùng gỗ sồi. Hương vị phong phú với note vani và gia vị.', '["https://images.pexels.com/photos/1407253/pexels-photo-1407253.jpeg", "https://images.pexels.com/photos/1407254/pexels-photo-1407254.jpeg"]', TRUE, FALSE, 14, 750, 'Marqués de Cáceres', '16-18°C');

-- Chèn dữ liệu mẫu cho WineGrapes
INSERT INTO WineGrapes (wine_id, grape_id)
VALUES 
    ('1', 1), ('1', 2), ('1', 3), -- Châteauneuf-du-Pape: Syrah, Grenache, Mourvèdre
    ('2', 4), -- Barolo: Nebbiolo
    ('3', 5), -- Chablis: Chardonnay
    ('4', 2), ('4', 6), ('4', 1), -- Côtes de Provence: Grenache, Cinsault, Syrah
    ('5', 5), ('5', 7), -- Dom Pérignon: Chardonnay, Pinot Noir
    ('6', 8), ('6', 9); -- Rioja: Tempranillo, Garnacha

-- Chèn dữ liệu mẫu cho WinePairings
INSERT INTO WinePairings (wine_id, pairing_id)
VALUES 
    ('1', 1), ('1', 2), ('1', 3), -- Châteauneuf-du-Pape: Thịt nướng, Phô mai, Sô cô la đen
    ('2', 4), ('2', 5), ('2', 6), -- Barolo: Thịt bò, Nấm truffle, Phô mai cứng
    ('3', 7), ('3', 8), ('3', 9), -- Chablis: Hải sản, Phô mai dê, Salad
    ('4', 9), ('4', 7), ('4', 10), -- Côtes de Provence: Salad, Hải sản, Phô mai nhẹ
    ('5', 11), ('5', 12), ('5', 13), -- Dom Pérignon: Caviar, Hàu, Dessert
    ('6', 14), ('6', 15), ('6', 16); -- Rioja: Thịt cừu, Jamón, Phô mai Manchego

