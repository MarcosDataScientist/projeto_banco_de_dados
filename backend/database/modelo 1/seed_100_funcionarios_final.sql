-- ==========================================
-- DADOS INICIAIS (SEED) - VERSÃO CORRIGIDA
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
-- FUNCIONÁRIOS - 95 FUNCIONÁRIOS
-- ==========================================
INSERT INTO Funcionario (cpf, nome, email, setor, ctps, tipo, status) VALUES
-- TI (25 funcionários)
('11111111111', 'Ana Silva Santos', 'ana.silva@empresa.com', 'TI', '11111/0001', 'Desenvolvedor Senior', 'Ativo'),
('11111111112', 'Carlos Eduardo Lima', 'carlos.lima@empresa.com', 'TI', '11111/0002', 'Desenvolvedor Pleno', 'Ativo'),
('11111111113', 'Mariana Costa Oliveira', 'mariana.costa@empresa.com', 'TI', '11111/0003', 'Desenvolvedor Junior', 'Ativo'),
('11111111114', 'João Pedro Alves', 'joao.alves@empresa.com', 'TI', '11111/0004', 'Tech Lead', 'Ativo'),
('11111111115', 'Fernanda Rodrigues', 'fernanda.rodrigues@empresa.com', 'TI', '11111/0005', 'Arquiteta de Software', 'Ativo'),
('11111111116', 'Rafael Mendes', 'rafael.mendes@empresa.com', 'TI', '11111/0006', 'DevOps Engineer', 'Ativo'),
('11111111117', 'Larissa Ferreira', 'larissa.ferreira@empresa.com', 'TI', '11111/0007', 'QA Engineer', 'Ativo'),
('11111111118', 'Diego Souza', 'diego.souza@empresa.com', 'TI', '11111/0008', 'Desenvolvedor Mobile', 'Ativo'),
('11111111119', 'Camila Barbosa', 'camila.barbosa@empresa.com', 'TI', '11111/0009', 'UX/UI Designer', 'Ativo'),
('11111111120', 'Thiago Nascimento', 'thiago.nascimento@empresa.com', 'TI', '11111/0010', 'Data Engineer', 'Ativo'),
('11111111121', 'Juliana Pereira', 'juliana.pereira@empresa.com', 'TI', '11111/0011', 'Product Manager', 'Ativo'),
('11111111122', 'Gabriel Martins', 'gabriel.martins@empresa.com', 'TI', '11111/0012', 'Scrum Master', 'Ativo'),
('11111111123', 'Beatriz Carvalho', 'beatriz.carvalho@empresa.com', 'TI', '11111/0013', 'Desenvolvedor Full Stack', 'Ativo'),
('11111111124', 'Lucas Rocha', 'lucas.rocha@empresa.com', 'TI', '11111/0014', 'Analista de Sistemas', 'Ativo'),
('11111111125', 'Amanda Dias', 'amanda.dias@empresa.com', 'TI', '11111/0015', 'Cybersecurity Analyst', 'Ativo'),
('11111111126', 'Pedro Henrique Silva', 'pedro.silva@empresa.com', 'TI', '11111/0016', 'Cloud Engineer', 'Ativo'),
('11111111127', 'Natália Almeida', 'natalia.almeida@empresa.com', 'TI', '11111/0017', 'Business Analyst', 'Ativo'),
('11111111128', 'Felipe Castro', 'felipe.castro@empresa.com', 'TI', '11111/0018', 'Machine Learning Engineer', 'Ativo'),
('11111111129', 'Isabela Santos', 'isabela.santos@empresa.com', 'TI', '11111/0019', 'Frontend Developer', 'Ativo'),
('11111111130', 'Bruno Oliveira', 'bruno.oliveira@empresa.com', 'TI', '11111/0020', 'Backend Developer', 'Ativo'),
('11111111131', 'Carolina Lima', 'carolina.lima@empresa.com', 'TI', '11111/0021', 'Database Administrator', 'Ativo'),
('11111111132', 'André Costa', 'andre.costa@empresa.com', 'TI', '11111/0022', 'System Administrator', 'Ativo'),
('11111111133', 'Patrícia Gomes', 'patricia.gomes@empresa.com', 'TI', '11111/0023', 'IT Support Specialist', 'Ativo'),
('11111111134', 'Rodrigo Ferreira', 'rodrigo.ferreira@empresa.com', 'TI', '11111/0024', 'Network Engineer', 'Ativo'),
('11111111135', 'Vanessa Ribeiro', 'vanessa.ribeiro@empresa.com', 'TI', '11111/0025', 'IT Manager', 'Ativo'),

