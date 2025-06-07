console.log("Loaded productRoutes.js");
const express = require('express');
const router = express.Router();
const db = require('../db');


router.get('/', (req, res) => {
  //console.log('GET /api/products called');
  db.query('SELECT * FROM products', (err, result) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).send(err);
    }
    //console.log("Fetched products:", result);
    res.json(result);
  });
});


// Add product (Admin)
router.post('/add', (req, res) => {
  const { name, price, stock } = req.body;
  db.query(
    'INSERT INTO products (name, price, stock) VALUES (?, ?, ?)',
    [name, price, stock],
    (err, result) => {
      if (err) return res.status(500).send(err);
      db.query('SELECT * FROM products WHERE id = LAST_INSERT_ID()', (err2, result2) => {
        if (err2) return res.status(500).send(err2);
        res.json(result2[0]);
      });
    }
  );
});

router.post('/update-stock', (req, res) => {
  const updates = req.body;

  const updateQueries = updates.map(({ id, quantity }) => {
    return new Promise((resolve, reject) => {
      db.query('UPDATE products SET stock = stock - ? WHERE id = ?', [quantity, id], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  });

  Promise.all(updateQueries)
    .then(() => res.send({ message: 'Stock updated' }))
    .catch(err => res.status(500).send({ error: err.message }));
});


// Delete product by ID
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM products WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.affectedRows === 0) {
      return res.status(404).send({ message: 'Product not found' });
    }
    res.send({ message: 'Product deleted' });
  });
});


module.exports = router;
