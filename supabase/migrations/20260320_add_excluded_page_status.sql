-- Add 'excluded' to the pages status enum
ALTER TABLE public.pages DROP CONSTRAINT IF EXISTS pages_status_check;
ALTER TABLE public.pages ADD CONSTRAINT pages_status_check
  CHECK (status IN ('healthy','warning','critical','dead','new','unknown','redirected','excluded'));
