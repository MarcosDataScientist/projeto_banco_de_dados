"""
Controller para Funcionários
"""
from flask import jsonify, request

from backend.models.funcionarios import FuncionariosModel
from backend.models.avaliacoes import AvaliacoesModel


class FuncionariosController:
    """Controller para gerenciar rotas de Funcionários"""
    
    @staticmethod
    def listar():
        """Lista todos os funcionários com paginação"""
        try:
            status = request.args.get('status')
            departamento = request.args.get('departamento')
            busca = request.args.get('q')
            
            print(f"[DEBUG] Parâmetros recebidos - status: {status}, departamento: {departamento}, busca: {busca}")
            
            # Parâmetros de paginação
            page = request.args.get('page', 1, type=int)
            per_page = request.args.get('per_page', 20, type=int)
            
            # Validar parâmetros
            if page < 1:
                page = 1
            if per_page < 1:
                per_page = 20
            elif per_page > 10000:
                per_page = 10000
            
            # Buscar funcionários com paginação
            funcionarios, total = FuncionariosModel.listar_com_paginacao(
                filtro_status=status, 
                filtro_setor=departamento,
                filtro_busca=busca,
                page=page, 
                per_page=per_page
            )
            
            print(f"[DEBUG] Resultados encontrados: {len(funcionarios)} funcionários de {total} total")
            
            # Calcular informações de paginação
            total_pages = (total + per_page - 1) // per_page
            has_prev = page > 1
            has_next = page < total_pages
            
            return jsonify({
                'funcionarios': funcionarios,
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
    def get_total():
        """Retorna o total geral de funcionários no sistema"""
        try:
            total = FuncionariosModel.contar_total_geral()
            return jsonify({'total': total}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def get_estatisticas():
        """Retorna estatísticas gerais: total geral, total ativo e total em processo"""
        try:
            estatisticas = FuncionariosModel.contar_estatisticas_gerais()
            return jsonify(estatisticas), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def buscar_por_id(funcionario_id):
        """Busca um funcionário específico por CPF"""
        try:
            funcionario = FuncionariosModel.buscar_por_cpf(funcionario_id)
            if not funcionario:
                return jsonify({'error': 'Funcionário não encontrado'}), 404
            
            return jsonify(funcionario), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def criar():
        """Cria um novo funcionário"""
        try:
            data = request.get_json()
            
            # Validações
            campos_obrigatorios = ['nome', 'cpf', 'email']
            for campo in campos_obrigatorios:
                if not data.get(campo):
                    return jsonify({'error': f'{campo} é obrigatório'}), 400
            
            funcionario = FuncionariosModel.criar(
                data['nome'],
                data['cpf'],
                data['email'],
                setor=data.get('setor'),
                ctps=data.get('ctps'),
                tipo=data.get('tipo', 'CLT'),
                status=data.get('status', 'Ativo')
            )
            
            return jsonify(funcionario[0]), 201
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def atualizar(funcionario_id):
        """Atualiza um funcionário por CPF"""
        try:
            data = request.get_json()
            
            # Remover CPF dos dados se estiver presente (para evitar conflito)
            if 'cpf' in data:
                del data['cpf']
            
            funcionario = FuncionariosModel.atualizar(funcionario_id, **data)
            
            if not funcionario:
                return jsonify({'error': 'Nenhum campo para atualizar'}), 400
            
            return jsonify(funcionario[0]), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def deletar(funcionario_id):
        """Deleta um funcionário por CPF"""
        try:
            # Verificar se o funcionário tem avaliações
            avaliacoes = AvaliacoesModel.buscar_por_avaliador(funcionario_id)
            
            if avaliacoes:
                return jsonify({
                    'error': 'Não é possível excluir este funcionário pois ele possui avaliações associadas',
                    'avaliacoes_count': len(avaliacoes)
                }), 400
            
            linhas = FuncionariosModel.deletar(funcionario_id)
            if linhas == 0:
                return jsonify({'error': 'Funcionário não encontrado'}), 404
            
            return jsonify({'message': 'Funcionário deletado com sucesso'}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def listar_departamentos():
        """Lista todos os departamentos"""
        try:
            departamentos = FuncionariosModel.listar_departamentos()
            return jsonify(departamentos), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

