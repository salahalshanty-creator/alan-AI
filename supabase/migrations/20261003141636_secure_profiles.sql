-- Automatically update updated_at whenever a profile is modified.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();


-- Allow authenticated users to read only their own profile.
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = id);


-- Allow authenticated users to create only their own profile.
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = id);


-- Allow authenticated users to update only their own profile.
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = id)
WITH CHECK ((SELECT auth.uid()) = id);
