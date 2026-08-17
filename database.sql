-- Schema Inicial MOBILIZA 33

-- Extension para suporte geoespacial e id universal
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enumerações
CREATE TYPE representation_type AS ENUM ('ESTADUAL', 'MUNICIPAL', 'SEDE');
CREATE TYPE representation_status AS ENUM ('ATIVA', 'IMPLANTACAO', 'INATIVA');

-- Tabela: Representações
CREATE TABLE representations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    state_id VARCHAR(2) NOT NULL, -- Ex: 'GO', 'SP'
    city VARCHAR(255) NOT NULL,
    type representation_type NOT NULL,
    status representation_status DEFAULT 'ATIVA',
    address TEXT,
    zip_code VARCHAR(20),
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    instagram VARCHAR(255),
    facebook VARCHAR(255),
    responsible_name VARCHAR(255),
    description TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE representations ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso
-- Políticas de Acesso (Modo Dev/MVP: Tudo Liberado)
CREATE POLICY "Enable all operations for everyone" 
ON representations FOR ALL 
USING ( true ) WITH CHECK ( true );

-- Função e Trigger para atualizar o updated_at automaticamente
CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$ language 'plpgsql';

CREATE TRIGGER update_representations_modtime 
BEFORE UPDATE ON representations 
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Ativar Supabase Realtime para a tabela representations
alter publication supabase_realtime add table representations;

-- =======================================================
-- NOVAS TABELAS: FASE 3 E 4
-- =======================================================

-- Tabela: Configurações do Sistema
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for settings" ON settings FOR ALL USING (true) WITH CHECK (true);

-- Tabela: Políticos Eleitos
CREATE TABLE politicians (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL, -- Ex: 'Governador', 'Deputado Federal'
    state_id VARCHAR(2) NOT NULL,
    city VARCHAR(255),
    photo_url TEXT,
    last_election_votes INTEGER,
    bio TEXT,
    status VARCHAR(50) DEFAULT 'ATIVO',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE politicians ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for politicians" ON politicians FOR ALL USING (true) WITH CHECK (true);

-- Tabela: Notícias (Blog)
CREATE TABLE news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    cover_image TEXT,
    author VARCHAR(255),
    status VARCHAR(50) DEFAULT 'PUBLICADO',
    published_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for news" ON news FOR ALL USING (true) WITH CHECK (true);

-- Ativar Realtime para as novas tabelas
alter publication supabase_realtime add table settings;
alter publication supabase_realtime add table politicians;
alter publication supabase_realtime add table news;

-- Tabela: Banners da Home
CREATE TABLE banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255),
    image_url TEXT NOT NULL,
    link_url TEXT,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for banners" ON banners FOR ALL USING (true) WITH CHECK (true);

-- Tabela: Sites Confiáveis (Feeds RSS)
CREATE TABLE trusted_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    rss_url TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'ATIVO',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE trusted_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for trusted_sources" ON trusted_sources FOR ALL USING (true) WITH CHECK (true);

-- Ativar Realtime para as novas tabelas
alter publication supabase_realtime add table banners;
alter publication supabase_realtime add table trusted_sources;

-- =======================================================
-- FASE 6: FILIAÇÕES E USUÁRIOS
-- =======================================================

CREATE TYPE filiation_status AS ENUM ('PENDENTE', 'APROVADO', 'REJEITADO', 'SUSPENSO');

CREATE TABLE filiations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id), -- Conectado ao sistema de Auth do Supabase
    full_name VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    whatsapp VARCHAR(20),
    state_id VARCHAR(2) NOT NULL,
    city VARCHAR(255) NOT NULL,
    status filiation_status DEFAULT 'PENDENTE',
    role VARCHAR(50) DEFAULT 'FILIADO', -- FILIADO, CANDIDATO, ADMIN
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE filiations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all operations for filiations" ON filiations FOR ALL USING (true) WITH CHECK (true);

alter publication supabase_realtime add table filiations;
-- Create Donations Table
CREATE TABLE IF NOT EXISTS public.donations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    donor_name TEXT NOT NULL,
    donor_cpf TEXT NOT NULL,
    donor_email TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),
    pix_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Filiation Wizard Tables

-- membership_steps
CREATE TABLE IF NOT EXISTS public.membership_steps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    step_number INTEGER NOT NULL UNIQUE,
    title TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- membership_documents
CREATE TABLE IF NOT EXISTS public.membership_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    url TEXT,
    button_text TEXT DEFAULT 'Ler Documento',
    is_active BOOLEAN DEFAULT true,
    is_required BOOLEAN DEFAULT true,
    requires_confirmation BOOLEAN DEFAULT true,
    step_number INTEGER DEFAULT 8,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- membership_participation
CREATE TABLE IF NOT EXISTS public.membership_participation (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- membership_interests
CREATE TABLE IF NOT EXISTS public.membership_interests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ALTER filiations to support draft and tracking
ALTER TABLE public.filiations 
ADD COLUMN IF NOT EXISTS protocol TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS current_step INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS participation_options JSONB,
ADD COLUMN IF NOT EXISTS interests JSONB,
ADD COLUMN IF NOT EXISTS accepted_documents JSONB;

-- Seed Default Steps
INSERT INTO public.membership_steps (step_number, title, is_active, is_required)
VALUES 
(1, 'Identificação', true, true),
(2, 'Dados Eleitorais', true, true),
(3, 'Contato', true, true),
(4, 'Endereço', true, true),
(5, 'Participação', true, false),
(6, 'Áreas de Interesse', true, false),
(7, 'Declarações e Documentos', true, true),
(8, 'Revisão', true, true)
ON CONFLICT (step_number) DO NOTHING;

-- Seed Default Participation
INSERT INTO public.membership_participation (name, description)
VALUES 
('Participação Partidária', 'Quero ajudar ativamente nas decisões do partido.'),
('Voluntariado', 'Disponível para ajudar em campanhas e eventos.'),
('Mobilização Digital', 'Quero ajudar espalhando a mensagem na internet.')
ON CONFLICT DO NOTHING;

-- Seed Default Interests
INSERT INTO public.membership_interests (name)
VALUES 
('Tecnologia'), ('Saúde'), ('Educação'), ('Comunicação'), ('Marketing'), ('Esportes')
ON CONFLICT DO NOTHING;
