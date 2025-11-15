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
        from backend.config.database import get_db_connection, Database
        from psycopg2.extras import RealDictCursor
        
        connection = None
        cursor = None
        
        try:
            connection = get_db_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)
            
            query = """
                INSERT INTO Avaliacao 
                (local, data_completa, descricao, rating, avaliado_cpf, avaliador_cpf, questionario_cod)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING cod_avaliacao, data_completa, avaliado_cpf, avaliador_cpf
            """
            
            data_completa = datetime.now()
            
            cursor.execute(query, (local, data_completa, descricao, rating, 
                                  avaliado_cpf, avaliador_cpf, questionario_cod))
            connection.commit()
            
            result = cursor.fetchone()
            return [dict(result)] if result else []
            
        except Exception as error:
            if connection:
                connection.rollback()
            print(f"[ERRO] Erro ao criar avaliação: {error}")
            raise
        finally:
            if cursor:
                cursor.close()
            if connection:
                Database.return_connection(connection)
    
    @staticmethod
    def atualizar_status(avaliacao_id, rating=None, descricao=None):
        """Atualiza uma avaliação (rating e descrição no novo schema)"""
        from backend.config.database import get_db_connection, Database
        from psycopg2.extras import RealDictCursor
        
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
        
        connection = None
        cursor = None
        
        try:
            connection = get_db_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)
            
            query = f"""
                UPDATE Avaliacao 
                SET {', '.join(campos)}
                WHERE cod_avaliacao = %s
                RETURNING cod_avaliacao, rating, descricao, data_completa
            """
            
            cursor.execute(query, tuple(params))
            connection.commit()
            
            result = cursor.fetchone()
            return [dict(result)] if result else None
            
        except Exception as error:
            if connection:
                connection.rollback()
            print(f"[ERRO] Erro ao atualizar status da avaliação: {error}")
            raise
        finally:
            if cursor:
                cursor.close()
            if connection:
                Database.return_connection(connection)
    
    @staticmethod
    def atualizar_configuracoes(avaliacao_id, avaliado_cpf=None, avaliador_cpf=None, questionario_cod=None, local=None, descricao=None):
        """Atualiza as configurações de uma avaliação (funcionário, avaliador, questionário, local, descrição)"""
        from backend.config.database import get_db_connection, Database
        from psycopg2.extras import RealDictCursor
        
        campos = []
        params = []
        
        if avaliado_cpf is not None:
            campos.append("avaliado_cpf = %s")
            params.append(avaliado_cpf)
        
        if avaliador_cpf is not None:
            campos.append("avaliador_cpf = %s")
            params.append(avaliador_cpf)
        
        if questionario_cod is not None:
            campos.append("questionario_cod = %s")
            params.append(questionario_cod)
        
        if local is not None:
            campos.append("local = %s")
            params.append(local)
        
        if descricao is not None:
            campos.append("descricao = %s")
            params.append(descricao)
        
        if not campos:
            return None
        
        params.append(avaliacao_id)
        
        connection = None
        cursor = None
        
        try:
            connection = get_db_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)
            
            query = f"""
                UPDATE Avaliacao 
                SET {', '.join(campos)}
                WHERE cod_avaliacao = %s
                RETURNING cod_avaliacao, avaliado_cpf, avaliador_cpf, questionario_cod, local, descricao
            """
            
            cursor.execute(query, tuple(params))
            connection.commit()
            
            result = cursor.fetchone()
            return [dict(result)] if result else None
            
        except Exception as error:
            if connection:
                connection.rollback()
            print(f"[ERRO] Erro ao atualizar configurações da avaliação: {error}")
            raise
        finally:
            if cursor:
                cursor.close()
            if connection:
                Database.return_connection(connection)
    
    @staticmethod
    def buscar_respostas(avaliacao_id):
        """Busca todas as respostas de uma avaliação"""
        query = """
            SELECT 
                r.cod_resposta AS id,
                r.tipo_resposta,
                r.questao_cod,
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
        """Salva ou atualiza uma resposta de avaliação (UPSERT)"""
        from backend.config.database import get_db_connection, Database
        from psycopg2.extras import RealDictCursor
        
        connection = None
        cursor = None
        
        try:
            connection = get_db_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)
            
            # Verificar se a resposta já existe
            query_verificar = """
                SELECT cod_resposta 
                FROM Resposta 
                WHERE avaliacao_cod = %s AND questao_cod = %s
            """
            cursor.execute(query_verificar, (avaliacao_cod, questao_cod))
            resposta_existente = cursor.fetchone()
            
            if resposta_existente:
                # Atualizar resposta existente
                cod_resposta = resposta_existente['cod_resposta']
                
                # Atualizar tipo de resposta se necessário
                query_atualizar_resposta = """
                    UPDATE Resposta 
                    SET tipo_resposta = %s
                    WHERE cod_resposta = %s
                """
                cursor.execute(query_atualizar_resposta, (tipo_resposta, cod_resposta))
                
                # Deletar respostas antigas nas tabelas específicas
                if tipo_resposta == 'Texto':
                    cursor.execute("DELETE FROM Resposta_Escolha WHERE resposta_cod = %s", (cod_resposta,))
                    # Verificar se já existe resposta de texto
                    cursor.execute("SELECT resposta_cod FROM Resposta_Texto WHERE resposta_cod = %s", (cod_resposta,))
                    if cursor.fetchone():
                        # Atualizar resposta de texto existente
                        query_atualizar_texto = """
                            UPDATE Resposta_Texto 
                            SET texto_resposta = %s 
                            WHERE resposta_cod = %s
                        """
                        cursor.execute(query_atualizar_texto, (texto_resposta, cod_resposta))
                    else:
                        # Inserir nova resposta de texto
                        query_inserir_texto = """
                            INSERT INTO Resposta_Texto (resposta_cod, texto_resposta)
                            VALUES (%s, %s)
                        """
                        cursor.execute(query_inserir_texto, (cod_resposta, texto_resposta))
                
                elif tipo_resposta == 'Escolha':
                    cursor.execute("DELETE FROM Resposta_Texto WHERE resposta_cod = %s", (cod_resposta,))
                    # Verificar se já existe resposta de escolha
                    cursor.execute("SELECT resposta_cod FROM Resposta_Escolha WHERE resposta_cod = %s", (cod_resposta,))
                    if cursor.fetchone():
                        # Atualizar resposta de escolha existente
                        query_atualizar_escolha = """
                            UPDATE Resposta_Escolha 
                            SET escolha = %s 
                            WHERE resposta_cod = %s
                        """
                        cursor.execute(query_atualizar_escolha, (escolha, cod_resposta))
                    else:
                        # Inserir nova resposta de escolha
                        query_inserir_escolha = """
                            INSERT INTO Resposta_Escolha (resposta_cod, escolha)
                            VALUES (%s, %s)
                        """
                        cursor.execute(query_inserir_escolha, (cod_resposta, escolha))
            else:
                # Criar nova resposta
                query_resposta = """
                    INSERT INTO Resposta 
                    (tipo_resposta, avaliacao_cod, questao_cod)
                    VALUES (%s, %s, %s)
                    RETURNING cod_resposta
                """
                
                cursor.execute(query_resposta, (tipo_resposta, avaliacao_cod, questao_cod))
                result = cursor.fetchone()
                
                if result:
                    cod_resposta = result['cod_resposta']
                    
                    # Inserir na tabela específica
                    if tipo_resposta == 'Texto' and texto_resposta:
                        query_texto = """
                            INSERT INTO Resposta_Texto (resposta_cod, texto_resposta)
                            VALUES (%s, %s)
                        """
                        cursor.execute(query_texto, (cod_resposta, texto_resposta))
                    
                    elif tipo_resposta == 'Escolha' and escolha:
                        query_escolha = """
                            INSERT INTO Resposta_Escolha (resposta_cod, escolha)
                            VALUES (%s, %s)
                        """
                        cursor.execute(query_escolha, (cod_resposta, escolha))
                else:
                    connection.rollback()
                    return None
            
            connection.commit()
            
            # Retornar a resposta atualizada
            query_retorno = """
                SELECT cod_resposta AS id
                FROM Resposta 
                WHERE cod_resposta = %s
            """
            cursor.execute(query_retorno, (cod_resposta,))
            result = cursor.fetchone()
            return [dict(result)] if result else None
            
        except Exception as error:
            if connection:
                connection.rollback()
            print(f"[ERRO] Erro ao salvar resposta: {error}")
            raise
        finally:
            if cursor:
                cursor.close()
            if connection:
                Database.return_connection(connection)
    
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