-- RH (15 funcionários)
('22222222221', 'Roberto Silva', 'roberto.silva@empresa.com', 'RH', '22222/0001', 'Analista de RH', 'Ativo'),
('22222222222', 'Cristina Mendes', 'cristina.mendes@empresa.com', 'RH', '22222/0002', 'Recrutadora', 'Ativo'),
('22222222223', 'Marcos Oliveira', 'marcos.oliveira@empresa.com', 'RH', '22222/0003', 'Especialista em Treinamento', 'Ativo'),
('22222222224', 'Luciana Costa', 'luciana.costa@empresa.com', 'RH', '22222/0004', 'Coordenadora de RH', 'Ativo'),
('22222222225', 'Paulo Santos', 'paulo.santos@empresa.com', 'RH', '22222/0005', 'Analista de Folha', 'Ativo'),
('22222222226', 'Renata Alves', 'renata.alves@empresa.com', 'RH', '22222/0006', 'Especialista em Benefícios', 'Ativo'),
('22222222227', 'Fábio Lima', 'fabio.lima@empresa.com', 'RH', '22222/0007', 'Analista de Recrutamento', 'Ativo'),
('22222222228', 'Sandra Rodrigues', 'sandra.rodrigues@empresa.com', 'RH', '22222/0008', 'Coordenadora de Treinamento', 'Ativo'),
('22222222229', 'Alexandre Pereira', 'alexandre.pereira@empresa.com', 'RH', '22222/0009', 'Analista de Desenvolvimento', 'Ativo'),
('22222222230', 'Mônica Carvalho', 'monica.carvalho@empresa.com', 'RH', '22222/0010', 'Especialista em Clima', 'Ativo'),
('22222222231', 'Ricardo Barbosa', 'ricardo.barbosa@empresa.com', 'RH', '22222/0011', 'Analista de Carreira', 'Ativo'),
('22222222232', 'Tatiana Nascimento', 'tatiana.nascimento@empresa.com', 'RH', '22222/0012', 'Coordenadora de Folha', 'Ativo'),
('22222222233', 'Leandro Martins', 'leandro.martins@empresa.com', 'RH', '22222/0013', 'Analista de Compliance', 'Ativo'),
('22222222234', 'Viviane Souza', 'viviane.souza@empresa.com', 'RH', '22222/0014', 'Especialista em Diversidade', 'Ativo'),
('22222222235', 'Gustavo Ferreira', 'gustavo.ferreira@empresa.com', 'RH', '22222/0015', 'Gerente de RH', 'Ativo'),

-- Vendas (15 funcionários)
('33333333331', 'Patricia Sandra', 'patricia.sales@empresa.com', 'Vendas', '33333/0001', 'Vendedora Senior', 'Ativo'),
('33333333332', 'Antonio Correia', 'antonio.comercial@empresa.com', 'Vendas', '33333/0002', 'Gerente de Vendas', 'Ativo'),
('33333333333', 'Lucia Rezende', 'lucia.representante@empresa.com', 'Vendas', '33333/0003', 'Representante Comercial', 'Ativo'),
('33333333334', 'Carlos Monteiro', 'carlos.vendas@empresa.com', 'Vendas', '33333/0004', 'Executivo de Contas', 'Ativo'),
('33333333335', 'Maria Cardoso', 'maria.consultora@empresa.com', 'Vendas', '33333/0005', 'Consultora de Vendas', 'Ativo'),
('33333333336', 'João Marques', 'joao.supervisor@empresa.com', 'Vendas', '33333/0006', 'Supervisor de Vendas', 'Ativo'),
('33333333337', 'Ana Pires', 'ana.coordenadora@empresa.com', 'Vendas', '33333/0007', 'Coordenadora de Vendas', 'Ativo'),
('33333333338', 'Pedro Silva', 'pedro.analista@empresa.com', 'Vendas', '33333/0008', 'Analista de Vendas', 'Ativo'),
('33333333339', 'Carla Gonçalves', 'carla.especialista@empresa.com', 'Vendas', '33333/0009', 'Especialista em Negócios', 'Ativo'),
('33333333340', 'Roberto Santos', 'roberto.diretor@empresa.com', 'Vendas', '33333/0010', 'Diretor Comercial', 'Ativo'),
('33333333341', 'Fernanda Batista', 'fernanda.assistente@empresa.com', 'Vendas', '33333/0011', 'Assistente de Vendas', 'Ativo'),
('33333333342', 'Rafael Alisson', 'rafael.consultor@empresa.com', 'Vendas', '33333/0012', 'Consultor de Negócios', 'Ativo'),
('33333333343', 'Larissa Antonieta', 'larissa.vendedora@empresa.com', 'Vendas', '33333/0013', 'Vendedora Pleno', 'Ativo'),
('33333333344', 'Diego Gordim', 'diego.gerente@empresa.com', 'Vendas', '33333/0014', 'Gerente Regional', 'Ativo'),
('33333333345', 'Camila Abaffim', 'camila.coordenadora@empresa.com', 'Vendas', '33333/0015', 'Coordenadora Regional', 'Ativo'),

