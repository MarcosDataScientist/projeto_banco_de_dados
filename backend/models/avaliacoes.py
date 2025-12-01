"""
Módulo de queries SQL para Avaliações
Adaptado para o Modelo 2: Resposta usa opcao_cod, Avaliacao usa observacao_geral
"""
from backend.config.database import execute_query

class AvaliacoesModel:
    
    @staticmethod
    def listar_todas(filtro_status=None, filtro_funcionario=None):
        """Lista todas as avaliações com filtros opcionais"""
        query = """
            SELECT 
                a.cod_avaliacao AS id,
                a.local,
                a.data_completa,
                a.observacao_geral AS descricao,
                a.rating_geral AS rating,
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
                a.observacao_geral AS descricao,
                a.rating_geral AS rating,
                f.nome AS funcionario,
                f.cpf AS funcionario_cpf,
                f.email AS funcionario_email,
                av.nome AS avaliador,
                av.cpf AS avaliador_cpf,
                q.nome AS questionario,
                q.cod_questionario AS questionario_id,
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
    def criar(avaliado_cpf, avaliador_cpf, questionario_cod, local=None, observacao_geral=None, rating_geral=None):
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
                (local, data_completa, observacao_geral, rating_geral, avaliado_cpf, avaliador_cpf, questionario_cod)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING cod_avaliacao, data_completa, avaliado_cpf, avaliador_cpf
            """
            
            data_completa = datetime.now()
            
            cursor.execute(query, (local, data_completa, observacao_geral, rating_geral, 
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
    def atualizar_status(avaliacao_id, rating_geral=None, observacao_geral=None):
        """Atualiza uma avaliação (rating_geral e observacao_geral)"""
        from backend.config.database import get_db_connection, Database
        from psycopg2.extras import RealDictCursor
        
        campos = []
        params = []
        
        if rating_geral is not None:
            campos.append("rating_geral = %s")
            params.append(rating_geral)
        
        if observacao_geral is not None:
            campos.append("observacao_geral = %s")
            params.append(observacao_geral)
        
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
                RETURNING cod_avaliacao, rating_geral, observacao_geral, data_completa
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
    def atualizar_configuracoes(avaliacao_id, avaliado_cpf=None, avaliador_cpf=None, questionario_cod=None, local=None, observacao_geral=None):
        """Atualiza as configurações de uma avaliação (funcionário, avaliador, questionário, local, observacao_geral)"""
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
        
        if observacao_geral is not None:
            campos.append("observacao_geral = %s")
            params.append(observacao_geral)
        
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
                RETURNING cod_avaliacao, avaliado_cpf, avaliador_cpf, questionario_cod, local, observacao_geral
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
                r.questao_cod,
                r.opcao_cod,
                q.texto_questao AS pergunta,
                o.texto_opcao AS escolha_selecionada,
                o.ordem AS ordem_opcao
            FROM Resposta r
            LEFT JOIN Questao q ON r.questao_cod = q.cod_questao
            LEFT JOIN Opcao o ON r.opcao_cod = o.cod_opcao
            WHERE r.avaliacao_cod = %s
            ORDER BY r.cod_resposta
        """
        
        return execute_query(query, (avaliacao_id,))
    
    @staticmethod
    def deletar(avaliacao_id):
        """Deleta uma avaliação e suas respostas (CASCADE)"""
        query = "DELETE FROM Avaliacao WHERE cod_avaliacao = %s"
        return execute_query(query, (avaliacao_id,), fetch=False)
    
    @staticmethod
    def salvar_resposta(avaliacao_cod, questao_cod, opcao_cod):
        """Salva ou atualiza uma resposta de avaliação (UPSERT) - Modelo 2 usa apenas opcao_cod"""
        from backend.config.database import get_db_connection, Database
        from psycopg2.extras import RealDictCursor
        
        connection = None
        cursor = None
        
        try:
            connection = get_db_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)
            
            # Verificar se a resposta já existe (constraint UNIQUE garante uma resposta por questão)
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
                
                query_atualizar = """
                    UPDATE Resposta 
                    SET opcao_cod = %s
                    WHERE cod_resposta = %s
                    RETURNING cod_resposta
                """
                cursor.execute(query_atualizar, (opcao_cod, cod_resposta))
            else:
                # Criar nova resposta
                query_inserir = """
                    INSERT INTO Resposta 
                    (avaliacao_cod, questao_cod, opcao_cod)
                    VALUES (%s, %s, %s)
                    RETURNING cod_resposta
                """
                cursor.execute(query_inserir, (avaliacao_cod, questao_cod, opcao_cod))
            
            connection.commit()
            
            # Retornar a resposta atualizada
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
        """Conta avaliações agrupadas por rating_geral"""
        query = """
            SELECT 
                rating_geral AS rating,
                COUNT(*) AS total
            FROM Avaliacao
            WHERE rating_geral IS NOT NULL
            GROUP BY rating_geral
            ORDER BY rating_geral DESC
        """
        
        return execute_query(query)
    
    @staticmethod
    def contar_por_status():
        """Retorna contagem simulada de status baseado em rating_geral e data"""
        query = """
            SELECT 
                CASE 
                    WHEN rating_geral IS NOT NULL THEN 'Concluída'
                    WHEN data_completa < NOW() - INTERVAL '7 days' THEN 'Pendente'
                    ELSE 'Em Andamento'
                END AS status,
                COUNT(*) AS total
            FROM Avaliacao
            GROUP BY 
                CASE 
                    WHEN rating_geral IS NOT NULL THEN 'Concluída'
                    WHEN data_completa < NOW() - INTERVAL '7 days' THEN 'Pendente'
                    ELSE 'Em Andamento'
                END
            ORDER BY 
                CASE 
                    WHEN rating_geral IS NOT NULL THEN 1
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
    def buscar_respostas_agrupadas_por_questao(questao_id):
        """Busca respostas agrupadas por alternativa para uma questão específica
        Retorna dados de todas as avaliações que usam esta questão
        Modelo 2: Todas as questões são múltipla escolha, usando tabela Opcao
        """
        from backend.config.database import get_db_connection, Database
        from psycopg2.extras import RealDictCursor
        
        connection = None
        cursor = None
        
        try:
            connection = get_db_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)
            
            # Buscar a questão e suas opções
            query_questao = """
                SELECT 
                    q.cod_questao AS questao_id,
                    q.texto_questao AS pergunta
                FROM Questao q
                WHERE q.cod_questao = %s
            """
            
            cursor.execute(query_questao, (questao_id,))
            questao_data = cursor.fetchone()
            
            if not questao_data:
                return []
            
            # Buscar todas as opções da questão
            query_opcoes = """
                SELECT 
                    o.cod_opcao,
                    o.texto_opcao,
                    o.ordem
                FROM Opcao o
                WHERE o.questao_cod = %s
                ORDER BY o.ordem, o.cod_opcao
            """
            
            cursor.execute(query_opcoes, (questao_id,))
            opcoes = cursor.fetchall()
            
            resultado = []
            
            # Buscar contagem de respostas por opção
            query_respostas = """
                SELECT 
                    r.opcao_cod,
                    o.texto_opcao AS alternativa_selecionada,
                    COUNT(*) AS quantidade
                FROM Resposta r
                INNER JOIN Opcao o ON r.opcao_cod = o.cod_opcao
                WHERE r.questao_cod = %s
                GROUP BY r.opcao_cod, o.texto_opcao
            """
            
            cursor.execute(query_respostas, (questao_id,))
            respostas = cursor.fetchall()
            
            # Criar dicionário de contagens por cod_opcao
            contagens = {r['opcao_cod']: r['quantidade'] for r in respostas}
            
            # Para cada opção disponível, criar um registro (mesmo se quantidade for 0)
            for opcao in opcoes:
                quantidade = contagens.get(opcao['cod_opcao'], 0)
                resultado.append({
                    'questao_id': questao_id,
                    'pergunta': questao_data['pergunta'],
                    'opcao_cod': opcao['cod_opcao'],
                    'alternativa_selecionada': opcao['texto_opcao'],
                    'quantidade': quantidade
                })
            
            return resultado
            
        except Exception as error:
            print(f"[ERRO] Erro ao buscar respostas por questão: {error}")
            import traceback
            traceback.print_exc()
            raise
        finally:
            if cursor:
                cursor.close()
            if connection:
                Database.return_connection(connection)
    
    def buscar_respostas_agrupadas_grafico_por_questionario(questionario_id):
        """Busca respostas agrupadas por pergunta e alternativa para gráfico
        Retorna dados de todas as avaliações que usam o questionário especificado
        Modelo 2: Todas as questões são múltipla escolha, usando tabela Opcao
        """
        from backend.config.database import get_db_connection, Database
        from psycopg2.extras import RealDictCursor
        
        connection = None
        cursor = None
        
        try:
            connection = get_db_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)
            
            # Buscar todas as questões do questionário com suas opções
            query_perguntas = """
                SELECT 
                    q.cod_questao AS questao_id,
                    q.texto_questao AS pergunta,
                    o.cod_opcao,
                    o.texto_opcao,
                    o.ordem
                FROM Questionario_Questao qq
                INNER JOIN Questao q ON qq.questao_cod = q.cod_questao
                LEFT JOIN Opcao o ON q.cod_questao = o.questao_cod
                WHERE qq.questionario_cod = %s
                ORDER BY q.cod_questao, o.ordem, o.cod_opcao
            """
            
            cursor.execute(query_perguntas, (questionario_id,))
            resultados = cursor.fetchall()
            
            # Agrupar por questão
            questoes_dict = {}
            for row in resultados:
                questao_id = row['questao_id']
                if questao_id not in questoes_dict:
                    questoes_dict[questao_id] = {
                        'questao_id': questao_id,
                        'pergunta': row['pergunta'],
                        'opcoes': []
                    }
                
                if row['cod_opcao']:
                    questoes_dict[questao_id]['opcoes'].append({
                        'cod_opcao': row['cod_opcao'],
                        'texto_opcao': row['texto_opcao'],
                        'ordem': row['ordem']
                    })
            
            resultado = []
            
            # Para cada questão, buscar contagem de respostas por opção
            for questao_id, questao_data in questoes_dict.items():
                # Buscar contagem de respostas por opção
                query_respostas = """
                    SELECT 
                        r.opcao_cod,
                        o.texto_opcao AS alternativa_selecionada,
                        COUNT(*) AS quantidade
                    FROM Resposta r
                    INNER JOIN Avaliacao a ON r.avaliacao_cod = a.cod_avaliacao
                    INNER JOIN Opcao o ON r.opcao_cod = o.cod_opcao
                    WHERE a.questionario_cod = %s
                        AND r.questao_cod = %s
                    GROUP BY r.opcao_cod, o.texto_opcao
                """
                
                cursor.execute(query_respostas, (questionario_id, questao_id))
                respostas = cursor.fetchall()
                
                # Criar dicionário de contagens por cod_opcao
                contagens = {r['opcao_cod']: r['quantidade'] for r in respostas}
                
                # Para cada opção disponível, criar um registro (mesmo se quantidade for 0)
                for opcao in questao_data['opcoes']:
                    quantidade = contagens.get(opcao['cod_opcao'], 0)
                    resultado.append({
                        'questao_id': questao_id,
                        'pergunta': questao_data['pergunta'],
                        'opcao_cod': opcao['cod_opcao'],
                        'alternativa_selecionada': opcao['texto_opcao'],
                        'quantidade': quantidade
                    })
            
            print(f"[DEBUG] Total de registros retornados para questionário {questionario_id}: {len(resultado)}")
            return resultado
            
        except Exception as error:
            print(f"[ERRO] Erro ao buscar respostas agrupadas: {error}")
            import traceback
            traceback.print_exc()
            raise
        finally:
            if cursor:
                cursor.close()
            if connection:
                Database.return_connection(connection)
    
    @staticmethod
    def buscar_respostas_agrupadas_grafico(avaliacao_id):
        """Busca respostas agrupadas por pergunta e alternativa para gráfico
        Retorna dados de todas as avaliações que usam o mesmo questionário da avaliação selecionada
        """
        # Primeiro, buscar o questionário da avaliação
        query_questionario = """
            SELECT questionario_cod 
            FROM Avaliacao 
            WHERE cod_avaliacao = %s
        """
        
        result = execute_query(query_questionario, (avaliacao_id,))
        if not result:
            return []
        
        questionario_cod = result[0]['questionario_cod']
        
        # Usar o método por questionário
        return AvaliacoesModel.buscar_respostas_agrupadas_grafico_por_questionario(questionario_cod)
