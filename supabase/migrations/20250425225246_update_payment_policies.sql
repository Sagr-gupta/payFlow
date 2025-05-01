-- Drop existing policies
DROP POLICY IF EXISTS "Users can read their own payment requests" ON payments;
DROP POLICY IF EXISTS "Admins can update payment status" ON payments;

-- Create updated policies
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