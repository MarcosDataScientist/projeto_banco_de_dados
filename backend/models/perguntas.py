"""
Módulo de queries SQL para Perguntas/Questões
Adaptado para o Modelo 2: Apenas múltipla escolha, usando tabela Opcao
"""
from backend.config.database import execute_query

class PerguntasModel:
    """Classe com queries SQL para questões"""
    
    @staticmethod
    def listar_todas(filtro_tipo=None, filtro_status=None):
        """
        Lista todas as questões com filtros opcionais
        
        Args:
            filtro_tipo: Não usado mais (mantido para compatibilidade)
            filtro_status: Status para filtrar (Ativo, Inativo)
        """
        query = """
            SELECT 
                q.cod_questao,
                q.texto_questao,
                q.status
            FROM Questao q
            WHERE 1=1
        """
        
        params = []
        
        if filtro_status is not None:
            # Compatibilidade: aceitar tanto 'Ativo'/'Inativo' quanto 'Ativa'/'Inativa'
            if filtro_status in ('Ativo', 'Inativo'):
                if filtro_status == 'Ativo':
                    query += " AND UPPER(q.status) IN ('ATIVO', 'ATIVA')"
                else:
                    query += " AND UPPER(q.status) IN ('INATIVO', 'INATIVA')"
            else:
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
            
            # Construir condições WHERE
            where_conditions = []
            params = []
            
            # filtro_tipo não é mais usado (todas são múltipla escolha)
            
            if filtro_status:
                # Compatibilidade: aceitar tanto 'Ativo'/'Inativo' quanto 'Ativa'/'Inativa'
                if filtro_status in ('Ativo', 'Inativo'):
                    if filtro_status == 'Ativo':
                        where_conditions.append("UPPER(q.status) IN ('ATIVO', 'ATIVA')")
                    else:
                        where_conditions.append("UPPER(q.status) IN ('INATIVO', 'INATIVA')")
                else:
                    where_conditions.append("q.status = %s")
                    params.append(filtro_status)
            
            if filtro_busca:
                where_conditions.append("LOWER(q.texto_questao) LIKE %s")
                busca_pattern = f"%{filtro_busca.lower()}%"
                params.append(busca_pattern)
            
            where_clause = "WHERE " + " AND ".join(where_conditions) if where_conditions else ""
            
            # Contar total de registros
            count_query = f"SELECT COUNT(DISTINCT q.cod_questao) as total FROM Questao q {where_clause}"
            cursor.execute(count_query, tuple(params) if params else None)
            total = cursor.fetchone()['total']
            
            # Query com paginação incluindo contagem de respostas
            offset = (page - 1) * per_page
            data_query = f"""
                SELECT 
                    q.cod_questao,
                    q.texto_questao,
                    q.status,
                    COALESCE(COUNT(DISTINCT r.cod_resposta), 0) as total_respostas
                FROM Questao q
                LEFT JOIN Resposta r ON q.cod_questao = r.questao_cod
                {where_clause}
                GROUP BY q.cod_questao, q.texto_questao, q.status
                ORDER BY q.cod_questao
                LIMIT %s OFFSET %s
            """
            
            params.extend([per_page, offset])
            cursor.execute(data_query, tuple(params))
            perguntas = [dict(row) for row in cursor.fetchall()]
            
            # Para cada pergunta, buscar opções (todas são múltipla escolha agora)
            for pergunta in perguntas:
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
                    q.texto_questao,
                    q.status,
                    COALESCE(COUNT(DISTINCT r.cod_resposta), 0) as total_respostas
                FROM Questao q
                LEFT JOIN Resposta r ON q.cod_questao = r.questao_cod
                WHERE q.cod_questao = %s
                GROUP BY q.cod_questao, q.texto_questao, q.status
            """
            
            cursor.execute(query, (questao_id,))
            resultado = cursor.fetchone()
            
            if resultado:
                resultado = dict(resultado)
                
                # Buscar opções (todas são múltipla escolha)
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
        """Busca as opções de resposta de uma questão (tabela Opcao)"""
        from backend.config.database import get_db_connection, Database
        from psycopg2.extras import RealDictCursor
        
        connection = None
        cursor = None
        
        try:
            connection = get_db_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)
            
            query = """
                SELECT 
                    cod_opcao,
                    texto_opcao,
                    ordem
                FROM Opcao
                WHERE questao_cod = %s
                ORDER BY ordem, cod_opcao
            """
            
            cursor.execute(query, (questao_id,))
            resultados = cursor.fetchall()
            
            # Retornar lista de opções com seus dados
            opcoes = []
            for row in resultados:
                opcoes.append({
                    'cod_opcao': row['cod_opcao'],
                    'texto_opcao': row['texto_opcao'],
                    'ordem': row['ordem']
                })
            
            return opcoes
            
        except Exception as error:
            print(f"[ERRO] Erro ao buscar opções: {error}")
            return []
        finally:
            if cursor:
                cursor.close()
            if connection:
                Database.return_connection(connection)
    
    @staticmethod
    def criar(texto_questao, status='Ativo', opcoes=None):
        """Cria uma nova questão de múltipla escolha com suas opções"""
        from backend.config.database import get_db_connection, Database
        from psycopg2.extras import RealDictCursor
        
        connection = None
        cursor = None
        
        try:
            connection = get_db_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)
            
            # Criar a questão base
            query = """
                INSERT INTO Questao (texto_questao, status)
                VALUES (%s, %s)
                RETURNING cod_questao, texto_questao, status
            """
            
            cursor.execute(query, (texto_questao, status))
            resultado = cursor.fetchone()
            
            if not resultado:
                raise Exception("Não foi possível criar a questão")
            
            cod_questao = resultado['cod_questao']
            
            # Inserir opções na tabela Opcao
            if opcoes:
                if isinstance(opcoes, list):
                    # Se for lista de strings, criar opções
                    for ordem, texto_opcao in enumerate(opcoes, start=1):
                        query_opcao = """
                            INSERT INTO Opcao (texto_opcao, ordem, questao_cod)
                            VALUES (%s, %s, %s)
                        """
                        cursor.execute(query_opcao, (texto_opcao, ordem, cod_questao))
                elif isinstance(opcoes, dict) and 'opcoes' in opcoes:
                    # Se for dict com chave 'opcoes'
                    for ordem, opcao in enumerate(opcoes['opcoes'], start=1):
                        texto = opcao if isinstance(opcao, str) else opcao.get('texto_opcao', str(opcao))
                        ordem_val = opcao.get('ordem', ordem) if isinstance(opcao, dict) else ordem
                        query_opcao = """
                            INSERT INTO Opcao (texto_opcao, ordem, questao_cod)
                            VALUES (%s, %s, %s)
                        """
                        cursor.execute(query_opcao, (texto, ordem_val, cod_questao))
            
            # Fazer commit de tudo junto
            connection.commit()
            
            return [dict(resultado)]
            
        except Exception as error:
            if connection:
                connection.rollback()
            print(f"[ERRO] Erro ao criar pergunta: {error}")
            import traceback
            traceback.print_exc()
            raise
        finally:
            if cursor:
                cursor.close()
            if connection:
                Database.return_connection(connection)
    
    @staticmethod
    def criar_opcoes(questao_cod, opcoes):
        """Cria opções para uma questão na tabela Opcao"""
        from backend.config.database import get_db_connection, Database
        
        connection = None
        cursor = None
        
        try:
            connection = get_db_connection()
            cursor = connection.cursor()
            
            if isinstance(opcoes, list):
                for ordem, texto_opcao in enumerate(opcoes, start=1):
                    query = """
                        INSERT INTO Opcao (texto_opcao, ordem, questao_cod)
                        VALUES (%s, %s, %s)
                    """
                    cursor.execute(query, (texto_opcao, ordem, questao_cod))
            
            connection.commit()
            return True
            
        except Exception as error:
            if connection:
                connection.rollback()
            print(f"[ERRO] Erro ao criar opções: {error}")
            raise
        finally:
            if cursor:
                cursor.close()
            if connection:
                Database.return_connection(connection)
    
    @staticmethod
    def atualizar(questao_id, texto_questao=None, status=None):
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
                RETURNING cod_questao, texto_questao, status
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
    def atualizar_opcoes(questao_cod, opcoes):
        """Atualiza as opções de uma questão (deleta as antigas e cria novas)"""
        from backend.config.database import get_db_connection, Database
        
        connection = None
        cursor = None
        
        try:
            connection = get_db_connection()
            cursor = connection.cursor()
            
            # Deletar opções antigas
            cursor.execute("DELETE FROM Opcao WHERE questao_cod = %s", (questao_cod,))
            
            # Inserir novas opções
            if isinstance(opcoes, list):
                for ordem, texto_opcao in enumerate(opcoes, start=1):
                    query = """
                        INSERT INTO Opcao (texto_opcao, ordem, questao_cod)
                        VALUES (%s, %s, %s)
                    """
                    cursor.execute(query, (texto_opcao, ordem, questao_cod))
            
            connection.commit()
            return True
            
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
        """Conta questões agrupadas por tipo (todas são múltipla escolha agora)"""
        query = """
            SELECT 
                'Múltipla Escolha' AS tipo_questao,
                COUNT(*) AS total
            FROM Questao
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
