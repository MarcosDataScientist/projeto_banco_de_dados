-- ==========================================
-- DADOS INICIAIS (SEED)
-- Sistema de Avaliação de Desligamento
-- ==========================================


-- ==========================================
-- CLASSIFICAÇÕES
-- ==========================================
INSERT INTO Classificacao (nome) VALUES
('Desligamento Voluntário'),
('Desligamento Involuntário'),
('Avaliação de Clima'),
('Avaliação de Desempenho'),
('Feedback 360'),
('Pesquisa de Satisfação')
ON CONFLICT (nome) DO NOTHING;

-- ==========================================
-- FUNCIONÁRIOS
-- ==========================================
INSERT INTO Funcionario (cpf, nome, email, setor, ctps, tipo, status) VALUES
('12345678900', 'João Silva', 'joao.silva@empresa.com', 'TI', '12345/0001', 'Desenvolvedor', 'Ativo'),
('98765432100', 'Maria Santos', 'maria.santos@empresa.com', 'RH', '67890/0002', 'Analista', 'Ativo'),
('45678912300', 'Pedro Costa', 'pedro.costa@empresa.com', 'Vendas', '11223/0003', 'Gerente', 'Ativo'),
('78912345600', 'Ana Oliveira', 'ana.oliveira@empresa.com', 'RH', '33445/0004', 'Gerente de RH', 'Ativo'),
('32165498700', 'Carlos Mendes', 'carlos.mendes@empresa.com', 'Operações', '55667/0005', 'Diretor', 'Ativo'),
('15975348600', 'Juliana Lima', 'juliana.lima@empresa.com', 'Marketing', '77889/0006', 'Coordenadora', 'Processo de Saída'),
('75315948200', 'Roberto Alves', 'roberto.alves@empresa.com', 'Financeiro', '99001/0007', 'Analista', 'Desligado'),
('95175382400', 'Beatriz Rocha', 'beatriz.rocha@empresa.com', 'TI', '11234/0008', 'Tech Lead', 'Ativo')
ON CONFLICT (cpf) DO NOTHING;

-- ==========================================
-- TREINAMENTOS
-- ==========================================
INSERT INTO Treinamento (nome, data_realizacao, validade, local) VALUES
('NR-10 - Segurança em Instalações Elétricas', '2023-06-15', '2025-06-15', 'Sala de Treinamento 1'),
('Gestão de Pessoas', '2023-08-20', '2024-08-20', 'Auditório Principal'),
('Metodologias Ágeis', '2024-01-10', '2026-01-10', 'Online'),
('Prevenção de Acidentes', '2023-11-05', '2025-11-05', 'Sala de Treinamento 2'),
('Comunicação Efetiva', '2024-02-14', '2025-02-14', 'Sala de Reuniões A'),
('Segurança da Informação', '2023-09-30', '2025-09-30', 'Online'),
('Liderança e Desenvolvimento', '2023-12-10', '2024-12-10', 'Centro de Convenções')
ON CONFLICT DO NOTHING;

-- ==========================================
-- RELACIONAMENTO FUNCIONÁRIO-TREINAMENTO
-- ==========================================
INSERT INTO Funcionario_Treinamento (funcionario_cpf, treinamento_cod, n_certificado) VALUES
('12345678900', (SELECT cod_treinamento FROM Treinamento WHERE nome = 'Metodologias Ágeis'), 'CERT-001-2024'),
('12345678900', (SELECT cod_treinamento FROM Treinamento WHERE nome = 'Segurança da Informação'), 'CERT-002-2023'),
('98765432100', (SELECT cod_treinamento FROM Treinamento WHERE nome = 'Gestão de Pessoas'), 'CERT-003-2023'),
('98765432100', (SELECT cod_treinamento FROM Treinamento WHERE nome = 'Comunicação Efetiva'), 'CERT-004-2024'),
('45678912300', (SELECT cod_treinamento FROM Treinamento WHERE nome = 'Gestão de Pessoas'), 'CERT-005-2023'),
('45678912300', (SELECT cod_treinamento FROM Treinamento WHERE nome = 'Liderança e Desenvolvimento'), 'CERT-006-2023'),
('78912345600', (SELECT cod_treinamento FROM Treinamento WHERE nome = 'Gestão de Pessoas'), 'CERT-007-2023'),
('78912345600', (SELECT cod_treinamento FROM Treinamento WHERE nome = 'Liderança e Desenvolvimento'), 'CERT-008-2023'),
('95175382400', (SELECT cod_treinamento FROM Treinamento WHERE nome = 'Metodologias Ágeis'), 'CERT-009-2024'),
('95175382400', (SELECT cod_treinamento FROM Treinamento WHERE nome = 'Segurança da Informação'), 'CERT-010-2023')
ON CONFLICT DO NOTHING;

