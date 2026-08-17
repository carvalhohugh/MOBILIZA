-- =======================================================
-- FASE 8: MOBILIZA TV VÍDEOS SECUNDÁRIOS
-- =======================================================

CREATE TABLE IF NOT EXISTS public.mobiliza_tv_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    youtube_id TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.mobiliza_tv_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all operations for tv_videos" ON public.mobiliza_tv_videos FOR ALL USING (true) WITH CHECK (true);
