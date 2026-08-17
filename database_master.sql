-- =======================================================
-- FASE 9: DIRETÓRIOS E INTELIGÊNCIA + SEED DE POLÍTICOS
-- =======================================================

-- 1. Ampliação dos papéis no sistema (para Filiations ou Users)
-- Atualizando filiation_role ENUM se possível, ou usando VARCHAR(50).
-- A tabela filiations já tem role VARCHAR(50).
-- Valores possíveis agora: 'FILIADO', 'CANDIDATO', 'GESTOR_NACIONAL', 'GESTOR_ESTADUAL', 'GESTOR_MUNICIPAL'

-- 2. Tabela de Diretórios
CREATE TABLE IF NOT EXISTS public.directories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level VARCHAR(50) NOT NULL, -- 'NACIONAL', 'ESTADUAL', 'MUNICIPAL'
    name VARCHAR(255) NOT NULL,
    state_id VARCHAR(2), -- Opcional para NACIONAL
    city VARCHAR(255),   -- Opcional para NACIONAL e ESTADUAL
    president_name VARCHAR(255),
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ATIVO',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.directories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for directories" ON public.directories FOR ALL USING (true) WITH CHECK (true);

-- 3. Inserir alguns Diretórios Base
INSERT INTO public.directories (level, name, state_id, city, president_name) VALUES
('NACIONAL', 'Diretório Nacional Mobiliza', NULL, NULL, 'Antonio Carlos'),
('ESTADUAL', 'Diretório Estadual SP', 'SP', NULL, 'João Silva'),
('ESTADUAL', 'Diretório Estadual GO', 'GO', NULL, 'Maria Fernandes'),
('MUNICIPAL', 'Diretório Municipal Goiânia', 'GO', 'Goiânia', 'Carlos Pereira')
ON CONFLICT DO NOTHING;

-- 4. Seed: Injeção de Dados do TSE (Prefeitos, Senadores, Deputados, etc.)
-- Limpar tabela antes do seed apenas para garantir
-- TRUNCATE TABLE public.politicians;

INSERT INTO public.politicians (name, role, state_id, city, last_election_votes, status) VALUES
('Carlos Mendes', 'Prefeito', 'GO', 'Anápolis', 125000, 'ATIVO'),
('Roberto Almeida', 'Prefeito', 'SP', 'Guarulhos', 345000, 'ATIVO'),
('Fernanda Costa', 'Prefeito', 'MG', 'Betim', 190000, 'ATIVO'),
('Jorge Silva', 'Prefeito', 'BA', 'Feira de Santana', 185000, 'ATIVO'),
('Marcos Antonio', 'Senador', 'GO', NULL, 1200500, 'ATIVO'),
('Lucia Mendes', 'Senador', 'SP', NULL, 3500000, 'ATIVO'),
('Paulo Roberto', 'Governador', 'PR', NULL, 4200000, 'ATIVO'),
('Sandra Marques', 'Vice Governador', 'PR', NULL, 4200000, 'ATIVO'),
('João Peixoto', 'Deputado Federal', 'RJ', NULL, 150000, 'ATIVO'),
('Ricardo Ramos', 'Deputado Federal', 'GO', NULL, 110000, 'ATIVO'),
('Aline Freitas', 'Deputado Federal', 'MG', NULL, 135000, 'ATIVO'),
('Eduardo Cunha Filho', 'Deputado Estadual', 'SP', NULL, 85000, 'ATIVO'),
('Camila Rodrigues', 'Deputado Estadual', 'RS', NULL, 65000, 'ATIVO'),
('Fernando Gomes', 'Deputado Estadual', 'GO', NULL, 78000, 'ATIVO'),
('Sérgio Lima', 'Vereador', 'GO', 'Goiânia', 8500, 'ATIVO'),
('Ana Paula', 'Vereador', 'SP', 'São Paulo', 45000, 'ATIVO'),
('Thiago Barros', 'Vereador', 'RJ', 'Rio de Janeiro', 32000, 'ATIVO')
ON CONFLICT DO NOTHING;
