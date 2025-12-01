from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Importar configuração do banco
from backend.config.database import Database

# Importar controllers
from backend.controllers import (
    DashboardController,
    PerguntasController,
    FuncionariosController,
    AvaliacoesController,
    QuestionariosController,
    AvaliadoresController,
    AdminController
)

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
# CONSTANTES DE ROTAS
# ==========================================

API_PREFIX = '/api'
DASHBOARD_PREFIX = f'{API_PREFIX}/dashboard'
PERGUNTAS_PREFIX = f'{API_PREFIX}/perguntas'
FUNCIONARIOS_PREFIX = f'{API_PREFIX}/funcionarios'
AVALIACOES_PREFIX = f'{API_PREFIX}/avaliacoes'
QUESTIONARIOS_PREFIX = f'{API_PREFIX}/questionarios'
AVALIADORES_PREFIX = f'{API_PREFIX}/avaliadores'
ADMIN_PREFIX = f'{API_PREFIX}/admin'

# ==========================================
# ROTAS API - DASHBOARD
# ==========================================

app.route(f'{DASHBOARD_PREFIX}/estatisticas', methods=['GET'], endpoint='dashboard_estatisticas')(DashboardController.get_estatisticas_gerais)
app.route(f'{DASHBOARD_PREFIX}/avaliacoes-mes', methods=['GET'], endpoint='dashboard_avaliacoes_mes')(DashboardController.get_avaliacoes_mes)
app.route(f'{DASHBOARD_PREFIX}/motivos-saida', methods=['GET'], endpoint='dashboard_motivos_saida')(DashboardController.get_motivos_saida)
app.route(f'{DASHBOARD_PREFIX}/status-avaliacoes', methods=['GET'], endpoint='dashboard_status_avaliacoes')(DashboardController.get_status_avaliacoes)
app.route(f'{DASHBOARD_PREFIX}/atividades-recentes', methods=['GET'], endpoint='dashboard_atividades_recentes')(DashboardController.get_atividades_recentes)
app.route(f'{DASHBOARD_PREFIX}/questionarios-usados', methods=['GET'], endpoint='dashboard_questionarios_usados')(DashboardController.get_questionarios_usados)
app.route(f'{DASHBOARD_PREFIX}/avaliacoes-por-questionario', methods=['GET'], endpoint='dashboard_avaliacoes_por_questionario')(DashboardController.get_avaliacoes_por_questionario)
app.route(f'{DASHBOARD_PREFIX}/respostas-frequencia', methods=['GET'], endpoint='dashboard_respostas_frequencia')(DashboardController.get_respostas_frequencia)
app.route(f'{DASHBOARD_PREFIX}/avaliacoes-tempo', methods=['GET'], endpoint='dashboard_avaliacoes_tempo')(DashboardController.get_avaliacoes_tempo)
app.route(f'{DASHBOARD_PREFIX}/avaliacoes-setor', methods=['GET'], endpoint='dashboard_avaliacoes_setor')(DashboardController.get_avaliacoes_setor)
app.route(f'{DASHBOARD_PREFIX}/avaliadores-por-setor', methods=['GET'], endpoint='dashboard_avaliadores_por_setor')(DashboardController.get_avaliadores_por_setor)
app.route(f'{DASHBOARD_PREFIX}/pontos-por-data', methods=['GET'], endpoint='dashboard_pontos_por_data')(DashboardController.get_pontos_por_data)

# ==========================================
# ROTAS API - PERGUNTAS
# ==========================================

app.route(f'{PERGUNTAS_PREFIX}', methods=['GET'], endpoint='perguntas_listar')(PerguntasController.listar)
app.route(f'{PERGUNTAS_PREFIX}/<int:pergunta_id>', methods=['GET'], endpoint='perguntas_buscar_por_id')(PerguntasController.buscar_por_id)
app.route(f'{PERGUNTAS_PREFIX}', methods=['POST'], endpoint='perguntas_criar')(PerguntasController.criar)
app.route(f'{PERGUNTAS_PREFIX}/<int:pergunta_id>', methods=['PUT'], endpoint='perguntas_atualizar')(PerguntasController.atualizar)
app.route(f'{PERGUNTAS_PREFIX}/<int:pergunta_id>', methods=['DELETE'], endpoint='perguntas_deletar')(PerguntasController.deletar)
app.route(f'{API_PREFIX}/categorias', methods=['GET'], endpoint='perguntas_listar_categorias')(PerguntasController.listar_categorias)

# ==========================================
# ROTAS API - FUNCIONÁRIOS
# ==========================================

app.route(f'{FUNCIONARIOS_PREFIX}', methods=['GET'], endpoint='funcionarios_listar')(FuncionariosController.listar)
app.route(f'{FUNCIONARIOS_PREFIX}/total', methods=['GET'], endpoint='funcionarios_get_total')(FuncionariosController.get_total)
app.route(f'{FUNCIONARIOS_PREFIX}/estatisticas', methods=['GET'], endpoint='funcionarios_get_estatisticas')(FuncionariosController.get_estatisticas)
app.route(f'{FUNCIONARIOS_PREFIX}/<funcionario_id>', methods=['GET'], endpoint='funcionarios_buscar_por_id')(FuncionariosController.buscar_por_id)
app.route(f'{FUNCIONARIOS_PREFIX}', methods=['POST'], endpoint='funcionarios_criar')(FuncionariosController.criar)
app.route(f'{FUNCIONARIOS_PREFIX}/<funcionario_id>', methods=['PUT'], endpoint='funcionarios_atualizar')(FuncionariosController.atualizar)
app.route(f'{FUNCIONARIOS_PREFIX}/<funcionario_id>', methods=['DELETE'], endpoint='funcionarios_deletar')(FuncionariosController.deletar)
app.route(f'{API_PREFIX}/departamentos', methods=['GET'], endpoint='funcionarios_listar_departamentos')(FuncionariosController.listar_departamentos)

