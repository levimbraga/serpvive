-- Add country column to profiles for signup form
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT;
