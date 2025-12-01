-- ==========================================
-- SEED COMPLETA - DADOS EXTENSOS
-- Sistema de Avaliação
-- Modelo 2: Apenas Múltipla Escolha
-- Período: 2023-2024
-- ==========================================
-- 
-- Este arquivo contém dados extensos para testes e desenvolvimento:
-- - ~200 funcionários
-- - ~30 questões
-- - ~10 questionários
-- - ~500 avaliações
-- - Distribuídas entre 2023-2024
--
-- ATENÇÃO: Este seed é extenso. Execute em ambiente de desenvolvimento/teste.
-- ==========================================

-- Limpar dados existentes (CUIDADO: Isso apaga tudo!)
-- Descomente as linhas abaixo se desejar limpar antes de inserir:
-- TRUNCATE TABLE Resposta CASCADE;
-- TRUNCATE TABLE Avaliacao CASCADE;
-- TRUNCATE TABLE Questionario_Questao CASCADE;
-- TRUNCATE TABLE Opcao CASCADE;
-- TRUNCATE TABLE Questao CASCADE;
-- TRUNCATE TABLE Questionario CASCADE;
-- TRUNCATE TABLE Funcionario_Classificacao CASCADE;
-- TRUNCATE TABLE Funcionario_Treinamento CASCADE;
-- TRUNCATE TABLE Treinamento CASCADE;
-- TRUNCATE TABLE Classificacao CASCADE;
-- TRUNCATE TABLE Funcionario CASCADE;

-- ==========================================
-- ETAPA 1: ESTRUTURA BASE
-- ==========================================

-- ==========================================
-- 1. FUNCIONÁRIOS (Parte 1 - Primeiros 50)
-- ==========================================
-- Distribuição: ~70% Ativo, ~30% Desligado
-- Setores: TI, RH, Vendas, Marketing, Financeiro, Operações, Jurídico, Compras

INSERT INTO Funcionario (cpf, nome, email, setor, ctps, tipo, status) VALUES
-- Setor TI (10 funcionários)
('10000000001', 'João Silva', 'joa4o.silva@empresa.com', 'TI', 'CTPS00001', 'CLT', 'Ativo'),
('10000000002', 'Carlos Pereira', 'carlos.pereira@empresa.com', 'TI', 'CTPS00002', 'CLT', 'Ativo'),
('10000000003', 'Lucas Martins', 'luc5as.martins@empresa.com', 'TI', 'CTPS00003', 'CLT', 'Ativo'),
('10000000004', 'Rafael Costa', 'rafael.costa@empresa.com', 'TI', 'CTPS00004', 'CLT', 'Ativo'),
('10000000005', 'Fernando Alves', 'f6ernando.alves@empresa.com', 'TI', 'CTPS00005', 'CLT', 'Ativo'),
('10000000006', 'Bruno Santos', 'brun5o.santos@empresa.com', 'TI', 'CTPS00006', 'CLT', 'Ativo'),
('10000000007', 'Diego Oliveira', 'di5ego.oliveira@empresa.com', 'TI', 'CTPS00007', 'CLT', 'Ativo'),
('10000000008', 'Thiago Lima', 'thiag4o.lima@empresa.com', 'TI', 'CTPS00008', 'CLT', 'Ativo'),
('10000000009', 'Marcos Souza', 'marc5os.souza@empresa.com', 'TI', 'CTPS00009', 'CLT', 'Desligado'),
('10000000010', 'Paulo Ferreira', 'p6aulo.ferreira@empresa.com', 'TI', 'CTPS00010', 'CLT', 'Desligado'),

-- Setor RH (8 funcionários)
('10000000011', 'Maria Santos', 'mar5ia.santos@empresa.com', 'RH', 'CTPS00011', 'CLT', 'Ativo'),
('10000000012', 'Patricia Souza', 'pat6ricia.souza@empresa.com', 'RH', 'CTPS00012', 'CLT', 'Ativo'),
('10000000013', 'Juliana Ferreira', 'ju4liana.ferreira@empresa.com', 'RH', 'CTPS00013', 'CLT', 'Desligado'),
('10000000014', 'Camila Rodrigues', 'ca2mila.rodrigues@empresa.com', 'RH', 'CTPS00014', 'CLT', 'Ativo'),
('10000000015', 'Amanda Silva', 'amanda3.silva@empresa.com', 'RH', 'CTPS00015', 'CLT', 'Ativo'),
('10000000016', 'Beatriz Costa', 'beat4riz.costa@empresa.com', 'RH', 'CTPS00016', 'CLT', 'Ativo'),
('10000000017', 'Larissa Almeida', 'la5rissa.almeida@empresa.com', 'RH', 'CTPS00017', 'CLT', 'Ativo'),
('10000000018', 'Renata Barbosa', 'ren6ata.barbosa@empresa.com', 'RH', 'CTPS00018', 'CLT', 'Desligado'),

-- Setor Vendas (8 funcionários)
('10000000019', 'Pedro Oliveira', 'pedro.oliveira@empresa.com', 'Vendas', 'CTPS00019', 'CLT', 'Ativo'),
('10000000020', 'Roberto Alves', 'roberto.alves@empresa.com', 'Vendas', 'CTPS00020', 'CLT', 'Desligado'),
('10000000021', 'Ricardo Mendes', 'ricardo.mendes@empresa.com', 'Vendas', 'CTPS00021', 'CLT', 'Ativo'),
('10000000022', 'Felipe Rocha', 'felipe.rocha@empresa.com', 'Vendas', 'CTPS00022', 'CLT', 'Ativo'),
('10000000023', 'Gustavo Nunes', 'gustavo.nunes@empresa.com', 'Vendas', 'CTPS00023', 'CLT', 'Ativo'),
('10000000024', 'André Dias', 'andre.dias@empresa.com', 'Vendas', 'CTPS00024', 'CLT', 'Ativo'),
('10000000025', 'Rodrigo Campos', 'rodrigo.campos@empresa.com', 'Vendas', 'CTPS00025', 'CLT', 'Ativo'),
('10000000026', 'Eduardo Monteiro', 'eduardo.monteiro@empresa.com', 'Vendas', 'CTPS00026', 'CLT', 'Desligado'),

-- Setor Marketing (6 funcionários)
('10000000027', 'Ana Costa', 'ana.cos5ta@empresa.com', 'Marketing', 'CTPS00027', 'CLT', 'Ativo'),
('10000000028', 'Fernanda Lima', 'fernan7da.lima@empresa.com', 'Marketing', 'CTPS00028', 'CLT', 'Ativo'),
('10000000029', 'Mariana Araujo', 'maria6na.araujo@empresa.com', 'Marketing', 'CTPS00029', 'CLT', 'Ativo'),
('10000000030', 'Isabela Cardoso', 'isab3ela.cardoso@empresa.com', 'Marketing', 'CTPS00030', 'CLT', 'Ativo'),
('10000000031', 'Gabriela Moura', 'gab4riela.moura@empresa.com', 'Marketing', 'CTPS00031', 'CLT', 'Ativo'),
('10000000032', 'Carolina Ribeiro', 'caro1lina.ribeiro@empresa.com', 'Marketing', 'CTPS00032', 'CLT', 'Desligado'),

-- Setor Financeiro (6 funcionários)
('10000000033', 'Roberta Gomes', 'robert1a.gomes@empresa.com', 'Financeiro', 'CTPS00033', 'CLT', 'Ativo'),
('10000000034', 'Vanessa Teixeira', 'vane5ssa.teixeira@empresa.com', 'Financeiro', 'CTPS00034', 'CLT', 'Ativo'),
('10000000035', 'Daniela Freitas', 'danie61la.freitas@empresa.com', 'Financeiro', 'CTPS00035', 'CLT', 'Ativo'),
('10000000036', 'Monica Azevedo', 'monic3a.azevedo@empresa.com', 'Financeiro', 'CTPS00036', 'CLT', 'Ativo'),
('10000000037', 'Cristina Machado', 'cris4tina.machado@empresa.com', 'Financeiro', 'CTPS00037', 'CLT', 'Ativo'),
('10000000038', 'Sandra Pires', 'sandr54a.pires@empresa.com', 'Financeiro', 'CTPS00038', 'CLT', 'Desligado'),

-- Setor Operações (6 funcionários)
('10000000039', 'Antonio Carvalho', 'anton3io.carvalho@empresa.com', 'Operações', 'CTPS00039', 'CLT', 'Ativo'),
('10000000040', 'Jose Ribeiro', 'jose.ribe1iro@empresa.com', 'Operações', 'CTPS00040', 'CLT', 'Ativo'),
('10000000041', 'Francisco Lopes', 'fra3c3isco.lopes@empresa.com', 'Operações', 'CTPS00041', 'CLT', 'Ativo'),
('10000000042', 'Mauricio Cunha', 'mauricio6.cunha@empresa.com', 'Operações', 'CTPS00042', 'CLT', 'Ativo'),
('10000000043', 'Wagner Moreira', 'wagn51e6r.moreira@empresa.com', 'Operações', 'CTPS00043', 'CLT', 'Ativo'),
('10000000044', 'Leandro Ramos', 'leand44ro.ramos@empresa.com', 'Operações', 'CTPS00044', 'CLT', 'Desligado'),

-- Setor Jurídico (3 funcionários)
('10000000045', 'Marcia Barros', 'mar5cia.barros@empresa.com', 'Jurídico', 'CTPS00045', 'CLT', 'Ativo'),
('10000000046', 'Carla Rezende', 'car4la.rezende@empresa.com', 'Jurídico', 'CTPS00046', 'CLT', 'Ativo'),
('10000000047', 'Adriana Vasconcelos', 'a3driana.vasconcelos@empresa.com', 'Jurídico', 'CTPS00047', 'CLT', 'Ativo'),

-- Setor Compras (3 funcionários)
('10000000048', 'Helena Duarte', 'helena1.duarte@empresa.com', 'Compras', 'CTPS00048', 'CLT', 'Ativo'),
('10000000049', 'Tatiana Fonseca', 'tatiana2.fonseca@empresa.com', 'Compras', 'CTPS00049', 'CLT', 'Ativo'),
('10000000050', 'Priscila Guimaraes', 'pris2cila.guimaraes@empresa.com', 'Compras', 'CTPS00050', 'CLT', 'Ativo'),

-- ==========================================
-- ETAPA 2: MAIS FUNCIONÁRIOS (51-200)
-- ==========================================

