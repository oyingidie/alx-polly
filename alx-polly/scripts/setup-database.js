#!/usr/bin/env node

/**
 * Database Setup Script
 * 
 * This script helps set up the Supabase database for the polling app.
 * Run with: node scripts/setup-database.js
 */

const fs = require('fs');
const path = require('path');

console.log('🗄️  Supabase Database Setup');
console.log('============================\n');

// Check if schema file exists
const schemaPath = path.join(__dirname, '..', 'supabase', 'schema.sql');
if (!fs.existsSync(schemaPath)) {
  console.error('❌ Schema file not found at:', schemaPath);
  process.exit(1);
}

// Read the schema file
const schema = fs.readFileSync(schemaPath, 'utf8');

console.log('✅ Schema file found');
console.log('📋 Schema contains:');
console.log('   - Users table with RLS policies');
console.log('   - Polls table with options and votes');
console.log('   - Categories for organizing polls');
console.log('   - Database functions and triggers');
console.log('   - Default categories\n');

console.log('📝 Next steps:');
console.log('1. Go to your Supabase dashboard');
console.log('2. Navigate to SQL Editor');
console.log('3. Copy and paste the contents of supabase/schema.sql');
console.log('4. Click "Run" to execute the schema');
console.log('5. Set up your environment variables in .env.local\n');

console.log('🔧 Environment variables needed:');
console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key\n');

console.log('📚 For detailed instructions, see: SUPABASE_SETUP.md');
console.log('🚀 Happy coding!');
