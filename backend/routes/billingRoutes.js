const express = require('express');
const router = express.Router();
const db = require('../db');

// Add a sale (billing)
router.post('/create', (req, res) => {
  const { items, total } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'No sale items provided' });
  }

  // Step 1: Insert into sales table
  db.query('INSERT INTO sales (timestamp, total) VALUES (NOW(), ?)', [total], (err, result) => {
    if (err) return res.status(500).send(err);
    const saleId = result.insertId;

    // Step 2: Prepare and insert sale_items
    const saleItems = items.map(item => [saleId, item.name, item.quantity, item.price]);
    db.query('INSERT INTO sale_items (sale_id, product_name, quantity, price) VALUES ?', [saleItems], err => {
      if (err) return res.status(500).send(err);

      // Step 3: Update stock for each product
      const stockUpdates = items.map(item => {
        return new Promise((resolve, reject) => {
          db.query(
            'UPDATE products SET stock = stock - ? WHERE name = ? AND stock >= ?',
            [item.quantity, item.name, item.quantity],
            (err, result) => {
              if (err) return reject(err);
              if (result.affectedRows === 0) return reject(new Error(`Not enough stock for ${item.name}`));
              resolve();
            }
          );
        });
      });

      Promise.all(stockUpdates)
        .then(() => res.send({ message: 'Sale recorded and stock updated' }))
        .catch(stockErr => res.status(400).json({ message: stockErr.message }));
    });
  });
});

module.exports = router;