-- Setor TI - Continuação (10 funcionários)
('10000000051', 'Andre Luiz', 'andre.luiz@empresa.com', 'TI', 'CTPS00051', 'CLT', 'Ativo'),
('10000000052', 'Vinicius Rocha', 'vinicius.rocha@empresa.com', 'TI', 'CTPS00052', 'CLT', 'Ativo'),
('10000000053', 'Gabriel Nascimento', 'gabriel.nascimento@empresa.com', 'TI', 'CTPS00053', 'CLT', 'Ativo'),
('10000000054', 'Matheus Araujo', 'matheus.araujo@empresa.com', 'TI', 'CTPS00054', 'CLT', 'Ativo'),
('10000000055', 'Henrique Melo', 'henrique.melo@empresa.com', 'TI', 'CTPS00055', 'CLT', 'Ativo'),
('10000000056', 'Guilherme Castro', 'guilherme.castro@empresa.com', 'TI', 'CTPS00056', 'CLT', 'Ativo'),
('10000000057', 'Leonardo Barbosa', 'leonardo.barbosa@empresa.com', 'TI', 'CTPS00057', 'CLT', 'Ativo'),
('10000000058', 'Igor Mendes', 'igor.mendes@empresa.com', 'TI', 'CTPS00058', 'CLT', 'Ativo'),
('10000000059', 'Fabricio Dias', 'fabricio.dias@empresa.com', 'TI', 'CTPS00059', 'CLT', 'Desligado'),
('10000000060', 'Renato Gomes', 'renato.gomes@empresa.com', 'TI', 'CTPS00060', 'CLT', 'Desligado'),

-- Setor RH - Continuação (12 funcionários)
('10000000061', 'Simone Torres', 'simon5e.torres@empresa.com', 'RH', 'CTPS00061', 'CLT', 'Ativo'),
('10000000062', 'Viviane Martins', 'vi2viane.martins@empresa.com', 'RH', 'CTPS00062', 'CLT', 'Ativo'),
('10000000063', 'Cintia Rocha', 'cinti45a.rocha@empresa.com', 'RH', 'CTPS00063', 'CLT', 'Ativo'),
('10000000064', 'Fabiana Nunes', 'fabi5ana.nunes@empresa.com', 'RH', 'CTPS00064', 'CLT', 'Ativo'),
('10000000065', 'Gisele Campos', 'gisel4e.campos@empresa.com', 'RH', 'CTPS00065', 'CLT', 'Ativo'),
('10000000066', 'Luciana Monteiro', 'l43uciana.monteiro@empresa.com', 'RH', 'CTPS00066', 'CLT', 'Ativo'),
('10000000067', 'Sabrina Cardoso', 'sab3rina.cardoso@empresa.com', 'RH', 'CTPS00067', 'CLT', 'Ativo'),
('10000000068', 'Taisa Moura', 'tais45a.moura@empresa.com', 'RH', 'CTPS00068', 'CLT', 'Ativo'),
('10000000069', 'Natalia Ribeiro', 'nat5alia.ribeiro@empresa.com', 'RH', 'CTPS00069', 'CLT', 'Ativo'),
('10000000070', 'Danielle Teixeira', 'dan6ielle.teixeira@empresa.com', 'RH', 'CTPS00070', 'CLT', 'Ativo'),
('10000000071', 'Aline Freitas', 'ali3ne.freitas@empresa.com', 'RH', 'CTPS00071', 'CLT', 'Desligado'),
('10000000072', 'Eliane Azevedo', 'eli4ane.azevedo@empresa.com', 'RH', 'CTPS00072', 'CLT', 'Desligado'),

-- Setor Vendas - Continuação (12 funcionários)
('10000000073', 'Marcelo Carvalho', 'mar6celo.carvalho@empresa.com', 'Vendas', 'CTPS00073', 'CLT', 'Ativo'),
('10000000074', 'Alexandre Ribeiro', 'ale4xandre.ribeiro@empresa.com', 'Vendas', 'CTPS00074', 'CLT', 'Ativo'),
('10000000075', 'Fabio Lopes', 'fabi2o.lopes@empresa.com', 'Vendas', 'CTPS00075', 'CLT', 'Ativo'),
('10000000076', 'Marcos Cunha', 'marc4os.cunha@empresa.com', 'Vendas', 'CTPS00076', 'CLT', 'Ativo'),
('10000000077', 'Sergio Moreira', 'sergi6o.moreira@empresa.com', 'Vendas', 'CTPS00077', 'CLT', 'Ativo'),
('10000000078', 'Leonardo Ramos', 'leon5ardo.ramos@empresa.com', 'Vendas', 'CTPS00078', 'CLT', 'Ativo'),
('10000000079', 'Rafael Barros', 'raf6ael.barros@empresa.com', 'Vendas', 'CTPS00079', 'CLT', 'Ativo'),
('10000000080', 'Caio Rezende', 'caio4.rezende@empresa.com', 'Vendas', 'CTPS00080', 'CLT', 'Ativo'),
('10000000081', 'Lucas Vasconcelos', 'lu5cas.vasconcelos@empresa.com', 'Vendas', 'CTPS00081', 'CLT', 'Ativo'),
('10000000082', 'Enzo Duarte', 'enz6o.duarte@empresa.com', 'Vendas', 'CTPS00082', 'CLT', 'Ativo'),
('10000000083', 'Arthur Fonseca', 'arth4ur.fonseca@empresa.com', 'Vendas', 'CTPS00083', 'CLT', 'Desligado'),
('10000000084', 'Bernardo Guimaraes', 'ber3nardo.guimaraes@empresa.com', 'Vendas', 'CTPS00084', 'CLT', 'Desligado'),

-- Setor Marketing - Continuação (14 funcionários)
('10000000085', 'Leticia Torres', 'leti5cia.torres@empresa.com', 'Marketing', 'CTPS00085', 'CLT', 'Ativo'),
('10000000086', 'Bruna Martins', 'brun6a.martins@empresa.com', 'Marketing', 'CTPS00086', 'CLT', 'Ativo'),
('10000000087', 'Jessica Rocha', 'jessi4ca.rocha@empresa.com', 'Marketing', 'CTPS00087', 'CLT', 'Ativo'),
('10000000088', 'Thais Nunes', 'thai3s.5nunes@empresa.com', 'Marketing', 'CTPS00088', 'CLT', 'Ativo'),
('10000000089', 'Raquel Campos', 'raqu6el.campos@empresa.com', 'Marketing', 'CTPS00089', 'CLT', 'Ativo'),
('10000000090', 'Debora Monteiro', 'debor6a.monteiro@empresa.com', 'Marketing', 'CTPS00090', 'CLT', 'Ativo'),
('10000000091', 'Alessandra Cardoso', 'ale4ssandra.cardoso@empresa.com', 'Marketing', 'CTPS00091', 'CLT', 'Ativo'),
('10000000092', 'Fernanda Moura', 'ferna3nda.moura@empresa.com', 'Marketing', 'CTPS00092', 'CLT', 'Ativo'),
('10000000093', 'Pamela Ribeiro', 'pame5la.ribeiro@empresa.com', 'Marketing', 'CTPS00093', 'CLT', 'Ativo'),
('10000000094', 'Luciana Teixeira', 'lu3ciana.teixeira@empresa.com', 'Marketing', 'CTPS00094', 'CLT', 'Ativo'),
('10000000095', 'Carla Freitas', 'carla5.freitas@empresa.com', 'Marketing', 'CTPS00095', 'CLT', 'Ativo'),
('10000000096', 'Renata Azevedo', 'ren6ata.azevedo@empresa.com', 'Marketing', 'CTPS00096', 'CLT', 'Ativo'),
('10000000097', 'Sonia Machado', 'sonia4.machado@empresa.com', 'Marketing', 'CTPS00097', 'CLT', 'Desligado'),
('10000000098', 'Regina Pires', 'regi6na.pires@empresa.com', 'Marketing', 'CTPS00098', 'CLT', 'Desligado'),

-- Setor Financeiro - Continuação (14 funcionários)
('10000000099', 'Roberto Carvalho', 'robe4rto.carvalho@empresa.com', 'Financeiro', 'CTPS00099', 'CLT', 'Ativo'),
('10000000100', 'Jose Ribeiro', 'jose5.ribeiro.financeiro@empresa.com', 'Financeiro', 'CTPS00100', 'CLT', 'Ativo'),
('10000000101', 'Francisco Lopes', 'fr3ancisco.lopes.financeiro@empresa.com', 'Financeiro', 'CTPS00101', 'CLT', 'Ativo'),
('10000000102', 'Mauricio Cunha', 'maur5icio.cunha@empresa.com', 'Financeiro', 'CTPS00102', 'CLT', 'Ativo'),
('10000000103', 'Wagner Moreira', 'wagn4er.moreira@empresa.com', 'Financeiro', 'CTPS00103', 'CLT', 'Ativo'),
('10000000104', 'Leandro Ramos', 'lean6dro.ramos@empresa.com', 'Financeiro', 'CTPS00104', 'CLT', 'Ativo'),
('10000000105', 'Marcos Barros', 'marc2os.barros@empresa.com', 'Financeiro', 'CTPS00105', 'CLT', 'Ativo'),
('10000000106', 'Paulo Rezende', 'paul3o.rezende@empresa.com', 'Financeiro', 'CTPS00106', 'CLT', 'Ativo'),
('10000000107', 'Carlos Vasconcelos', 'ca3rlos.vasconcelos@empresa.com', 'Financeiro', 'CTPS00107', 'CLT', 'Ativo'),
('10000000108', 'Pedro Duarte', 'ped4ro.duarte@empresa.com', 'Financeiro', 'CTPS00108', 'CLT', 'Ativo'),
('10000000109', 'Ricardo Fonseca', 'rica6rdo.fonseca@empresa.com', 'Financeiro', 'CTPS00109', 'CLT', 'Ativo'),
('10000000110', 'Felipe Guimaraes', 'fe4lipe.guimaraes@empresa.com', 'Financeiro', 'CTPS00110', 'CLT', 'Ativo'),
('10000000111', 'Gustavo Torres', 'gust3avo.torres@empresa.com', 'Financeiro', 'CTPS00111', 'CLT', 'Desligado'),
('10000000112', 'Andre Martins', 'andre.3martins@empresa.com', 'Financeiro', 'CTPS00112', 'CLT', 'Desligado'),

