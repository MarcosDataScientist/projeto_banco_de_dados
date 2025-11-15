"""
Model para gerenciamento de questionários
"""
from backend.config.database import Database

class QuestionariosModel:
    """Model para operações com questionários"""
    
    @staticmethod
    def listar_todos():
        """
        Lista todos os questionários com informações agregadas
        - Quantidade de perguntas vinculadas
        - Quantidade de vezes que foi aplicado
        """
        query = """
        SELECT 
            q.cod_questionario as id,
            q.nome as titulo,
            q.tipo,
            q.status,
            c.nome as classificacao,
            COUNT(DISTINCT qq.questao_cod) as total_perguntas,
            COUNT(DISTINCT a.cod_avaliacao) as total_aplicacoes
        FROM Questionario q
        LEFT JOIN Classificacao c ON q.classificacao_cod = c.cod_classificacao
        LEFT JOIN Questionario_Questao qq ON q.cod_questionario = qq.questionario_cod
        LEFT JOIN Avaliacao a ON q.cod_questionario = a.questionario_cod
        GROUP BY q.cod_questionario, q.nome, q.tipo, q.status, c.nome
        ORDER BY q.cod_questionario DESC
        """
        
        conn = Database.get_connection()
        if not conn:
            raise Exception("Não foi possível conectar ao banco de dados")
        
        try:
            with conn.cursor() as cursor:
                cursor.execute(query)
                colunas = [desc[0] for desc in cursor.description]
                resultados = cursor.fetchall()
                
                questionarios = []
                for row in resultados:
                    questionario = dict(zip(colunas, row))
                    questionarios.append(questionario)
                
                return questionarios
        finally:
            Database.return_connection(conn)
    
    @staticmethod
    def buscar_por_id(questionario_id):
        """Busca um questionário específico por ID"""
        query = """
        SELECT 
            q.cod_questionario as id,
            q.nome as titulo,
            q.tipo,
            q.status,
            c.nome as classificacao,
            c.cod_classificacao as classificacao_id
        FROM Questionario q
        LEFT JOIN Classificacao c ON q.classificacao_cod = c.cod_classificacao
        WHERE q.cod_questionario = %s
        """
        
        conn = Database.get_connection()
        if not conn:
            raise Exception("Não foi possível conectar ao banco de dados")
        
        try:
            with conn.cursor() as cursor:
                cursor.execute(query, (questionario_id,))
                colunas = [desc[0] for desc in cursor.description]
                resultado = cursor.fetchone()
                
                if resultado:
                    return dict(zip(colunas, resultado))
                return None
        finally:
            Database.return_connection(conn)
    
    @staticmethod
    def buscar_perguntas(questionario_id):
        """Busca todas as perguntas de um questionário"""
        query = """
        SELECT 
            qu.cod_questao as id,
            qu.texto_questao as texto,
            qu.tipo_questao as tipo,
            qu.status
        FROM Questionario_Questao qq
        JOIN Questao qu ON qq.questao_cod = qu.cod_questao
        WHERE qq.questionario_cod = %s
        ORDER BY qu.cod_questao
        """
        
        conn = Database.get_connection()
        if not conn:
            raise Exception("Não foi possível conectar ao banco de dados")
        
        try:
            with conn.cursor() as cursor:
                cursor.execute(query, (questionario_id,))
                colunas = [desc[0] for desc in cursor.description]
                resultados = cursor.fetchall()
                
                perguntas = []
                for row in resultados:
                    pergunta = dict(zip(colunas, row))
                    
                    # Se for múltipla escolha, buscar opções
                    if pergunta['tipo'] == 'Múltipla Escolha':
                        opcoes_query = """
                        SELECT opcoes 
                        FROM Questao_Multipla_Escolha 
                        WHERE questao_cod = %s
                        """
                        cursor.execute(opcoes_query, (pergunta['id'],))
                        opcoes_row = cursor.fetchone()
                        if opcoes_row and opcoes_row[0]:
                            # opcoes_row[0] já vem como dict/list do psycopg2 quando é JSONB
                            import json
                            opcoes_value = opcoes_row[0]
                            # Se já for uma lista ou dict, usar diretamente
                            if isinstance(opcoes_value, (list, dict)):
                                pergunta['opcoes'] = opcoes_value
                            # Se for string, tentar fazer parse
                            elif isinstance(opcoes_value, str):
                                try:
                                    pergunta['opcoes'] = json.loads(opcoes_value)
                                except:
                                    pergunta['opcoes'] = []
                            else:
                                pergunta['opcoes'] = []
                    
                    perguntas.append(pergunta)
                
                return perguntas
        finally:
            Database.return_connection(conn)
    
    @staticmethod
    def criar(nome, tipo, classificacao_cod, status='Ativo'):
        """Cria um novo questionário"""
        query = """
        INSERT INTO Questionario (nome, tipo, status, classificacao_cod)
        VALUES (%s, %s, %s, %s)
        RETURNING cod_questionario as id, nome as titulo, tipo, status, classificacao_cod
        """
        
        conn = Database.get_connection()
        if not conn:
            raise Exception("Não foi possível conectar ao banco de dados")
        
        try:
            with conn.cursor() as cursor:
                cursor.execute(query, (nome, tipo, status, classificacao_cod))
                conn.commit()
                
                colunas = [desc[0] for desc in cursor.description]
                resultado = cursor.fetchall()
                
                return [dict(zip(colunas, row)) for row in resultado]
        finally:
            Database.return_connection(conn)
    
    @staticmethod
    def atualizar(questionario_id, nome=None, tipo=None, status=None, classificacao_cod=None):
        """Atualiza um questionário"""
        campos = []
        valores = []
        
        if nome is not None:
            campos.append("nome = %s")
            valores.append(nome)
        
        if tipo is not None:
            campos.append("tipo = %s")
            valores.append(tipo)
        
        if status is not None:
            campos.append("status = %s")
            valores.append(status)
        
        if classificacao_cod is not None:
            campos.append("classificacao_cod = %s")
            valores.append(classificacao_cod)
        
        if not campos:
            return None
        
        valores.append(questionario_id)
        
        query = f"""
        UPDATE Questionario
        SET {', '.join(campos)}
        WHERE cod_questionario = %s
        RETURNING cod_questionario as id, nome as titulo, tipo, status, classificacao_cod
        """
        
        conn = Database.get_connection()
        if not conn:
            raise Exception("Não foi possível conectar ao banco de dados")
        
        try:
            with conn.cursor() as cursor:
                cursor.execute(query, valores)
                conn.commit()
                
                colunas = [desc[0] for desc in cursor.description]
                resultado = cursor.fetchall()
                
                return [dict(zip(colunas, row)) for row in resultado]
        finally:
            Database.return_connection(conn)
        
    @staticmethod
    def vincular_perguntas(questionario_id, questoes_ids):
        """Vincula perguntas a um questionário"""
        if not questoes_ids:
            return
        
        conn = Database.get_connection()
        if not conn:
            raise Exception("Não foi possível conectar ao banco de dados")
        
        try:
            with conn.cursor() as cursor:
                # Limpar vínculos existentes
                cursor.execute(
                    "DELETE FROM Questionario_Questao WHERE questionario_cod = %s",
                    (questionario_id,)
                )
                
                # Inserir novos vínculos
                for questao_id in questoes_ids:
                    cursor.execute(
                        """
                        INSERT INTO Questionario_Questao (questionario_cod, questao_cod)
                        VALUES (%s, %s)
                        ON CONFLICT DO NOTHING
                        """,
                        (questionario_id, questao_id)
                    )
                
                conn.commit()
        finally:
            Database.return_connection(conn)
    
    @staticmethod
    def verificar_uso_em_avaliacoes(questionario_id):
        """Verifica se o questionário está sendo usado em alguma avaliação"""
        conn = Database.get_connection()
        if not conn:
            raise Exception("Não foi possível conectar ao banco de dados")
        
        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    "SELECT COUNT(*) FROM Avaliacao WHERE questionario_cod = %s",
                    (questionario_id,)
                )
                total = cursor.fetchone()[0]
                return total
        finally:
            Database.return_connection(conn)
    
    @staticmethod
    def deletar_com_cascata(questionario_id):
        """
        Deleta um questionário APENAS se não estiver associado a avaliações.
        Se houver avaliações associadas, retorna erro.
        """
        conn = Database.get_connection()
        if not conn:
            raise Exception("Não foi possível conectar ao banco de dados")
        
        try:
            with conn.cursor() as cursor:
                # Verificar se o questionário existe
                cursor.execute(
                    "SELECT cod_questionario, nome FROM Questionario WHERE cod_questionario = %s",
                    (questionario_id,)
                )
                questionario = cursor.fetchone()
                
                if not questionario:
                    return {'sucesso': False, 'mensagem': 'Questionário não encontrado'}
                
                # Verificar se há avaliações associadas
                cursor.execute(
                    "SELECT COUNT(*) FROM Avaliacao WHERE questionario_cod = %s",
                    (questionario_id,)
                )
                total_avaliacoes = cursor.fetchone()[0]
                
                if total_avaliacoes > 0:
                    return {
                        'sucesso': False,
                        'mensagem': f'Não é possível excluir este questionário. Ele está sendo usado em {total_avaliacoes} avaliação(ões).',
                        'total_avaliacoes': total_avaliacoes
                    }
                
                # Se não houver avaliações, pode deletar
                # Deletar vínculos com perguntas
                cursor.execute(
                    "DELETE FROM Questionario_Questao WHERE questionario_cod = %s",
                    (questionario_id,)
                )
                vinculos_deletados = cursor.rowcount
                
                # Deletar o questionário
                cursor.execute(
                    "DELETE FROM Questionario WHERE cod_questionario = %s",
                    (questionario_id,)
                )
                questionario_deletado = cursor.rowcount
                
                conn.commit()
                
                return {
                    'sucesso': True,
                    'questionario_id': questionario_id,
                    'questionario_nome': questionario[1] if len(questionario) > 1 else None,
                    'estatisticas': {
                        'vinculos_deletados': vinculos_deletados,
                        'questionarios_deletados': questionario_deletado
                    }
                }
                
        except Exception as e:
            conn.rollback()
            error_msg = str(e)
            # Verificar se o erro é de constraint RESTRICT
            if 'restrict' in error_msg.lower() or 'violates foreign key constraint' in error_msg.lower():
                return {
                    'sucesso': False,
                    'mensagem': 'Não é possível excluir este questionário. Ele está sendo usado em avaliações.'
                }
            raise Exception(f"Erro ao deletar questionário: {error_msg}")
        finally:
            Database.return_connection(conn)
    
    @staticmethod
    def listar_classificacoes():
        """Lista todas as classificações disponíveis"""
        query = "SELECT cod_classificacao as id, nome FROM Classificacao ORDER BY nome"
        
        conn = Database.get_connection()
        if not conn:
            raise Exception("Não foi possível conectar ao banco de dados")
        
        try:
            with conn.cursor() as cursor:
                cursor.execute(query)
                colunas = [desc[0] for desc in cursor.description]
                resultados = cursor.fetchall()
                
                return [dict(zip(colunas, row)) for row in resultados]
        finally:
            Database.return_connection(conn)

