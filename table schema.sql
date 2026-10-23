CREATE DATABASE ayurveda;

USE ayurveda;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY  KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255)
);

CREATE TABLE dosha_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    body_type VARCHAR(20),
    skin VARCHAR(20),
    digestion VARCHAR(20),
    sleep VARCHAR(20),
    energy VARCHAR(20),
    mind VARCHAR(20),
    appetite VARCHAR(20),
    emotion VARCHAR(20),

    dominant_dosha VARCHAR(20),
    secondary_dosha VARCHAR(20),
    vata_score INT,
    pitta_score INT,
    kapha_score INT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE dosha_results
ADD COLUMN user_id INT,
ADD CONSTRAINT fk_user_dosha
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE;



CREATE TABLE IF NOT EXISTS blood_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    cholesterol FLOAT,
    hemoglobin FLOAT,
    glucose FLOAT,
    abnormalities TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_blood_reports_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE SET NULL
);

SHOW TABLES;