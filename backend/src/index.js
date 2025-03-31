const express = require('express');
require('dotenv').config();
const cors = require('cors');

const apiRoutes = require('./routes/api');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    console.log(`[ROUTE] ${middleware.route.stack[0].method.toUpperCase()} ${middleware.route.path}`);
  } else if (middleware.name === 'router') {
    middleware.handle.stack.forEach((handler) => {
      const routePath = handler.route && handler.route.path;
      const method = handler.route && handler.route.stack[0].method.toUpperCase();
      if (routePath && method) {
        console.log(`[ROUTE] ${method} ${routePath}`);
      }
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Backend active in port ${PORT}`);
});