-- ==========================================
-- RELACIONAMENTO FUNCIONÁRIO-CLASSIFICAÇÃO
-- ==========================================
INSERT INTO Funcionario_Classificacao (funcionario_cpf, classificacao_cod) VALUES
('15975348600', (SELECT cod_classificacao FROM Classificacao WHERE nome = 'Desligamento Voluntário')),
('75315948200', (SELECT cod_classificacao FROM Classificacao WHERE nome = 'Desligamento Involuntário')),
('12345678900', (SELECT cod_classificacao FROM Classificacao WHERE nome = 'Avaliação de Desempenho')),
('98765432100', (SELECT cod_classificacao FROM Classificacao WHERE nome = 'Feedback 360')),
('45678912300', (SELECT cod_classificacao FROM Classificacao WHERE nome = 'Avaliação de Desempenho'))
ON CONFLICT DO NOTHING;

-- ==========================================
-- QUESTÕES
-- ==========================================

-- Questões de Múltipla Escolha
INSERT INTO Questao (tipo_questao, texto_questao, status) VALUES
('Múltipla Escolha', 'Qual o principal motivo da sua saída da empresa?', 'Ativo'),
('Múltipla Escolha', 'Como você avalia o ambiente de trabalho?', 'Ativo'),
('Múltipla Escolha', 'A comunicação interna era clara e eficiente?', 'Ativo'),
('Múltipla Escolha', 'Você teve oportunidades de crescimento profissional?', 'Ativo');

-- Questões de Texto Livre
INSERT INTO Questao (tipo_questao, texto_questao, status) VALUES
('Texto Livre', 'Descreva sua experiência geral na empresa:', 'Ativo'),
('Texto Livre', 'O que você mais gostou durante o período em que trabalhou aqui?', 'Ativo'),
('Texto Livre', 'Que sugestões você daria para melhorar o ambiente de trabalho?', 'Ativo'),
('Texto Livre', 'Há algo mais que você gostaria de compartilhar?', 'Ativo'),
('Texto Livre', 'Como foi seu relacionamento com a liderança?', 'Ativo');

-- ==========================================
-- QUESTÕES DE MÚLTIPLA ESCOLHA (Opções)
-- ==========================================
INSERT INTO Questao_Multipla_Escolha (questao_cod, opcoes) VALUES
((SELECT cod_questao FROM Questao WHERE texto_questao = 'Qual o principal motivo da sua saída da empresa?' LIMIT 1),
 '["Melhor oferta salarial", "Insatisfação com a gestão", "Falta de crescimento profissional", "Mudança de cidade", "Questões pessoais", "Outro motivo"]'::jsonb),

((SELECT cod_questao FROM Questao WHERE texto_questao = 'Como você avalia o ambiente de trabalho?' LIMIT 1),
 '["Excelente", "Bom", "Regular", "Ruim", "Péssimo"]'::jsonb),

((SELECT cod_questao FROM Questao WHERE texto_questao = 'A comunicação interna era clara e eficiente?' LIMIT 1),
 '["Sempre", "Na maioria das vezes", "Às vezes", "Raramente", "Nunca"]'::jsonb),

((SELECT cod_questao FROM Questao WHERE texto_questao = 'Você teve oportunidades de crescimento profissional?' LIMIT 1),
 '["Sim, muitas", "Sim, algumas", "Poucas", "Nenhuma"]'::jsonb)
ON CONFLICT DO NOTHING;

