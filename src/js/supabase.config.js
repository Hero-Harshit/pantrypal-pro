// ============================================================
// PantryPal Pro — Supabase Configuration
// ============================================================
// SETUP INSTRUCTIONS:
//   1. Go to https://supabase.com/dashboard
//   2. Open your project (knhzicieylhislmnbwhj)
//   3. Navigate to: Settings → API
//   4. Copy "Project URL" → paste as SUPABASE_URL below
//   5. Copy "anon public" key → paste as SUPABASE_ANON_KEY below
//
// ⚠️  IMPORTANT: Add this file to .gitignore before committing!
// ============================================================

const SUPABASE_CONFIG = {
  url: 'https://knhzicieylhislmnbwhj.supabase.co',
  // Replace with your actual anon key from Supabase Dashboard → Settings → API
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuaHppY2lleWxoaXNsbW5id2hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyOTAwNTMsImV4cCI6MjA5Mjg2NjA1M30.JxauUTPp9G9XtXnjDHJmiId5hZsM4SfEqFuXMV7wMHU'
};

// Freeze to prevent accidental mutation
Object.freeze(SUPABASE_CONFIG);
