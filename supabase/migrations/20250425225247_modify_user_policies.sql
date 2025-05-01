-- Drop existing policies
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;

-- Create new policies
-- Allow anyone to insert a new user (needed for signup)
CREATE POLICY "Allow public user inserts"
  ON users
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow users to read their own data
CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id); 