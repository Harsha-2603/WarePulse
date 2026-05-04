import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';

const PORT = process.env.PORT || 5000;

try {
  const server = app.listen(PORT, () => {
    console.log(`Server successfully started on port ${PORT}`);
  });

  server.on('error', (error) => {
    console.error('Server startup error:', error);
    process.exit(1);
  });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}
