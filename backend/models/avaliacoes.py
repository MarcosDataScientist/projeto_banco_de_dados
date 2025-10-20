"""
Módulo de queries SQL para Avaliações
Adaptado para o novo schema: Avaliacao, Resposta, Resposta_Texto, Resposta_Escolha
"""
from backend.config.database import execute_query

class AvaliacoesModel:
    
    @staticmethod
    def listar_todas(filtro_status=None, filtro_funcionario=None):
        """Lista todas as avaliações com filtros opcionais"""
        # Nota: Novo schema não tem campo status na tabela Avaliacao
        # Vamos usar rating ou outros campos para filtrar
        query = """
            SELECT 
                a.cod_avaliacao AS id,
                a.local,
                a.data_completa,
                a.descricao,
                a.rating,
                f.nome AS funcionario,
                f.cpf AS funcionario_cpf,
                av.nome AS avaliador,
                av.cpf AS avaliador_cpf,
                q.nome AS questionario,
                q.cod_questionario AS questionario_id,
                f.setor AS departamento
            FROM Avaliacao a
            LEFT JOIN Funcionario f ON a.avaliado_cpf = f.cpf
            LEFT JOIN Funcionario av ON a.avaliador_cpf = av.cpf
            LEFT JOIN Questionario q ON a.questionario_cod = q.cod_questionario
            WHERE 1=1
        """
        
        params = []
        
        if filtro_funcionario:
            query += " AND a.avaliado_cpf = %s"
            params.append(filtro_funcionario)
        
        query += " ORDER BY a.data_completa DESC"
        
        return execute_query(query, tuple(params) if params else None)
    
    @staticmethod
    def buscar_por_id(avaliacao_id):
        """Busca uma avaliação específica por ID"""
        query = """
            SELECT 
                a.cod_avaliacao AS id,
                a.local,
                a.data_completa,
                a.descricao,
                a.rating,
                f.nome AS funcionario,
                f.cpf AS funcionario_cpf,
                f.email AS funcionario_email,
                av.nome AS avaliador,
                av.cpf AS avaliador_cpf,
                q.nome AS questionario,
                q.cod_questionario AS questionario_id,
                q.tipo AS questionario_tipo,
                q.status AS questionario_status,
                f.setor AS departamento
            FROM Avaliacao a
            LEFT JOIN Funcionario f ON a.avaliado_cpf = f.cpf
            LEFT JOIN Funcionario av ON a.avaliador_cpf = av.cpf
            LEFT JOIN Questionario q ON a.questionario_cod = q.cod_questionario
            WHERE a.cod_avaliacao = %s
        """
        
        results = execute_query(query, (avaliacao_id,))
        return results[0] if results else None
    
    @staticmethod
    def criar(avaliado_cpf, avaliador_cpf, questionario_cod, local=None, descricao=None, rating=None):
        """Cria uma nova avaliação"""
        from datetime import datetime
        
        query = """
            INSERT INTO Avaliacao 
            (local, data_completa, descricao, rating, avaliado_cpf, avaliador_cpf, questionario_cod)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING cod_avaliacao, data_completa, avaliado_cpf, avaliador_cpf
        """
        
        data_completa = datetime.now()
        
        return execute_query(query, (local, data_completa, descricao, rating, 
                                     avaliado_cpf, avaliador_cpf, questionario_cod))
    
    @staticmethod
    def atualizar_status(avaliacao_id, rating=None, descricao=None):
        """Atualiza uma avaliação (rating e descrição no novo schema)"""
        campos = []
        params = []
        
        if rating is not None:
            campos.append("rating = %s")
            params.append(rating)
        
        if descricao is not None:
            campos.append("descricao = %s")
            params.append(descricao)
        
        if not campos:
            return None
        
        params.append(avaliacao_id)
        
        query = f"""
            UPDATE Avaliacao 
            SET {', '.join(campos)}
            WHERE cod_avaliacao = %s
            RETURNING cod_avaliacao, rating, descricao, data_completa
        """
        
        return execute_query(query, tuple(params))
    
    @staticmethod
    def buscar_respostas(avaliacao_id):
        """Busca todas as respostas de uma avaliação"""
        query = """
            SELECT 
                r.cod_resposta AS id,
                r.tipo_resposta,
                q.texto_questao AS pergunta,
                q.tipo_questao AS tipo_pergunta,
                rt.texto_resposta,
                re.escolha
            FROM Resposta r
            LEFT JOIN Questao q ON r.questao_cod = q.cod_questao
            LEFT JOIN Resposta_Texto rt ON r.cod_resposta = rt.resposta_cod
            LEFT JOIN Resposta_Escolha re ON r.cod_resposta = re.resposta_cod
            WHERE r.avaliacao_cod = %s
            ORDER BY r.cod_resposta
        """
        
        return execute_query(query, (avaliacao_id,))
    
    @staticmethod
    def salvar_resposta(avaliacao_cod, questao_cod, tipo_resposta, texto_resposta=None, escolha=None):
        """Salva uma resposta de avaliação"""
        # Primeiro criar a resposta base
        query_resposta = """
            INSERT INTO Resposta 
            (tipo_resposta, avaliacao_cod, questao_cod)
            VALUES (%s, %s, %s)
            RETURNING cod_resposta
        """
        
        resultado = execute_query(query_resposta, (tipo_resposta, avaliacao_cod, questao_cod))
        
        if resultado:
            cod_resposta = resultado[0]['cod_resposta']
            
            # Inserir na tabela específica
            if tipo_resposta == 'Texto' and texto_resposta:
                query_texto = """
                    INSERT INTO Resposta_Texto (resposta_cod, texto_resposta)
                    VALUES (%s, %s)
                """
                execute_query(query_texto, (cod_resposta, texto_resposta), fetch=False)
            
            elif tipo_resposta == 'Escolha' and escolha:
                query_escolha = """
                    INSERT INTO Resposta_Escolha (resposta_cod, escolha)
                    VALUES (%s, %s)
                """
                execute_query(query_escolha, (cod_resposta, escolha), fetch=False)
            
            return resultado
        
        return None
    
    @staticmethod
    def contar_por_rating():
        """Conta avaliações agrupadas por rating"""
        query = """
            SELECT 
                rating,
                COUNT(*) AS total
            FROM Avaliacao
            WHERE rating IS NOT NULL
            GROUP BY rating
            ORDER BY rating DESC
        """
        
        return execute_query(query)
    
    @staticmethod
    def contar_por_status():
        """Retorna contagem simulada de status baseado em rating e data"""
        query = """
            SELECT 
                CASE 
                    WHEN rating IS NOT NULL THEN 'Concluída'
                    WHEN data_completa < NOW() - INTERVAL '7 days' THEN 'Pendente'
                    ELSE 'Em Andamento'
                END AS status,
                COUNT(*) AS total
            FROM Avaliacao
            GROUP BY 
                CASE 
                    WHEN rating IS NOT NULL THEN 'Concluída'
                    WHEN data_completa < NOW() - INTERVAL '7 days' THEN 'Pendente'
                    ELSE 'Em Andamento'
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
    def avaliacoes_por_mes(ano=None):
        """Retorna quantidade de avaliações por mês"""
        query = """
            SELECT 
                TO_CHAR(data_completa, 'MM') AS mes,
                TO_CHAR(data_completa, 'Mon') AS mes_nome,
                COUNT(*) AS total
            FROM Avaliacao
            WHERE data_completa IS NOT NULL
        """
        
        params = []
        if ano:
            query += " AND EXTRACT(YEAR FROM data_completa) = %s"
            params.append(ano)
        
        query += """
            GROUP BY TO_CHAR(data_completa, 'MM'), TO_CHAR(data_completa, 'Mon')
            ORDER BY mes
        """
        
        return execute_query(query, tuple(params) if params else None)
    
    @staticmethod
    def buscar_por_avaliador(avaliador_cpf):
        """Busca avaliações por CPF do avaliador"""
        query = """
            SELECT cod_avaliacao, data_completa, avaliado_cpf
            FROM Avaliacao 
            WHERE avaliador_cpf = %s
        """
        return execute_query(query, (avaliador_cpf,))
    
    @staticmethod
    def deletar(avaliacao_id):
        """Deleta uma avaliação"""
        query = "DELETE FROM Avaliacao WHERE cod_avaliacao = %s"
        return execute_query(query, (avaliacao_id,), fetch=False)
