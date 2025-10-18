-- ==========================================
-- SCHEMA DO BANCO DE DADOS
-- Sistema de Avaliação de Desligamento
-- ==========================================

-- CREATE DATABASE project_lutica_beregula;

-- ==========================================
-- TABELAS PRINCIPAIS
-- ==========================================

-- Tabela de Funcionários
CREATE TABLE IF NOT EXISTS Funcionario (
    cpf VARCHAR(11) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    setor VARCHAR(100),
    ctps VARCHAR(20) UNIQUE,
    tipo VARCHAR(50),
    status VARCHAR(50) NOT NULL
);

-- Tabela de Treinamentos
CREATE TABLE IF NOT EXISTS Treinamento (
    cod_treinamento SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    data_realizacao DATE,
    validade DATE,
    local VARCHAR(255)
);

-- Tabela de Classificações
CREATE TABLE IF NOT EXISTS Classificacao (
    cod_classificacao SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE
);

-- Tabela de Questões
CREATE TABLE IF NOT EXISTS Questao (
    cod_questao SERIAL PRIMARY KEY,
    tipo_questao VARCHAR(50) NOT NULL,
    texto_questao TEXT NOT NULL,
    status VARCHAR(50) NOT NULL
);

-- Tabela de Questões de Múltipla Escolha
CREATE TABLE IF NOT EXISTS Questao_Multipla_Escolha (
    questao_cod INTEGER PRIMARY KEY,
    opcoes JSONB NOT NULL,
    CONSTRAINT fk_questao_multipla
        FOREIGN KEY(questao_cod) 
        REFERENCES Questao(cod_questao)
        ON DELETE CASCADE
);

-- Tabela de Questões de Texto Livre
CREATE TABLE IF NOT EXISTS Questao_Texto_Livre (
    questao_cod INTEGER PRIMARY KEY,
    CONSTRAINT fk_questao_texto
        FOREIGN KEY(questao_cod) 
        REFERENCES Questao(cod_questao)
        ON DELETE CASCADE
);

-- Tabela de Questionários
CREATE TABLE IF NOT EXISTS Questionario (
    cod_questionario SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(100),
    status VARCHAR(50) NOT NULL,
    classificacao_cod INTEGER NOT NULL REFERENCES Classificacao(cod_classificacao) ON DELETE RESTRICT
);

-- Tabela de Avaliações
CREATE TABLE IF NOT EXISTS Avaliacao (
    cod_avaliacao SERIAL PRIMARY KEY,
    local VARCHAR(255),
    data_completa TIMESTAMP WITH TIME ZONE NOT NULL,
    descricao TEXT,
    rating SMALLINT,
    avaliado_cpf VARCHAR(11) NOT NULL REFERENCES Funcionario(cpf),
    avaliador_cpf VARCHAR(11) NOT NULL REFERENCES Funcionario(cpf),
    questionario_cod INTEGER NOT NULL REFERENCES Questionario(cod_questionario)
);

-- Tabela de Respostas
CREATE TABLE IF NOT EXISTS Resposta (
    cod_resposta SERIAL PRIMARY KEY,
    tipo_resposta VARCHAR(50) NOT NULL,
    avaliacao_cod INTEGER NOT NULL REFERENCES Avaliacao(cod_avaliacao) ON DELETE CASCADE,
    questao_cod INTEGER NOT NULL REFERENCES Questao(cod_questao) ON DELETE RESTRICT
);

-- Tabela de Respostas de Texto
CREATE TABLE IF NOT EXISTS Resposta_Texto (
    resposta_cod INTEGER PRIMARY KEY REFERENCES Resposta(cod_resposta) ON DELETE CASCADE,
    texto_resposta TEXT NOT NULL
);

-- Tabela de Respostas de Escolha
CREATE TABLE IF NOT EXISTS Resposta_Escolha (
    resposta_cod INTEGER PRIMARY KEY REFERENCES Resposta(cod_resposta) ON DELETE CASCADE,
    escolha TEXT NOT NULL
);

-- ==========================================
-- TABELAS DE RELACIONAMENTO
-- ==========================================

-- Relacionamento Funcionário-Treinamento
CREATE TABLE IF NOT EXISTS Funcionario_Treinamento (
    funcionario_cpf VARCHAR(11) REFERENCES Funcionario(cpf) ON DELETE CASCADE,
    treinamento_cod INTEGER REFERENCES Treinamento(cod_treinamento) ON DELETE CASCADE,
    n_certificado VARCHAR(100),
    PRIMARY KEY (funcionario_cpf, treinamento_cod)
);

-- Relacionamento Questionário-Questão
CREATE TABLE IF NOT EXISTS Questionario_Questao (
    questionario_cod INTEGER REFERENCES Questionario(cod_questionario) ON DELETE CASCADE,
    questao_cod INTEGER REFERENCES Questao(cod_questao) ON DELETE CASCADE,
    PRIMARY KEY (questionario_cod, questao_cod)
);

-- Relacionamento Funcionário-Classificação
CREATE TABLE IF NOT EXISTS Funcionario_Classificacao (
    funcionario_cpf VARCHAR(11) REFERENCES Funcionario(cpf) ON DELETE CASCADE,
    classificacao_cod INTEGER REFERENCES Classificacao(cod_classificacao) ON DELETE CASCADE,
    PRIMARY KEY (funcionario_cpf, classificacao_cod)
);

-- ==========================================
-- ÍNDICES PARA PERFORMANCE
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_funcionario_status ON Funcionario(status);
CREATE INDEX IF NOT EXISTS idx_funcionario_setor ON Funcionario(setor);
CREATE INDEX IF NOT EXISTS idx_questao_status ON Questao(status);
CREATE INDEX IF NOT EXISTS idx_questao_tipo ON Questao(tipo_questao);
CREATE INDEX IF NOT EXISTS idx_questionario_status ON Questionario(status);
CREATE INDEX IF NOT EXISTS idx_questionario_classificacao ON Questionario(classificacao_cod);
CREATE INDEX IF NOT EXISTS idx_avaliacao_avaliado ON Avaliacao(avaliado_cpf);
CREATE INDEX IF NOT EXISTS idx_avaliacao_avaliador ON Avaliacao(avaliador_cpf);
CREATE INDEX IF NOT EXISTS idx_avaliacao_questionario ON Avaliacao(questionario_cod);
CREATE INDEX IF NOT EXISTS idx_avaliacao_data ON Avaliacao(data_completa);
CREATE INDEX IF NOT EXISTS idx_resposta_avaliacao ON Resposta(avaliacao_cod);
CREATE INDEX IF NOT EXISTS idx_resposta_questao ON Resposta(questao_cod);
