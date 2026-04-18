const bcrypt = require('bcryptjs');
const { pool } = require('./config/database');
require('dotenv').config();

const initializeDatabase = async () => {
  try {
    console.log('🔧 Initializing database with sample data...');

    // Check if users table exists and has data
    const [existingUsers] = await pool.execute('SELECT COUNT(*) as count FROM users');
    
    if (existingUsers[0].count > 0) {
      console.log('✅ Database already has users, skipping initialization');
      process.exit(0);
    }

    // Hash passwords
    const adminPassword = await bcrypt.hash('password', 12);
    const userPassword = await bcrypt.hash('password', 12);

    // Insert sample admin user
    await pool.execute(
      'INSERT INTO users (username, email, password, first_name, last_name, phone, role, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      ['admin', 'admin@smarttourist.com', adminPassword, 'Admin', 'User', '+1234567890', 'admin', true]
    );
    console.log('✅ Admin user created: admin@smarttourist.com / password');

    // Insert sample regular user
    await pool.execute(
      'INSERT INTO users (username, email, password, first_name, last_name, phone, role, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      ['tourist', 'user@example.com', userPassword, 'Tourist', 'User', '+0987654321', 'user', true]
    );
    console.log('✅ Regular user created: user@example.com / password');

    // Insert sample safety officer
    const officerPassword = await bcrypt.hash('password', 12);
    await pool.execute(
      'INSERT INTO users (username, email, password, first_name, last_name, phone, role, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      ['officer', 'officer@smarttourist.com', officerPassword, 'Safety', 'Officer', '+1122334455', 'safety_officer', true]
    );
    console.log('✅ Safety officer created: officer@smarttourist.com / password');

    console.log('\n✨ Database initialization complete!');
    console.log('You can now log in with the following credentials:');
    console.log('  Admin: admin@smarttourist.com / password');
    console.log('  User: user@example.com / password');
    console.log('  Officer: officer@smarttourist.com / password');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
};

initializeDatabase();