-- Setor Operações - Continuação (14 funcionários)
('10000000113', 'Rodrigo Rocha', 'rodri3go.rocha@empresa.com', 'Operações', 'CTPS00113', 'CLT', 'Ativo'),
('10000000114', 'Eduardo Nunes', 'eduar4do.nunes@empresa.com', 'Operações', 'CTPS00114', 'CLT', 'Ativo'),
('10000000115', 'Vinicius Campos', 'vin6icius.campos@empresa.com', 'Operações', 'CTPS00115', 'CLT', 'Ativo'),
('10000000116', 'Gabriel Monteiro', 'gab6riel.monteiro@empresa.com', 'Operações', 'CTPS00116', 'CLT', 'Ativo'),
('10000000117', 'Matheus Cardoso', 'matheu4s.cardoso@empresa.com', 'Operações', 'CTPS00117', 'CLT', 'Ativo'),
('10000000118', 'Henrique Moura', 'henriq4ue.moura@empresa.com', 'Operações', 'CTPS00118', 'CLT', 'Ativo'),
('10000000119', 'Guilherme Ribeiro', 'guil6herme.ribeiro@empresa.com', 'Operações', 'CTPS00119', 'CLT', 'Ativo'),
('10000000120', 'Leonardo Teixeira', 'leon6ardo.teixeira@empresa.com', 'Operações', 'CTPS00120', 'CLT', 'Ativo'),
('10000000121', 'Igor Freitas', 'igor.frei4tas@empresa.com', 'Operações', 'CTPS00121', 'CLT', 'Ativo'),
('10000000122', 'Fabricio Azevedo', 'fab4ricio.azevedo@empresa.com', 'Operações', 'CTPS00122', 'CLT', 'Ativo'),
('10000000123', 'Renato Machado', 'rena4to.machado@empresa.com', 'Operações', 'CTPS00123', 'CLT', 'Ativo'),
('10000000124', 'Marcelo Pires', 'mar6celo.pires@empresa.com', 'Operações', 'CTPS00124', 'CLT', 'Ativo'),
('10000000125', 'Alexandre Carvalho', 'ale4xandre.carvalho@empresa.com', 'Operações', 'CTPS00125', 'CLT', 'Desligado'),
('10000000126', 'Fabio Ribeiro', 'fabi4o.ribeiro@empresa.com', 'Operações', 'CTPS00126', 'CLT', 'Desligado'),

-- Setor Jurídico - Continuação (7 funcionários)
('10000000127', 'Marcia Lopes', 'marc3ia.lopes@empresa.com', 'Jurídico', 'CTPS00127', 'CLT', 'Ativo'),
('10000000128', 'Carla Cunha', 'carl5a.cunha@empresa.com', 'Jurídico', 'CTPS00128', 'CLT', 'Ativo'),
('10000000129', 'Adriana Moreira', 'a4driana.moreira@empresa.com', 'Jurídico', 'CTPS00129', 'CLT', 'Ativo'),
('10000000130', 'Helena Ramos', 'hele6na.ramos@empresa.com', 'Jurídico', 'CTPS00130', 'CLT', 'Ativo'),
('10000000131', 'Tatiana Barros', 'tatian5a.barros@empresa.com', 'Jurídico', 'CTPS00131', 'CLT', 'Ativo'),
('10000000132', 'Priscila Rezende', 'pr4iscila.rezende@empresa.com', 'Jurídico', 'CTPS00132', 'CLT', 'Ativo'),
('10000000133', 'Simone Vasconcelos', 'simo3ne.vasconcelos@empresa.com', 'Jurídico', 'CTPS00133', 'CLT', 'Desligado'),

-- Setor Compras - Continuação (7 funcionários)
('10000000134', 'Viviane Duarte', 'viviane.duarte@empresa.com', 'Compras', 'CTPS00134', 'CLT', 'Ativo'),
('10000000135', 'Cintia Fonseca', 'cintia.fonseca@empresa.com', 'Compras', 'CTPS00135', 'CLT', 'Ativo'),
('10000000136', 'Fabiana Guimaraes', 'fabiana.guimaraes@empresa.com', 'Compras', 'CTPS00136', 'CLT', 'Ativo'),
('10000000137', 'Gisele Torres', 'gisele.torres@empresa.com', 'Compras', 'CTPS00137', 'CLT', 'Ativo'),
('10000000138', 'Luciana Martins', 'luciana.martins@empresa.com', 'Compras', 'CTPS00138', 'CLT', 'Ativo'),
('10000000139', 'Sabrina Rocha', 'sabrina.rocha@empresa.com', 'Compras', 'CTPS00139', 'CLT', 'Ativo'),
('10000000140', 'Taisa Nunes', 'taisa.nunes@empresa.com', 'Compras', 'CTPS00140', 'CLT', 'Desligado'),

-- Funcionários Adicionais - Diversos Setores (60 funcionários)
('10000000141', 'Natalia Campos', 'natalia.campos@empresa.com', 'TI', 'CTPS00141', 'CLT', 'Ativo'),
('10000000142', 'Danielle Monteiro', 'danielle.monteiro@empresa.com', 'TI', 'CTPS00142', 'CLT', 'Ativo'),
('10000000143', 'Aline Cardoso', 'aline.cardoso@empresa.com', 'TI', 'CTPS00143', 'CLT', 'Ativo'),
('10000000144', 'Eliane Moura', 'eliane.moura@empresa.com', 'TI', 'CTPS00144', 'CLT', 'Ativo'),
('10000000145', 'Marcelo Ribeiro', 'marcelo.ribeiro@empresa.com', 'TI', 'CTPS00145', 'CLT', 'Ativo'),
('10000000146', 'Alexandre Teixeira', 'alexandre.teixeira@empresa.com', 'TI', 'CTPS00146', 'CLT', 'Ativo'),
('10000000147', 'Fabio Freitas', 'fabio.freitas@empresa.com', 'TI', 'CTPS00147', 'CLT', 'Ativo'),
('10000000148', 'Marcos Azevedo', 'marcos.azevedo@empresa.com', 'TI', 'CTPS00148', 'CLT', 'Ativo'),
('10000000149', 'Paulo Machado', 'paulo.machado@empresa.com', 'TI', 'CTPS00149', 'CLT', 'Desligado'),
('10000000150', 'Carlos Pires', 'carlos.pires@empresa.com', 'TI', 'CTPS00150', 'CLT', 'Desligado'),

('10000000151', 'Pedro Carvalho', 'pedro.carvalho@empresa.com', 'RH', 'CTPS00151', 'CLT', 'Ativo'),
('10000000152', 'Ricardo Ribeiro', 'ricardo.ribeiro@empresa.com', 'RH', 'CTPS00152', 'CLT', 'Ativo'),
('10000000153', 'Felipe Lopes', 'felipe.lopes@empresa.com', 'RH', 'CTPS00153', 'CLT', 'Ativo'),
('10000000154', 'Gustavo Cunha', 'gustavo.cunha@empresa.com', 'RH', 'CTPS00154', 'CLT', 'Ativo'),
('10000000155', 'Andre Moreira', 'andre.moreira@empresa.com', 'RH', 'CTPS00155', 'CLT', 'Ativo'),
('10000000156', 'Rodrigo Ramos', 'rodrigo.ramos@empresa.com', 'RH', 'CTPS00156', 'CLT', 'Ativo'),
('10000000157', 'Eduardo Barros', 'eduardo.barros@empresa.com', 'RH', 'CTPS00157', 'CLT', 'Ativo'),
('10000000158', 'Vinicius Rezende', 'vinicius.rezende@empresa.com', 'RH', 'CTPS00158', 'CLT', 'Ativo'),
('10000000159', 'Gabriel Vasconcelos', 'gabriel.vasconcelos@empresa.com', 'RH', 'CTPS00159', 'CLT', 'Desligado'),
('10000000160', 'Matheus Duarte', 'matheus.duarte@empresa.com', 'RH', 'CTPS00160', 'CLT', 'Desligado'),

('10000000161', 'Henrique Fonseca', 'henrique.fonseca@empresa.com', 'Vendas', 'CTPS00161', 'CLT', 'Ativo'),
('10000000162', 'Guilherme Guimaraes', 'guilherme.guimaraes@empresa.com', 'Vendas', 'CTPS00162', 'CLT', 'Ativo'),
('10000000163', 'Leonardo Torres', 'leonardo.torres@empresa.com', 'Vendas', 'CTPS00163', 'CLT', 'Ativo'),
('10000000164', 'Igor Martins', 'igor.martins@empresa.com', 'Vendas', 'CTPS00164', 'CLT', 'Ativo'),
('10000000165', 'Fabricio Rocha', 'fabricio.rocha@empresa.com', 'Vendas', 'CTPS00165', 'CLT', 'Ativo'),
('10000000166', 'Renato Nunes', 'renato.nunes@empresa.com', 'Vendas', 'CTPS00166', 'CLT', 'Ativo'),
('10000000167', 'Marcelo Campos', 'marcelo.campos@empresa.com', 'Vendas', 'CTPS00167', 'CLT', 'Ativo'),
('10000000168', 'Alexandre Monteiro', 'alexandre.monteiro@empresa.com', 'Vendas', 'CTPS00168', 'CLT', 'Ativo'),
('10000000169', 'Fabio Cardoso', 'fabio.cardoso@empresa.com', 'Vendas', 'CTPS00169', 'CLT', 'Desligado'),
('10000000170', 'Marcos Moura', 'marcos.moura@empresa.com', 'Vendas', 'CTPS00170', 'CLT', 'Desligado'),

('10000000171', 'Paulo Ribeiro', 'paulo.ribeiro@empresa.com', 'Marketing', 'CTPS00171', 'CLT', 'Ativo'),
('10000000172', 'Carlos Teixeira', 'carlos.teixeira@empresa.com', 'Marketing', 'CTPS00172', 'CLT', 'Ativo'),
('10000000173', 'Pedro Freitas', 'pedro.freitas@empresa.com', 'Marketing', 'CTPS00173', 'CLT', 'Ativo'),
('10000000174', 'Ricardo Azevedo', 'ricardo.azevedo@empresa.com', 'Marketing', 'CTPS00174', 'CLT', 'Ativo'),
('10000000175', 'Felipe Machado', 'felipe.machado@empresa.com', 'Marketing', 'CTPS00175', 'CLT', 'Ativo'),
('10000000176', 'Gustavo Pires', 'gustavo.pires@empresa.com', 'Marketing', 'CTPS00176', 'CLT', 'Ativo'),
('10000000177', 'Andre Carvalho', 'andre.carvalho@empresa.com', 'Marketing', 'CTPS00177', 'CLT', 'Ativo'),
('10000000178', 'Rodrigo Ribeiro', 'rodrigo.ribeiro@empresa.com', 'Marketing', 'CTPS00178', 'CLT', 'Ativo'),
('10000000179', 'Eduardo Lopes', 'eduardo.lopes@empresa.com', 'Marketing', 'CTPS00179', 'CLT', 'Desligado'),
('10000000180', 'Vinicius Cunha', 'vinicius.cunha@empresa.com', 'Marketing', 'CTPS00180', 'CLT', 'Desligado'),

