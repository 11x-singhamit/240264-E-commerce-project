// test/setup.js
const mysql = require('mysql2/promise');
const path = require('path');

// Load test environment variables
if (process.env.NODE_ENV === 'test') {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env.test') });
}

// Test database configuration
const testDbConfig = {
  host: process.env.TEST_DB_HOST || 'localhost',
  user: process.env.TEST_DB_USER || 'root',
  password: process.env.TEST_DB_PASSWORD || '',
  database: process.env.TEST_DB_NAME || 'ecommerce_test',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0
};

let testPool;

// Setup before all tests
beforeAll(async () => {
  // Create test database if it doesn't exist
  const connection = await mysql.createConnection({
    host: testDbConfig.host,
    user: testDbConfig.user,
    password: testDbConfig.password
  });
  
  await connection.execute(`CREATE DATABASE IF NOT EXISTS ${testDbConfig.database}`);
  await connection.end();
  
  // Create test pool
  testPool = mysql.createPool(testDbConfig);
  
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.DB_NAME = testDbConfig.database;
});

// Cleanup after all tests
afterAll(async () => {
  if (testPool) {
    await testPool.end();
  }
});

// Export test pool for use in tests
global.testPool = testPool;
