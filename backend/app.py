from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Importar configuração do banco
from backend.config.database import Database

# Importar models
from backend.models.perguntas import PerguntasModel
from backend.models.funcionarios import FuncionariosModel
from backend.models.avaliacoes import AvaliacoesModel
from backend.models.dashboard import DashboardModel

# Carregar variáveis de ambiente
load_dotenv()

# Inicializar Flask
app = Flask(__name__, static_folder='../static/dist', static_url_path='')
CORS(app)

# Inicializar pool de conexões ao iniciar o app
try:
    Database.initialize_pool()
except Exception as e:
    print(f"[AVISO] Não foi possível conectar ao banco de dados: {e}")
    print("[AVISO] O servidor irá iniciar, mas as rotas da API não funcionarão.")

# ==========================================
# ROTAS API - DASHBOARD
# ==========================================

@app.route('/api/dashboard/estatisticas', methods=['GET'])
def get_estatisticas_gerais():
    """Retorna estatísticas gerais do dashboard"""
    try:
        stats = DashboardModel.estatisticas_gerais()
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/dashboard/avaliacoes-mes', methods=['GET'])
def get_avaliacoes_mes():
    """Retorna avaliações por mês"""
    try:
        meses = request.args.get('meses', 6, type=int)
        data = DashboardModel.avaliacoes_por_mes(meses)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/dashboard/motivos-saida', methods=['GET'])
def get_motivos_saida():
    """Retorna principais motivos de saída"""
    try:
        data = DashboardModel.motivos_saida_principais()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/dashboard/status-avaliacoes', methods=['GET'])
def get_status_avaliacoes():
    """Retorna distribuição de status das avaliações"""
    try:
        data = DashboardModel.status_avaliacoes()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/dashboard/atividades-recentes', methods=['GET'])
def get_atividades_recentes():
    """Retorna atividades recentes"""
    try:
        limite = request.args.get('limite', 10, type=int)
        data = DashboardModel.atividades_recentes(limite)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==========================================
# ROTAS API - PERGUNTAS
# ==========================================

@app.route('/api/perguntas', methods=['GET'])
def get_perguntas():
    """Lista todas as perguntas"""
    try:
        categoria = request.args.get('categoria', type=int)
        ativa = request.args.get('ativa', type=lambda v: v.lower() == 'true')
        
        perguntas = PerguntasModel.listar_todas(categoria, ativa)
        return jsonify(perguntas), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/perguntas/<int:pergunta_id>', methods=['GET'])
def get_pergunta(pergunta_id):
    """Busca uma pergunta específica"""
    try:
        pergunta = PerguntasModel.buscar_por_id(pergunta_id)
        if not pergunta:
            return jsonify({'error': 'Pergunta não encontrada'}), 404
        
        # Já vem com opções do model se for múltipla escolha
        return jsonify(pergunta), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/perguntas', methods=['POST'])
def criar_pergunta():
    """Cria uma nova pergunta"""
    try:
        data = request.get_json()
        
        # Validações básicas
        if not data.get('texto'):
            return jsonify({'error': 'Texto da pergunta é obrigatório'}), 400
        if not data.get('tipo'):
            return jsonify({'error': 'Tipo da pergunta é obrigatório'}), 400
        
        pergunta = PerguntasModel.criar(
            data['texto'],
            data.get('categoria_id'),
            data['tipo'],
            data.get('ativa', True)
        )
        
        return jsonify(pergunta[0]), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/perguntas/<int:pergunta_id>', methods=['PUT'])
