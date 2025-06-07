const mysql = require('mysql2');
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'puneeth@17',
  database: 'grocery_store1'
});
db.connect(err => {
  if (err) throw err;
  console.log('MySQL Connected');
});
module.exports = db;