# ==========================================
# ROTAS API - AVALIAÇÕES
# ==========================================

app.route(f'{AVALIACOES_PREFIX}', methods=['GET'], endpoint='avaliacoes_listar')(AvaliacoesController.listar)
app.route(f'{AVALIACOES_PREFIX}/<int:avaliacao_id>', methods=['GET'], endpoint='avaliacoes_buscar_por_id')(AvaliacoesController.buscar_por_id)
app.route(f'{AVALIACOES_PREFIX}/<int:avaliacao_id>', methods=['DELETE'], endpoint='avaliacoes_deletar')(AvaliacoesController.deletar)
app.route(f'{AVALIACOES_PREFIX}', methods=['POST'], endpoint='avaliacoes_criar')(AvaliacoesController.criar)
app.route(f'{AVALIACOES_PREFIX}/<int:avaliacao_id>/status', methods=['PUT'], endpoint='avaliacoes_atualizar_status')(AvaliacoesController.atualizar_status)
app.route(f'{AVALIACOES_PREFIX}/<int:avaliacao_id>', methods=['PUT'], endpoint='avaliacoes_atualizar')(AvaliacoesController.atualizar)
app.route(f'{AVALIACOES_PREFIX}/respostas', methods=['POST'], endpoint='avaliacoes_salvar_resposta')(AvaliacoesController.salvar_resposta)
app.route(f'{AVALIACOES_PREFIX}/<int:avaliacao_id>/grafico-respostas', methods=['GET'], endpoint='avaliacoes_grafico_respostas')(AvaliacoesController.get_grafico_respostas_avaliacao)
app.route(f'{QUESTIONARIOS_PREFIX}/<int:questionario_id>/grafico-respostas', methods=['GET'], endpoint='questionarios_grafico_respostas')(AvaliacoesController.get_grafico_respostas_questionario)
app.route(f'{API_PREFIX}/questoes/<int:questao_id>/respostas', methods=['GET'], endpoint='questoes_respostas')(AvaliacoesController.get_respostas_questao)

# ==========================================
# ROTAS API - QUESTIONÁRIOS (FORMULÁRIOS)
# ==========================================

app.route(f'{QUESTIONARIOS_PREFIX}', methods=['GET'], endpoint='questionarios_listar')(QuestionariosController.listar)
app.route(f'{QUESTIONARIOS_PREFIX}/<int:questionario_id>', methods=['GET'], endpoint='questionarios_buscar_por_id')(QuestionariosController.buscar_por_id)
app.route(f'{QUESTIONARIOS_PREFIX}', methods=['POST'], endpoint='questionarios_criar')(QuestionariosController.criar)
app.route(f'{QUESTIONARIOS_PREFIX}/<int:questionario_id>', methods=['PUT'], endpoint='questionarios_atualizar')(QuestionariosController.atualizar)
app.route(f'{QUESTIONARIOS_PREFIX}/<int:questionario_id>', methods=['DELETE'], endpoint='questionarios_deletar')(QuestionariosController.deletar)
app.route(f'{API_PREFIX}/classificacoes', methods=['GET'], endpoint='questionarios_listar_classificacoes')(QuestionariosController.listar_classificacoes)

# ==========================================
# ROTAS API - AVALIADORES
# ==========================================

app.route(f'{AVALIADORES_PREFIX}', methods=['GET'], endpoint='avaliadores_listar')(AvaliadoresController.listar)
app.route(f'{AVALIADORES_PREFIX}/<cpf>', methods=['GET'], endpoint='avaliadores_buscar_por_cpf')(AvaliadoresController.buscar_por_cpf)
app.route(f'{AVALIADORES_PREFIX}/<cpf>/certificados', methods=['GET'], endpoint='avaliadores_listar_certificados')(AvaliadoresController.listar_certificados)
app.route(f'{API_PREFIX}/treinamentos', methods=['GET'], endpoint='avaliadores_listar_treinamentos')(AvaliadoresController.listar_treinamentos)
app.route(f'{API_PREFIX}/funcionario-treinamento', methods=['POST'], endpoint='avaliadores_criar_vinculo')(AvaliadoresController.criar_vinculo_funcionario_treinamento)
app.route(f'{API_PREFIX}/funcionario-treinamento', methods=['PUT'], endpoint='avaliadores_atualizar_vinculo')(AvaliadoresController.atualizar_vinculo_funcionario_treinamento)
app.route(f'{API_PREFIX}/funcionario-treinamento', methods=['DELETE'], endpoint='avaliadores_deletar_vinculo')(AvaliadoresController.deletar_vinculo_funcionario_treinamento)

# ==========================================
# ROTAS API - ADMINISTRAÇÃO
# ==========================================

app.route(f'{ADMIN_PREFIX}/limpar-banco', methods=['DELETE'], endpoint='admin_limpar_banco')(AdminController.limpar_banco_dados)

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

# ==========================================
# EXECUÇÃO
# ==========================================

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    print("=" * 50)
    print("Sistema de Avaliação de Desligamento")
    print("=" * 50)
    print(f"Servidor rodando em: http://localhost:{port}")
    print(f"Dashboard: http://localhost:{port}/dashboard")
    print(f"API: http://localhost:{port}/api/")
    print("=" * 50)
    
    try:
        host = os.getenv('FLASK_HOST', '0.0.0.0')
        app.run(host=host, port=port, debug=debug)
    finally:
        Database.close_all_connections()
