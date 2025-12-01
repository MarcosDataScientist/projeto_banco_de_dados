-- ==========================================
-- SCHEMA DO BANCO DE DADOS (Atualizado)
-- Foco: Questionários de Múltipla Escolha
-- ==========================================

-- CREATE DATABASE project_lutica_beregula;

-- ==========================================
-- 1. TABELAS DE APOIO (RH/ADMINISTRATIVO)
-- ==========================================

CREATE TABLE IF NOT EXISTS Funcionario (
    cpf VARCHAR(11) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    setor VARCHAR(100),
    ctps VARCHAR(20) UNIQUE,
    tipo VARCHAR(50),
    status VARCHAR(50) NOT NULL -- Ex: 'Ativo', 'Desligado'
);

CREATE TABLE IF NOT EXISTS Treinamento (
    cod_treinamento SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    data_realizacao DATE,
    validade DATE,
    local VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS Classificacao (
    cod_classificacao SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE -- Ex: 'Onboarding', 'Clima', 'Desligamento'
);

-- ==========================================
-- 2. O NÚCLEO DO QUESTIONÁRIO (ESTRUTURA)
-- ==========================================

-- A Questão agora é simples (sem herança), pois tudo é múltipla escolha
CREATE TABLE IF NOT EXISTS Questao (
    cod_questao SERIAL PRIMARY KEY,
    texto_questao TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Ativa'
);

-- NOVA TABELA: Substitui o JSONB. Cada opção é uma linha.
-- Representa a relação "Questão CONTÉM Opções"
CREATE TABLE IF NOT EXISTS Opcao (
    cod_opcao SERIAL PRIMARY KEY,
    texto_opcao VARCHAR(255) NOT NULL, -- O texto da alternativa (Ex: "Sim", "Não")
    ordem INTEGER, -- Para ordenar (A, B, C...) na tela se necessário
    questao_cod INTEGER NOT NULL,
    CONSTRAINT fk_opcao_questao 
        FOREIGN KEY (questao_cod) 
        REFERENCES Questao(cod_questao) 
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Questionario (
    cod_questionario SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Rascunho',
    classificacao_cod INTEGER NOT NULL REFERENCES Classificacao(cod_classificacao)
);

-- Tabela Associativa: Quais questões compõem quais questionários
CREATE TABLE IF NOT EXISTS Questionario_Questao (
    questionario_cod INTEGER REFERENCES Questionario(cod_questionario) ON DELETE CASCADE,
    questao_cod INTEGER REFERENCES Questao(cod_questao) ON DELETE RESTRICT,
    PRIMARY KEY (questionario_cod, questao_cod)
);

-- ==========================================
-- 3. A EXECUÇÃO (AVALIAÇÃO E RESPOSTAS)
-- ==========================================

CREATE TABLE IF NOT EXISTS Avaliacao (
    cod_avaliacao SERIAL PRIMARY KEY,
    data_completa TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    local VARCHAR(255),
    observacao_geral TEXT, -- Antigo 'descricao', renomeado para evitar confusão
    rating_geral SMALLINT, -- Nota de 0 a 5 ou 0 a 10 para a avaliação como um todo
    
    -- Quem?
    avaliado_cpf VARCHAR(11) NOT NULL REFERENCES Funcionario(cpf),
    avaliador_cpf VARCHAR(11) NOT NULL REFERENCES Funcionario(cpf),
    
    -- Qual prova?
    questionario_cod INTEGER NOT NULL REFERENCES Questionario(cod_questionario)
);

-- A TABELA "RESPOSTA" (O Triângulo Final)
-- Conecta: A Avaliação + A Questão (Contexto) + A Opção (A Escolha)
CREATE TABLE IF NOT EXISTS Resposta (
    cod_resposta SERIAL PRIMARY KEY,
    
    -- 1. O Contexto (Onde e O quê)
    avaliacao_cod INTEGER NOT NULL REFERENCES Avaliacao(cod_avaliacao) ON DELETE CASCADE,
    questao_cod INTEGER NOT NULL REFERENCES Questao(cod_questao),
    
    -- 2. A Escolha (O relacionamento "Seleciona")
    opcao_cod INTEGER NOT NULL REFERENCES Opcao(cod_opcao),

    -- Regra de Ouro: Um usuário só pode responder UMA vez cada questão numa mesma avaliação.
    CONSTRAINT uk_uma_resposta_por_questao UNIQUE (avaliacao_cod, questao_cod)
);

-- ==========================================
-- 4. OUTROS RELACIONAMENTOS (LEGADO)
-- ==========================================

CREATE TABLE IF NOT EXISTS Funcionario_Treinamento (
    funcionario_cpf VARCHAR(11) REFERENCES Funcionario(cpf) ON DELETE CASCADE,
    treinamento_cod INTEGER REFERENCES Treinamento(cod_treinamento) ON DELETE CASCADE,
    n_certificado VARCHAR(100),
    PRIMARY KEY (funcionario_cpf, treinamento_cod)
);

CREATE TABLE IF NOT EXISTS Funcionario_Classificacao (
    funcionario_cpf VARCHAR(11) REFERENCES Funcionario(cpf) ON DELETE CASCADE,
    classificacao_cod INTEGER REFERENCES Classificacao(cod_classificacao) ON DELETE CASCADE,
    PRIMARY KEY (funcionario_cpf, classificacao_cod)
);

-- ==========================================
-- ÍNDICES (Mantidos e Ajustados)
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_opcao_questao ON Opcao(questao_cod); -- Importante para joins
CREATE INDEX IF NOT EXISTS idx_resposta_avaliacao ON Resposta(avaliacao_cod);
CREATE INDEX IF NOT EXISTS idx_resposta_questao ON Resposta(questao_cod);
CREATE INDEX IF NOT EXISTS idx_resposta_opcao ON Resposta(opcao_cod); -- Novo índice para análise estatística