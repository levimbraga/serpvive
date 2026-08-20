-- The free allowance became a single shared pool: GSC diagnoses and standalone
-- URL analyses draw from the same 10 runs per account. Usage is counted from
-- table rows, so a run that writes to BOTH tables would burn two credits.
--
-- /api/analyze-url writes a `diagnoses` row *in addition to* the
-- `external_analyses` row whenever the URL belongs to a connected GSC site.
-- This column marks exactly those rows, so the count can be
--   count(diagnoses) + count(external_analyses WHERE page_id IS NULL)
-- and stay exactly one credit per user action.
--
-- ON DELETE SET NULL, not CASCADE: deleting a page must not erase the analysis
-- permalink at /pages/analyze/[id]. It only unlinks — and an unlinked row then
-- correctly counts on its own, since its `diagnoses` row is gone with the page.
ALTER TABLE public.external_analyses
  ADD COLUMN IF NOT EXISTS page_id UUID REFERENCES public.pages(id) ON DELETE SET NULL;

-- Partial index: the usage count only ever asks for the unlinked rows.
CREATE INDEX IF NOT EXISTS idx_external_analyses_user_unlinked
  ON public.external_analyses(user_id)
  WHERE page_id IS NULL;

-- Backfill: rows written before this column existed. Without it, every past
-- run that hit the both-tables path would charge two credits retroactively the
-- first time the new shared count runs.
--
-- Correlated by URL within the account's own sites, requiring that a diagnosis
-- for that page actually exists. The imprecise case is a URL analyzed
-- standalone *before* the site was connected and diagnosed through GSC later:
-- that gets linked too, undercounting by one. It errs in the user's favour and
-- only affects accounts that predate this migration.
UPDATE public.external_analyses ea
SET page_id = p.id
FROM public.pages p
JOIN public.sites s ON s.id = p.site_id
WHERE ea.page_id IS NULL
  AND s.user_id = ea.user_id
  AND p.url = ea.url
  AND EXISTS (
    SELECT 1 FROM public.diagnoses d
    WHERE d.page_id = p.id AND d.user_id = ea.user_id
  );
