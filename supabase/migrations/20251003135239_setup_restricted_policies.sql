-- Drop temporary policy
DROP POLICY IF EXISTS "Temporary unrestricted access" ON public.institutions;

-- Enable RLS
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;

-- Create proper restricted policies
CREATE POLICY "Institutions are viewable by authenticated users"
ON public.institutions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only super admins can create institutions"
ON public.institutions FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

CREATE POLICY "Admins can update their own institution"
ON public.institutions FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND (profiles.role = 'admin' OR profiles.role = 'super_admin')
    AND profiles.institution_id = id
  )
);