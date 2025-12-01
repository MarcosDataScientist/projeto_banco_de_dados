-- ==========================================
-- SEED DATA - DADOS INICIAIS
-- Sistema de Avaliação de Desligamento
-- Modelo 2: Apenas Múltipla Escolha
-- ==========================================

-- Limpar dados existentes (CUIDADO: Isso apaga tudo!)
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
-- 1. FUNCIONÁRIOS
-- ==========================================
INSERT INTO Funcionario (cpf, nome, email, setor, ctps, tipo, status) VALUES
('12345678901', 'João Silva', 'joao.silva@empresa.com', 'TI', 'CTPS001', 'CLT', 'Ativo'),
('23456789012', 'Maria Santos', 'maria.santos@empresa.com', 'RH', 'CTPS002', 'CLT', 'Ativo'),
('34567890123', 'Pedro Oliveira', 'pedro.oliveira@empresa.com', 'Vendas', 'CTPS003', 'CLT', 'Ativo'),
('45678901234', 'Ana Costa', 'ana.costa@empresa.com', 'Marketing', 'CTPS004', 'CLT', 'Ativo'),
('56789012345', 'Carlos Pereira', 'carlos.pereira@empresa.com', 'TI', 'CTPS005', 'CLT', 'Ativo'),
('67890123456', 'Juliana Ferreira', 'juliana.ferreira@empresa.com', 'RH', 'CTPS006', 'CLT', 'Desligado'),
('78901234567', 'Roberto Alves', 'roberto.alves@empresa.com', 'Vendas', 'CTPS007', 'CLT', 'Desligado'),
('89012345678', 'Fernanda Lima', 'fernanda.lima@empresa.com', 'Marketing', 'CTPS008', 'CLT', 'Ativo'),
('90123456789', 'Lucas Martins', 'lucas.martins@empresa.com', 'TI', 'CTPS009', 'CLT', 'Ativo'),
('01234567890', 'Patricia Souza', 'patricia.souza@empresa.com', 'RH', 'CTPS010', 'CLT', 'Ativo');

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
-- 3. QUESTÕES
-- ==========================================
-- Questões para Desligamento
INSERT INTO Questao (texto_questao, status) VALUES
('Qual foi o principal motivo do seu desligamento?', 'Ativa'),
('Como você avalia o suporte recebido durante seu período na empresa?', 'Ativa'),
('Você recomendaria esta empresa para outros profissionais?', 'Ativa'),
('Como você avalia o ambiente de trabalho?', 'Ativa'),
('Você recebeu feedbacks regulares sobre seu desempenho?', 'Ativa');

-- Questões para Clima Organizacional
INSERT INTO Questao (texto_questao, status) VALUES
('Como você avalia a comunicação interna da empresa?', 'Ativa'),
('Você se sente valorizado no seu trabalho?', 'Ativa'),
('Como você avalia o relacionamento com seus colegas?', 'Ativa'),
('A empresa oferece oportunidades de crescimento?', 'Ativa'),
('Você está satisfeito com seu salário atual?', 'Ativa');

-- Questões para Onboarding
INSERT INTO Questao (texto_questao, status) VALUES
('O processo de integração foi claro e organizado?', 'Ativa'),
('Você recebeu todas as informações necessárias para começar?', 'Ativa'),
('Como você avalia o suporte do seu gestor durante a integração?', 'Ativa'),
('Você se sente preparado para suas funções?', 'Ativa');

-- ==========================================
-- 4. OPÇÕES PARA AS QUESTÕES
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
-- 5. QUESTIONÁRIOS
-- ==========================================
INSERT INTO Questionario (nome, descricao, status, classificacao_cod) VALUES
('Questionário de Desligamento', 'Avaliação realizada no momento do desligamento do funcionário', 'Ativo', 3),
('Pesquisa de Clima Organizacional 2024', 'Avaliação do clima organizacional da empresa', 'Ativo', 2),
('Avaliação de Onboarding', 'Questionário para novos funcionários após 30 dias', 'Ativo', 1);

-- ==========================================
-- 6. RELACIONAMENTO QUESTIONÁRIO-QUESTÃO
-- ==========================================
-- Questionário de Desligamento (questões 1-5)
INSERT INTO Questionario_Questao (questionario_cod, questao_cod) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5);

-- Questionário de Clima (questões 6-10)
INSERT INTO Questionario_Questao (questionario_cod, questao_cod) VALUES
(2, 6), (2, 7), (2, 8), (2, 9), (2, 10);

