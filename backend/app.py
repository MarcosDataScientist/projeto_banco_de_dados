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
from backend.models.questionarios import QuestionariosModel
from backend.models.avaliadores import AvaliadoresModel

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
    """Lista todas as perguntas com paginação"""
    try:
        categoria = request.args.get('categoria', type=int)
        ativa_param = request.args.get('ativa')
        
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
        if per_page < 1 or per_page > 100:
            per_page = 10
        
        # Buscar perguntas com paginação
        perguntas, total = PerguntasModel.listar_com_paginacao(
            filtro_tipo=None,  # Não filtrar por tipo por enquanto
            filtro_status=status, 
            page=page, 
            per_page=per_page
        )
        
        # Calcular informações de paginação
        total_pages = (total + per_page - 1) // per_page  # Ceiling division
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
            data['tipo'],
            data.get('status', 'Ativo'),
            data.get('opcoes')
        )
        
        return jsonify(pergunta[0]), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/perguntas/<int:pergunta_id>', methods=['PUT'])
def atualizar_pergunta(pergunta_id):
    """Atualiza uma pergunta"""
    try:
        data = request.get_json()
        print(f"[DEBUG] Dados recebidos para atualização: {data}")
        
        # Compatibilidade com campos antigos e novos
        texto_questao = data.get('texto_questao') or data.get('texto')
        tipo_questao = data.get('tipo_questao') or data.get('tipo')
        status = data.get('status')
        
        print(f"[DEBUG] Campos mapeados - texto: {texto_questao}, tipo: {tipo_questao}, status: {status}")
        
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
    """Lista todos os funcionários com paginação"""
    try:
        status = request.args.get('status')
        departamento = request.args.get('departamento')  # Agora é string (nome do setor)
        busca = request.args.get('q')
        
        # Debug: log dos parâmetros recebidos
        print(f"[DEBUG] Parâmetros recebidos - status: {status}, departamento: {departamento}, busca: {busca}")
        
        # Parâmetros de paginação
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Validar parâmetros
        if page < 1:
            page = 1
        if per_page < 1 or per_page > 100:
            per_page = 20
        
        # Buscar funcionários com paginação
        # departamento aqui é um nome de setor (string), usar filtro_setor
        funcionarios, total = FuncionariosModel.listar_com_paginacao(
            filtro_status=status, 
            filtro_setor=departamento,
            filtro_busca=busca,
            page=page, 
            per_page=per_page
        )
        
        print(f"[DEBUG] Resultados encontrados: {len(funcionarios)} funcionários de {total} total")
        
        # Calcular informações de paginação
        total_pages = (total + per_page - 1) // per_page  # Ceiling division
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

