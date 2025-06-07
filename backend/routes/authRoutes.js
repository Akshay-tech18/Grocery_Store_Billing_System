const express = require('express');
const router = express.Router();
const db = require('../db'); // Assuming db.js exports the MySQL connection

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.query(
    'SELECT * FROM users WHERE username = ? AND password = ?',
    [username, password],
    (err, result) => {
      if (err) return res.status(500).send(err);
      if (result.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

      const user = {
        id: result[0].id,
        username: result[0].username,
        role: result[0].role
      };

      res.json({ user });
    }
  );
});

module.exports = router;
