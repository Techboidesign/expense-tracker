/*
  # Expense Tracker Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `password` (text, hashed)
      - `created_at` (timestamp)
    
    - `expenses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `name` (text)
      - `amount` (numeric)
      - `type` (text) - 'Recurring' or 'One-time'
      - `recurrence` (text) - 'Weekly', 'Bi-weekly', 'Monthly', 'Yearly', etc.
      - `category` (text)
      - `date` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `budgets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `amount` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `income`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `amount` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  amount numeric NOT NULL,
  type text NOT NULL DEFAULT 'One-time',
  recurrence text,
  category text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own expenses"
  ON expenses FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE username = current_user));

CREATE POLICY "Users can insert own expenses"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM users WHERE username = current_user));

CREATE POLICY "Users can update own expenses"
  ON expenses FOR UPDATE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE username = current_user))
  WITH CHECK (user_id IN (SELECT id FROM users WHERE username = current_user));

CREATE POLICY "Users can delete own expenses"
  ON expenses FOR DELETE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE username = current_user));

-- Create budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own budget"
  ON budgets FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE username = current_user));

CREATE POLICY "Users can insert own budget"
  ON budgets FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM users WHERE username = current_user));

CREATE POLICY "Users can update own budget"
  ON budgets FOR UPDATE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE username = current_user))
  WITH CHECK (user_id IN (SELECT id FROM users WHERE username = current_user));

CREATE POLICY "Users can delete own budget"
  ON budgets FOR DELETE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE username = current_user));

-- Create income table
CREATE TABLE IF NOT EXISTS income (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE income ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own income"
  ON income FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE username = current_user));

CREATE POLICY "Users can insert own income"
  ON income FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM users WHERE username = current_user));

CREATE POLICY "Users can update own income"
  ON income FOR UPDATE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE username = current_user))
  WITH CHECK (user_id IN (SELECT id FROM users WHERE username = current_user));

CREATE POLICY "Users can delete own income"
  ON income FOR DELETE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE username = current_user));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_income_user_id ON income(user_id);