-- Questionário de Onboarding (questões 11-14)
INSERT INTO Questionario_Questao (questionario_cod, questao_cod) VALUES
(3, 11), (3, 12), (3, 13), (3, 14);

-- ==========================================
-- 7. TREINAMENTOS
-- ==========================================
INSERT INTO Treinamento (nome, data_realizacao, validade, local) VALUES
('Treinamento de Segurança do Trabalho', '2024-01-15', '2025-01-15', 'Sala de Treinamento A'),
('Curso de Liderança', '2024-02-20', NULL, 'Online'),
('Workshop de Comunicação', '2024-03-10', NULL, 'Sala de Treinamento B'),
('Treinamento de Sistemas Internos', '2024-04-05', '2025-04-05', 'Sala de Treinamento A');

-- ==========================================
-- 8. RELACIONAMENTO FUNCIONÁRIO-TREINAMENTO
-- ==========================================
INSERT INTO Funcionario_Treinamento (funcionario_cpf, treinamento_cod, n_certificado) VALUES
('12345678901', 1, 'CERT-001'),
('12345678901', 4, 'CERT-002'),
('23456789012', 2, 'CERT-003'),
('34567890123', 1, 'CERT-004'),
('45678901234', 3, 'CERT-005'),
('56789012345', 1, 'CERT-006'),
('56789012345', 4, 'CERT-007');

-- ==========================================
-- 9. RELACIONAMENTO FUNCIONÁRIO-CLASSIFICAÇÃO
-- ==========================================
INSERT INTO Funcionario_Classificacao (funcionario_cpf, classificacao_cod) VALUES
('12345678901', 2), -- João - Clima
('23456789012', 2), -- Maria - Clima
('34567890123', 2), -- Pedro - Clima
('45678901234', 1), -- Ana - Onboarding
('56789012345', 1), -- Carlos - Onboarding
('89012345678', 2); -- Fernanda - Clima

-- ==========================================
-- 10. AVALIAÇÕES
-- ==========================================
INSERT INTO Avaliacao (data_completa, local, observacao_geral, rating_geral, avaliado_cpf, avaliador_cpf, questionario_cod) VALUES
('2024-01-10 14:30:00-03:00', 'Escritório Central', 'Avaliação realizada no momento do desligamento', 3, '67890123456', '23456789012', 1),
('2024-01-15 10:00:00-03:00', 'Escritório Central', 'Avaliação realizada no momento do desligamento', 2, '78901234567', '23456789012', 1),
('2024-02-01 09:00:00-03:00', 'Escritório Central', 'Pesquisa de clima organizacional', 4, '12345678901', '23456789012', 2),
('2024-02-01 09:15:00-03:00', 'Escritório Central', 'Pesquisa de clima organizacional', 5, '23456789012', '23456789012', 2),
('2024-02-01 09:30:00-03:00', 'Escritório Central', 'Pesquisa de clima organizacional', 4, '34567890123', '23456789012', 2),
('2024-02-15 11:00:00-03:00', 'Escritório Central', 'Avaliação após 30 dias de trabalho', 5, '45678901234', '23456789012', 3),
('2024-02-20 11:00:00-03:00', 'Escritório Central', 'Avaliação após 30 dias de trabalho', 4, '56789012345', '23456789012', 3),
('2024-03-01 09:00:00-03:00', 'Escritório Central', 'Pesquisa de clima organizacional', 3, '89012345678', '23456789012', 2);

-- ==========================================
-- 11. RESPOSTAS
-- ==========================================
-- Avaliação 1 (Desligamento - Juliana)
-- Questão 1: Melhor oportunidade (opcao_cod = 1)
-- Questão 2: Regular (opcao_cod = 8)
-- Questão 3: Talvez (opcao_cod = 13)
-- Questão 4: Regular (opcao_cod = 18)
-- Questão 5: Ocasionalmente (opcao_cod = 23)
INSERT INTO Resposta (avaliacao_cod, questao_cod, opcao_cod) VALUES
(1, 1, 1), (1, 2, 8), (1, 3, 13), (1, 4, 18), (1, 5, 23);