-- ==========================================
-- QUESTÕES DE TEXTO LIVRE
-- ==========================================
INSERT INTO Questao_Texto_Livre (questao_cod) VALUES
((SELECT cod_questao FROM Questao WHERE texto_questao = 'Descreva sua experiência geral na empresa:' LIMIT 1)),
((SELECT cod_questao FROM Questao WHERE texto_questao = 'O que você mais gostou durante o período em que trabalhou aqui?' LIMIT 1)),
((SELECT cod_questao FROM Questao WHERE texto_questao = 'Que sugestões você daria para melhorar o ambiente de trabalho?' LIMIT 1)),
((SELECT cod_questao FROM Questao WHERE texto_questao = 'Há algo mais que você gostaria de compartilhar?' LIMIT 1)),
((SELECT cod_questao FROM Questao WHERE texto_questao = 'Como foi seu relacionamento com a liderança?' LIMIT 1))
ON CONFLICT DO NOTHING;

-- ==========================================
-- QUESTIONÁRIOS
-- ==========================================
INSERT INTO Questionario (nome, tipo, status, classificacao_cod) VALUES
('Questionário de Desligamento Completo', 'Desligamento', 'Ativo', 
 (SELECT cod_classificacao FROM Classificacao WHERE nome = 'Desligamento Voluntário')),
('Questionário de Desligamento Rápido', 'Desligamento', 'Ativo', 
 (SELECT cod_classificacao FROM Classificacao WHERE nome = 'Desligamento Voluntário')),
('Questionário de Feedback Geral', 'Feedback', 'Ativo', 
 (SELECT cod_classificacao FROM Classificacao WHERE nome = 'Feedback 360')),
('Questionário de Avaliação de Clima', 'Clima Organizacional', 'Ativo', 
 (SELECT cod_classificacao FROM Classificacao WHERE nome = 'Avaliação de Clima'))
ON CONFLICT DO NOTHING;

-- ==========================================
-- RELACIONAMENTO QUESTIONÁRIO-QUESTÃO
-- ==========================================

-- Questionário de Desligamento Completo (todas as questões)
INSERT INTO Questionario_Questao (questionario_cod, questao_cod)
SELECT 
    (SELECT cod_questionario FROM Questionario WHERE nome = 'Questionário de Desligamento Completo'),
    cod_questao
FROM Questao
WHERE status = 'Ativo'
ON CONFLICT DO NOTHING;

-- Questionário de Desligamento Rápido (apenas algumas questões)
INSERT INTO Questionario_Questao (questionario_cod, questao_cod) VALUES
((SELECT cod_questionario FROM Questionario WHERE nome = 'Questionário de Desligamento Rápido'),
 (SELECT cod_questao FROM Questao WHERE texto_questao = 'Qual o principal motivo da sua saída da empresa?' LIMIT 1)),
((SELECT cod_questionario FROM Questionario WHERE nome = 'Questionário de Desligamento Rápido'),
 (SELECT cod_questao FROM Questao WHERE texto_questao = 'Como você avalia o ambiente de trabalho?' LIMIT 1)),
((SELECT cod_questionario FROM Questionario WHERE nome = 'Questionário de Desligamento Rápido'),
 (SELECT cod_questao FROM Questao WHERE texto_questao = 'Descreva sua experiência geral na empresa:' LIMIT 1))
ON CONFLICT DO NOTHING;

-- Questionário de Feedback Geral
INSERT INTO Questionario_Questao (questionario_cod, questao_cod) VALUES
((SELECT cod_questionario FROM Questionario WHERE nome = 'Questionário de Feedback Geral'),
 (SELECT cod_questao FROM Questao WHERE texto_questao = 'Como você avalia o ambiente de trabalho?' LIMIT 1)),
((SELECT cod_questionario FROM Questionario WHERE nome = 'Questionário de Feedback Geral'),
 (SELECT cod_questao FROM Questao WHERE texto_questao = 'A comunicação interna era clara e eficiente?' LIMIT 1)),
((SELECT cod_questionario FROM Questionario WHERE nome = 'Questionário de Feedback Geral'),
 (SELECT cod_questao FROM Questao WHERE texto_questao = 'Você teve oportunidades de crescimento profissional?' LIMIT 1)),