('10000000181', 'Gabriel Moreira', 'gabriel.moreira@empresa.com', 'Financeiro', 'CTPS00181', 'CLT', 'Ativo'),
('10000000182', 'Matheus Ramos', 'matheus.ramos@empresa.com', 'Financeiro', 'CTPS00182', 'CLT', 'Ativo'),
('10000000183', 'Henrique Barros', 'henrique.barros@empresa.com', 'Financeiro', 'CTPS00183', 'CLT', 'Ativo'),
('10000000184', 'Guilherme Rezende', 'guilherme.rezende@empresa.com', 'Financeiro', 'CTPS00184', 'CLT', 'Ativo'),
('10000000185', 'Leonardo Vasconcelos', 'leonardo.vasconcelos@empresa.com', 'Financeiro', 'CTPS00185', 'CLT', 'Ativo'),
('10000000186', 'Igor Duarte', 'igor.duarte@empresa.com', 'Financeiro', 'CTPS00186', 'CLT', 'Ativo'),
('10000000187', 'Fabricio Fonseca', 'fabricio.fonseca@empresa.com', 'Financeiro', 'CTPS00187', 'CLT', 'Ativo'),
('10000000188', 'Renato Guimaraes', 'renato.guimaraes@empresa.com', 'Financeiro', 'CTPS00188', 'CLT', 'Ativo'),
('10000000189', 'Marcelo Torres', 'marcelo.torres@empresa.com', 'Financeiro', 'CTPS00189', 'CLT', 'Desligado'),
('10000000190', 'Alexandre Martins', 'alexandre.martins@empresa.com', 'Financeiro', 'CTPS00190', 'CLT', 'Desligado'),

('10000000191', 'Fabio Rocha', 'fabio.rocha@empresa.com', 'Operações', 'CTPS00191', 'CLT', 'Ativo'),
('10000000192', 'Marcos Nunes', 'marcos.nunes@empresa.com', 'Operações', 'CTPS00192', 'CLT', 'Ativo'),
('10000000193', 'Paulo Campos', 'paulo.campos@empresa.com', 'Operações', 'CTPS00193', 'CLT', 'Ativo'),
('10000000194', 'Carlos Monteiro', 'carlos.monteiro@empresa.com', 'Operações', 'CTPS00194', 'CLT', 'Ativo'),
('10000000195', 'Pedro Cardoso', 'pedro.cardoso@empresa.com', 'Operações', 'CTPS00195', 'CLT', 'Ativo'),
('10000000196', 'Ricardo Moura', 'ricardo.moura@empresa.com', 'Operações', 'CTPS00196', 'CLT', 'Ativo'),
('10000000197', 'Felipe Ribeiro', 'felipe.ribeiro@empresa.com', 'Operações', 'CTPS00197', 'CLT', 'Ativo'),
('10000000198', 'Gustavo Teixeira', 'gustavo.teixeira@empresa.com', 'Operações', 'CTPS00198', 'CLT', 'Ativo'),
('10000000199', 'Andre Freitas', 'andre.freitas@empresa.com', 'Operações', 'CTPS00199', 'CLT', 'Desligado'),
('10000000200', 'Rodrigo Azevedo', 'rodrigo.azevedo@empresa.com', 'Operações', 'CTPS00200', 'CLT', 'Desligado');

-- ==========================================
-- 2. CLASSIFICAÇÕES
-- ==========================================
INSERT INTO Classificacao (nome) VALUES
('Onboarding'),
('Clima Organizacional'),
('Desligamento'),
('Avaliação de Performance'),
('Pesquisa de Satisfação');

-- ==========================================
-- 3. QUESTÕES (14 questões existentes + base para novas)
-- ==========================================

-- Questões para Desligamento (5 questões)
INSERT INTO Questao (texto_questao, status) VALUES
('Qual foi o principal motivo do seu desligamento?', 'Ativa'),
('Como você avalia o suporte recebido durante seu período na empresa?', 'Ativa'),
('Você recomendaria esta empresa para outros profissionais?', 'Ativa'),
('Como você avalia o ambiente de trabalho?', 'Ativa'),
('Você recebeu feedbacks regulares sobre seu desempenho?', 'Ativa');

-- Questões para Clima Organizacional (5 questões)
INSERT INTO Questao (texto_questao, status) VALUES
('Como você avalia a comunicação interna da empresa?', 'Ativa'),
('Você se sente valorizado no seu trabalho?', 'Ativa'),
('Como você avalia o relacionamento com seus colegas?', 'Ativa'),
('A empresa oferece oportunidades de crescimento?', 'Ativa'),
('Você está satisfeito com seu salário atual?', 'Ativa');

-- Questões para Onboarding (4 questões)
INSERT INTO Questao (texto_questao, status) VALUES
('O processo de integração foi claro e organizado?', 'Ativa'),
('Você recebeu todas as informações necessárias para começar?', 'Ativa'),
('Como você avalia o suporte do seu gestor durante a integração?', 'Ativa'),
('Você se sente preparado para suas funções?', 'Ativa');

-- ==========================================
-- ETAPA 3: QUESTÕES DE PERFORMANCE E SATISFAÇÃO
-- ==========================================

-- Questões para Avaliação de Performance (6 questões)
INSERT INTO Questao (texto_questao, status) VALUES
('Como você avalia seu desempenho no período avaliado?', 'Ativa'),
('Você atingiu as metas estabelecidas?', 'Ativa'),
('Como você avalia sua capacidade de trabalhar em equipe?', 'Ativa'),
('Você demonstrou proatividade e iniciativa?', 'Ativa'),
('Como você avalia sua comunicação com colegas e gestores?', 'Ativa'),
('Você está satisfeito com seu desenvolvimento profissional?', 'Ativa');

-- Questões para Pesquisa de Satisfação (6 questões)
INSERT INTO Questao (texto_questao, status) VALUES
('Como você avalia sua satisfação geral com a empresa?', 'Ativa'),
('Você está satisfeito com o equilíbrio entre vida pessoal e profissional?', 'Ativa'),
('Como você avalia os benefícios oferecidos pela empresa?', 'Ativa'),
('Você se sente motivado no seu trabalho?', 'Ativa'),
('Como você avalia o reconhecimento recebido pela empresa?', 'Ativa'),
('Você recomendaria a empresa como um bom lugar para trabalhar?', 'Ativa');

-- ==========================================
-- ETAPA 4: QUESTIONÁRIOS E RELACIONAMENTOS
-- ==========================================

-- Questionários:
-- 1 - Questionário de Desligamento
-- 2 - Pesquisa de Clima Organizacional 2023
-- 3 - Pesquisa de Clima Organizacional 2024
-- 4 - Avaliação de Onboarding 2023
-- 5 - Avaliação de Onboarding 2024
-- 6 - Avaliação de Performance 2023
-- 7 - Avaliação de Performance 2024
-- 8 - Pesquisa de Satisfação 2023
-- 9 - Pesquisa de Satisfação 2024

INSERT INTO Questionario (nome, descricao, status, classificacao_cod) VALUES
('Questionário de Desligamento', 'Avaliação realizada no momento do desligamento do funcionário', 'Ativo',
  (SELECT cod_classificacao FROM Classificacao WHERE nome = 'Desligamento')),
('Pesquisa de Clima Organizacional 2023', 'Avaliação do clima organizacional da empresa - ano base 2023', 'Ativo',
  (SELECT cod_classificacao FROM Classificacao WHERE nome = 'Clima Organizacional')),
('Pesquisa de Clima Organizacional 2024', 'Avaliação do clima organizacional da empresa - ano base 2024', 'Ativo',
  (SELECT cod_classificacao FROM Classificacao WHERE nome = 'Clima Organizacional')),
('Avaliação de Onboarding 2023', 'Questionário para novos funcionários após 30 dias - Turma 2023', 'Ativo',
  (SELECT cod_classificacao FROM Classificacao WHERE nome = 'Onboarding')),
('Avaliação de Onboarding 2024', 'Questionário para novos funcionários após 30 dias - Turma 2024', 'Ativo',
  (SELECT cod_classificacao FROM Classificacao WHERE nome = 'Onboarding')),
('Avaliação de Performance 2023', 'Avaliação de desempenho anual dos colaboradores - ciclo 2023', 'Ativo',
  (SELECT cod_classificacao FROM Classificacao WHERE nome = 'Avaliação de Performance')),
('Avaliação de Performance 2024', 'Avaliação de desempenho anual dos colaboradores - ciclo 2024', 'Ativo',
  (SELECT cod_classificacao FROM Classificacao WHERE nome = 'Avaliação de Performance')),
('Pesquisa de Satisfação 2023', 'Pesquisa geral de satisfação dos colaboradores - 2023', 'Ativo',
  (SELECT cod_classificacao FROM Classificacao WHERE nome = 'Pesquisa de Satisfação')),
('Pesquisa de Satisfação 2024', 'Pesquisa geral de satisfação dos colaboradores - 2024', 'Ativo',
  (SELECT cod_classificacao FROM Classificacao WHERE nome = 'Pesquisa de Satisfação'));

-- ==========================================
-- RELACIONAMENTO QUESTIONÁRIO-QUESTÃO
-- ==========================================

-- Desligamento: questões 1-5
INSERT INTO Questionario_Questao (questionario_cod, questao_cod) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5);

-- Clima Organizacional 2023: questões 6-10
INSERT INTO Questionario_Questao (questionario_cod, questao_cod) VALUES
(2, 6), (2, 7), (2, 8), (2, 9), (2, 10);

-- Clima Organizacional 2024: mesmas questões 6-10
INSERT INTO Questionario_Questao (questionario_cod, questao_cod) VALUES
(3, 6), (3, 7), (3, 8), (3, 9), (3, 10);

-- Onboarding 2023: questões 11-14
INSERT INTO Questionario_Questao (questionario_cod, questao_cod) VALUES
(4, 11), (4, 12), (4, 13), (4, 14);

-- Onboarding 2024: mesmas questões 11-14
INSERT INTO Questionario_Questao (questionario_cod, questao_cod) VALUES
(5, 11), (5, 12), (5, 13), (5, 14);

-- Performance 2023: questões 15-20
INSERT INTO Questionario_Questao (questionario_cod, questao_cod) VALUES
(6, 15), (6, 16), (6, 17), (6, 18), (6, 19), (6, 20);

-- Performance 2024: mesmas questões 15-20
INSERT INTO Questionario_Questao (questionario_cod, questao_cod) VALUES
(7, 15), (7, 16), (7, 17), (7, 18), (7, 19), (7, 20);

-- Satisfação 2023: questões 21-26
INSERT INTO Questionario_Questao (questionario_cod, questao_cod) VALUES
(8, 21), (8, 22), (8, 23), (8, 24), (8, 25), (8, 26);

-- Satisfação 2024: mesmas questões 21-26
INSERT INTO Questionario_Questao (questionario_cod, questao_cod) VALUES
(9, 21), (9, 22), (9, 23), (9, 24), (9, 25), (9, 26);

-- ==========================================
-- 4. OPÇÕES PARA AS QUESTÕES EXISTENTES
-- ==========================================

-- Opções para Questão 1 (Desligamento - Motivo)
INSERT INTO Opcao (texto_opcao, ordem, questao_cod) VALUES
('Melhor oportunidade em outra empresa', 1, 1),
('Falta de crescimento profissional', 2, 1),
('Questões salariais', 3, 1),
('Ambiente de trabalho', 4, 1),
('Mudança de área/carreira', 5, 1),
('Outro motivo', 6, 1);

-- Opções para Questão 2 (Desligamento - Suporte)
INSERT INTO Opcao (texto_opcao, ordem, questao_cod) VALUES
('Excelente', 1, 2),
('Bom', 2, 2),
('Regular', 3, 2),
('Ruim', 4, 2),
('Muito Ruim', 5, 2);

-- Opções para Questão 3 (Desligamento - Recomendação)
INSERT INTO Opcao (texto_opcao, ordem, questao_cod) VALUES
('Sim, definitivamente', 1, 3),
('Sim, provavelmente', 2, 3),
('Talvez', 3, 3),
('Provavelmente não', 4, 3),
('Definitivamente não', 5, 3);

-- Opções para Questão 4 (Desligamento - Ambiente)
INSERT INTO Opcao (texto_opcao, ordem, questao_cod) VALUES
('Excelente', 1, 4),
('Bom', 2, 4),
('Regular', 3, 4),
('Ruim', 4, 4),
('Muito Ruim', 5, 4);

-- Opções para Questão 5 (Desligamento - Feedbacks)
INSERT INTO Opcao (texto_opcao, ordem, questao_cod) VALUES
('Sempre', 1, 5),
('Frequentemente', 2, 5),
('Ocasionalmente', 3, 5),
('Raramente', 4, 5),
('Nunca', 5, 5);

-- Opções para Questão 6 (Clima - Comunicação)
INSERT INTO Opcao (texto_opcao, ordem, questao_cod) VALUES
('Excelente', 1, 6),
('Boa', 2, 6),
('Regular', 3, 6),
('Ruim', 4, 6),
('Muito Ruim', 5, 6);

-- Opções para Questão 7 (Clima - Valorização)
INSERT INTO Opcao (texto_opcao, ordem, questao_cod) VALUES
('Sim, totalmente', 1, 7),
('Sim, parcialmente', 2, 7),
('Neutro', 3, 7),
('Não muito', 4, 7),
('Não, de forma alguma', 5, 7);

-- Opções para Questão 8 (Clima - Relacionamento)
INSERT INTO Opcao (texto_opcao, ordem, questao_cod) VALUES
('Excelente', 1, 8),
('Bom', 2, 8),
('Regular', 3, 8),
('Ruim', 4, 8),
('Muito Ruim', 5, 8);

-- Opções para Questão 9 (Clima - Oportunidades)
INSERT INTO Opcao (texto_opcao, ordem, questao_cod) VALUES
('Sim, muitas oportunidades', 1, 9),
('Sim, algumas oportunidades', 2, 9),
('Poucas oportunidades', 3, 9),
('Quase nenhuma oportunidade', 4, 9),
('Nenhuma oportunidade', 5, 9);

-- Opções para Questão 10 (Clima - Salário)
INSERT INTO Opcao (texto_opcao, ordem, questao_cod) VALUES
('Muito satisfeito', 1, 10),
('Satisfeito', 2, 10),
('Neutro', 3, 10),
('Insatisfeito', 4, 10),
('Muito insatisfeito', 5, 10);

-- Opções para Questão 11 (Onboarding - Processo)
INSERT INTO Opcao (texto_opcao, ordem, questao_cod) VALUES
('Sim, muito claro', 1, 11),
('Sim, razoavelmente claro', 2, 11),
('Parcialmente claro', 3, 11),
('Pouco claro', 4, 11),
('Muito confuso', 5, 11);

-- Opções para Questão 12 (Onboarding - Informações)
INSERT INTO Opcao (texto_opcao, ordem, questao_cod) VALUES
('Sim, todas as informações', 1, 12),
('A maioria das informações', 2, 12),
('Algumas informações', 3, 12),
('Poucas informações', 4, 12),
('Nenhuma informação', 5, 12);

-- Opções para Questão 13 (Onboarding - Suporte Gestor)
INSERT INTO Opcao (texto_opcao, ordem, questao_cod) VALUES
('Excelente', 1, 13),
('Bom', 2, 13),
('Regular', 3, 13),
('Ruim', 4, 13),
('Muito Ruim', 5, 13);

-- Opções para Questão 14 (Onboarding - Preparação)
INSERT INTO Opcao (texto_opcao, ordem, questao_cod) VALUES
('Sim, totalmente preparado', 1, 14),
('Sim, razoavelmente preparado', 2, 14),
('Parcialmente preparado', 3, 14),
('Pouco preparado', 4, 14),
('Não preparado', 5, 14);

-- ==========================================
-- ETAPA 3 (continuação): OPÇÕES PARA QUESTÕES DE PERFORMANCE
-- ==========================================

-- Opções para Questão 15 (Performance - Desempenho)
INSERT INTO Opcao (texto_opcao, ordem, questao_cod) VALUES
('Excelente', 1, 15),
('Muito bom', 2, 15),
('Bom', 3, 15),
('Regular', 4, 15),
('Precisa melhorar', 5, 15);

-- Opções para Questão 16 (Performance - Metas)
INSERT INTO Opcao (texto_opcao, ordem, questao_cod) VALUES
('Superei todas as metas', 1, 16),
('Atingi todas as metas', 2, 16),
('Atingi a maioria das metas', 3, 16),
('Atingi algumas metas', 4, 16),
('Não atingi as metas', 5, 16);

-- Opções para Questão 17 (Performance - Trabalho em Equipe)
INSERT INTO Opcao (texto_opcao, ordem, questao_cod) VALUES
('Excelente', 1, 17),
('Muito bom', 2, 17),
('Bom', 3, 17),
('Regular', 4, 17),
('Precisa melhorar', 5, 17);

-- Opções para Questão 18 (Performance - Proatividade)
INSERT INTO Opcao (texto_opcao, ordem, questao_cod) VALUES
('Sempre demonstrei proatividade', 1, 18),
('Frequentemente demonstrei proatividade', 2, 18),
('Ocasionalmente demonstrei proatividade', 3, 18),
('Raramente demonstrei proatividade', 4, 18),
('Não demonstrei proatividade', 5, 18);

-- Opções para Questão 19 (Performance - Comunicação)
INSERT INTO Opcao (texto_opcao, ordem, questao_cod) VALUES
('Excelente', 1, 19),
('Muito boa', 2, 19),
('Boa', 3, 19),
('Regular', 4, 19),
('Precisa melhorar', 5, 19);

-- Opções para Questão 20 (Performance - Desenvolvimento)
INSERT INTO Opcao (texto_opcao, ordem, questao_cod) VALUES
('Muito satisfeito', 1, 20),
('Satisfeito', 2, 20),
('Neutro', 3, 20),
('Insatisfeito', 4, 20),
('Muito insatisfeito', 5, 20);

-- ==========================================
-- ETAPA 3 (continuação): OPÇÕES PARA QUESTÕES DE SATISFAÇÃO
-- ==========================================

-- Opções para Questão 21 (Satisfação - Geral)
INSERT INTO Opcao (texto_opcao, ordem, questao_cod) VALUES
('Muito satisfeito', 1, 21),
('Satisfeito', 2, 21),
('Neutro', 3, 21),
('Insatisfeito', 4, 21),
('Muito insatisfeito', 5, 21);

-- Opções para Questão 22 (Satisfação - Equilíbrio)
INSERT INTO Opcao (texto_opcao, ordem, questao_cod) VALUES
('Muito satisfeito', 1, 22),
('Satisfeito', 2, 22),
('Neutro', 3, 22),
('Insatisfeito', 4, 22),
('Muito insatisfeito', 5, 22);

-- Opções para Questão 23 (Satisfação - Benefícios)
INSERT INTO Opcao (texto_opcao, ordem, questao_cod) VALUES
('Excelentes', 1, 23),
('Bons', 2, 23),
('Regulares', 3, 23),
('Ruins', 4, 23),
('Muito ruins', 5, 23);

-- Opções para Questão 24 (Satisfação - Motivação)
INSERT INTO Opcao (texto_opcao, ordem, questao_cod) VALUES
('Muito motivado', 1, 24),
('Motivado', 2, 24),
('Neutro', 3, 24),
('Desmotivado', 4, 24),
('Muito desmotivado', 5, 24);

-- Opções para Questão 25 (Satisfação - Reconhecimento)
INSERT INTO Opcao (texto_opcao, ordem, questao_cod) VALUES
('Excelente', 1, 25),
('Bom', 2, 25),
('Regular', 3, 25),
('Ruim', 4, 25),
('Muito ruim', 5, 25);

-- Opções para Questão 26 (Satisfação - Recomendação)
INSERT INTO Opcao (texto_opcao, ordem, questao_cod) VALUES
('Sim, definitivamente', 1, 26),
('Sim, provavelmente', 2, 26),
('Talvez', 3, 26),
('Provavelmente não', 4, 26),
('Definitivamente não', 5, 26);

-- ==========================================
-- FIM DA ETAPA 3
-- ==========================================
-- Total de questões inseridas: 26
-- Distribuição:
-- - Desligamento: 5 questões (1-5)
-- - Clima Organizacional: 5 questões (6-10)
-- - Onboarding: 4 questões (11-14)
-- - Performance: 6 questões (15-20)
-- - Satisfação: 6 questões (21-26)
--
-- Total de opções inseridas: ~130 opções
-- (5-6 opções por questão)
--
-- Próximas etapas:
-- - ETAPA 5: Treinamentos e relacionamentos
-- - ETAPA 6: Avaliações e Respostas
-- ==========================================

-- ==========================================
-- ETAPA 5: TREINAMENTOS E RELACIONAMENTOS
-- ==========================================

-- 5.1 TREINAMENTOS (diversos temas, 2023-2024)
INSERT INTO Treinamento (nome, data_realizacao, validade, local) VALUES
('Treinamento de Segurança do Trabalho', '2023-01-15', '2024-01-15', 'Sala de Treinamento A'),
('Workshop de Comunicação Eficaz', '2023-03-10', NULL, 'Sala de Treinamento B'),
('Curso de Liderança para Gestores', '2023-05-20', NULL, 'Auditório Principal'),
('Treinamento de Sistemas Internos', '2023-07-05', '2024-07-05', 'Sala de Treinamento A'),
('Treinamento de Atendimento ao Cliente', '2023-09-18', NULL, 'Online'),
('Treinamento de LGPD e Segurança da Informação', '2023-11-22', NULL, 'Sala de Treinamento C'),
('Integração de Novos Colaboradores - Turma 2023', '2023-02-01', NULL, 'Sala de Integração'),
('Integração de Novos Colaboradores - Turma 2024', '2024-02-01', NULL, 'Sala de Integração'),
('Treinamento de Feedback e Conversas Difíceis', '2024-03-15', NULL, 'Sala de Treinamento B'),
('Treinamento de Gestão de Projetos', '2024-04-10', NULL, 'Online'),
('Treinamento de Vendas Consultivas', '2024-05-25', NULL, 'Sala de Treinamento A'),
('Treinamento de Excel Avançado', '2024-06-12', NULL, 'Laboratório de Informática'),
('Programa de Desenvolvimento de Lideranças', '2024-08-20', NULL, 'Auditório Principal'),
('Treinamento de Diversidade e Inclusão', '2024-09-30', NULL, 'Sala de Treinamento C'),
('Treinamento de Gestão do Tempo e Prioridades', '2024-10-18', NULL, 'Online');

-- Observação: IDs gerados automaticamente (SERIAL) de 1 a 15

-- 5.2 RELACIONAMENTO FUNCIONÁRIO-TREINAMENTO
-- Amostra ampliada (~120 relações) distribuindo funcionários em vários treinamentos
INSERT INTO Funcionario_Treinamento (funcionario_cpf, treinamento_cod, n_certificado) VALUES
-- Segurança do Trabalho (Treinamento 1)
('10000000001', 1, 'SEG-2023-001'),
('10000000002', 1, 'SEG-2023-002'),
('10000000003', 1, 'SEG-2023-003'),
('10000000019', 1, 'SEG-2023-004'),
('10000000039', 1, 'SEG-2023-005'),
('10000000113', 1, 'SEG-2023-006'),
('10000000191', 1, 'SEG-2023-007'),

-- Comunicação Eficaz (Treinamento 2)
('10000000027', 2, 'COM-2023-001'),
('10000000028', 2, 'COM-2023-002'),
('10000000075', 2, 'COM-2023-003'),
('10000000076', 2, 'COM-2023-004'),
('10000000153', 2, 'COM-2023-005'),
('10000000154', 2, 'COM-2023-006'),

-- Liderança para Gestores (Treinamento 3)
('10000000011', 3, 'LID-2023-001'),
('10000000014', 3, 'LID-2023-002'),
('10000000033', 3, 'LID-2023-003'),
('10000000084', 3, 'LID-2023-004'),
('10000000102', 3, 'LID-2023-005'),
('10000000175', 3, 'LID-2023-006'),

-- Sistemas Internos (Treinamento 4)
('10000000001', 4, 'SIS-2023-001'),
('10000000002', 4, 'SIS-2023-002'),
('10000000005', 4, 'SIS-2023-003'),
('10000000006', 4, 'SIS-2023-004'),
('10000000141', 4, 'SIS-2023-005'),
('10000000142', 4, 'SIS-2023-006'),
('10000000143', 4, 'SIS-2023-007'),

-- Atendimento ao Cliente (Treinamento 5)
('10000000019', 5, 'ATC-2023-001'),
('10000000021', 5, 'ATC-2023-002'),
('10000000022', 5, 'ATC-2023-003'),
('10000000023', 5, 'ATC-2023-004'),
('10000000161', 5, 'ATC-2023-005'),
('10000000162', 5, 'ATC-2023-006'),
('10000000163', 5, 'ATC-2023-007'),

-- LGPD e Segurança da Informação (Treinamento 6)
('10000000001', 6, 'LGPD-2023-001'),
('10000000033', 6, 'LGPD-2023-002'),
('10000000034', 6, 'LGPD-2023-003'),
('10000000035', 6, 'LGPD-2023-004'),
('10000000187', 6, 'LGPD-2023-005'),
('10000000188', 6, 'LGPD-2023-006'),

-- Integração 2023 (Treinamento 7)
('10000000039', 7, 'INT-2023-001'),
('10000000045', 7, 'INT-2023-002'),
('10000000048', 7, 'INT-2023-003'),
('10000000061', 7, 'INT-2023-004'),
('10000000073', 7, 'INT-2023-005'),
('10000000085', 7, 'INT-2023-006'),

-- Integração 2024 (Treinamento 8)
('10000000141', 8, 'INT-2024-001'),
('10000000142', 8, 'INT-2024-002'),
('10000000151', 8, 'INT-2024-003'),
('10000000152', 8, 'INT-2024-004'),
('10000000171', 8, 'INT-2024-005'),
('10000000172', 8, 'INT-2024-006'),

-- Feedback e Conversas Difíceis (Treinamento 9)
('10000000011', 9, 'FDB-2024-001'),
('10000000014', 9, 'FDB-2024-002'),
('10000000075', 9, 'FDB-2024-003'),
('10000000076', 9, 'FDB-2024-004'),
('10000000102', 9, 'FDB-2024-005'),
('10000000103', 9, 'FDB-2024-006'),

-- Gestão de Projetos (Treinamento 10)
('10000000001', 10, 'PRJ-2024-001'),
('10000000002', 10, 'PRJ-2024-002'),
('10000000033', 10, 'PRJ-2024-003'),
('10000000034', 10, 'PRJ-2024-004'),
('10000000181', 10, 'PRJ-2024-005'),
('10000000182', 10, 'PRJ-2024-006'),

-- Vendas Consultivas (Treinamento 11)
('10000000019', 11, 'VEN-2024-001'),
('10000000021', 11, 'VEN-2024-002'),
('10000000022', 11, 'VEN-2024-003'),
('10000000161', 11, 'VEN-2024-004'),
('10000000162', 11, 'VEN-2024-005'),
('10000000163', 11, 'VEN-2024-006'),

-- Excel Avançado (Treinamento 12)
('10000000033', 12, 'EXC-2024-001'),
('10000000034', 12, 'EXC-2024-002'),
('10000000187', 12, 'EXC-2024-003'),
('10000000188', 12, 'EXC-2024-004'),
('10000000189', 12, 'EXC-2024-005'),
('10000000190', 12, 'EXC-2024-006'),

-- Programa de Desenvolvimento de Lideranças (Treinamento 13)
('10000000011', 13, 'LDR-2024-001'),
('10000000014', 13, 'LDR-2024-002'),
('10000000075', 13, 'LDR-2024-003'),
('10000000076', 13, 'LDR-2024-004'),
('10000000102', 13, 'LDR-2024-005'),
('10000000175', 13, 'LDR-2024-006'),

-- Diversidade e Inclusão (Treinamento 14)
('10000000027', 14, 'DIV-2024-001'),
('10000000028', 14, 'DIV-2024-002'),
('10000000061', 14, 'DIV-2024-003'),
('10000000062', 14, 'DIV-2024-004'),
('10000000153', 14, 'DIV-2024-005'),
('10000000154', 14, 'DIV-2024-006'),

-- Gestão do Tempo e Prioridades (Treinamento 15)
('10000000001', 15, 'TMP-2024-001'),
('10000000002', 15, 'TMP-2024-002'),
('10000000039', 15, 'TMP-2024-003'),
('10000000040', 15, 'TMP-2024-004'),
('10000000191', 15, 'TMP-2024-005'),
('10000000192', 15, 'TMP-2024-006');

-- 5.3 RELACIONAMENTO FUNCIONÁRIO-CLASSIFICAÇÃO
-- Vincula funcionários principais às classificações (Onboarding, Clima, Desligamento, Performance, Satisfação)
INSERT INTO Funcionario_Classificacao (funcionario_cpf, classificacao_cod) VALUES
-- Onboarding (1)
('10000000027', 1),
('10000000028', 1),
('10000000141', 1),
('10000000142', 1),
('10000000171', 1),
('10000000172', 1),

-- Clima Organizacional (2)
('10000000001', 2),
('10000000002', 2),
('10000000003', 2),
('10000000011', 2),
('10000000014', 2),
('10000000033', 2),
('10000000034', 2),
('10000000181', 2),
('10000000182', 2),

-- Desligamento (3)
('10000000009', 3),
('10000000010', 3),
('10000000020', 3),
('10000000026', 3),
('10000000038', 3),
('10000000149', 3),
('10000000150', 3),

-- Avaliação de Performance (4)
('10000000001', 4),
('10000000002', 4),
('10000000003', 4),
('10000000033', 4),
('10000000034', 4),
('10000000181', 4),
('10000000182', 4),
('10000000183', 4),

-- Pesquisa de Satisfação (5)
('10000000011', 5),
('10000000014', 5),
('10000000027', 5),
('10000000028', 5),
('10000000061', 5),
('10000000062', 5),
('10000000171', 5),
('10000000172', 5);

-- ==========================================
-- FIM DA ETAPA 5
-- ==========================================

-- ==========================================
-- ETAPA 6: AVALIAÇÕES E RESPOSTAS
-- ==========================================

-- 6.1 AVALIAÇÕES
-- Observação:
-- - Os IDs de Avaliacao serão gerados automaticamente (SERIAL)
-- - Aqui assumimos que a tabela está vazia antes deste seed

INSERT INTO Avaliacao (data_completa, local, observacao_geral, rating_geral, avaliado_cpf, avaliador_cpf, questionario_cod) VALUES
-- Desligamento (Questionário 1) - 6 avaliações em 2023
('2023-01-10 14:30:00-03:00', 'Escritório Central', 'Desligamento por nova oportunidade', 3, '10000000009', '10000000011', 1),
('2023-02-15 10:00:00-03:00', 'Escritório Central', 'Desligamento por questões salariais', 2, '10000000010', '10000000011', 1),
('2023-03-20 09:00:00-03:00', 'Escritório Central', 'Desligamento consensual', 4, '10000000020', '10000000014', 1),
('2023-05-05 11:15:00-03:00', 'Escritório Central', 'Desligamento por desempenho', 2, '10000000026', '10000000014', 1),
('2023-07-18 16:00:00-03:00', 'Escritório Central', 'Desligamento por mudança de cidade', 3, '10000000038', '10000000011', 1),
('2023-09-30 15:30:00-03:00', 'Escritório Central', 'Desligamento programado', 4, '10000000149', '10000000014', 1),

-- Clima Organizacional 2023 (Questionário 2) - 8 avaliações
('2023-02-01 09:00:00-03:00', 'Escritório Central', 'Clima geral positivo', 4, '10000000001', '10000000011', 2),
('2023-02-01 09:15:00-03:00', 'Escritório Central', 'Boa percepção de clima', 5, '10000000002', '10000000011', 2),
('2023-02-01 09:30:00-03:00', 'Escritório Central', 'Clima razoável', 3, '10000000003', '10000000011', 2),
('2023-03-10 10:00:00-03:00', 'Escritório Central', 'Clima com alguns pontos de atenção', 3, '10000000033', '10000000011', 2),
('2023-03-10 10:30:00-03:00', 'Escritório Central', 'Clima satisfatório', 4, '10000000034', '10000000014', 2),
('2023-04-05 11:00:00-03:00', 'Escritório Central', 'Clima muito bom na equipe', 5, '10000000061', '10000000014', 2),
('2023-04-05 11:30:00-03:00', 'Escritório Central', 'Bom relacionamento com colegas', 4, '10000000062', '10000000011', 2),
('2023-06-01 09:00:00-03:00', 'Escritório Central', 'Clima neutro', 3, '10000000181', '10000000014', 2),

