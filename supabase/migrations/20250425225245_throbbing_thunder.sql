/*
  # Initial schema setup for payment approval system

  1. New Tables
    - users
      - id (uuid, primary key)
      - email (text, unique)
      - name (text)
      - role (text)
      - company (text)
      - created_at (timestamptz)
      - updated_at (timestamptz)
    
    - payments
      - id (uuid, primary key)
      - serial_number (bigint)
      - date (timestamptz)
      - vendor_name (text)
      - total_outstanding (numeric)
      - advance_tds (numeric)
      - payment_amount (numeric)
      - balance_amount (numeric)
      - item_description (text)
      - bill_number (text)
      - bill_date (timestamptz)
      - requested_by (uuid, references users)
      - approved_by (uuid, references users)
      - company_name (text)
      - status (text)
      - created_at (timestamptz)
      - updated_at (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for user access
*/

-- Create users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'admin', 'accounts')),
  company text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payments table
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  serial_number bigint GENERATED ALWAYS AS IDENTITY,
  date timestamptz NOT NULL DEFAULT now(),
  vendor_name text NOT NULL,
  total_outstanding numeric NOT NULL CHECK (total_outstanding >= 0),
  advance_tds numeric NOT NULL DEFAULT 0 CHECK (advance_tds >= 0),
  payment_amount numeric NOT NULL CHECK (payment_amount >= 0),
  balance_amount numeric NOT NULL DEFAULT 0,
  item_description text NOT NULL,
  bill_number text NOT NULL,
  bill_date timestamptz NOT NULL,
  requested_by uuid REFERENCES users(id) NOT NULL,
  approved_by uuid REFERENCES users(id),
  company_name text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'processed')) DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policies for payments table
CREATE POLICY "Users can create payment requests"
  ON payments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read their own payment requests"
  ON payments
  FOR SELECT
  TO authenticated
  USING (
    requested_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'accounts')
    )
  );

CREATE POLICY "Admins can update payment status"
  ON payments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );