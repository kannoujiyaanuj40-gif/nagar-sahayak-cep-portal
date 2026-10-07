-- =====================================================================
-- Complaint Registration Management Portal — Database Schema (MySQL 8+)
-- BSc IT CEP Project (NEP 2020) — Academic Prototype
-- =====================================================================
-- This is the "production" schema referenced by the project report.
-- The bundled runnable prototype (backend/) uses a JSON-file data store
-- so it can run with zero installation (see README.md for why). This
-- file is what you import into MySQL if you wish to run the optional
-- Express + MySQL version, or simply to document the data design.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS complaint_portal;
USE complaint_portal;

-- ---------------------------------------------------------------------
-- USERS
-- ---------------------------------------------------------------------
CREATE TABLE users (
    user_id         INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    mobile          VARCHAR(15) NOT NULL UNIQUE,
    email           VARCHAR(150) UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    address         VARCHAR(255),
    role            ENUM('citizen','admin','department_officer') NOT NULL DEFAULT 'citizen',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- DEPARTMENTS
-- ---------------------------------------------------------------------
CREATE TABLE departments (
    department_id   INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL,
    description     VARCHAR(255)
);

-- ---------------------------------------------------------------------
-- CATEGORIES  (drives smart department suggestion)
-- ---------------------------------------------------------------------
CREATE TABLE categories (
    category_id       INT AUTO_INCREMENT PRIMARY KEY,
    category_name     VARCHAR(100) NOT NULL,
    icon              VARCHAR(10),
    description       VARCHAR(255),
    default_department_id INT,
    sla_days          INT NOT NULL DEFAULT 7,
    FOREIGN KEY (default_department_id) REFERENCES departments(department_id)
);

-- ---------------------------------------------------------------------
-- COMPLAINTS
-- ---------------------------------------------------------------------
CREATE TABLE complaints (
    complaint_id            VARCHAR(20) PRIMARY KEY,          -- e.g. CMP-000123
    user_id                 INT NOT NULL,
    category_id             INT NOT NULL,
    title                   VARCHAR(150) NOT NULL,
    description             TEXT NOT NULL,
    address                 VARCHAR(255) NOT NULL,
    area                    VARCHAR(100) NOT NULL,
    landmark                VARCHAR(150),
    pincode                 VARCHAR(10),
    latitude                DECIMAL(10,6),
    longitude               DECIMAL(10,6),
    photo                   VARCHAR(255),
    status                  ENUM('Registered','Verified','Department Assigned','In Progress',
                                  'Resolved','Feedback Pending','Closed','Reopened') NOT NULL DEFAULT 'Registered',
    department_id           INT,
    assigned_to             VARCHAR(100),
    escalation_level        INT NOT NULL DEFAULT 0,           -- 0=none,1=ward,2=officer,3=senior/admin
    sla_breached            BOOLEAN NOT NULL DEFAULT FALSE,
    resolution_remarks      TEXT,
    resolution_photo        VARCHAR(255),
    created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expected_resolution_date DATE,
    resolved_at              TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (category_id) REFERENCES categories(category_id),
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
);

-- ---------------------------------------------------------------------
-- COMPLAINT STATUS HISTORY (drives the visual timeline)
-- ---------------------------------------------------------------------
CREATE TABLE complaint_status_history (
    history_id      INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id    VARCHAR(20) NOT NULL,
    status          VARCHAR(50) NOT NULL,
    remarks         VARCHAR(255),
    updated_by      VARCHAR(100),
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(complaint_id)
);

-- ---------------------------------------------------------------------
-- FEEDBACK
-- ---------------------------------------------------------------------
CREATE TABLE feedback (
    feedback_id       INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id      VARCHAR(20) NOT NULL,
    rating            INT CHECK (rating BETWEEN 1 AND 5),
    resolution_status ENUM('Yes','Partially','No') NOT NULL,
    comment           VARCHAR(500),
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(complaint_id)
);

-- ---------------------------------------------------------------------
-- NOTIFICATIONS
-- ---------------------------------------------------------------------
CREATE TABLE notifications (
    notification_id  INT AUTO_INCREMENT PRIMARY KEY,
    user_id          INT NOT NULL,
    complaint_id     VARCHAR(20),
    message          VARCHAR(255) NOT NULL,
    is_read          BOOLEAN NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (complaint_id) REFERENCES complaints(complaint_id)
);

CREATE INDEX idx_complaints_user ON complaints(user_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_category ON complaints(category_id);
CREATE INDEX idx_complaints_department ON complaints(department_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
