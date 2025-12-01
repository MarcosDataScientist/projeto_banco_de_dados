"""
Controller para Avaliações
"""
from flask import jsonify, request

from backend.models.avaliacoes import AvaliacoesModel


class AvaliacoesController:
    """Controller para gerenciar rotas de Avaliações"""
    
    @staticmethod
    def listar():
        """Lista todas as avaliações"""
        try:
            status = request.args.get('status')
            funcionario = request.args.get('funcionario', type=int)
            
            avaliacoes = AvaliacoesModel.listar_todas(status, funcionario)
            return jsonify(avaliacoes), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def buscar_por_id(avaliacao_id):
        """Busca uma avaliação específica"""
        try:
            avaliacao = AvaliacoesModel.buscar_por_id(avaliacao_id)
            if not avaliacao:
                return jsonify({'error': 'Avaliação não encontrada'}), 404
            
            # Buscar respostas
            respostas = AvaliacoesModel.buscar_respostas(avaliacao_id)
            avaliacao['respostas'] = respostas
            
            return jsonify(avaliacao), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def deletar(avaliacao_id):
        """Deleta uma avaliação"""
        try:
            # Verificar se a avaliação existe
            avaliacao = AvaliacoesModel.buscar_por_id(avaliacao_id)
            if not avaliacao:
                return jsonify({'error': 'Avaliação não encontrada'}), 404
            
            # Deletar avaliação (as respostas serão deletadas em cascata)
            linhas = AvaliacoesModel.deletar(avaliacao_id)
            if linhas == 0:
                return jsonify({'error': 'Avaliação não encontrada'}), 404
            
            return jsonify({'message': 'Avaliação deletada com sucesso'}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def criar():
        """Cria uma nova avaliação (Modelo 2: usa observacao_geral e rating_geral)"""
        try:
            data = request.get_json()
            
            # Validações
            if not data.get('avaliado_cpf'):
                return jsonify({'error': 'avaliado_cpf é obrigatório'}), 400
            if not data.get('questionario_cod'):
                return jsonify({'error': 'questionario_cod é obrigatório'}), 400
            if not data.get('avaliador_cpf'):
                return jsonify({'error': 'avaliador_cpf é obrigatório'}), 400
            
            # Compatibilidade: aceita 'descricao' ou 'observacao_geral'
            observacao_geral = data.get('observacao_geral') or data.get('descricao')
            rating_geral = data.get('rating_geral') or data.get('rating')
            
            avaliacao = AvaliacoesModel.criar(
                data['avaliado_cpf'],
                data['avaliador_cpf'],
                data['questionario_cod'],
                data.get('local'),
                observacao_geral,
                rating_geral
            )
            
            return jsonify(avaliacao[0]), 201
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def atualizar_status(avaliacao_id):
        """Atualiza status de uma avaliação (rating_geral e observacao_geral)"""
        try:
            data = request.get_json()
            
            # Compatibilidade: aceita 'rating' ou 'rating_geral', 'descricao' ou 'observacao_geral'
            rating_geral = data.get('rating_geral') or data.get('rating')
            observacao_geral = data.get('observacao_geral') or data.get('descricao')
            
            avaliacao = AvaliacoesModel.atualizar_status(
                avaliacao_id,
                rating_geral,
                observacao_geral
            )
            
            if not avaliacao:
                return jsonify({'error': 'Nenhum campo para atualizar'}), 400
            
            return jsonify(avaliacao[0]), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def atualizar(avaliacao_id):
        """Atualiza as configurações de uma avaliação (funcionário, avaliador, questionário, local, observacao_geral)"""
        try:
            data = request.get_json()
            
            # Validações
            if data.get('avaliado_cpf') and data.get('avaliador_cpf') and data.get('avaliado_cpf') == data.get('avaliador_cpf'):
                return jsonify({'error': 'O avaliador não pode ser o mesmo funcionário a ser avaliado'}), 400
            
            # Compatibilidade: aceita 'descricao' ou 'observacao_geral'
            observacao_geral = data.get('observacao_geral') or data.get('descricao')
            
            avaliacao = AvaliacoesModel.atualizar_configuracoes(
                avaliacao_id,
                data.get('avaliado_cpf'),
                data.get('avaliador_cpf'),
                data.get('questionario_cod'),
                data.get('local'),
                observacao_geral
            )
            
            if not avaliacao:
                return jsonify({'error': 'Nenhum campo para atualizar'}), 400
            
            return jsonify(avaliacao[0]), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def salvar_resposta():
        """Salva uma resposta de avaliação (Modelo 2: usa apenas opcao_cod)"""
        try:
            data = request.get_json()
            
            # Validações
            if not data.get('avaliacao_cod'):
                return jsonify({'error': 'avaliacao_cod é obrigatório'}), 400
            if not data.get('questao_cod'):
                return jsonify({'error': 'questao_cod é obrigatório'}), 400
            if not data.get('opcao_cod'):
                return jsonify({'error': 'opcao_cod é obrigatório'}), 400
            
            resposta = AvaliacoesModel.salvar_resposta(
                data['avaliacao_cod'],
                data['questao_cod'],
                data['opcao_cod']
            )
            
            if resposta:
                return jsonify(resposta[0]), 201
            else:
                return jsonify({'error': 'Erro ao salvar resposta'}), 500
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def get_grafico_respostas_avaliacao(avaliacao_id):
        """Retorna dados para gráfico de respostas de uma avaliação (agrupado por pergunta e alternativa)"""
        try:
            dados = AvaliacoesModel.buscar_respostas_agrupadas_grafico(avaliacao_id)
            return jsonify(dados), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def get_grafico_respostas_questionario(questionario_id):
        """Retorna dados para gráfico de respostas de um questionário (agrupado por pergunta e alternativa)"""
        try:
            dados = AvaliacoesModel.buscar_respostas_agrupadas_grafico_por_questionario(questionario_id)
            print(f"[DEBUG] Buscando gráfico para questionário {questionario_id}")
            print(f"[DEBUG] Total de registros retornados: {len(dados) if dados else 0}")
            return jsonify(dados), 200
        except Exception as e:
            print(f"[ERROR] Erro ao buscar gráfico de respostas: {str(e)}")
            import traceback
            traceback.print_exc()
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def get_respostas_questao(questao_id):
        """Retorna respostas agrupadas por alternativa para uma questão específica"""
        try:
            dados = AvaliacoesModel.buscar_respostas_agrupadas_por_questao(questao_id)
            return jsonify(dados), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

