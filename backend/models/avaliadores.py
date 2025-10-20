from ..config.database import Database

class AvaliadoresModel:
    @staticmethod
    def listar_avaliadores():
        """
        Lista funcionários que possuem certificados (são avaliadores)
        """
        conn = Database.get_connection()
        if not conn:
            raise Exception("Não foi possível conectar ao banco de dados")
        
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT DISTINCT
                        f.cpf,
                        f.nome,
                        f.email,
                        f.setor,
                        f.status,
                        COUNT(ft.treinamento_cod) as total_certificados,
                        MAX(ft.n_certificado) as ultimo_certificado,
                        COUNT(DISTINCT t.cod_treinamento) as treinamentos_unicos
                    FROM Funcionario f
                    INNER JOIN Funcionario_Treinamento ft ON f.cpf = ft.funcionario_cpf
                    INNER JOIN Treinamento t ON ft.treinamento_cod = t.cod_treinamento
                    WHERE f.status = 'Ativo'
                    GROUP BY f.cpf, f.nome, f.email, f.setor, f.status
                    ORDER BY f.nome
                """)
                
                avaliadores = []
                for row in cursor.fetchall():
                    avaliadores.append({
                        'cpf': row[0],
                        'nome': row[1],
                        'email': row[2],
                        'setor': row[3],
                        'status': row[4],
                        'total_certificados': row[5],
                        'ultimo_certificado': row[6],
                        'treinamentos_unicos': row[7]
                    })
                
                return avaliadores
                
        except Exception as e:
            raise Exception(f"Erro ao listar avaliadores: {str(e)}")
        finally:
            Database.return_connection(conn)
    
    @staticmethod
    def buscar_avaliador_por_cpf(cpf):
        """
        Busca um avaliador específico por CPF
        """
        conn = Database.get_connection()
        if not conn:
            raise Exception("Não foi possível conectar ao banco de dados")
        
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT 
                        f.cpf,
                        f.nome,
                        f.email,
                        f.setor,
                        f.status,
                        COUNT(ft.treinamento_cod) as total_certificados,
                        MAX(ft.n_certificado) as ultimo_certificado,
                        COUNT(DISTINCT t.cod_treinamento) as treinamentos_unicos
                    FROM Funcionario f
                    INNER JOIN Funcionario_Treinamento ft ON f.cpf = ft.funcionario_cpf
                    INNER JOIN Treinamento t ON ft.treinamento_cod = t.cod_treinamento
                    WHERE f.cpf = %s
                    GROUP BY f.cpf, f.nome, f.email, f.setor, f.status
                """, (cpf,))
                
                row = cursor.fetchone()
                if row:
                    return {
                        'cpf': row[0],
                        'nome': row[1],
                        'email': row[2],
                        'setor': row[3],
                        'status': row[4],
                        'total_certificados': row[5],
                        'ultimo_certificado': row[6],
                        'treinamentos_unicos': row[7]
                    }
                return None
                
        except Exception as e:
            raise Exception(f"Erro ao buscar avaliador: {str(e)}")
        finally:
            Database.return_connection(conn)
    
    @staticmethod
    def listar_certificados_avaliador(cpf):
        """
        Lista todos os certificados de um avaliador específico
        """
        conn = Database.get_connection()
        if not conn:
            raise Exception("Não foi possível conectar ao banco de dados")
        
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT 
                        t.cod_treinamento,
                        t.nome as nome_treinamento,
                        t.data_realizacao,
                        t.validade,
                        t.local,
                        ft.n_certificado
                    FROM Funcionario_Treinamento ft
                    INNER JOIN Treinamento t ON ft.treinamento_cod = t.cod_treinamento
                    WHERE ft.funcionario_cpf = %s
                    ORDER BY t.data_realizacao DESC
                """, (cpf,))
                
                certificados = []
                for row in cursor.fetchall():
                    certificados.append({
                        'cod_treinamento': row[0],
                        'nome_treinamento': row[1],
                        'data_realizacao': row[2],
                        'validade': row[3],
                        'local': row[4],
                        'n_certificado': row[5]
                    })
                
                return certificados
                
        except Exception as e:
            raise Exception(f"Erro ao listar certificados: {str(e)}")
        finally:
            Database.return_connection(conn)