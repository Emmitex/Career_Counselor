CREATE TABLE chat_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  sender VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  timestamp DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);