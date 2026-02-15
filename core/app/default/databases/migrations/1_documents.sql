CREATE TABLE documents (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    user_id CHAR(24) NOT NULL,
    parent_id BIGINT UNSIGNED NULL,

    type ENUM('folder', 'file') NOT NULL,
    name VARCHAR(255) NOT NULL,

    -- file-only fields
    mime_type VARCHAR(100) NULL,
    size BIGINT UNSIGNED NULL,
    storage_path VARCHAR(500) NULL,
    checksum CHAR(64) NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    CONSTRAINT fk_documents_parent
        FOREIGN KEY (parent_id) REFERENCES documents(id)
        ON DELETE CASCADE,

    INDEX idx_documents_user (user_id),
    INDEX idx_documents_parent (parent_id),
    INDEX idx_documents_type (type)
);

CREATE TABLE document_shares (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    document_id BIGINT UNSIGNED NOT NULL,
    shared_with_user_id CHAR(24) NOT NULL,

    permission ENUM('view', 'edit') NOT NULL DEFAULT 'view',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_shares_document
        FOREIGN KEY (document_id) REFERENCES documents(id)
        ON DELETE CASCADE,

    UNIQUE KEY uq_document_share (document_id, shared_with_user_id),
    INDEX idx_shared_user (shared_with_user_id)
);

CREATE TABLE document_versions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    document_id BIGINT UNSIGNED NOT NULL,
    version INT UNSIGNED NOT NULL,

    size BIGINT UNSIGNED NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    checksum CHAR(64) NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_versions_document
        FOREIGN KEY (document_id) REFERENCES documents(id)
        ON DELETE CASCADE,

    UNIQUE KEY uq_document_version (document_id, version),
    INDEX idx_versions_document (document_id)
);