-- Financeiro (10 funcionários)
('44444444441', 'Thiago Finn', 'thiago.financeiro@empresa.com', 'Financeiro', '44444/0001', 'Analista Financeiro', 'Ativo'),
('44444444442', 'Juliana Cabb', 'juliana.contadora@empresa.com', 'Financeiro', '44444/0002', 'Contadora', 'Ativo'),
('44444444443', 'Gabriel Connt', 'gabriel.controller@empresa.com', 'Financeiro', '44444/0003', 'Controller', 'Ativo'),
('44444444444', 'Beatriz Tinnt', 'beatriz.tesoureira@empresa.com', 'Financeiro', '44444/0004', 'Tesoureira', 'Ativo'),
('44444444445', 'Lucas Alves', 'lucas.analista@empresa.com', 'Financeiro', '44444/0005', 'Analista de Custos', 'Ativo'),
('44444444446', 'Amanda Grant', 'amanda.gerente@empresa.com', 'Financeiro', '44444/0006', 'Gerente Financeiro', 'Ativo'),
('44444444447', 'Pedro Corda', 'pedro.coordenador@empresa.com', 'Financeiro', '44444/0007', 'Coordenador Financeiro', 'Ativo'),
('44444444448', 'Natália Escapelato', 'natalia.especialista@empresa.com', 'Financeiro', '44444/0008', 'Especialista em Orçamento', 'Ativo'),
('44444444449', 'Felipe Dirretyir', 'felipe.diretor@empresa.com', 'Financeiro', '44444/0009', 'Diretor Financeiro', 'Ativo'),
('44444444450', 'Isabela Assis', 'isabela.assistente@empresa.com', 'Financeiro', '44444/0010', 'Assistente Financeiro', 'Ativo'),

-- Marketing (10 funcionários)
('55555555551', 'Bruno Mesatto', 'bruno.marketing@empresa.com', 'Marketing', '55555/0001', 'Analista de Marketing', 'Ativo'),
('55555555552', 'Carolina Destra', 'carolina.digital@empresa.com', 'Marketing', '55555/0002', 'Especialista em Marketing Digital', 'Ativo'),
('55555555553', 'André Creta', 'andre.criativo@empresa.com', 'Marketing', '55555/0003', 'Diretor de Criação', 'Ativo'),
('55555555554', 'Patrícia Gata', 'patricia.social@empresa.com', 'Marketing', '55555/0004', 'Especialista em Redes Sociais', 'Ativo'),
('55555555555', 'Rodrigo Coelho', 'rodrigo.conteudo@empresa.com', 'Marketing', '55555/0005', 'Especialista em Conteúdo', 'Ativo'),
('55555555556', 'Vanessa Brandt', 'vanessa.brand@empresa.com', 'Marketing', '55555/0006', 'Gerente de Marca', 'Ativo'),
('55555555557', 'Gustavo Perfaz', 'gustavo.performance@empresa.com', 'Marketing', '55555/0007', 'Analista de Performance', 'Ativo'),
('55555555558', 'Larissa Filho', 'larissa.eventos@empresa.com', 'Marketing', '55555/0008', 'Coordenadora de Eventos', 'Ativo'),
('55555555559', 'Diego Granto', 'diego.growth@empresa.com', 'Marketing', '55555/0009', 'Especialista em Growth', 'Ativo'),
('55555555560', 'Camila Pestate', 'camila.estrategia@empresa.com', 'Marketing', '55555/0010', 'Estrategista de Marketing', 'Ativo'),

