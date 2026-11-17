-- Private bucket for lesson downloads. Course thumbnails and lesson videos keep
-- their existing public buckets; downloads are served through signed URLs.

insert into storage.buckets (id, name, public)
values ('lesson-resources', 'lesson-resources', false)
on conflict (id) do nothing;
