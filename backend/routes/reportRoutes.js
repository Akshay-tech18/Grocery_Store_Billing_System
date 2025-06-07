const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  db.query(
    `SELECT s.id, s.timestamp, s.total, 
            JSON_ARRAYAGG(JSON_OBJECT('name', si.product_name, 'quantity', si.quantity)) AS items 
     FROM sales s 
     JOIN sale_items si ON s.id = si.sale_id 
     GROUP BY s.id 
     ORDER BY s.timestamp DESC`,
    (err, result) => {
      if (err) return res.status(500).send(err);

      // Parse JSON strings into arrays
      const formattedResult = result.map(row => ({
        ...row,
        // items: JSON.parse(row.items)
        items: row.items
      }));

      res.json(formattedResult);
    }
  );
});

module.exports = router;
