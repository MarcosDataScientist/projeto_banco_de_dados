"""
Controller para Administração
"""
from flask import jsonify

from backend.config.database import Database


class AdminController:
    """Controller para gerenciar rotas administrativas"""
    
    @staticmethod
    def limpar_banco_dados():
        """Exclui todos os dados do banco de dados"""
        conn = None
        try:
            conn = Database.get_connection()
            if not conn:
                return jsonify({'error': 'Não foi possível conectar ao banco de dados'}), 500
            
            cursor = conn.cursor()
            
            # Ordem de exclusão respeitando foreign keys (schema modelo 2)
            # Começamos pelas tabelas mais dependentes até chegar nas de apoio
            tabelas = [
                # Respostas de avaliações
                'Resposta',
                # Avaliações aplicadas
                'Avaliacao',
                # Relação pergunta/questionário
                'Questionario_Questao',
                # Questionários
                'Questionario',
                # Opções de múltipla escolha
                'Opcao',
                # Questões
                'Questao',
                # Relações de funcionários
                'Funcionario_Treinamento',
                'Funcionario_Classificacao',
                # Tabelas de apoio/entidades principais
                'Funcionario',
                'Treinamento',
                'Classificacao'
            ]
            
            # Desabilitar temporariamente as verificações de foreign key
            cursor.execute("SET session_replication_role = 'replica';")
            
            for tabela in tabelas:
                try:
                    # RESTART IDENTITY garante que os IDs (SERIAL) voltem a começar de 1
                    cursor.execute(f"TRUNCATE TABLE {tabela} RESTART IDENTITY CASCADE;")
                except Exception as e:
                    # Se a tabela não existir ou houver erro, continua
                    print(f"Aviso ao limpar {tabela}: {str(e)}")
            
            # Reabilitar verificações de foreign key
            cursor.execute("SET session_replication_role = 'origin';")
            
            conn.commit()
            
            return jsonify({
                'success': True,
                'message': 'Todos os dados foram excluídos com sucesso'
            }), 200
            
        except Exception as e:
            if conn:
                conn.rollback()
            return jsonify({'error': f'Erro ao limpar banco de dados: {str(e)}'}), 500
        finally:
            if conn:
                Database.return_connection(conn)

