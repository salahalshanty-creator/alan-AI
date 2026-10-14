-- Customer saved addresses.
CREATE TABLE public.addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id uuid NOT NULL
    REFERENCES auth.users(id)
    ON DELETE CASCADE,

  label text,
  recipient_name text NOT NULL,
  phone text NOT NULL,

  country text NOT NULL DEFAULT 'United Arab Emirates',
  emirate text NOT NULL,
  city text NOT NULL,
  area text,
  street text,
  building text,
  apartment text,
  additional_details text,

  is_default boolean NOT NULL DEFAULT false,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.addresses
  ENABLE ROW LEVEL SECURITY;


-- A user can read only their own addresses.
CREATE POLICY "Users can view own addresses"
ON public.addresses
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);


-- A user can create addresses only for themselves.
CREATE POLICY "Users can insert own addresses"
ON public.addresses
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);


-- A user can modify only their own addresses.
CREATE POLICY "Users can update own addresses"
ON public.addresses
FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);


-- A user can delete only their own addresses.
CREATE POLICY "Users can delete own addresses"
ON public.addresses
FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = user_id);


-- Reuse the function created by secure_profiles migration.
CREATE TRIGGER addresses_set_updated_at
BEFORE UPDATE ON public.addresses
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();