@app.route('/api/funcionarios/total', methods=['GET'])
def get_total_funcionarios():
    """Retorna o total geral de funcionários no sistema"""
    try:
        total = FuncionariosModel.contar_total_geral()
        return jsonify({'total': total}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/funcionarios/estatisticas', methods=['GET'])
def get_estatisticas_funcionarios():
    """Retorna estatísticas gerais: total geral, total ativo e total em processo"""
    try:
        estatisticas = FuncionariosModel.contar_estatisticas_gerais()
        return jsonify(estatisticas), 200
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

@app.route('/api/funcionarios/<funcionario_id>', methods=['PUT'])
def atualizar_funcionario(funcionario_id):
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

@app.route('/api/funcionarios/<funcionario_id>', methods=['DELETE'])
def deletar_funcionario(funcionario_id):
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
# ROTAS API - QUESTIONÁRIOS (FORMULÁRIOS)
# ==========================================

@app.route('/api/questionarios', methods=['GET'])
def get_questionarios():
    """Lista todos os questionários"""
    try:
        questionarios = QuestionariosModel.listar_todos()
        return jsonify(questionarios), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/questionarios/<int:questionario_id>', methods=['GET'])
def get_questionario(questionario_id):
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

@app.route('/api/questionarios', methods=['POST'])
def criar_questionario():
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
            data.get('tipo'),
            data['classificacao_cod'],
            data.get('status', 'Ativo')
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

@app.route('/api/questionarios/<int:questionario_id>', methods=['PUT'])
def atualizar_questionario(questionario_id):
    """Atualiza um questionário"""
    try:
        data = request.get_json()
        
        questionario = QuestionariosModel.atualizar(
            questionario_id,
            data.get('nome'),
            data.get('tipo'),
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

@app.route('/api/questionarios/<int:questionario_id>', methods=['DELETE'])
def deletar_questionario(questionario_id):
    """
    Deleta um questionário e todos os dados relacionados em cascata:
    1. Respostas das avaliações que usaram o questionário
    2. Avaliações que usaram o questionário
    3. Vínculos com perguntas (Questionario_Questao)
    4. O questionário em si
    """
    try:
        resultado = QuestionariosModel.deletar_com_cascata(questionario_id)
        
        if resultado['sucesso']:
            return jsonify({
                'message': 'Questionário deletado com sucesso',
                'detalhes': resultado
            }), 200
        else:
            return jsonify({'error': 'Questionário não encontrado'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/classificacoes', methods=['GET'])
def get_classificacoes():
    """Lista todas as classificações"""
    try:
        classificacoes = QuestionariosModel.listar_classificacoes()
        return jsonify(classificacoes), 200
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
# ROTAS DE AVALIADORES
# ==========================================

@app.route('/api/avaliadores', methods=['GET'])
def get_avaliadores():
    """Lista todos os avaliadores (funcionários com certificados)"""
    try:
        avaliadores = AvaliadoresModel.listar_avaliadores()
        return jsonify(avaliadores), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/avaliadores/<cpf>', methods=['GET'])
def get_avaliador(cpf):
    """Busca um avaliador específico por CPF"""
    try:
        avaliador = AvaliadoresModel.buscar_avaliador_por_cpf(cpf)
        if avaliador:
            return jsonify(avaliador), 200
        else:
            return jsonify({'error': 'Avaliador não encontrado'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/avaliadores/<cpf>/certificados', methods=['GET'])
def get_certificados_avaliador(cpf):
    """Lista todos os certificados de um avaliador"""
    try:
        certificados = AvaliadoresModel.listar_certificados_avaliador(cpf)
        return jsonify(certificados), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/treinamentos', methods=['GET'])
def get_treinamentos():
    """Lista todos os treinamentos disponíveis"""
    try:
        conn = Database.get_connection()
        if not conn:
            raise Exception("Não foi possível conectar ao banco de dados")
        
        with conn.cursor() as cursor:
            cursor.execute("SELECT cod_treinamento, nome, data_realizacao, validade, local FROM Treinamento ORDER BY nome")
            treinamentos = []
            for row in cursor.fetchall():
                treinamentos.append({
                    'cod_treinamento': row[0],
                    'nome': row[1],
                    'data_realizacao': row[2].isoformat() if row[2] else None,
                    'validade': row[3].isoformat() if row[3] else None,
                    'local': row[4]
                })
            return jsonify(treinamentos), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if 'conn' in locals():
            Database.return_connection(conn)

@app.route('/api/funcionario-treinamento', methods=['POST'])
def criar_vinculo_funcionario_treinamento():
    """Cria vínculo entre funcionário e treinamento"""
    try:
        dados = request.get_json()
        conn = Database.get_connection()
        if not conn:
            raise Exception("Não foi possível conectar ao banco de dados")
        
        with conn.cursor() as cursor:
            cursor.execute("""
                INSERT INTO Funcionario_Treinamento (funcionario_cpf, treinamento_cod, n_certificado)
                VALUES (%s, %s, %s)
            """, (dados['funcionario_cpf'], dados['treinamento_cod'], dados['n_certificado']))
            conn.commit()
            return jsonify({'message': 'Vínculo criado com sucesso'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if 'conn' in locals():
            Database.return_connection(conn)

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