-- Avaliação 2 (Desligamento - Roberto)
-- Questão 1: Questões salariais (opcao_cod = 3)
-- Questão 2: Ruim (opcao_cod = 9)
-- Questão 3: Provavelmente não (opcao_cod = 14)
-- Questão 4: Ruim (opcao_cod = 19)
-- Questão 5: Raramente (opcao_cod = 24)
INSERT INTO Resposta (avaliacao_cod, questao_cod, opcao_cod) VALUES
(2, 1, 3), (2, 2, 9), (2, 3, 14), (2, 4, 19), (2, 5, 24);

-- Avaliação 3 (Clima - João)
-- Questão 6: Boa (opcao_cod = 27)
-- Questão 7: Sim, parcialmente (opcao_cod = 32)
-- Questão 8: Bom (opcao_cod = 37)
-- Questão 9: Sim, algumas oportunidades (opcao_cod = 42)
-- Questão 10: Satisfeito (opcao_cod = 47)
INSERT INTO Resposta (avaliacao_cod, questao_cod, opcao_cod) VALUES
(3, 6, 27), (3, 7, 32), (3, 8, 37), (3, 9, 42), (3, 10, 47);

-- Avaliação 4 (Clima - Maria)
-- Questão 6: Excelente (opcao_cod = 27 - primeira opção da questão 6)
-- Questão 7: Sim, totalmente (opcao_cod = 32 - primeira opção da questão 7)
-- Questão 8: Excelente (opcao_cod = 37 - primeira opção da questão 8)
-- Questão 9: Sim, muitas oportunidades (opcao_cod = 42 - primeira opção da questão 9)
-- Questão 10: Muito satisfeito (opcao_cod = 47 - primeira opção da questão 10)
INSERT INTO Resposta (avaliacao_cod, questao_cod, opcao_cod) VALUES
(4, 6, 27), (4, 7, 32), (4, 8, 37), (4, 9, 42), (4, 10, 47);

-- Avaliação 5 (Clima - Pedro)
-- Questão 6: Boa (opcao_cod = 27)
-- Questão 7: Neutro (opcao_cod = 33)
-- Questão 8: Bom (opcao_cod = 37)
-- Questão 9: Poucas oportunidades (opcao_cod = 43)
-- Questão 10: Neutro (opcao_cod = 48)
INSERT INTO Resposta (avaliacao_cod, questao_cod, opcao_cod) VALUES
(5, 6, 27), (5, 7, 33), (5, 8, 37), (5, 9, 43), (5, 10, 48);

-- Avaliação 6 (Onboarding - Ana)
-- Questão 11: Sim, muito claro (opcao_cod = 51)
-- Questão 12: Sim, todas as informações (opcao_cod = 56)
-- Questão 13: Excelente (opcao_cod = 61)
-- Questão 14: Sim, totalmente preparado (opcao_cod = 66)
INSERT INTO Resposta (avaliacao_cod, questao_cod, opcao_cod) VALUES
(6, 11, 51), (6, 12, 56), (6, 13, 61), (6, 14, 66);

-- Avaliação 7 (Onboarding - Carlos)
-- Questão 11: Sim, razoavelmente claro (opcao_cod = 52)
-- Questão 12: A maioria das informações (opcao_cod = 57)
-- Questão 13: Bom (opcao_cod = 62)
-- Questão 14: Sim, razoavelmente preparado (opcao_cod = 67)
INSERT INTO Resposta (avaliacao_cod, questao_cod, opcao_cod) VALUES
(7, 11, 52), (7, 12, 57), (7, 13, 62), (7, 14, 67);

-- Avaliação 8 (Clima - Fernanda)
-- Questão 6: Regular (opcao_cod = 28)
-- Questão 7: Sim, parcialmente (opcao_cod = 32)
-- Questão 8: Regular (opcao_cod = 38)
-- Questão 9: Poucas oportunidades (opcao_cod = 43)
-- Questão 10: Neutro (opcao_cod = 48)
INSERT INTO Resposta (avaliacao_cod, questao_cod, opcao_cod) VALUES
(8, 6, 28), (8, 7, 32), (8, 8, 38), (8, 9, 43), (8, 10, 48);

-- ==========================================
-- FIM DO SEED
-- ==========================================
-- Para verificar os dados inseridos, você pode executar:
-- SELECT COUNT(*) FROM Funcionario;
-- SELECT COUNT(*) FROM Questao;
-- SELECT COUNT(*) FROM Opcao;
-- SELECT COUNT(*) FROM Questionario;
-- SELECT COUNT(*) FROM Avaliacao;
-- SELECT COUNT(*) FROM Resposta;