-- Operações (10 funcionários)
('66666666661', 'Thiago Castro', 'thiago.operacoes@empresa.com', 'Operações', '66666/0001', 'Analista de Operações', 'Ativo'),
('66666666662', 'Juliana Pardal', 'juliana.logistica@empresa.com', 'Operações', '66666/0002', 'Especialista em Logística', 'Ativo'),
('66666666663', 'Gabriel Vista', 'gabriel.producao@empresa.com', 'Operações', '66666/0003', 'Supervisor de Produção', 'Ativo'),
('66666666664', 'Beatriz Sado', 'beatriz.qualidade@empresa.com', 'Operações', '66666/0004', 'Analista de Qualidade', 'Ativo'),
('66666666665', 'Lucas Supla', 'lucas.suprimentos@empresa.com', 'Operações', '66666/0005', 'Analista de Suprimentos', 'Ativo'),
('66666666666', 'Amanda Plantio', 'amanda.planejamento@empresa.com', 'Operações', '66666/0006', 'Planejadora de Produção', 'Ativo'),
('66666666667', 'Pedro Cantarola', 'pedro.controle@empresa.com', 'Operações', '66666/0007', 'Controlador de Operações', 'Ativo'),
('66666666668', 'Natália Melinda', 'natalia.melhoria@empresa.com', 'Operações', '66666/0008', 'Especialista em Melhoria Contínua', 'Ativo'),
('66666666669', 'Felipe Garranha', 'felipe.gerente@empresa.com', 'Operações', '66666/0009', 'Gerente de Operações', 'Ativo'),
('66666666670', 'Isabela Fritz', 'isabela.coordenadora@empresa.com', 'Operações', '66666/0010', 'Coordenadora de Operações', 'Ativo'),

-- Jurídico (5 funcionários)
('77777777771', 'Bruno Padrao', 'bruno.juridico@empresa.com', 'Jurídico', '77777/0001', 'Advogado', 'Ativo'),
('77777777772', 'Carolina Contigua', 'carolina.compliance@empresa.com', 'Jurídico', '77777/0002', 'Especialista em Compliance', 'Ativo'),
('77777777773', 'André Cumpadre', 'andre.contratos@empresa.com', 'Jurídico', '77777/0003', 'Especialista em Contratos', 'Ativo'),
('77777777774', 'Patrícia Trato', 'patricia.trabalhista@empresa.com', 'Jurídico', '77777/0004', 'Especialista em Direito Trabalhista', 'Ativo'),
('77777777775', 'Rodrigo Gastao', 'rodrigo.gerente@empresa.com', 'Jurídico', '77777/0005', 'Gerente Jurídico', 'Ativo'),

-- Administrativo (5 funcionários)
('88888888881', 'Vanessa Admin', 'vanessa.admin@empresa.com', 'Administrativo', '88888/0001', 'Assistente Administrativo', 'Ativo'),
('88888888882', 'Gustavo Sacratista', 'gustavo.secretario@empresa.com', 'Administrativo', '88888/0002', 'Secretário Executivo', 'Ativo'),
('88888888883', 'Larissa Resticato', 'larissa.recepcionista@empresa.com', 'Administrativo', '88888/0003', 'Recepcionista', 'Ativo'),
('88888888884', 'Diego filho', 'diego.auxiliar@empresa.com', 'Administrativo', '88888/0004', 'Auxiliar Administrativo', 'Ativo'),
('88888888885', 'Camila Jacinto', 'camila.coordenadora@empresa.com', 'Administrativo', '88888/0005', 'Coordenadora Administrativa', 'Ativo')

ON CONFLICT (cpf) DO NOTHING;