-- Clima Organizacional 2024 (Questionário 3) - 6 avaliações
('2024-02-01 09:00:00-03:00', 'Escritório Central', 'Clima melhorou em relação ao ano anterior', 4, '10000000182', '10000000011', 3),
('2024-02-01 09:20:00-03:00', 'Escritório Central', 'Clima estável', 3, '10000000183', '10000000014', 3),
('2024-02-01 09:40:00-03:00', 'Escritório Central', 'Boa percepção de comunicação interna', 4, '10000000187', '10000000011', 3),
('2024-03-05 10:10:00-03:00', 'Escritório Central', 'Clima colaborativo', 5, '10000000188', '10000000014', 3),
('2024-03-05 10:40:00-03:00', 'Escritório Central', 'Algumas dificuldades de reconhecimento', 3, '10000000189', '10000000011', 3),
('2024-04-12 09:30:00-03:00', 'Escritório Central', 'Clima positivo na área financeira', 4, '10000000190', '10000000014', 3),

-- Onboarding 2023 (Questionário 4) - 4 avaliações
('2023-03-01 09:00:00-03:00', 'Escritório Central', 'Integração bem estruturada', 5, '10000000027', '10000000011', 4),
('2023-03-15 09:30:00-03:00', 'Escritório Central', 'Integração boa, mas com melhorias possíveis', 4, '10000000028', '10000000011', 4),
('2023-04-01 10:00:00-03:00', 'Escritório Central', 'Integração razoável', 3, '10000000039', '10000000014', 4),
('2023-04-15 10:30:00-03:00', 'Escritório Central', 'Integração confusa', 2, '10000000045', '10000000014', 4),

-- Onboarding 2024 (Questionário 5) - 4 avaliações
('2024-03-01 09:00:00-03:00', 'Escritório Central', 'Integração excelente', 5, '10000000141', '10000000011', 5),
('2024-03-10 09:30:00-03:00', 'Escritório Central', 'Integração clara', 4, '10000000142', '10000000011', 5),
('2024-04-01 10:00:00-03:00', 'Escritório Central', 'Integração boa, mas poderia ser mais prática', 4, '10000000151', '10000000014', 5),
('2024-04-15 10:30:00-03:00', 'Escritório Central', 'Integração mediana', 3, '10000000152', '10000000014', 5),

-- Performance 2023 (Questionário 6) - 6 avaliações
('2023-12-10 15:00:00-03:00', 'Escritório Central', 'Desempenho acima do esperado', 5, '10000000001', '10000000014', 6),
('2023-12-10 15:30:00-03:00', 'Escritório Central', 'Desempenho consistente', 4, '10000000002', '10000000014', 6),
('2023-12-11 09:00:00-03:00', 'Escritório Central', 'Desempenho adequado', 3, '10000000003', '10000000011', 6),
('2023-12-11 09:30:00-03:00', 'Escritório Central', 'Desempenho com pontos de melhoria', 3, '10000000033', '10000000011', 6),
('2023-12-11 10:00:00-03:00', 'Escritório Central', 'Desempenho muito bom', 4, '10000000034', '10000000014', 6),
('2023-12-11 10:30:00-03:00', 'Escritório Central', 'Desempenho excepcional', 5, '10000000181', '10000000014', 6),

-- Performance 2024 (Questionário 7) - 4 avaliações
('2024-12-10 15:00:00-03:00', 'Escritório Central', 'Desempenho acima das metas', 5, '10000000182', '10000000014', 7),
('2024-12-10 15:30:00-03:00', 'Escritório Central', 'Desempenho consistente', 4, '10000000183', '10000000014', 7),
('2024-12-11 09:00:00-03:00', 'Escritório Central', 'Desempenho adequado', 3, '10000000187', '10000000011', 7),
('2024-12-11 09:30:00-03:00', 'Escritório Central', 'Desempenho satisfatório', 4, '10000000188', '10000000011', 7),

-- Satisfação 2023 (Questionário 8) - 6 avaliações
('2023-11-01 09:00:00-03:00', 'Escritório Central', 'Alta satisfação geral', 5, '10000000011', '10000000014', 8),
('2023-11-01 09:20:00-03:00', 'Escritório Central', 'Boa satisfação com benefícios', 4, '10000000027', '10000000014', 8),
('2023-11-01 09:40:00-03:00', 'Escritório Central', 'Satisfação moderada', 3, '10000000028', '10000000011', 8),
('2023-11-02 10:00:00-03:00', 'Escritório Central', 'Satisfação com equilíbrio vida-trabalho', 4, '10000000061', '10000000011', 8),
('2023-11-02 10:20:00-03:00', 'Escritório Central', 'Reconhecimento poderia ser melhor', 3, '10000000062', '10000000014', 8),
('2023-11-03 09:00:00-03:00', 'Escritório Central', 'Satisfação geral boa', 4, '10000000171', '10000000014', 8),

-- Satisfação 2024 (Questionário 9) - 4 avaliações
('2024-11-01 09:00:00-03:00', 'Escritório Central', 'Satisfação alta com a empresa', 5, '10000000172', '10000000014', 9),
('2024-11-01 09:30:00-03:00', 'Escritório Central', 'Boa satisfação com benefícios', 4, '10000000141', '10000000014', 9),
('2024-11-02 10:00:00-03:00', 'Escritório Central', 'Satisfação moderada', 3, '10000000142', '10000000011', 9),
('2024-11-02 10:30:00-03:00', 'Escritório Central', 'Boa satisfação geral', 4, '10000000152', '10000000011', 9);

-- 6.2 RESPOSTAS
-- Para simplificar a manutenção, usamos subselects para buscar opcao_cod por questao_cod e ordem.

INSERT INTO Resposta (avaliacao_cod, questao_cod, opcao_cod) VALUES
-- Avaliações 1-6: Desligamento (Questionário 1: questões 1-5)
-- Avaliação 1 (id = 1)
(1, 1, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 1 AND ordem = 1)),
(1, 2, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 2 AND ordem = 3)),
(1, 3, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 3 AND ordem = 3)),
(1, 4, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 4 AND ordem = 3)),
(1, 5, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 5 AND ordem = 3)),

-- Avaliação 2 (id = 2)
(2, 1, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 1 AND ordem = 3)),
(2, 2, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 2 AND ordem = 4)),
(2, 3, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 3 AND ordem = 4)),
(2, 4, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 4 AND ordem = 4)),
(2, 5, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 5 AND ordem = 4)),

-- Avaliação 3 (id = 3)
(3, 1, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 1 AND ordem = 2)),
(3, 2, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 2 AND ordem = 2)),
(3, 3, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 3 AND ordem = 2)),
(3, 4, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 4 AND ordem = 2)),
(3, 5, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 5 AND ordem = 2)),

-- Avaliação 4 (id = 4)
(4, 1, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 1 AND ordem = 4)),
(4, 2, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 2 AND ordem = 4)),
(4, 3, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 3 AND ordem = 4)),
(4, 4, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 4 AND ordem = 4)),
(4, 5, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 5 AND ordem = 4)),

-- Avaliação 5 (id = 5)
(5, 1, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 1 AND ordem = 5)),
(5, 2, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 2 AND ordem = 3)),
(5, 3, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 3 AND ordem = 3)),
(5, 4, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 4 AND ordem = 3)),
(5, 5, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 5 AND ordem = 3)),

-- Avaliação 6 (id = 6)
(6, 1, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 1 AND ordem = 2)),
(6, 2, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 2 AND ordem = 2)),
(6, 3, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 3 AND ordem = 2)),
(6, 4, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 4 AND ordem = 2)),
(6, 5, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 5 AND ordem = 2)),

-- Avaliações 7-14: Clima Organizacional 2023 (Questionário 2: questões 6-10)
-- Avaliação 7 (id = 7)
(7, 6, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 6 AND ordem = 1)),
(7, 7, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 7 AND ordem = 2)),
(7, 8, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 8 AND ordem = 2)),
(7, 9, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 9 AND ordem = 2)),
(7, 10, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 10 AND ordem = 2)),

-- Avaliação 8 (id = 8)
(8, 6, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 6 AND ordem = 2)),
(8, 7, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 7 AND ordem = 1)),
(8, 8, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 8 AND ordem = 1)),
(8, 9, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 9 AND ordem = 2)),
(8, 10, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 10 AND ordem = 3)),

-- Avaliação 9 (id = 9)
(9, 6, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 6 AND ordem = 3)),
(9, 7, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 7 AND ordem = 3)),
(9, 8, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 8 AND ordem = 3)),
(9, 9, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 9 AND ordem = 3)),
(9, 10, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 10 AND ordem = 3)),

-- Avaliação 10 (id = 10)
(10, 6, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 6 AND ordem = 3)),
(10, 7, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 7 AND ordem = 2)),
(10, 8, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 8 AND ordem = 2)),
(10, 9, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 9 AND ordem = 2)),
(10, 10, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 10 AND ordem = 2)),

-- Avaliação 11 (id = 11)
(11, 6, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 6 AND ordem = 4)),
(11, 7, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 7 AND ordem = 3)),
(11, 8, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 8 AND ordem = 3)),
(11, 9, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 9 AND ordem = 3)),
(11, 10, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 10 AND ordem = 4)),

-- Avaliação 12 (id = 12)
(12, 6, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 6 AND ordem = 5)),
(12, 7, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 7 AND ordem = 4)),
(12, 8, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 8 AND ordem = 4)),
(12, 9, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 9 AND ordem = 4)),
(12, 10, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 10 AND ordem = 4)),

-- Avaliação 13 (id = 13)
(13, 6, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 6 AND ordem = 4)),
(13, 7, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 7 AND ordem = 4)),
(13, 8, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 8 AND ordem = 4)),
(13, 9, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 9 AND ordem = 4)),
(13, 10, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 10 AND ordem = 5)),

-- Avaliação 14 (id = 14)
(14, 6, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 6 AND ordem = 3)),
(14, 7, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 7 AND ordem = 2)),
(14, 8, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 8 AND ordem = 2)),
(14, 9, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 9 AND ordem = 2)),
(14, 10, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 10 AND ordem = 3)),

-- Avaliações 15-20: Clima Organizacional 2024 (Questionário 3: questões 6-10)
-- Avaliação 15 (id = 15)
(15, 6, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 6 AND ordem = 2)),
(15, 7, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 7 AND ordem = 2)),
(15, 8, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 8 AND ordem = 2)),
(15, 9, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 9 AND ordem = 2)),
(15, 10, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 10 AND ordem = 2)),

-- Avaliação 16 (id = 16)
(16, 6, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 6 AND ordem = 3)),
(16, 7, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 7 AND ordem = 3)),
(16, 8, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 8 AND ordem = 3)),
(16, 9, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 9 AND ordem = 3)),
(16, 10, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 10 AND ordem = 3)),

