
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
-- Bảng Gifts (quà tặng rượu vang)
-- ==============================
CREATE TABLE IF NOT EXISTS Gifts (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(15, 2) NOT NULL,
  original_price DECIMAL(15, 2),
  description TEXT,
  images JSON,
  in_stock TINYINT(1) DEFAULT 1,
  featured TINYINT(1) DEFAULT 0,
  gift_type ENUM('set','single','combo') DEFAULT 'set',
  include_wine TINYINT(1) DEFAULT 0,
  theme VARCHAR(100),
  packaging VARCHAR(100),
  items JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    product_type ENUM('wine', 'accessory', 'gift') DEFAULT 'wine',
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
INSERT INTO `Wines` (`id`,`name`,`wine_type_id`,`country_id`,`region`,`year`,`price`,`original_price`,`rating`,`reviews`,`description`,`images`,`in_stock`,`featured`,`alcohol`,`volume`,`winery`,`serving_temp`) VALUES ('1','Châteauneuf-du-Pape Rouge 2019',1,1,'Rhône Valley',2019,2500000.00,2800000.00,4.8,127,'Một chai rượu vang đỏ đặc biệt từ vùng Châteauneuf-du-Pape danh tiếng. Hương vị phức tạp với note của quả mọng đen, gia vị và một chút khói.','[\"https://winecellar.vn/wp-content/uploads/2020/06/clos-des-papes-chateauneuf-du-pape-rouge.jpg\", \"https://cdn.ruoutuongvy.com/files/2025/03/21/072127-0-ruou-vang-do-phap-chateau-de-beaucastel-chateauneuf-du-pape-rouge-2019.webp\"]',1,1,14.5,750,'Domaine de la Côte','16-18°C');
INSERT INTO `Wines` (`id`,`name`,`wine_type_id`,`country_id`,`region`,`year`,`price`,`original_price`,`rating`,`reviews`,`description`,`images`,`in_stock`,`featured`,`alcohol`,`volume`,`winery`,`serving_temp`) VALUES ('2','Barolo DOCG 2018',1,2,'Piedmont',2018,3200000.00,NULL,4.9,89,'Rượu vang đỏ cao cấp từ vùng Barolo, Italy. Được làm từ nho Nebbiolo 100%, mang hương vị sang trọng và độ phức tạp cao.','[\"https://www.divino.com.au/cdn/shop/files/batasiolo-barolo-docg-2018-971727.png?v=1740901743\", \"https://static.hanosshop.com/medias/914Wx914H-null?context=bWFzdGVyfHByb2R1Y3RpbWFnZXN8NTg0MjF8aW1hZ2UvanBlZ3xjM2x6TFcxaGMzUmxjaTl3Y205a2RXTjBhVzFoWjJWekwyZzBNeTlvWm1Jdk1UQXlPRFl6TlRneE16UTRNVFF2T1RFMFYzZzVNVFJJWDI1MWJHd3w0OWY1ZTcwODVjZTQ1MzNhZGUxNGM1NTk1ZGQxMmM2NWNhOGEwMGZjZjI0ZmExM2QyMDE0ZDhhZTk2Y2MxZDA2\"]',1,1,15.0,750,'Antinori','18-20°C');
INSERT INTO `Wines` (`id`,`name`,`wine_type_id`,`country_id`,`region`,`year`,`price`,`original_price`,`rating`,`reviews`,`description`,`images`,`in_stock`,`featured`,`alcohol`,`volume`,`winery`,`serving_temp`) VALUES ('3','Chablis Premier Cru 2020',2,1,'Burgundy',2020,1800000.00,NULL,4.6,156,'Rượu vang trắng tinh tế từ vùng Chablis. Hương vị tươi mát với note khoáng chất đặc trưng và độ axit cân bằng.','[\"https://productionbhsstorage.blob.core.windows.net/cms-media-storage/assets/24768_be8913440c.png\", \"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIuybA5S4y-9dz3IVGGeUvC3cqKNlIpyoo71OtRVCxGFOq2lRjYe0tP2u_D14afu0zgPQ&usqp=CAU\"]',1,0,12.5,750,'Louis Michel','8-10°C');
INSERT INTO `Wines` (`id`,`name`,`wine_type_id`,`country_id`,`region`,`year`,`price`,`original_price`,`rating`,`reviews`,`description`,`images`,`in_stock`,`featured`,`alcohol`,`volume`,`winery`,`serving_temp`) VALUES ('4','Côtes de Provence Rosé 2021',3,1,'Provence',2021,950000.00,NULL,4.4,203,'Rượu vang hồng thanh lịch từ Provence với màu hồng nhạt đặc trưng. Hương vị tươi mát, hoàn hảo cho mùa hè.','[\"https://www.hrskov.dk/media/iopt/catalog/product/cache/56c776a0db6d879ca86a5b764397b7d2/image/22513efd/cotes-de-provence-rose-grand-classique-oko.webp\", \"https://winesonline.com.sg/cdn/shop/products/Domaine-Ott-Cotes-de-Provence-By-Ott-Rose.jpg?v=1567493311\"]',1,1,13.0,750,'Château d\'Esclans','6-8°C');
INSERT INTO `Wines` (`id`,`name`,`wine_type_id`,`country_id`,`region`,`year`,`price`,`original_price`,`rating`,`reviews`,`description`,`images`,`in_stock`,`featured`,`alcohol`,`volume`,`winery`,`serving_temp`) VALUES ('5','Dom Pérignon 2012',4,1,'Champagne',2012,8500000.00,NULL,4.9,78,'Champagne đỉnh cao từ Dom Pérignon. Sự kết hợp hoàn hảo giữa Chardonnay và Pinot Noir tạo nên hương vị tinh tế và bong bóng mịn màng.','[\"https://cosedelposto.com/cdn/shop/files/ChampagnePlenitude2DomPerignon2004.png?v=1716905920\", \"https://www.vipwineservices.com/wp-content/uploads/dom-perignon-oenotheque-1995.png\"]',1,1,12.5,750,'Dom Pérignon','6-8°C');
INSERT INTO `Wines` (`id`,`name`,`wine_type_id`,`country_id`,`region`,`year`,`price`,`original_price`,`rating`,`reviews`,`description`,`images`,`in_stock`,`featured`,`alcohol`,`volume`,`winery`,`serving_temp`) VALUES ('6','Rioja Reserva 2017',1,3,'La Rioja',2017,1400000.00,NULL,4.5,145,'Rượu vang đỏ Tây Ban Nha với thời gian ủ dài trong thùng gỗ sồi. Hương vị phong phú với note vani và gia vị.','[\"https://ruounhapkhau.com/wp-content/uploads/2024/02/muga-riojajpg-203616668.jpg\", \"https://laespanolameats.com/6891-thickbox_default/campo-viejo-reserva-2017-doc-rioja.jpg\"]',1,0,14.0,750,'Marqués de Cáceres','16-18°C');

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

-- Gifts (Quà tặng rượu vang)
INSERT INTO Gifts (id, name, price, original_price, description, images, in_stock, featured, gift_type, include_wine, theme, packaging, items) VALUES
('G1', 'Set Quà Tặng Rượu Vang Đỏ Premium', 2500000, 3000000, 'Bộ quà tặng cao cấp gồm 1 chai rượu vang đỏ, 2 ly crystal, dụng cụ mở rượu và túi đựng sang trọng. Phù hợp tặng đối tác, sếp hoặc dịp đặc biệt.', '["https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg", "https://images.pexels.com/photos/1303081/pexels-photo-1303081.jpeg"]', 1, 1, 'set', 1, 'Tết', 'Hộp gỗ cao cấp', '["Chai rượu vang đỏ 750ml", "2 ly crystal Riedel", "Dụng cụ mở rượu", "Túi đựng vải"]'),
('G2', 'Combo Rượu Vang + Phụ Kiện', 1800000, 2200000, 'Bộ combo hoàn chỉnh gồm rượu vang, ly, bình thở và dụng cụ mở rượu. Lý tưởng cho người mới bắt đầu sưu tầm rượu vang.', '["https://images.pexels.com/photos/1303081/pexels-photo-1303081.jpeg", "https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg"]', 1, 1, 'combo', 1, 'Sinh nhật', 'Túi vải canvas', '["Chai rượu vang 750ml", "4 ly rượu vang", "Bình thở rượu", "Dụng cụ mở rượu", "Sách hướng dẫn"]'),
('G3', 'Quà Tặng Noel Rượu Vang', 3200000, 3800000, 'Set quà tặng Noel đặc biệt với rượu vang đỏ, ly champagne, và phụ kiện trang trí. Hoàn hảo cho mùa lễ hội.', '["https://images.pexels.com/photos/1303081/pexels-photo-1303081.jpeg"]', 1, 1, 'set', 1, 'Noel', 'Hộp quà Noel', '["Chai rượu vang đỏ", "2 ly champagne", "Dụng cụ mở rượu", "Phụ kiện trang trí Noel"]'),
('G4', 'Bộ Quà Tặng Doanh Nghiệp', 4500000, 5200000, 'Bộ quà tặng cao cấp dành cho doanh nghiệp, gồm rượu vang premium, ly crystal và bao bì sang trọng. Thể hiện sự tôn trọng và chuyên nghiệp.', '["https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg"]', 1, 0, 'set', 1, 'Doanh nghiệp', 'Hộp gỗ sồi', '["Chai rượu vang cao cấp", "6 ly crystal", "Dụng cụ mở rượu", "Thẻ chúc mừng", "Túi đựng da"]'),
('G5', 'Set Quà Tặng Không Kèm Rượu', 1200000, 1500000, 'Bộ quà tặng phụ kiện rượu vang không kèm rượu, gồm ly, dụng cụ và túi đựng. Phù hợp cho người đã có rượu vang.', '["https://images.pexels.com/photos/1303081/pexels-photo-1303081.jpeg"]', 1, 0, 'set', 0, 'Tri ân', 'Túi vải cao cấp', '["4 ly rượu vang crystal", "Dụng cụ mở rượu", "Bình thở rượu", "Khăn lau ly"]'),
('G6', 'Quà Tặng Sinh Nhật Đặc Biệt', 2800000, 3200000, 'Set quà tặng sinh nhật với rượu vang hồng, ly đẹp và bao bì bắt mắt. Hoàn hảo cho người thân yêu.', '["https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg"]', 1, 1, 'set', 1, 'Sinh nhật', 'Hộp quà sinh nhật', '["Chai rượu vang hồng", "2 ly crystal", "Dụng cụ mở rượu", "Thẻ chúc mừng"]'),
('G7', 'Combo Rượu Vang Trắng', 2100000, 2500000, 'Bộ combo rượu vang trắng với ly chuyên dụng và phụ kiện. Lý tưởng cho người thích rượu vang trắng.', '["https://images.pexels.com/photos/1303081/pexels-photo-1303081.jpeg"]', 1, 0, 'combo', 1, 'Tết', 'Túi vải', '["Chai rượu vang trắng", "4 ly rượu vang trắng", "Bình thở rượu", "Dụng cụ mở rượu"]'),
('G8', 'Set Quà Tặng Cao Cấp', 5500000, 6500000, 'Bộ quà tặng cao cấp nhất với rượu vang premium, ly crystal Riedel và bao bì sang trọng. Dành cho dịp đặc biệt.', '["https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg"]', 1, 1, 'set', 1, 'Đặc biệt', 'Hộp gỗ sồi cao cấp', '["Chai rượu vang premium", "6 ly crystal Riedel", "Dụng cụ mở rượu", "Bình thở rượu", "Sách hướng dẫn", "Túi đựng da cao cấp"]');
