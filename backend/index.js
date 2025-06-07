console.log("🚀 Server starting... No data reset should happen beyond this point.");
const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./db');

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/billing', require('./routes/billingRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