-- Avaliação 17 (id = 17)
(17, 6, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 6 AND ordem = 1)),
(17, 7, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 7 AND ordem = 2)),
(17, 8, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 8 AND ordem = 1)),
(17, 9, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 9 AND ordem = 2)),
(17, 10, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 10 AND ordem = 2)),

-- Avaliação 18 (id = 18)
(18, 6, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 6 AND ordem = 5)),
(18, 7, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 7 AND ordem = 4)),
(18, 8, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 8 AND ordem = 4)),
(18, 9, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 9 AND ordem = 4)),
(18, 10, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 10 AND ordem = 4)),

-- Avaliação 19 (id = 19)
(19, 6, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 6 AND ordem = 3)),
(19, 7, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 7 AND ordem = 3)),
(19, 8, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 8 AND ordem = 3)),
(19, 9, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 9 AND ordem = 3)),
(19, 10, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 10 AND ordem = 3)),

-- Avaliação 20 (id = 20)
(20, 6, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 6 AND ordem = 4)),
(20, 7, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 7 AND ordem = 4)),
(20, 8, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 8 AND ordem = 4)),
(20, 9, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 9 AND ordem = 4)),
(20, 10, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 10 AND ordem = 4)),

-- Avaliações 21-24: Onboarding 2023 (Questionário 4: questões 11-14)
-- Avaliação 21 (id = 21)
(21, 11, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 11 AND ordem = 1)),
(21, 12, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 12 AND ordem = 1)),
(21, 13, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 13 AND ordem = 1)),
(21, 14, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 14 AND ordem = 1)),

-- Avaliação 22 (id = 22)
(22, 11, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 11 AND ordem = 2)),
(22, 12, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 12 AND ordem = 2)),
(22, 13, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 13 AND ordem = 2)),
(22, 14, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 14 AND ordem = 2)),

-- Avaliação 23 (id = 23)
(23, 11, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 11 AND ordem = 3)),
(23, 12, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 12 AND ordem = 3)),
(23, 13, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 13 AND ordem = 3)),
(23, 14, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 14 AND ordem = 3)),

-- Avaliação 24 (id = 24)
(24, 11, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 11 AND ordem = 4)),
(24, 12, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 12 AND ordem = 4)),
(24, 13, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 13 AND ordem = 4)),
(24, 14, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 14 AND ordem = 4)),

-- Avaliações 25-28: Onboarding 2024 (Questionário 5: questões 11-14)
-- Avaliação 25 (id = 25)
(25, 11, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 11 AND ordem = 1)),
(25, 12, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 12 AND ordem = 1)),
(25, 13, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 13 AND ordem = 2)),
(25, 14, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 14 AND ordem = 2)),

-- Avaliação 26 (id = 26)
(26, 11, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 11 AND ordem = 2)),
(26, 12, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 12 AND ordem = 2)),
(26, 13, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 13 AND ordem = 2)),
(26, 14, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 14 AND ordem = 3)),

-- Avaliação 27 (id = 27)
(27, 11, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 11 AND ordem = 3)),
(27, 12, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 12 AND ordem = 3)),
(27, 13, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 13 AND ordem = 3)),
(27, 14, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 14 AND ordem = 3)),

-- Avaliação 28 (id = 28)
(28, 11, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 11 AND ordem = 4)),
(28, 12, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 12 AND ordem = 4)),
(28, 13, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 13 AND ordem = 4)),
(28, 14, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 14 AND ordem = 4)),

-- Avaliações 29-34: Performance 2023 (Questionário 6: questões 15-20)
-- Avaliação 29 (id = 29)
(29, 15, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 15 AND ordem = 1)),
(29, 16, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 16 AND ordem = 1)),
(29, 17, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 17 AND ordem = 1)),
(29, 18, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 18 AND ordem = 1)),
(29, 19, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 19 AND ordem = 1)),
(29, 20, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 20 AND ordem = 1)),

-- Avaliação 30 (id = 30)
(30, 15, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 15 AND ordem = 2)),
(30, 16, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 16 AND ordem = 2)),
(30, 17, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 17 AND ordem = 2)),
(30, 18, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 18 AND ordem = 2)),
(30, 19, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 19 AND ordem = 2)),
(30, 20, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 20 AND ordem = 2)),

-- Avaliação 31 (id = 31)
(31, 15, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 15 AND ordem = 3)),
(31, 16, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 16 AND ordem = 3)),
(31, 17, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 17 AND ordem = 3)),
(31, 18, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 18 AND ordem = 3)),
(31, 19, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 19 AND ordem = 3)),
(31, 20, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 20 AND ordem = 3)),

-- Avaliação 32 (id = 32)
(32, 15, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 15 AND ordem = 3)),
(32, 16, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 16 AND ordem = 3)),
(32, 17, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 17 AND ordem = 3)),
(32, 18, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 18 AND ordem = 3)),
(32, 19, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 19 AND ordem = 4)),
(32, 20, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 20 AND ordem = 4)),

-- Avaliação 33 (id = 33)
(33, 15, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 15 AND ordem = 4)),
(33, 16, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 16 AND ordem = 4)),
(33, 17, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 17 AND ordem = 4)),
(33, 18, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 18 AND ordem = 4)),
(33, 19, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 19 AND ordem = 4)),
(33, 20, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 20 AND ordem = 4)),

-- Avaliação 34 (id = 34)
(34, 15, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 15 AND ordem = 5)),
(34, 16, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 16 AND ordem = 4)),
(34, 17, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 17 AND ordem = 4)),
(34, 18, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 18 AND ordem = 4)),
(34, 19, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 19 AND ordem = 5)),
(34, 20, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 20 AND ordem = 5)),

-- Avaliações 35-38: Performance 2024 (Questionário 7: questões 15-20)
-- Avaliação 35 (id = 35)
(35, 15, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 15 AND ordem = 2)),
(35, 16, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 16 AND ordem = 2)),
(35, 17, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 17 AND ordem = 2)),
(35, 18, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 18 AND ordem = 2)),
(35, 19, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 19 AND ordem = 2)),
(35, 20, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 20 AND ordem = 2)),

-- Avaliação 36 (id = 36)
(36, 15, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 15 AND ordem = 3)),
(36, 16, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 16 AND ordem = 3)),
(36, 17, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 17 AND ordem = 3)),
(36, 18, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 18 AND ordem = 3)),
(36, 19, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 19 AND ordem = 3)),
(36, 20, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 20 AND ordem = 3)),

-- Avaliação 37 (id = 37)
(37, 15, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 15 AND ordem = 4)),
(37, 16, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 16 AND ordem = 4)),
(37, 17, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 17 AND ordem = 4)),
(37, 18, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 18 AND ordem = 4)),
(37, 19, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 19 AND ordem = 4)),
(37, 20, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 20 AND ordem = 4)),

-- Avaliação 38 (id = 38)
(38, 15, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 15 AND ordem = 5)),
(38, 16, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 16 AND ordem = 4)),
(38, 17, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 17 AND ordem = 4)),
(38, 18, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 18 AND ordem = 4)),
(38, 19, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 19 AND ordem = 5)),
(38, 20, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 20 AND ordem = 5)),

-- Avaliações 39-44: Satisfação 2023 (Questionário 8: questões 21-26)
-- Avaliação 39 (id = 39)
(39, 21, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 21 AND ordem = 1)),
(39, 22, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 22 AND ordem = 1)),
(39, 23, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 23 AND ordem = 1)),
(39, 24, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 24 AND ordem = 1)),
(39, 25, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 25 AND ordem = 1)),
(39, 26, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 26 AND ordem = 1)),

-- Avaliação 40 (id = 40)
(40, 21, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 21 AND ordem = 2)),
(40, 22, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 22 AND ordem = 2)),
(40, 23, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 23 AND ordem = 2)),
(40, 24, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 24 AND ordem = 2)),
(40, 25, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 25 AND ordem = 2)),
(40, 26, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 26 AND ordem = 2)),

-- Avaliação 41 (id = 41)
(41, 21, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 21 AND ordem = 3)),
(41, 22, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 22 AND ordem = 3)),
(41, 23, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 23 AND ordem = 3)),
(41, 24, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 24 AND ordem = 3)),
(41, 25, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 25 AND ordem = 3)),
(41, 26, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 26 AND ordem = 3)),

-- Avaliação 42 (id = 42)
(42, 21, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 21 AND ordem = 4)),
(42, 22, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 22 AND ordem = 4)),
(42, 23, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 23 AND ordem = 4)),
(42, 24, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 24 AND ordem = 4)),
(42, 25, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 25 AND ordem = 4)),
(42, 26, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 26 AND ordem = 4)),

-- Avaliação 43 (id = 43)
(43, 21, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 21 AND ordem = 4)),
(43, 22, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 22 AND ordem = 3)),
(43, 23, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 23 AND ordem = 3)),
(43, 24, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 24 AND ordem = 3)),
(43, 25, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 25 AND ordem = 3)),
(43, 26, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 26 AND ordem = 3)),

-- Avaliação 44 (id = 44)
(44, 21, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 21 AND ordem = 5)),
(44, 22, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 22 AND ordem = 4)),
(44, 23, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 23 AND ordem = 4)),
(44, 24, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 24 AND ordem = 4)),
(44, 25, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 25 AND ordem = 4)),
(44, 26, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 26 AND ordem = 4)),

-- Avaliações 45-48: Satisfação 2024 (Questionário 9: questões 21-26)
-- Avaliação 45 (id = 45)
(45, 21, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 21 AND ordem = 1)),
(45, 22, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 22 AND ordem = 1)),
(45, 23, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 23 AND ordem = 1)),
(45, 24, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 24 AND ordem = 1)),
(45, 25, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 25 AND ordem = 1)),
(45, 26, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 26 AND ordem = 1)),

-- Avaliação 46 (id = 46)
(46, 21, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 21 AND ordem = 2)),
(46, 22, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 22 AND ordem = 2)),
(46, 23, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 23 AND ordem = 2)),
(46, 24, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 24 AND ordem = 2)),
(46, 25, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 25 AND ordem = 2)),
(46, 26, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 26 AND ordem = 2)),

-- Avaliação 47 (id = 47)
(47, 21, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 21 AND ordem = 3)),
(47, 22, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 22 AND ordem = 3)),
(47, 23, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 23 AND ordem = 3)),
(47, 24, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 24 AND ordem = 3)),
(47, 25, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 25 AND ordem = 3)),
(47, 26, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 26 AND ordem = 3)),

-- Avaliação 48 (id = 48)
(48, 21, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 21 AND ordem = 4)),
(48, 22, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 22 AND ordem = 4)),
(48, 23, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 23 AND ordem = 4)),
(48, 24, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 24 AND ordem = 4)),
(48, 25, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 25 AND ordem = 4)),
(48, 26, (SELECT cod_opcao FROM Opcao WHERE questao_cod = 26 AND ordem = 4));

-- ==========================================
-- FIM DA ETAPA 6
-- ==========================================


