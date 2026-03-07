CREATE TABLE people (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    user_id CHAR(24) DEFAULT NULL,
    code VARCHAR(50) NULL UNIQUE, 
    -- bisa dipakai untuk NIS, NIP, Employee Code, Customer Code, dll
    
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NULL,
    full_name VARCHAR(200) GENERATED ALWAYS AS (
        CONCAT(first_name, IF(last_name IS NOT NULL, CONCAT(' ', last_name), ''))
    ) STORED,
    
    gender ENUM('male','female') NULL,
    birth_date DATE NULL,
    birth_place VARCHAR(100) NULL,
    
    email VARCHAR(150) NULL UNIQUE,
    phone VARCHAR(50) NULL,
    
    address TEXT NULL,
    city VARCHAR(100) NULL,
    state VARCHAR(100) NULL,
    postal_code VARCHAR(20) NULL,
    country VARCHAR(100) NULL,
    
    identity_number VARCHAR(100) NULL,
    -- bisa KTP, Passport, Student ID, dll
    
    photo VARCHAR(255) NULL,
    
    status ENUM('active','draft','inactive','deceased','archived') DEFAULT 'active',
    
    metadata JSON NULL,
    -- untuk data tambahan tanpa ubah struktur
    
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    INDEX idx_people_status (status),
    INDEX idx_people_name (first_name, last_name)
) ENGINE=InnoDB;