-- ============================================================================
-- TREINAMENTOS
-- ============================================================================
INSERT INTO Treinamento (nome, data_realizacao, validade, local) VALUES
('NR-10 - Segurança em Instalações Elétricas', '2023-06-15', '2025-06-15', 'Sala de Treinamento 1'),
('Gestão de Pessoas', '2023-08-20', '2024-08-20', 'Auditório Principal'),
('Metodologias Ágeis', '2024-01-10', '2026-01-10', 'Online'),
('Prevenção de Acidentes', '2023-11-05', '2025-11-05', 'Sala de Treinamento 2'),
('Comunicação Efetiva', '2024-02-14', '2025-02-14', 'Sala de Reuniões A'),
('Segurança da Informação', '2023-09-30', '2025-09-30', 'Online'),
('Liderança e Desenvolvimento', '2023-12-10', '2024-12-10', 'Centro de Convenções')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- RELACIONAMENTO FUNCIONÁRIO-TREINAMENTO
-- =============================================================================
INSERT INTO Funcionario_Treinamento (funcionario_cpf, treinamento_cod, n_certificado) VALUES
('11111111111', (SELECT cod_treinamento FROM Treinamento WHERE nome = 'Metodologias Ágeis' LIMIT 1), 'CERT-001-2024'),
('11111111111', (SELECT cod_treinamento FROM Treinamento WHERE nome = 'Segurança da Informação' LIMIT 1), 'CERT-002-2023'),
('11111111112', (SELECT cod_treinamento FROM Treinamento WHERE nome = 'Gestão de Pessoas' LIMIT 1), 'CERT-003-2023'),
('11111111112', (SELECT cod_treinamento FROM Treinamento WHERE nome = 'Comunicação Efetiva' LIMIT 1), 'CERT-004-2024'),
('11111111113', (SELECT cod_treinamento FROM Treinamento WHERE nome = 'Gestão de Pessoas' LIMIT 1), 'CERT-005-2023'),
('11111111113', (SELECT cod_treinamento FROM Treinamento WHERE nome = 'Liderança e Desenvolvimento' LIMIT 1), 'CERT-006-2023'),
('11111111114', (SELECT cod_treinamento FROM Treinamento WHERE nome = 'Gestão de Pessoas' LIMIT 1), 'CERT-007-2023'),
('11111111114', (SELECT cod_treinamento FROM Treinamento WHERE nome = 'Liderança e Desenvolvimento' LIMIT 1), 'CERT-008-2023'),
('11111111115', (SELECT cod_treinamento FROM Treinamento WHERE nome = 'Metodologias Ágeis' LIMIT 1), 'CERT-009-2024'),
('11111111115', (SELECT cod_treinamento FROM Treinamento WHERE nome = 'Segurança da Informação' LIMIT 1), 'CERT-010-2023')
ON CONFLICT DO NOTHING;

-- ==========================================
-- RELACIONAMENTO FUNCIONÁRIO-CLASSIFICAÇÃO
-- ==========================================
INSERT INTO Funcionario_Classificacao (funcionario_cpf, classificacao_cod) VALUES
('11111111111', (SELECT cod_classificacao FROM Classificacao WHERE nome = 'Desligamento Voluntário' LIMIT 1)),
('11111111112', (SELECT cod_classificacao FROM Classificacao WHERE nome = 'Desligamento Involuntário' LIMIT 1)),
('11111111113', (SELECT cod_classificacao FROM Classificacao WHERE nome = 'Avaliação de Desempenho' LIMIT 1)),
('11111111114', (SELECT cod_classificacao FROM Classificacao WHERE nome = 'Feedback 360' LIMIT 1)),
('11111111115', (SELECT cod_classificacao FROM Classificacao WHERE nome = 'Avaliação de Desempenho' LIMIT 1))
ON CONFLICT DO NOTHING;

-- ==========================================
-- QUESTÕES
-- ==========================================

-- Questões de Múltipla Escolha
INSERT INTO Questao (tipo_questao, texto_questao, status) VALUES
('Múltipla Escolha', 'Qual o principal motivo da sua saída da empresa?', 'Ativo'),
('Múltipla Escolha', 'Como você avalia o ambiente de trabalho?', 'Ativo'),
('Múltipla Escolha', 'A comunicação interna era clara e eficiente?', 'Ativo'),
('Múltipla Escolha', 'Você teve oportunidades de crescimento profissional?', 'Ativo')
ON CONFLICT DO NOTHING;

