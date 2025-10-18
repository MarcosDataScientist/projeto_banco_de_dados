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
    def buscar_por_id(questao_id):
        """Busca uma questão específica por ID"""
        query = """
            SELECT 
                q.cod_questao,
                q.tipo_questao,
                q.texto_questao,
                q.status
            FROM Questao q
            WHERE q.cod_questao = %s
        """
        
        results = execute_query(query, (questao_id,))
        resultado = results[0] if results else None
        
        # Se for múltipla escolha, buscar opções
        if resultado and resultado['tipo_questao'] == 'Múltipla Escolha':
            opcoes = PerguntasModel.buscar_opcoes_resposta(questao_id)
            resultado['opcoes'] = opcoes
        
        return resultado
    
    @staticmethod
    def buscar_opcoes_resposta(questao_id):
        """Busca as opções de resposta de uma questão de múltipla escolha"""
        query = """
            SELECT 
                qme.opcoes
            FROM Questao_Multipla_Escolha qme
            WHERE qme.questao_cod = %s
        """
        
        results = execute_query(query, (questao_id,))
        if results and results[0].get('opcoes'):
            # opcoes está em formato JSONB
            return results[0]['opcoes']
        return []
    
    @staticmethod
    def criar(texto_questao, tipo_questao, status='Ativo', opcoes=None):
        """Cria uma nova questão"""
        # Criar a questão base
        query = """
            INSERT INTO Questao (tipo_questao, texto_questao, status)
            VALUES (%s, %s, %s)
            RETURNING cod_questao, tipo_questao, texto_questao, status
        """
        
        resultado = execute_query(query, (tipo_questao, texto_questao, status))
        
        if resultado and opcoes and tipo_questao == 'Múltipla Escolha':
            # Inserir opções para múltipla escolha
            cod_questao = resultado[0]['cod_questao']
            PerguntasModel.criar_opcoes_multipla_escolha(cod_questao, opcoes)
        elif resultado and tipo_questao == 'Texto Livre':
            # Inserir na tabela de texto livre
            cod_questao = resultado[0]['cod_questao']
            PerguntasModel.criar_questao_texto_livre(cod_questao)
        
        return resultado
    
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
        
        return execute_query(query, (questao_cod, opcoes_json))
    
    @staticmethod
    def criar_questao_texto_livre(questao_cod):
        """Cria registro de questão de texto livre"""
        query = """
            INSERT INTO Questao_Texto_Livre (questao_cod)
            VALUES (%s)
            RETURNING questao_cod
        """
        
        return execute_query(query, (questao_cod,))
    
    @staticmethod
    def atualizar(questao_id, texto_questao=None, tipo_questao=None, status=None):
        """Atualiza uma questão"""
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
        
        return execute_query(query, tuple(params))
    
    @staticmethod
    def atualizar_opcoes_multipla_escolha(questao_cod, opcoes):
        """Atualiza as opções de uma questão de múltipla escolha"""
        import json
        
        if isinstance(opcoes, list):
            opcoes_json = json.dumps(opcoes)
        else:
            opcoes_json = opcoes
        
        query = """
            UPDATE Questao_Multipla_Escolha
            SET opcoes = %s::jsonb
            WHERE questao_cod = %s
            RETURNING questao_cod
        """
        
        return execute_query(query, (opcoes_json, questao_cod))
    
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