def atualizar_pergunta(pergunta_id):
    """Atualiza uma pergunta"""
    try:
        data = request.get_json()
        
        # Compatibilidade com campos antigos e novos
        texto_questao = data.get('texto_questao') or data.get('texto')
        tipo_questao = data.get('tipo_questao') or data.get('tipo')
        status = data.get('status')
        
        # Se não tem status mas tem 'ativa', converter
        if status is None and 'ativa' in data:
            status = 'Ativo' if data.get('ativa') else 'Inativo'
        
        pergunta = PerguntasModel.atualizar(
            pergunta_id,
            texto_questao,
            tipo_questao,
            status
        )
        
        if not pergunta:
            return jsonify({'error': 'Nenhum campo para atualizar'}), 400
        
        # Se for múltipla escolha e tiver opções, atualizar
        if tipo_questao == 'Múltipla Escolha' and 'opcoes' in data:
            PerguntasModel.atualizar_opcoes_multipla_escolha(pergunta_id, data['opcoes'])
        
        return jsonify(pergunta[0]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/perguntas/<int:pergunta_id>', methods=['DELETE'])
def deletar_pergunta(pergunta_id):
    """Deleta uma pergunta"""
    try:
        linhas = PerguntasModel.deletar(pergunta_id)
        if linhas == 0:
            return jsonify({'error': 'Pergunta não encontrada'}), 404
        
        return jsonify({'message': 'Pergunta deletada com sucesso'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/categorias', methods=['GET'])
def get_categorias():
    """Lista todas as categorias"""
    try:
        categorias = PerguntasModel.listar_categorias()
        return jsonify(categorias), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==========================================
# ROTAS API - FUNCIONÁRIOS
# ==========================================

@app.route('/api/funcionarios', methods=['GET'])
def get_funcionarios():
    """Lista todos os funcionários"""
    try:
        status = request.args.get('status')
        departamento = request.args.get('departamento', type=int)
        
        funcionarios = FuncionariosModel.listar_todos(status, departamento)
        return jsonify(funcionarios), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/funcionarios/<funcionario_id>', methods=['GET'])
def get_funcionario(funcionario_id):
    """Busca um funcionário específico por CPF"""
    try:
        funcionario = FuncionariosModel.buscar_por_cpf(funcionario_id)
        if not funcionario:
            return jsonify({'error': 'Funcionário não encontrado'}), 404
        
        return jsonify(funcionario), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/funcionarios', methods=['POST'])
def criar_funcionario():
    """Cria um novo funcionário"""
    try:
        data = request.get_json()
        
        # Validações
        campos_obrigatorios = ['nome', 'cpf', 'email', 'departamento_id', 'cargo']
        for campo in campos_obrigatorios:
            if not data.get(campo):
                return jsonify({'error': f'{campo} é obrigatório'}), 400
        
        funcionario = FuncionariosModel.criar(
            data['nome'],
            data['cpf'],
            data['email'],
            data.get('setor', data.get('departamento_id')),  # Compatibilidade
            data.get('ctps'),
            data.get('tipo', data.get('cargo')),  # Compatibilidade
            data.get('status', 'Ativo')
        )
        
        return jsonify(funcionario[0]), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/funcionarios/<funcionario_id>', methods=['PUT'])
def atualizar_funcionario(funcionario_id):
    """Atualiza um funcionário por CPF"""
    try:
        data = request.get_json()
        
        funcionario = FuncionariosModel.atualizar(funcionario_id, **data)
        
        if not funcionario:
            return jsonify({'error': 'Nenhum campo para atualizar'}), 400
        
        return jsonify(funcionario[0]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/funcionarios/<funcionario_id>', methods=['DELETE'])
def deletar_funcionario(funcionario_id):
    """Deleta um funcionário por CPF"""
    try:
        linhas = FuncionariosModel.deletar(funcionario_id)
        if linhas == 0:
            return jsonify({'error': 'Funcionário não encontrado'}), 404
        
        return jsonify({'message': 'Funcionário deletado com sucesso'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/departamentos', methods=['GET'])
def get_departamentos():
    """Lista todos os departamentos"""
    try:
        departamentos = FuncionariosModel.listar_departamentos()
        return jsonify(departamentos), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==========================================
# ROTAS API - AVALIAÇÕES
# ==========================================

@app.route('/api/avaliacoes', methods=['GET'])
def get_avaliacoes():
    """Lista todas as avaliações"""
    try:
        status = request.args.get('status')
        funcionario = request.args.get('funcionario', type=int)
        
        avaliacoes = AvaliacoesModel.listar_todas(status, funcionario)
        return jsonify(avaliacoes), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/avaliacoes/<int:avaliacao_id>', methods=['GET'])
def get_avaliacao(avaliacao_id):
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

@app.route('/api/avaliacoes', methods=['POST'])
def criar_avaliacao():
    """Cria uma nova avaliação"""
    try:
        data = request.get_json()
        
        # Validações
        if not data.get('funcionario_id'):
            return jsonify({'error': 'funcionario_id é obrigatório'}), 400
        if not data.get('formulario_id'):
            return jsonify({'error': 'formulario_id é obrigatório'}), 400
        
        avaliacao = AvaliacoesModel.criar(
            data['funcionario_id'],
            data['formulario_id'],
            data.get('avaliador_id'),
            data.get('status', 'Pendente')
        )
        
        return jsonify(avaliacao[0]), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/avaliacoes/<int:avaliacao_id>/status', methods=['PUT'])
def atualizar_status_avaliacao(avaliacao_id):
    """Atualiza status de uma avaliação"""
    try:
        data = request.get_json()
        
        if not data.get('status'):
            return jsonify({'error': 'status é obrigatório'}), 400
        
        avaliacao = AvaliacoesModel.atualizar_status(
            avaliacao_id,
            data['status'],
            data.get('data_inicio'),
            data.get('data_conclusao')
        )
        
        return jsonify(avaliacao[0]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==========================================
# ROTAS FRONTEND (devem vir por último!)
# ==========================================

@app.route('/')
def serve_frontend():
    """Serve o frontend React"""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serve arquivos estáticos do React"""
    # Primeiro verifica se não é uma rota da API
    if path.startswith('api/'):
        return jsonify({'error': 'Recurso não encontrado'}), 404
    
    file_path = os.path.join(app.static_folder, path)
    if os.path.exists(file_path):
        return send_from_directory(app.static_folder, path)
    else:
        # Para rotas do React Router, serve o index.html
        return send_from_directory(app.static_folder, 'index.html')

# ==========================================
# TRATAMENTO DE ERROS
# ==========================================

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Erro interno do servidor'}), 500

# ==========================================
# INICIALIZAÇÃO
# ==========================================

@app.before_request
def log_request():
    """Log de requisições (desenvolvimento)"""
    if app.debug:
        print(f"[REQUEST] {request.method} {request.path}")

@app.teardown_appcontext
def shutdown_session(exception=None):
    """Fecha conexões ao encerrar"""
    pass

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    print("=" * 50)
    print("Sistema de Avaliação de Desligamento")
    print("=" * 50)
    print(f"Servidor rodando em: http://localhost:{port}")
    print(f"Dashboard: http://localhost:{port}/dashboard")
    print(f"API: http://localhost:{port}/api/")
    print("=" * 50)
    
    try:
        app.run(host='0.0.0.0', port=port, debug=debug)
    finally:
        Database.close_all_connections()

