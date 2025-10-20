"""
Módulo de queries SQL para Funcionários
Adaptado para o novo schema: Funcionario (sem departamentos)
"""
from backend.config.database import execute_query


class FuncionariosModel:
    """Classe com queries SQL para funcionários"""
    
    @staticmethod
    def listar_todos(filtro_status=None, filtro_setor=None):
        """Lista todos os funcionários com filtros opcionais"""
        query = """
            SELECT 
                f.cpf,
                f.nome,
                f.email,
                f.setor,
                f.ctps,
                f.tipo,
                f.status
            FROM Funcionario f
            WHERE 1=1
        """
        
        params = []
        
        if filtro_status:
            query += " AND f.status = %s"
            params.append(filtro_status)
        
        if filtro_setor:
            query += " AND f.setor = %s"
            params.append(filtro_setor)
        
        query += " ORDER BY f.nome"
        
        return execute_query(query, tuple(params) if params else None)
    
    @staticmethod
    def listar_com_paginacao(filtro_status=None, filtro_setor=None, page=1, per_page=20):
        """Lista funcionários com paginação"""
        from backend.config.database import get_db_connection, Database
        from psycopg2.extras import RealDictCursor
        
        connection = None
        cursor = None
        
        try:
            connection = get_db_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)
            
            # Query base
            base_query = """
                FROM Funcionario f
                WHERE 1=1
            """
            
            params = []
            
            if filtro_status:
                base_query += " AND f.status = %s"
                params.append(filtro_status)
            
            if filtro_setor:
                base_query += " AND f.setor = %s"
                params.append(filtro_setor)
            
            # Contar total de registros
            count_query = f"SELECT COUNT(*) as total {base_query}"
            cursor.execute(count_query, tuple(params) if params else None)
            total = cursor.fetchone()['total']
            
            # Query com paginação
            offset = (page - 1) * per_page
            data_query = f"""
                SELECT 
                    f.cpf,
                    f.nome,
                    f.email,
                    f.setor,
                    f.ctps,
                    f.tipo,
                    f.status
                {base_query}
                ORDER BY f.nome
                LIMIT %s OFFSET %s
            """
            
            params.extend([per_page, offset])
            cursor.execute(data_query, tuple(params))
            funcionarios = [dict(row) for row in cursor.fetchall()]
            
            return funcionarios, total
            
        except Exception as error:
            print(f"[ERRO] Erro ao listar funcionários com paginação: {error}")
            raise
        finally:
            if cursor:
                cursor.close()
            if connection:
                Database.return_connection(connection)
    
    @staticmethod
    def buscar_por_cpf(cpf):
        """Busca um funcionário específico por CPF"""
        query = """
            SELECT 
                f.cpf,
                f.nome,
                f.email,
                f.setor,
                f.ctps,
                f.tipo,
                f.status
            FROM Funcionario f
            WHERE f.cpf = %s
        """
        
        results = execute_query(query, (cpf,))
        return results[0] if results else None
    
    @staticmethod
    def buscar_por_id(funcionario_id):
        """Alias para buscar_por_cpf (para compatibilidade com a API)"""
        return FuncionariosModel.buscar_por_cpf(funcionario_id)
    
    @staticmethod
    def criar(nome, cpf, email, setor, ctps=None, tipo=None, status='Ativo'):
        """Cria um novo funcionário"""
        from backend.config.database import get_db_connection, Database
        from psycopg2.extras import RealDictCursor
        
        connection = None
        cursor = None
        
        try:
            connection = get_db_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)
            
            query = """
                INSERT INTO Funcionario 
                (cpf, nome, email, setor, ctps, tipo, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING cpf, nome, email, status
            """
            
            cursor.execute(query, (cpf, nome, email, setor, ctps, tipo, status))
            connection.commit()
            
            result = cursor.fetchone()
            return [dict(result)] if result else []
            
        except Exception as error:
            if connection:
                connection.rollback()
            print(f"[ERRO] Erro ao criar funcionário: {error}")
            raise
        finally:
            if cursor:
                cursor.close()
            if connection:
                Database.return_connection(connection)
    
    @staticmethod
    def atualizar(cpf, **campos):
        """Atualiza um funcionário"""
        from backend.config.database import get_db_connection, Database
        from psycopg2.extras import RealDictCursor
        
        campos_update = []
        params = []
        
        campos_permitidos = ['nome', 'email', 'setor', 'ctps', 'tipo', 'status']
        
        for campo, valor in campos.items():
            if campo in campos_permitidos and valor is not None:
                campos_update.append(f"{campo} = %s")
                params.append(valor)
        
        if not campos_update:
            return None
        
        params.append(cpf)
        
        connection = None
        cursor = None
        
        try:
            connection = get_db_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)
            
            query = f"""
                UPDATE Funcionario 
                SET {', '.join(campos_update)}
                WHERE cpf = %s
                RETURNING cpf, nome, email, status
            """
            
            cursor.execute(query, tuple(params))
            connection.commit()
            
            result = cursor.fetchone()
            return [dict(result)] if result else []
            
        except Exception as error:
            if connection:
                connection.rollback()
            print(f"[ERRO] Erro ao atualizar funcionário: {error}")
            raise
        finally:
            if cursor:
                cursor.close()
            if connection:
                Database.return_connection(connection)
    
    @staticmethod
    def deletar(cpf):
        """Deleta um funcionário"""
        query = "DELETE FROM Funcionario WHERE cpf = %s"
        return execute_query(query, (cpf,), fetch=False)
    
    @staticmethod
    def contar_por_status():
        """Conta funcionários agrupados por status"""
        query = """
            SELECT 
                status,
                COUNT(*) AS total
            FROM Funcionario
            GROUP BY status
            ORDER BY total DESC
        """
        
        return execute_query(query)
    
    @staticmethod
    def contar_por_setor():
        """Conta funcionários agrupados por setor"""
        query = """
            SELECT 
                setor,
                COUNT(*) AS total
            FROM Funcionario
            WHERE setor IS NOT NULL
            GROUP BY setor
            ORDER BY total DESC
        """
        
        return execute_query(query)
    
    @staticmethod
    def listar_setores():
        """Lista todos os setores distintos"""
        query = """
            SELECT DISTINCT 
                setor AS nome
            FROM Funcionario
            WHERE setor IS NOT NULL
            ORDER BY setor
        """
        
        return execute_query(query)
    
    @staticmethod
    def listar_departamentos():
        """Alias para listar_setores (compatibilidade com API)"""
        return FuncionariosModel.listar_setores()
    
    @staticmethod
    def buscar_avaliacoes_funcionario(funcionario_cpf):
        """Busca todas as avaliações de um funcionário"""
        query = """
            SELECT 
                a.cod_avaliacao AS id,
                a.local,
                a.data_completa,
                a.descricao,
                a.rating,
                q.nome AS questionario,
                av.nome AS avaliador
            FROM Avaliacao a
            LEFT JOIN Questionario q ON a.questionario_cod = q.cod_questionario
            LEFT JOIN Funcionario av ON a.avaliador_cpf = av.cpf
            WHERE a.avaliado_cpf = %s
            ORDER BY a.data_completa DESC
        """
        
        return execute_query(query, (funcionario_cpf,))
    
    @staticmethod
    def buscar_treinamentos_funcionario(funcionario_cpf):
        """Busca todos os treinamentos de um funcionário"""
        query = """
            SELECT 
                t.cod_treinamento,
                t.nome,
                t.data_realizacao,
                t.validade,
                t.local,
                ft.n_certificado
            FROM Funcionario_Treinamento ft
            JOIN Treinamento t ON ft.treinamento_cod = t.cod_treinamento
            WHERE ft.funcionario_cpf = %s
            ORDER BY t.data_realizacao DESC
        """
        
        return execute_query(query, (funcionario_cpf,))
    
    @staticmethod
    def buscar_classificacoes_funcionario(funcionario_cpf):
        """Busca todas as classificações de um funcionário"""
        query = """
            SELECT 
                c.cod_classificacao,
                c.nome
            FROM Funcionario_Classificacao fc
            JOIN Classificacao c ON fc.classificacao_cod = c.cod_classificacao
            WHERE fc.funcionario_cpf = %s
            ORDER BY c.nome
        """
        
        return execute_query(query, (funcionario_cpf,))