-- Questões de Texto Livre
INSERT INTO Questao (tipo_questao, texto_questao, status) VALUES
('Texto Livre', 'Descreva sua experiência geral na empresa:', 'Ativo'),
('Texto Livre', 'O que você mais gostou durante o período em que trabalhou aqui?', 'Ativo'),
('Texto Livre', 'Que sugestões você daria para melhorar o ambiente de trabalho?', 'Ativo'),
('Texto Livre', 'Há algo mais que você gostaria de compartilhar?', 'Ativo'),
('Texto Livre', 'Como foi seu relacionamento com a liderança?', 'Ativo')
ON CONFLICT DO NOTHING;

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
 (SELECT cod_classificacao FROM Classificacao WHERE nome = 'Desligamento Voluntário' LIMIT 1)),
('Questionário de Desligamento Rápido', 'Desligamento', 'Ativo', 
 (SELECT cod_classificacao FROM Classificacao WHERE nome = 'Desligamento Voluntário' LIMIT 1)),
('Questionário de Feedback Geral', 'Feedback', 'Ativo', 
 (SELECT cod_classificacao FROM Classificacao WHERE nome = 'Feedback 360' LIMIT 1)),
('Questionário de Avaliação de Clima', 'Clima Organizacional', 'Ativo', 
 (SELECT cod_classificacao FROM Classificacao WHERE nome = 'Avaliação de Clima' LIMIT 1))
ON CONFLICT DO NOTHING;

-- ==========================================
-- RELACIONAMENTO QUESTIONÁRIO-QUESTÃO
-- ==========================================

-- Questionário de Desligamento Completo (todas as questões)
INSERT INTO Questionario_Questao (questionario_cod, questao_cod)
SELECT 
    (SELECT cod_questionario FROM Questionario WHERE nome = 'Questionário de Desligamento Completo' LIMIT 1),
    cod_questao
FROM Questao
WHERE status = 'Ativo'
ON CONFLICT DO NOTHING;

-- Questionário de Desligamento Rápido (apenas algumas questões)
INSERT INTO Questionario_Questao (questionario_cod, questao_cod) VALUES
((SELECT cod_questionario FROM Questionario WHERE nome = 'Questionário de Desligamento Rápido' LIMIT 1),
 (SELECT cod_questao FROM Questao WHERE texto_questao = 'Qual o principal motivo da sua saída da empresa?' LIMIT 1)),
((SELECT cod_questionario FROM Questionario WHERE nome = 'Questionário de Desligamento Rápido' LIMIT 1),
 (SELECT cod_questao FROM Questao WHERE texto_questao = 'Como você avalia o ambiente de trabalho?' LIMIT 1)),
((SELECT cod_questionario FROM Questionario WHERE nome = 'Questionário de Desligamento Rápido' LIMIT 1),
 (SELECT cod_questao FROM Questao WHERE texto_questao = 'Descreva sua experiência geral na empresa:' LIMIT 1))
ON CONFLICT DO NOTHING;

-- Questionário de Feedback Geral
INSERT INTO Questionario_Questao (questionario_cod, questao_cod) VALUES
((SELECT cod_questionario FROM Questionario WHERE nome = 'Questionário de Feedback Geral' LIMIT 1),
 (SELECT cod_questao FROM Questao WHERE texto_questao = 'Como você avalia o ambiente de trabalho?' LIMIT 1)),
((SELECT cod_questionario FROM Questionario WHERE nome = 'Questionário de Feedback Geral' LIMIT 1),
 (SELECT cod_questao FROM Questao WHERE texto_questao = 'A comunicação interna era clara e eficiente?' LIMIT 1)),
((SELECT cod_questionario FROM Questionario WHERE nome = 'Questionário de Feedback Geral' LIMIT 1),
 (SELECT cod_questao FROM Questao WHERE texto_questao = 'Você teve oportunidades de crescimento profissional?' LIMIT 1)),
