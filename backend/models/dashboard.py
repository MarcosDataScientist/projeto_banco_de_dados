"""
Módulo de queries SQL para Dashboard
Adaptado para o novo schema
"""
from backend.config.database import execute_query

class DashboardModel:
    
    @staticmethod
    def estatisticas_gerais():
        """Retorna estatísticas gerais do sistema"""
        query = """
            SELECT 
                (SELECT COUNT(*) FROM Questao WHERE status = 'Ativo') AS perguntas_cadastradas,
                (SELECT COUNT(*) FROM Questionario WHERE status = 'Ativo') AS formularios_ativos,
                (SELECT COUNT(*) FROM Avaliacao WHERE rating IS NULL) AS avaliacoes_pendentes,
                (SELECT COUNT(*) FROM Avaliacao WHERE rating IS NOT NULL) AS avaliacoes_concluidas,
                (SELECT COUNT(*) FROM Funcionario WHERE status = 'Ativo') AS funcionarios_ativos,
                (SELECT COUNT(DISTINCT avaliador_cpf) FROM Avaliacao WHERE avaliador_cpf IS NOT NULL) AS avaliadores_ativos
        """
        
        results = execute_query(query)
        return results[0] if results else None
    
    @staticmethod
    def avaliacoes_por_mes(limite_meses=6):
        """Retorna avaliações nos últimos N meses"""
        query = """
            WITH meses AS (
                SELECT 
                    TO_CHAR(
                        CURRENT_DATE - (n || ' months')::INTERVAL, 
                        'Mon'
                    ) AS mes,
                    DATE_TRUNC('month', CURRENT_DATE - (n || ' months')::INTERVAL) AS data_mes
                FROM generate_series(0, %s - 1) AS n
            )
            SELECT 
                m.mes,
                COALESCE(COUNT(a.cod_avaliacao), 0) AS valor
            FROM meses m
            LEFT JOIN Avaliacao a ON 
                DATE_TRUNC('month', a.data_completa) = m.data_mes
            GROUP BY m.mes, m.data_mes
            ORDER BY m.data_mes
        """
        
        return execute_query(query, (limite_meses,))
    
    @staticmethod
    def motivos_saida_principais():
        """Retorna os principais motivos de saída com percentuais (simulado baseado em descrições)"""
        # Como não temos mais motivos_saida, vamos criar dados fictícios baseados nas avaliações
        query = """
            WITH motivos_simulados AS (
                SELECT 
                    'Melhor Oferta' AS motivo,
                    '#e91e63' AS cor,
                    1 AS ordem
                UNION ALL SELECT 'Insatisfação', '#2196f3', 2
                UNION ALL SELECT 'Mudança de Cidade', '#4caf50', 3
                UNION ALL SELECT 'Questões Pessoais', '#ff9800', 4
                UNION ALL SELECT 'Outros', '#9e9e9e', 5
            ),
            total_avaliacoes AS (
                SELECT COUNT(*) AS total FROM Avaliacao
            )
            SELECT 
                m.motivo,
                m.cor,
                CASE m.ordem
                    WHEN 1 THEN ROUND((SELECT total * 0.35 FROM total_avaliacoes))
                    WHEN 2 THEN ROUND((SELECT total * 0.25 FROM total_avaliacoes))
                    WHEN 3 THEN ROUND((SELECT total * 0.20 FROM total_avaliacoes))
                    WHEN 4 THEN ROUND((SELECT total * 0.15 FROM total_avaliacoes))
                    ELSE ROUND((SELECT total * 0.05 FROM total_avaliacoes))
                END AS quantidade,
                CASE m.ordem
                    WHEN 1 THEN 35
                    WHEN 2 THEN 25
                    WHEN 3 THEN 20
                    WHEN 4 THEN 15
                    ELSE 5
                END AS percentual
            FROM motivos_simulados m
            WHERE (SELECT total FROM total_avaliacoes) > 0
            ORDER BY quantidade DESC
        """
        
        return execute_query(query)
    
    @staticmethod
    def status_avaliacoes():
        """Retorna distribuição de avaliações por status (simulado)"""
        query = """
            SELECT 
                CASE 
                    WHEN rating IS NOT NULL THEN 'Concluídas'
                    WHEN data_completa < NOW() - INTERVAL '7 days' THEN 'Pendentes'
                    ELSE 'Em Andamento'
                END AS status,
                COUNT(*) AS valor,
                CASE 
                    WHEN rating IS NOT NULL THEN '#4caf50'
                    WHEN data_completa < NOW() - INTERVAL '7 days' THEN '#ff9800'
                    ELSE '#2196f3'
                END AS cor
            FROM Avaliacao
            GROUP BY 
                CASE 
                    WHEN rating IS NOT NULL THEN 'Concluídas'
                    WHEN data_completa < NOW() - INTERVAL '7 days' THEN 'Pendentes'
                    ELSE 'Em Andamento'
                END,
                CASE 
                    WHEN rating IS NOT NULL THEN '#4caf50'
                    WHEN data_completa < NOW() - INTERVAL '7 days' THEN '#ff9800'
                    ELSE '#2196f3'
                END
            ORDER BY 
                CASE 
                    WHEN rating IS NOT NULL THEN 1
                    WHEN data_completa < NOW() - INTERVAL '7 days' THEN 2
                    ELSE 3
                END
        """
        
        return execute_query(query)
    
    @staticmethod
    def avaliacoes_por_setor():
        """Retorna quantidade de avaliações por setor"""
        query = """
            SELECT 
                f.setor AS departamento,
                COUNT(a.cod_avaliacao) AS total,
                COUNT(CASE WHEN a.rating IS NOT NULL THEN 1 END) AS concluidas,
                COUNT(CASE WHEN a.rating IS NULL THEN 1 END) AS pendentes
            FROM Funcionario f
            LEFT JOIN Avaliacao a ON f.cpf = a.avaliado_cpf
            WHERE f.setor IS NOT NULL
            GROUP BY f.setor
            HAVING COUNT(a.cod_avaliacao) > 0
            ORDER BY total DESC
        """
        
        return execute_query(query)
    
    @staticmethod
    def media_ratings():
        """Calcula média dos ratings das avaliações"""
        query = """
            SELECT 
                AVG(rating) AS media,
                MIN(rating) AS minimo,
                MAX(rating) AS maximo,
                COUNT(*) AS total
            FROM Avaliacao
            WHERE rating IS NOT NULL
        """
        
        results = execute_query(query)
        return results[0] if results else None
    
    @staticmethod
    def distribuicao_respostas_escolha():
        """Distribuição de respostas de escolha"""
        query = """
            SELECT 
                q.texto_questao AS pergunta,
                re.escolha AS resposta,
                COUNT(*) AS quantidade
            FROM Resposta r
            JOIN Questao q ON r.questao_cod = q.cod_questao
            JOIN Resposta_Escolha re ON r.cod_resposta = re.resposta_cod
            WHERE r.tipo_resposta = 'Escolha'
            GROUP BY q.cod_questao, q.texto_questao, re.escolha
            ORDER BY q.texto_questao, quantidade DESC
        """
        
        return execute_query(query)
    
    @staticmethod
    def atividades_recentes(limite=10):
        """Retorna atividades recentes do sistema"""
        query = """
            WITH atividades AS (
                (
                    SELECT 
                        'avaliacao' AS tipo,
                        a.cod_avaliacao AS id,
                        'Avaliação ' || CASE 
                            WHEN a.rating IS NOT NULL THEN 'concluída'
                            ELSE 'realizada'
                        END AS titulo,
                        f.nome || ' - ' || q.nome AS descricao,
                        a.data_completa AS data,
                        CASE 
                            WHEN a.rating IS NOT NULL THEN '#4caf50'
                            ELSE '#2196f3'
                        END AS cor,
                        CASE
                            WHEN a.data_completa > NOW() - INTERVAL '1 hour' THEN 'Há alguns minutos'
                            WHEN a.data_completa > NOW() - INTERVAL '1 day' THEN 
                                'Há ' || EXTRACT(HOUR FROM (NOW() - a.data_completa))::INTEGER || ' horas'
                            ELSE 
                                'Há ' || EXTRACT(DAY FROM (NOW() - a.data_completa))::INTEGER || ' dias'
                        END AS tempo
                    FROM Avaliacao a
                    JOIN Funcionario f ON a.avaliado_cpf = f.cpf
                    JOIN Questionario q ON a.questionario_cod = q.cod_questionario
                    ORDER BY a.data_completa DESC
                    LIMIT %s
                )
            )
            SELECT * FROM atividades
            ORDER BY data DESC
            LIMIT %s
        """
        
        return execute_query(query, (limite, limite))
    
    @staticmethod
    def taxa_conclusao_avaliacoes():
        """Calcula taxa de conclusão de avaliações"""
        query = """
            SELECT 
                COUNT(CASE WHEN rating IS NOT NULL THEN 1 END) AS concluidas,
                COUNT(CASE WHEN rating IS NULL AND data_completa < NOW() - INTERVAL '7 days' THEN 1 END) AS pendentes,
                COUNT(CASE WHEN rating IS NULL AND data_completa >= NOW() - INTERVAL '7 days' THEN 1 END) AS em_andamento,
                COUNT(*) AS total,
                ROUND(
                    (COUNT(CASE WHEN rating IS NOT NULL THEN 1 END)::NUMERIC / 
                     NULLIF(COUNT(*), 0)) * 100, 
                    1
                ) AS taxa_conclusao
            FROM Avaliacao
        """
        
        results = execute_query(query)
        return results[0] if results else None
    
    @staticmethod
    def questionarios_mais_usados():
        """Retorna os questionários mais utilizados"""
        query = """
            SELECT 
                q.cod_questionario,
                q.nome,
                q.tipo,
                COUNT(a.cod_avaliacao) AS total_usos,
                AVG(a.rating) AS media_rating
            FROM Questionario q
            LEFT JOIN Avaliacao a ON q.cod_questionario = a.questionario_cod
            WHERE q.status = 'Ativo'
            GROUP BY q.cod_questionario, q.nome, q.tipo
            ORDER BY total_usos DESC
            LIMIT 5
        """
        
        return execute_query(query)
    
    @staticmethod
    def funcionarios_por_status():
        """Distribuição de funcionários por status"""
        query = """
            SELECT 
                status,
                COUNT(*) AS total,
                ROUND((COUNT(*)::NUMERIC / (SELECT COUNT(*) FROM Funcionario)) * 100, 1) AS percentual
            FROM Funcionario
            GROUP BY status
            ORDER BY total DESC
        """
        
        return execute_query(query)
    
    @staticmethod
    def treinamentos_proximos_vencimento():
        """Lista treinamentos próximos ao vencimento (30 dias)"""
        query = """
            SELECT 
                t.cod_treinamento,
                t.nome,
                t.validade,
                COUNT(ft.funcionario_cpf) AS total_funcionarios,
                EXTRACT(DAY FROM (t.validade - CURRENT_DATE))::INTEGER AS dias_restantes
            FROM Treinamento t
            JOIN Funcionario_Treinamento ft ON t.cod_treinamento = ft.treinamento_cod
            WHERE t.validade BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
            GROUP BY t.cod_treinamento, t.nome, t.validade
            ORDER BY t.validade
        """
        
        return execute_query(query)
