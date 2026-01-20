const { Client } = require('pg')

async function fixChatDirectSQL() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'liftplannerpro_dev',
    user: 'postgres',
    password: 'syntex82'
  })

  try {
    console.log('🔌 Connecting to PostgreSQL...')
    await client.connect()
    console.log('✅ Connected!')

    // Drop and recreate table
    console.log('🗑️ Dropping old table...')
    await client.query('DROP TABLE IF EXISTS chat_messages;')

    console.log('🔧 Creating chat_messages table...')
    await client.query(`
      CREATE TABLE chat_messages (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        message_type VARCHAR(50) DEFAULT 'text',
        room_id INTEGER DEFAULT 1,
        reply_to INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_id VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL
      );
    `)

    console.log('✅ Table created!')

    // Insert welcome messages
    console.log('🌱 Adding welcome messages...')
    await client.query(`
      INSERT INTO chat_messages (content, message_type, room_id, user_id, username, created_at)
      VALUES 
        ('Welcome to Lift Planner Pro chat! 🎉', 'text', 1, 'system', 'System', NOW() - INTERVAL '1 hour'),
        ('Click the video icon 📹 to start a video call with your team!', 'text', 1, 'system', 'System', NOW() - INTERVAL '30 minutes'),
        ('Chat messages are now persistent in PostgreSQL database! 💾', 'text', 1, 'system', 'System', NOW() - INTERVAL '15 minutes');
    `)

    // Verify
    const result = await client.query('SELECT COUNT(*) FROM chat_messages;')
    console.log('📊 Message count:', result.rows[0].count)

    console.log('🎉 CHAT IS FIXED WITH DIRECT SQL!')

  } catch (error) {
    console.error('❌ ERROR:', error)
  } finally {
    await client.end()
  }
}

fixChatDirectSQL()
