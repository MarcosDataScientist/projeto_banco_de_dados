"""
Controller para Perguntas
"""
from flask import jsonify, request

from backend.models.perguntas import PerguntasModel


class PerguntasController:
    """Controller para gerenciar rotas de Perguntas"""
    
    @staticmethod
    def listar():
        """Lista todas as perguntas com paginação (Modelo 2: apenas múltipla escolha)"""
        try:
            categoria = request.args.get('categoria', type=int)
            ativa_param = request.args.get('ativa')
            busca = request.args.get('q') or request.args.get('busca')
            
            # Converter parâmetro ativa para status
            status = None
            if ativa_param is not None:
                status = 'Ativo' if ativa_param.lower() == 'true' else 'Inativo'
            
            # Parâmetros de paginação
            page = request.args.get('page', 1, type=int)
            per_page = request.args.get('per_page', 10, type=int)
            
            # Validar parâmetros
            if page < 1:
                page = 1
            if per_page < 1:
                per_page = 10
            elif per_page > 10000:
                per_page = 10000
            
            # Buscar perguntas com paginação
            perguntas, total = PerguntasModel.listar_com_paginacao(
                filtro_tipo=None,
                filtro_status=status,
                filtro_busca=busca,
                page=page, 
                per_page=per_page
            )
            
            # Calcular informações de paginação
            total_pages = (total + per_page - 1) // per_page
            has_prev = page > 1
            has_next = page < total_pages
            
            return jsonify({
                'perguntas': perguntas,
                'pagination': {
                    'page': page,
                    'per_page': per_page,
                    'total': total,
                    'total_pages': total_pages,
                    'has_prev': has_prev,
                    'has_next': has_next,
                    'prev_page': page - 1 if has_prev else None,
                    'next_page': page + 1 if has_next else None
                }
            }), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def buscar_por_id(pergunta_id):
        """Busca uma pergunta específica"""
        try:
            pergunta = PerguntasModel.buscar_por_id(pergunta_id)
            if not pergunta:
                return jsonify({'error': 'Pergunta não encontrada'}), 404
            
            return jsonify(pergunta), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def criar():
        """Cria uma nova pergunta (Modelo 2: apenas múltipla escolha)"""
        try:
            data = request.get_json()
            print(f"[DEBUG] Dados recebidos para criar pergunta: {data}")
            
            # Validações básicas
            if not data.get('texto'):
                return jsonify({'error': 'Texto da pergunta é obrigatório'}), 400
            
            # Opções são obrigatórias (todas são múltipla escolha)
            if not data.get('opcoes'):
                return jsonify({'error': 'Opções são obrigatórias (todas as questões são múltipla escolha)'}), 400
            
            print(f"[DEBUG] Opções recebidas: {data.get('opcoes')}")
            
            pergunta = PerguntasModel.criar(
                data['texto'],
                data.get('status', 'Ativo'),
                data.get('opcoes')
            )
            
            if not pergunta or len(pergunta) == 0:
                return jsonify({'error': 'Erro ao criar pergunta'}), 500
            
            print(f"[DEBUG] Pergunta criada com sucesso: {pergunta[0]}")
            return jsonify(pergunta[0]), 201
        except Exception as e:
            print(f"[ERRO] Erro ao criar pergunta: {str(e)}")
            import traceback
            traceback.print_exc()
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def atualizar(pergunta_id):
        """Atualiza uma pergunta (Modelo 2: apenas múltipla escolha)"""
        try:
            data = request.get_json()
            print(f"[DEBUG] Dados recebidos para atualização: {data}")
            
            # Compatibilidade com campos antigos e novos
            texto_questao = data.get('texto_questao') or data.get('texto')
            status = data.get('status')
            
            print(f"[DEBUG] Campos mapeados - texto: {texto_questao}, status: {status}")
            
            # Se não tem status mas tem 'ativa', converter
            if status is None and 'ativa' in data:
                status = 'Ativo' if data.get('ativa') else 'Inativo'
            
            pergunta = PerguntasModel.atualizar(
                pergunta_id,
                texto_questao,
                status
            )
            
            if not pergunta:
                return jsonify({'error': 'Nenhum campo para atualizar'}), 400
            
            # Se tiver opções, atualizar (todas são múltipla escolha)
            if 'opcoes' in data:
                PerguntasModel.atualizar_opcoes(pergunta_id, data['opcoes'])
            
            return jsonify(pergunta[0]), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def deletar(pergunta_id):
        """Deleta uma pergunta"""
        try:
            # Verificar se a pergunta existe
            pergunta = PerguntasModel.buscar_por_id(pergunta_id)
            if not pergunta:
                return jsonify({'error': 'Pergunta não encontrada'}), 404
            
            # Verificar se está sendo usada em respostas
            total_respostas = PerguntasModel.verificar_uso_em_respostas(pergunta_id)
            if total_respostas > 0:
                return jsonify({
                    'error': f'Não é possível excluir esta pergunta. Ela está sendo usada em {total_respostas} resposta(s) de avaliação(ões).'
                }), 400
            
            # Verificar se está sendo usada em formulários
            total_formularios = PerguntasModel.verificar_uso_em_formularios(pergunta_id)
            if total_formularios > 0:
                return jsonify({
                    'error': f'Não é possível excluir esta pergunta. Ela está associada a {total_formularios} formulário(s). Remova a pergunta dos formulários antes de excluí-la.'
                }), 400
            
            # Se passou todas as validações, deletar
            linhas = PerguntasModel.deletar(pergunta_id)
            if linhas == 0:
                return jsonify({'error': 'Pergunta não encontrada'}), 404
            
            return jsonify({'message': 'Pergunta deletada com sucesso'}), 200
        except Exception as e:
            # Capturar erro de constraint do banco
            error_msg = str(e)
            if 'restrict' in error_msg.lower() or 'violates foreign key constraint' in error_msg.lower():
                return jsonify({
                    'error': 'Não é possível excluir esta pergunta. Ela está sendo usada em formulários ou respostas.'
                }), 400
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def listar_categorias():
        """Lista todas as categorias"""
        try:
            categorias = PerguntasModel.listar_categorias()
            return jsonify(categorias), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

