CREATE TABLE categorizable (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ref_name VARCHAR(255) NULL,
    ref_id BIGINT UNSIGNED NULL,
    category_id BIGINT UNSIGNED NULL,

    CONSTRAINT fk_categorizable_category_id 
        FOREIGN KEY (category_id) REFERENCES categories(id)
        ON DELETE CASCADE,
        
    INDEX idx_categorizable_category_id (category_id)
);