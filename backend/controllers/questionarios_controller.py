"""
Controller para Questionários
"""
from flask import jsonify, request

from backend.models.questionarios import QuestionariosModel


class QuestionariosController:
    """Controller para gerenciar rotas de Questionários"""
    
    @staticmethod
    def listar():
        """Lista todos os questionários"""
        try:
            questionarios = QuestionariosModel.listar_todos()
            return jsonify(questionarios), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def buscar_por_id(questionario_id):
        """Busca um questionário específico"""
        try:
            questionario = QuestionariosModel.buscar_por_id(questionario_id)
            if not questionario:
                return jsonify({'error': 'Questionário não encontrado'}), 404
            
            # Buscar perguntas do questionário
            perguntas = QuestionariosModel.buscar_perguntas(questionario_id)
            questionario['perguntas'] = perguntas
            
            return jsonify(questionario), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def criar():
        """Cria um novo questionário"""
        try:
            data = request.get_json()
            
            # Validações
            if not data.get('nome'):
                return jsonify({'error': 'nome é obrigatório'}), 400
            if not data.get('classificacao_cod'):
                return jsonify({'error': 'classificacao_cod é obrigatório'}), 400
            
            questionario = QuestionariosModel.criar(
                data['nome'],
                data['classificacao_cod'],
                data.get('descricao'),
                data.get('status', 'Rascunho')
            )
            
            # Vincular perguntas se fornecidas
            if data.get('questoes_ids'):
                QuestionariosModel.vincular_perguntas(
                    questionario[0]['id'],
                    data['questoes_ids']
                )
            
            return jsonify(questionario[0]), 201
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def atualizar(questionario_id):
        """Atualiza um questionário"""
        try:
            data = request.get_json()
            
            questionario = QuestionariosModel.atualizar(
                questionario_id,
                data.get('nome'),
                data.get('descricao'),
                data.get('status'),
                data.get('classificacao_cod')
            )
            
            # Atualizar perguntas vinculadas se fornecidas
            if 'questoes_ids' in data:
                QuestionariosModel.vincular_perguntas(
                    questionario_id,
                    data['questoes_ids']
                )
            
            if not questionario:
                return jsonify({'error': 'Nenhum campo para atualizar'}), 400
            
            return jsonify(questionario[0]), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def deletar(questionario_id):
        """
        Deleta um questionário APENAS se não estiver associado a avaliações.
        Se houver avaliações associadas, retorna erro informativo.
        """
        try:
            resultado = QuestionariosModel.deletar_com_cascata(questionario_id)
            
            if resultado['sucesso']:
                return jsonify({
                    'message': 'Questionário deletado com sucesso',
                    'detalhes': resultado
                }), 200
            else:
                # Se não foi bem-sucedido, verificar o motivo
                error_message = resultado.get('mensagem', 'Erro ao deletar questionário')
                if 'avaliação' in error_message.lower() or 'avaliacoes' in error_message.lower():
                    return jsonify({'error': error_message}), 400
                else:
                    return jsonify({'error': error_message}), 404
                
        except Exception as e:
            error_msg = str(e)
            # Verificar se o erro é de constraint RESTRICT
            if 'restrict' in error_msg.lower() or 'violates foreign key constraint' in error_msg.lower():
                return jsonify({
                    'error': 'Não é possível excluir este questionário. Ele está sendo usado em avaliações.'
                }), 400
            return jsonify({'error': error_msg}), 500
    
    @staticmethod
    def listar_classificacoes():
        """Lista todas as classificações"""
        try:
            classificacoes = QuestionariosModel.listar_classificacoes()
            return jsonify(classificacoes), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

