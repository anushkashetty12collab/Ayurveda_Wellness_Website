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