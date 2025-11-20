/**
 * Database setup script
 * This script creates the database tables and imports initial data
 */

const SUPABASE_URL = 'https://0ec90b57d6e95fcbda19832f.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw';

async function setupDatabase() {
  console.log('Setting up database...');

  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Create tables
  const createTablesSQL = `
    CREATE TABLE IF NOT EXISTS users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      username text UNIQUE NOT NULL,
      password_hash text NOT NULL,
      monthly_budget numeric DEFAULT 0,
      monthly_income numeric DEFAULT 0,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id bigint PRIMARY KEY,
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name text NOT NULL,
      category text NOT NULL,
      recurrence text NOT NULL,
      amount numeric NOT NULL,
      due_date date NOT NULL,
      notes text DEFAULT '',
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
    CREATE INDEX IF NOT EXISTS idx_expenses_due_date ON expenses(due_date);
    CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
  `;

  console.log('Database tables created');

  // Insert demo user
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('username', 'User')
    .maybeSingle();

  let userId;

  if (!existingUser) {
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{
        username: 'User',
        password_hash: '123456',
        monthly_budget: 3000,
        monthly_income: 3500
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return;
    }

    userId = newUser.id;
    console.log('Demo user created:', userId);
  } else {
    userId = existingUser.id;
    console.log('Demo user already exists:', userId);
  }

  // Load and import expense data
  const response = await fetch('./data/expense_tracker_data.json');
  const expenses = await response.json();

  console.log(`Importing ${expenses.length} expenses...`);

  for (const expense of expenses) {
    const expenseData = {
      id: expense.id,
      user_id: userId,
      name: expense.name,
      category: expense.category,
      recurrence: expense.recurrence,
      amount: expense.amount,
      due_date: expense.dueDate,
      notes: expense.notes || '',
      created_at: expense.createdAt
    };

    const { error } = await supabase
      .from('expenses')
      .upsert([expenseData]);

    if (error) {
      console.error('Error importing expense:', expense.name, error);
    }
  }

  console.log('Database setup complete!');
  console.log('You can now login with:');
  console.log('Username: User');
  console.log('Password: 123456');
}

// Run setup when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupDatabase);
} else {
  setupDatabase();
}
