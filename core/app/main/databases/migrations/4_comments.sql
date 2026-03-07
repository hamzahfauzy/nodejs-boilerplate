CREATE TABLE comments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ref_name VARCHAR(255) NULL,
    ref_id BIGINT UNSIGNED NULL,
    people_id BIGINT UNSIGNED NOT NULL,
    content LONGTEXT NOT NULL,

    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    CONSTRAINT fk_comments_people 
        FOREIGN KEY (people_id) REFERENCES people(id)
        ON DELETE CASCADE,
        
    INDEX idx_comments_people (people_id)
);