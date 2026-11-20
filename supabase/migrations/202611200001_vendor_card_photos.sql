-- Free Vendor Card: owner-uploaded photos (logo stays in logo_url, gallery in photos).
alter table public.boda_vendor_profiles
  add column if not exists photos jsonb not null default '[]'::jsonb;

-- Public bucket for card images. Uploads go through the vendor-presence function with the
-- service key after the owner's edit session is checked; there are no client write policies.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('vendor-card-photos', 'vendor-card-photos', true, 3145728, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
