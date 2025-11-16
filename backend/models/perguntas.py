"""
Módulo de queries SQL para Perguntas/Questões
Adaptado para o novo schema: Questao, Questao_Multipla_Escolha, Questao_Texto_Livre
"""
from backend.config.database import execute_query

class PerguntasModel:
    """Classe com queries SQL para questões"""
    
    @staticmethod
    def listar_todas(filtro_tipo=None, filtro_status=None):
        """
        Lista todas as questões com filtros opcionais
        
        Args:
            filtro_tipo: Tipo da questão para filtrar (Múltipla Escolha, Texto Livre)
            filtro_status: Status para filtrar (Ativo, Inativo)
        """
        query = """
            SELECT 
                q.cod_questao,
                q.tipo_questao,
                q.texto_questao,
                q.status
            FROM Questao q
            WHERE 1=1
        """
        
        params = []
        
        if filtro_tipo is not None:
            query += " AND q.tipo_questao = %s"
            params.append(filtro_tipo)
        
        if filtro_status is not None:
            query += " AND q.status = %s"
            params.append(filtro_status)
        
        query += " ORDER BY q.cod_questao"
        
        return execute_query(query, tuple(params) if params else None)
    
    @staticmethod
    def listar_com_paginacao(filtro_tipo=None, filtro_status=None, filtro_busca=None, page=1, per_page=10):
        """Lista perguntas com paginação"""
        from backend.config.database import get_db_connection, Database
        from psycopg2.extras import RealDictCursor
        
        connection = None
        cursor = None
        
        try:
            connection = get_db_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)
            
            # Query base
            base_query = """
                FROM Questao q
                WHERE 1=1
            """
            
            params = []
            
            if filtro_tipo:
                base_query += " AND q.tipo_questao = %s"
                params.append(filtro_tipo)
            
            if filtro_status:
                base_query += " AND q.status = %s"
                params.append(filtro_status)
            
            if filtro_busca:
                base_query += " AND (LOWER(q.texto_questao) LIKE %s OR LOWER(q.tipo_questao) LIKE %s)"
                busca_pattern = f"%{filtro_busca.lower()}%"
                params.append(busca_pattern)
                params.append(busca_pattern)
            
            # Contar total de registros
            count_query = f"SELECT COUNT(*) as total {base_query}"
            cursor.execute(count_query, tuple(params) if params else None)
            total = cursor.fetchone()['total']
            
            # Query com paginação
            offset = (page - 1) * per_page
            data_query = f"""
                SELECT 
                    q.cod_questao,
                    q.tipo_questao,
                    q.texto_questao,
                    q.status
                {base_query}
                ORDER BY q.cod_questao
                LIMIT %s OFFSET %s
            """
            
            params.extend([per_page, offset])
            cursor.execute(data_query, tuple(params))
            perguntas = [dict(row) for row in cursor.fetchall()]
            
            # Para cada pergunta, buscar opções se for múltipla escolha
            for pergunta in perguntas:
                if pergunta['tipo_questao'] == 'Múltipla Escolha':
                    opcoes = PerguntasModel.buscar_opcoes_resposta(pergunta['cod_questao'])
                    pergunta['opcoes'] = opcoes
            
            return perguntas, total
            
        except Exception as error:
            print(f"[ERRO] Erro ao listar perguntas com paginação: {error}")
            raise
        finally:
            if cursor:
                cursor.close()
            if connection:
                Database.return_connection(connection)
    
    @staticmethod
    def buscar_por_id(questao_id):
        """Busca uma questão específica por ID"""
        from backend.config.database import get_db_connection, Database
        from psycopg2.extras import RealDictCursor
        
        connection = None
        cursor = None
        
        try:
            connection = get_db_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)
            
            query = """
                SELECT 
                    q.cod_questao,
                    q.tipo_questao,
                    q.texto_questao,
                    q.status
                FROM Questao q
                WHERE q.cod_questao = %s
            """
            
            cursor.execute(query, (questao_id,))
            resultado = cursor.fetchone()
            
            if resultado:
                resultado = dict(resultado)
                
                # Se for múltipla escolha, buscar opções
                if resultado['tipo_questao'] == 'Múltipla Escolha':
                    opcoes = PerguntasModel.buscar_opcoes_resposta(questao_id)
                    resultado['opcoes'] = opcoes
            
            return resultado
            
        except Exception as error:
            print(f"[ERRO] Erro ao buscar pergunta: {error}")
            raise
        finally:
            if cursor:
                cursor.close()
            if connection:
                Database.return_connection(connection)
    
    @staticmethod
    def buscar_opcoes_resposta(questao_id):
        """Busca as opções de resposta de uma questão de múltipla escolha"""
        from backend.config.database import get_db_connection, Database
        from psycopg2.extras import RealDictCursor
        
        connection = None
        cursor = None
        
        try:
            connection = get_db_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)
            
            query = """
                SELECT 
                    qme.opcoes
                FROM Questao_Multipla_Escolha qme
                WHERE qme.questao_cod = %s
            """
            
            cursor.execute(query, (questao_id,))
            resultado = cursor.fetchone()
            
            if resultado and resultado.get('opcoes'):
                # opcoes está em formato JSONB
                return resultado['opcoes']
            return []
            
        except Exception as error:
            print(f"[ERRO] Erro ao buscar opções: {error}")
            return []
        finally:
            if cursor:
                cursor.close()
            if connection:
                Database.return_connection(connection)
    
    @staticmethod
    def criar(texto_questao, tipo_questao, status='Ativo', opcoes=None):
        """Cria uma nova questão"""
        from backend.config.database import get_db_connection, Database
        from psycopg2.extras import RealDictCursor
        
        connection = None
        cursor = None
        
        try:
            connection = get_db_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)
            
            # Criar a questão base
            query = """
                INSERT INTO Questao (tipo_questao, texto_questao, status)
                VALUES (%s, %s, %s)
                RETURNING cod_questao, tipo_questao, texto_questao, status
            """
            
            cursor.execute(query, (tipo_questao, texto_questao, status))
            connection.commit()
            
            resultado = cursor.fetchone()
            
            if resultado and opcoes and tipo_questao == 'Múltipla Escolha':
                # Inserir opções para múltipla escolha
                cod_questao = resultado['cod_questao']
                PerguntasModel.criar_opcoes_multipla_escolha(cod_questao, opcoes)
            elif resultado and tipo_questao == 'Texto Livre':
                # Inserir na tabela de texto livre
                cod_questao = resultado['cod_questao']
                PerguntasModel.criar_questao_texto_livre(cod_questao)
            
            return [dict(resultado)] if resultado else []
            
        except Exception as error:
            if connection:
                connection.rollback()
            print(f"[ERRO] Erro ao criar pergunta: {error}")
            raise
        finally:
            if cursor:
                cursor.close()
            if connection:
                Database.return_connection(connection)
    
    @staticmethod
    def criar_opcoes_multipla_escolha(questao_cod, opcoes):
        """Cria registro de questão de múltipla escolha com opções em JSONB"""
        import json
        
        # Se opcoes é uma lista, converter para JSON
        if isinstance(opcoes, list):
            opcoes_json = json.dumps(opcoes)
        else:
            opcoes_json = opcoes
        
        query = """
            INSERT INTO Questao_Multipla_Escolha (questao_cod, opcoes)
            VALUES (%s, %s::jsonb)
            RETURNING questao_cod
        """
        
        # Usar fetch=False para fazer commit da inserção
        return execute_query(query, (questao_cod, opcoes_json), fetch=False)
    
    @staticmethod
    def criar_questao_texto_livre(questao_cod):
        """Cria registro de questão de texto livre"""
        query = """
            INSERT INTO Questao_Texto_Livre (questao_cod)
            VALUES (%s)
            RETURNING questao_cod
        """
        
        # Usar fetch=False para fazer commit da inserção
        return execute_query(query, (questao_cod,), fetch=False)
    
    @staticmethod
    def atualizar(questao_id, texto_questao=None, tipo_questao=None, status=None):
        """Atualiza uma questão"""
        from backend.config.database import get_db_connection, Database
        from psycopg2.extras import RealDictCursor
        
        connection = None
        cursor = None
        
        try:
            connection = get_db_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)
            
            campos = []
            params = []
            
            if texto_questao is not None:
                campos.append("texto_questao = %s")
                params.append(texto_questao)
            
            if tipo_questao is not None:
                campos.append("tipo_questao = %s")
                params.append(tipo_questao)
            
            if status is not None:
                campos.append("status = %s")
                params.append(status)
            
            if not campos:
                return None
            
            params.append(questao_id)
            
            query = f"""
                UPDATE Questao 
                SET {', '.join(campos)}
                WHERE cod_questao = %s
                RETURNING cod_questao, tipo_questao, texto_questao, status
            """
            
            cursor.execute(query, tuple(params))
            connection.commit()
            
            resultado = cursor.fetchone()
            return [dict(resultado)] if resultado else []
            
        except Exception as error:
            if connection:
                connection.rollback()
            print(f"[ERRO] Erro ao atualizar pergunta: {error}")
            raise
        finally:
            if cursor:
                cursor.close()
            if connection:
                Database.return_connection(connection)
    
    @staticmethod
    def atualizar_opcoes_multipla_escolha(questao_cod, opcoes):
        """Atualiza as opções de uma questão de múltipla escolha"""
        from backend.config.database import get_db_connection, Database
        from psycopg2.extras import RealDictCursor
        import json
        
        connection = None
        cursor = None
        
        try:
            connection = get_db_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)
            
            if isinstance(opcoes, list):
                opcoes_json = json.dumps(opcoes)
            else:
                opcoes_json = opcoes
            
            # Primeiro, verificar se existe registro
            check_query = """
                SELECT questao_cod FROM Questao_Multipla_Escolha WHERE questao_cod = %s
            """
            cursor.execute(check_query, (questao_cod,))
            existe = cursor.fetchone()
            
            if existe:
                # Atualizar se existe
                update_query = """
                    UPDATE Questao_Multipla_Escolha
                    SET opcoes = %s::jsonb
                    WHERE questao_cod = %s
                    RETURNING questao_cod
                """
                cursor.execute(update_query, (opcoes_json, questao_cod))
            else:
                # Criar se não existe
                insert_query = """
                    INSERT INTO Questao_Multipla_Escolha (questao_cod, opcoes)
                    VALUES (%s, %s::jsonb)
                    RETURNING questao_cod
                """
                cursor.execute(insert_query, (questao_cod, opcoes_json))
            
            connection.commit()
            
            resultado = cursor.fetchone()
            return [dict(resultado)] if resultado else []
            
        except Exception as error:
            if connection:
                connection.rollback()
            print(f"[ERRO] Erro ao atualizar opções: {error}")
            raise
        finally:
            if cursor:
                cursor.close()
            if connection:
                Database.return_connection(connection)
    
    @staticmethod
    def verificar_uso_em_formularios(questao_id):
        """Verifica se a questão está sendo usada em algum questionário"""
        from backend.config.database import get_db_connection, Database
        
        conn = None
        cursor = None
        
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            query = """
                SELECT COUNT(*) as total
                FROM Questionario_Questao
                WHERE questao_cod = %s
            """
            
            cursor.execute(query, (questao_id,))
            resultado = cursor.fetchone()
            
            return resultado[0] if resultado else 0
            
        except Exception as error:
            print(f"[ERRO] Erro ao verificar uso em formulários: {error}")
            raise
        finally:
            if cursor:
                cursor.close()
            if conn:
                Database.return_connection(conn)

    @staticmethod
    def verificar_uso_em_respostas(questao_id):
        """Verifica se a questão está sendo usada em alguma resposta"""
        from backend.config.database import get_db_connection, Database
        
        conn = None
        cursor = None
        
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            query = """
                SELECT COUNT(*) as total
                FROM Resposta
                WHERE questao_cod = %s
            """
            
            cursor.execute(query, (questao_id,))
            resultado = cursor.fetchone()
            
            return resultado[0] if resultado else 0
            
        except Exception as error:
            print(f"[ERRO] Erro ao verificar uso em respostas: {error}")
            raise
        finally:
            if cursor:
                cursor.close()
            if conn:
                Database.return_connection(conn)
    
    @staticmethod
    def deletar(questao_id):
        """Deleta uma questão"""
        query = "DELETE FROM Questao WHERE cod_questao = %s"
        return execute_query(query, (questao_id,), fetch=False)
    
    @staticmethod
    def contar_por_tipo():
        """Conta questões agrupadas por tipo"""
        query = """
            SELECT 
                tipo_questao,
                COUNT(*) AS total
            FROM Questao
            GROUP BY tipo_questao
            ORDER BY total DESC
        """
        
        return execute_query(query)
    
    @staticmethod
    def contar_por_status():
        """Conta questões agrupadas por status"""
        query = """
            SELECT 
                status,
                COUNT(*) AS total
            FROM Questao
            GROUP BY status
            ORDER BY total DESC
        """
        
        return execute_query(query)
    
    @staticmethod
    def listar_categorias():
        """Lista todas as classificações (equivalente a categorias)"""
        query = """
            SELECT 
                cod_classificacao AS id,
                nome,
                nome AS descricao,
                TRUE AS ativo
            FROM Classificacao
            ORDER BY nome
        """
        
        return execute_query(query)
