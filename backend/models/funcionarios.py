"""
Módulo de queries SQL para Funcionários
Adaptado para o novo schema: Funcionario (sem departamentos)
"""
import re
import unicodedata

from backend.config.database import execute_query

ACCENTED_CHARS = 'áàãâäéèêëíìîïóòõôöúùûüç'
UNACCENTED_CHARS = 'aaaaaeeeeiiiiooooouuuuc'


def normalize_search_term(term: str) -> str:
    """Remove acentos e converte para minúsculas para comparação."""
    normalized = unicodedata.normalize('NFD', term)
    return ''.join(c for c in normalized if unicodedata.category(c) != 'Mn').lower()


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
    def listar_com_paginacao(filtro_status=None, filtro_setor=None, filtro_busca=None, page=1, per_page=20):
        """Lista funcionários com paginação"""
        from backend.config.database import get_db_connection, Database
        from psycopg2.extras import RealDictCursor
        
        connection = None
        cursor = None
        
        try:
            connection = get_db_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)
            
            # Query base (sem JOIN com departamento por enquanto, pois a tabela pode não existir)
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

            if filtro_busca:
                # Busca simples usando ILIKE (case-insensitive) para todos os campos
                search_pattern = f"%{filtro_busca}%"
                
                # Busca por CPF sem formatação
                cpf_digits_only = re.sub(r'\D', '', filtro_busca)
                cpf_pattern = f"%{cpf_digits_only}%" if cpf_digits_only else None
                
                # Condições de busca
                search_conditions = [
                    "f.cpf::text ILIKE %s",
                    "f.nome ILIKE %s",
                    "COALESCE(f.email, '') ILIKE %s",
                    "COALESCE(f.setor, '') ILIKE %s",
                    "COALESCE(f.tipo, '') ILIKE %s",
                    "f.status ILIKE %s"
                ]
                
                search_params = [
                    search_pattern,  # CPF formatado
                    search_pattern,  # Nome
                    search_pattern,  # Email
                    search_pattern,  # Setor
                    search_pattern,  # Tipo
                    search_pattern   # Status
                ]
                
                # Adicionar busca por CPF sem formatação se houver dígitos
                if cpf_pattern and cpf_pattern != search_pattern:
                    search_conditions.insert(0, "REGEXP_REPLACE(f.cpf::text, '\\D', '', 'g') ILIKE %s")
                    search_params.insert(0, cpf_pattern)
                
                base_query += f" AND ({' OR '.join(search_conditions)})"
                params.extend(search_params)
            
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
    def criar(nome, cpf, email, setor=None, ctps=None, tipo=None, status='Ativo'):
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
            
            # Garantir que status esteja no formato correto
            status_final = status if status else 'Ativo'
            if isinstance(status_final, str):
                status_final = status_final.capitalize()
            
            cursor.execute(query, (cpf, nome, email, setor, ctps, tipo, status_final))
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
        
        connection = None
        cursor = None
        
        try:
            connection = get_db_connection()
            cursor = connection.cursor(cursor_factory=RealDictCursor)
            
            for campo, valor in campos.items():
                if campo in campos_permitidos and valor is not None:
                    campos_update.append(f"{campo} = %s")
                    params.append(valor)
            
            if not campos_update:
                return None
            
            params.append(cpf)
            
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
    def contar_total_geral():
        """Conta o total geral de funcionários no sistema (sem filtros)"""
        from backend.config.database import get_db_connection, Database
        
        connection = None
        cursor = None
        
        try:
            connection = get_db_connection()
            cursor = connection.cursor()
            
            query = "SELECT COUNT(*) AS total FROM Funcionario"
            cursor.execute(query)
            result = cursor.fetchone()
            
            total = result[0] if result else 0
            print(f"[DEBUG] Total geral de funcionários: {total}")
            return total
            
        except Exception as error:
            print(f"[ERRO] Erro ao contar total geral: {error}")
            raise
        finally:
            if cursor:
                cursor.close()
            if connection:
                Database.return_connection(connection)
    
    @staticmethod
    def contar_estatisticas_gerais():
        """Retorna estatísticas gerais: total geral, total ativo, total inativo e total em processo"""
        from backend.config.database import get_db_connection, Database
        
        connection = None
        cursor = None
        
        try:
            connection = get_db_connection()
            cursor = connection.cursor()
            
            query = """
                SELECT 
                    COUNT(*) AS total_geral,
                    COUNT(*) FILTER (WHERE TRIM(UPPER(status)) = 'ATIVO') AS total_ativo,
                    -- Considerar funcionários DESLIGADOS como inativos
                    COUNT(*) FILTER (
                        WHERE TRIM(UPPER(status)) = 'INATIVO'
                           OR TRIM(UPPER(status)) = 'DESLIGADO'
                    ) AS total_inativo,
                    COUNT(*) FILTER (
                        WHERE TRIM(UPPER(status)) LIKE '%PROCESSO%' 
                           OR TRIM(UPPER(status)) LIKE '%SAÍDA%' 
                           OR TRIM(UPPER(status)) LIKE '%SAIDA%'
                    ) AS total_processo
                FROM Funcionario
            """
            cursor.execute(query)
            result = cursor.fetchone()
            
            if result:
                total_geral = result[0] or 0
                total_ativo = result[1] or 0
                total_inativo = result[2] or 0
                total_processo = result[3] or 0
                
                # Debug: log dos resultados
                print(f"[DEBUG] Estatísticas gerais - Total: {total_geral}, Ativo: {total_ativo}, Inativo: {total_inativo}, Processo: {total_processo}")
                
                # Debug: verificar alguns status reais
                cursor.execute("SELECT DISTINCT status FROM Funcionario LIMIT 10")
                status_unicos = cursor.fetchall()
                print(f"[DEBUG] Status únicos encontrados: {[s[0] for s in status_unicos]}")
                
                return {
                    'total_geral': total_geral,
                    'total_ativo': total_ativo,
                    'total_inativo': total_inativo,
                    'total_processo': total_processo
                }
            return {'total_geral': 0, 'total_ativo': 0, 'total_inativo': 0, 'total_processo': 0}
            
        except Exception as error:
            print(f"[ERRO] Erro ao contar estatísticas gerais: {error}")
            raise
        finally:
            if cursor:
                cursor.close()
            if connection:
                Database.return_connection(connection)
    
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
        """Lista todos os departamentos da tabela Departamento ou setores distintos se a tabela não existir"""
        from backend.config.database import get_db_connection, Database
        
        connection = None
        cursor = None
        
        try:
            connection = get_db_connection()
            cursor = connection.cursor()
            
            # Tenta buscar da tabela departamento primeiro
            try:
                cursor.execute("""
                    SELECT 
                        cod_departamento,
                        nome
                    FROM departamento
                    ORDER BY nome
                """)
                results = cursor.fetchall()
                return [{'cod_departamento': row[0], 'nome': row[1]} for row in results]
            except:
                # Se a tabela não existe, retorna setores distintos da tabela Funcionario
                cursor.execute("""
                    SELECT DISTINCT
                        setor as nome
                    FROM Funcionario
                    WHERE setor IS NOT NULL AND setor != ''
                    ORDER BY setor
                """)
                results = cursor.fetchall()
                # Cria um cod_departamento fictício baseado no índice
                return [{'cod_departamento': idx + 1, 'nome': row[0]} for idx, row in enumerate(results)]
        except Exception as error:
            print(f"[ERRO] Erro ao listar departamentos: {error}")
            return []
        finally:
            if cursor:
                cursor.close()
            if connection:
                Database.return_connection(connection)
    
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
