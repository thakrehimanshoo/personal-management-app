import pool from './mysql'

export async function setupDatabase() {
  try {
    console.log('🔄 Starting database setup...')
    
    // Test connection first
    const connection = await pool.getConnection()
    console.log('✅ Database connection successful')
    connection.release()

    // Create users table
    console.log('Creating users table...')
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        passwordHash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Users table created')

    // Create ideas table
    console.log('Creating ideas table...')
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS ideas (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'draft',
        category VARCHAR(255),
        tags JSON,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        userId VARCHAR(255) NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_userId (userId)
      )
    `)
    console.log('✅ Ideas table created')

    // Create subscriptions table
    console.log('Creating subscriptions table...')
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        cost DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'USD',
        billingCycle VARCHAR(50) NOT NULL,
        renewalDate DATE NOT NULL,
        category VARCHAR(255),
        status VARCHAR(50) DEFAULT 'active',
        website VARCHAR(500),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        userId VARCHAR(255) NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_userId (userId),
        INDEX idx_renewalDate (renewalDate)
      )
    `)
    console.log('✅ Subscriptions table created')

    console.log('✅ Database tables created successfully')
    return true
  } catch (error: any) {
    console.error('❌ Database setup error:', error.message)
    console.error('Error code:', error.code)
    console.error('Error details:', error)
    throw error
  }
}