((SELECT cod_questionario FROM Questionario WHERE nome = 'Questionário de Feedback Geral' LIMIT 1),
 (SELECT cod_questao FROM Questao WHERE texto_questao = 'Que sugestões você daria para melhorar o ambiente de trabalho?' LIMIT 1))
ON CONFLICT DO NOTHING;

-- ==========================================
-- AVALIAÇÕES
-- ==========================================
INSERT INTO Avaliacao (local, data_completa, descricao, rating, avaliado_cpf, avaliador_cpf, questionario_cod) VALUES
('Sala de RH', '2024-01-30 14:30:00-03', 'Avaliação de desligamento - Ana Silva Santos', 4, 
 '11111111111', '11111111112', 
 (SELECT cod_questionario FROM Questionario WHERE nome = 'Questionário de Desligamento Completo' LIMIT 1)),

('Online', '2024-02-05 10:00:00-03', 'Avaliação de desligamento - Carlos Eduardo Lima', 3, 
 '11111111112', '11111111113', 
 (SELECT cod_questionario FROM Questionario WHERE nome = 'Questionário de Desligamento Rápido' LIMIT 1)),

('Sala de Reuniões', '2024-03-10 16:00:00-03', 'Feedback trimestral - Mariana Costa Oliveira', 5, 
 '11111111113', '11111111114', 
 (SELECT cod_questionario FROM Questionario WHERE nome = 'Questionário de Feedback Geral' LIMIT 1))
ON CONFLICT DO NOTHING;

-- ==========================================
-- RESPOSTAS (Exemplos)
-- ==========================================

-- Respostas da primeira avaliação (Ana Silva Santos)
INSERT INTO Resposta (tipo_resposta, avaliacao_cod, questao_cod) VALUES
('Escolha', 
 (SELECT cod_avaliacao FROM Avaliacao WHERE avaliado_cpf = '11111111111' LIMIT 1),
 (SELECT cod_questao FROM Questao WHERE texto_questao = 'Qual o principal motivo da sua saída da empresa?' LIMIT 1)),
('Escolha', 
 (SELECT cod_avaliacao FROM Avaliacao WHERE avaliado_cpf = '11111111111' LIMIT 1),
 (SELECT cod_questao FROM Questao WHERE texto_questao = 'Como você avalia o ambiente de trabalho?' LIMIT 1)),
('Texto', 
 (SELECT cod_avaliacao FROM Avaliacao WHERE avaliado_cpf = '11111111111' LIMIT 1),
 (SELECT cod_questao FROM Questao WHERE texto_questao = 'Descreva sua experiência geral na empresa:' LIMIT 1));

-- Respostas de Escolha
INSERT INTO Resposta_Escolha (resposta_cod, escolha) VALUES
((SELECT r.cod_resposta FROM Resposta r 
  JOIN Questao q ON r.questao_cod = q.cod_questao 
  WHERE q.texto_questao = 'Qual o principal motivo da sua saída da empresa?' 
  AND r.avaliacao_cod = (SELECT cod_avaliacao FROM Avaliacao WHERE avaliado_cpf = '11111111111' LIMIT 1) LIMIT 1),
 'Melhor oferta salarial'),

((SELECT r.cod_resposta FROM Resposta r 
  JOIN Questao q ON r.questao_cod = q.cod_questao 
  WHERE q.texto_questao = 'Como você avalia o ambiente de trabalho?' 
  AND r.avaliacao_cod = (SELECT cod_avaliacao FROM Avaliacao WHERE avaliado_cpf = '11111111111' LIMIT 1) LIMIT 1),
 'Bom');

-- Respostas de Texto
INSERT INTO Resposta_Texto (resposta_cod, texto_resposta) VALUES
((SELECT r.cod_resposta FROM Resposta r 
  JOIN Questao q ON r.questao_cod = q.cod_questao 
  WHERE q.texto_questao = 'Descreva sua experiência geral na empresa:' 
  AND r.avaliacao_cod = (SELECT cod_avaliacao FROM Avaliacao WHERE avaliado_cpf = '11111111111' LIMIT 1) LIMIT 1),
 'Minha experiência na empresa foi muito positiva. Aprendi bastante e tive ótimos colegas de trabalho. A decisão de sair foi difícil, mas recebi uma proposta que não poderia recusar.');