((SELECT cod_questionario FROM Questionario WHERE nome = 'Questionário de Feedback Geral'),
 (SELECT cod_questao FROM Questao WHERE texto_questao = 'Que sugestões você daria para melhorar o ambiente de trabalho?' LIMIT 1))
ON CONFLICT DO NOTHING;

-- ==========================================
-- AVALIAÇÕES
-- ==========================================
INSERT INTO Avaliacao (local, data_completa, descricao, rating, avaliado_cpf, avaliador_cpf, questionario_cod) VALUES
('Sala de RH', '2024-01-30 14:30:00-03', 'Avaliação de desligamento - Juliana Lima', 4, 
 '15975348600', '78912345600', 
 (SELECT cod_questionario FROM Questionario WHERE nome = 'Questionário de Desligamento Completo')),

('Online', '2024-02-05 10:00:00-03', 'Avaliação de desligamento - Roberto Alves', 3, 
 '75315948200', '78912345600', 
 (SELECT cod_questionario FROM Questionario WHERE nome = 'Questionário de Desligamento Rápido')),

('Sala de Reuniões', '2024-03-10 16:00:00-03', 'Feedback trimestral - João Silva', 5, 
 '12345678900', '95175382400', 
 (SELECT cod_questionario FROM Questionario WHERE nome = 'Questionário de Feedback Geral'))
ON CONFLICT DO NOTHING;

-- ==========================================
-- RESPOSTAS (Exemplos)
-- ==========================================

-- Respostas da primeira avaliação (Juliana Lima)
INSERT INTO Resposta (tipo_resposta, avaliacao_cod, questao_cod) VALUES
('Escolha', 
 (SELECT cod_avaliacao FROM Avaliacao WHERE avaliado_cpf = '15975348600' LIMIT 1),
 (SELECT cod_questao FROM Questao WHERE texto_questao = 'Qual o principal motivo da sua saída da empresa?' LIMIT 1)),
('Escolha', 
 (SELECT cod_avaliacao FROM Avaliacao WHERE avaliado_cpf = '15975348600' LIMIT 1),
 (SELECT cod_questao FROM Questao WHERE texto_questao = 'Como você avalia o ambiente de trabalho?' LIMIT 1)),
('Texto', 
 (SELECT cod_avaliacao FROM Avaliacao WHERE avaliado_cpf = '15975348600' LIMIT 1),
 (SELECT cod_questao FROM Questao WHERE texto_questao = 'Descreva sua experiência geral na empresa:' LIMIT 1));

-- Respostas de Escolha
INSERT INTO Resposta_Escolha (resposta_cod, escolha) VALUES
((SELECT r.cod_resposta FROM Resposta r 
  JOIN Questao q ON r.questao_cod = q.cod_questao 
  WHERE q.texto_questao = 'Qual o principal motivo da sua saída da empresa?' 
  AND r.avaliacao_cod = (SELECT cod_avaliacao FROM Avaliacao WHERE avaliado_cpf = '15975348600' LIMIT 1) LIMIT 1),
 'Melhor oferta salarial'),

((SELECT r.cod_resposta FROM Resposta r 
  JOIN Questao q ON r.questao_cod = q.cod_questao 
  WHERE q.texto_questao = 'Como você avalia o ambiente de trabalho?' 
  AND r.avaliacao_cod = (SELECT cod_avaliacao FROM Avaliacao WHERE avaliado_cpf = '15975348600' LIMIT 1) LIMIT 1),
 'Bom')
ON CONFLICT DO NOTHING;

-- Respostas de Texto
INSERT INTO Resposta_Texto (resposta_cod, texto_resposta) VALUES
((SELECT r.cod_resposta FROM Resposta r 
  JOIN Questao q ON r.questao_cod = q.cod_questao 
  WHERE q.texto_questao = 'Descreva sua experiência geral na empresa:' 
  AND r.avaliacao_cod = (SELECT cod_avaliacao FROM Avaliacao WHERE avaliado_cpf = '15975348600' LIMIT 1) LIMIT 1),
 'Minha experiência na empresa foi muito positiva. Aprendi bastante e tive ótimos colegas de trabalho. A decisão de sair foi difícil, mas recebi uma proposta que não poderia recusar.')
ON CONFLICT DO NOTHING;