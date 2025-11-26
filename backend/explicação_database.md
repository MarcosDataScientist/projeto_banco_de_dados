# Explicação do Sistema de Banco de Dados e Rotas

## 📋 Índice
1. [Como Funcionam as Queries](#como-funcionam-as-queries)
2. [Como Funcionam as Rotas](#como-funcionam-as-rotas)
3. [Como o Frontend Faz Chamadas para o Backend](#como-o-frontend-faz-chamadas-para-o-backend)
4. [Arquitetura do Sistema](#arquitetura-do-sistema)

---

## 🔍 Como Funcionam as Queries

### 1. Sistema de Pool de Conexões

O sistema utiliza um **pool de conexões** para gerenciar eficientemente as conexões com o banco de dados PostgreSQL. Isso evita criar e destruir conexões a cada requisição, melhorando a performance.

#### Configuração (`backend/config/database.py`)

```python
class Database:
    _connection_pool = None  # Pool compartilhado entre todas as requisições
    
    @classmethod
    def initialize_pool(cls, minconn=1, maxconn=10):
        """Inicializa o pool com mínimo 1 e máximo 10 conexões"""
        cls._connection_pool = psycopg2.pool.SimpleConnectionPool(...)
```

**Características:**
- **Mínimo de conexões**: 1 (sempre mantém pelo menos uma conexão ativa)
- **Máximo de conexões**: 10 (limita o número de conexões simultâneas)
- **Reutilização**: As conexões são reutilizadas, não criadas do zero a cada requisição

### 2. Funções Auxiliares para Execução de Queries

#### `execute_query(query, params=None, fetch=True)`

Função principal para executar queries SQL. Ela:
1. Obtém uma conexão do pool
2. Cria um cursor com `RealDictCursor` (retorna resultados como dicionários)
3. Executa a query com parâmetros (proteção contra SQL injection)
4. Retorna resultados ou faz commit
5. **Sempre** retorna a conexão ao pool no bloco `finally`

**Exemplo de uso:**
```python
# Query SELECT (fetch=True)
resultados = execute_query(
    "SELECT * FROM Questao WHERE status = %s",
    ('Ativo',)
)

# Query INSERT/UPDATE/DELETE (fetch=False)
linhas_afetadas = execute_query(
    "DELETE FROM Questao WHERE cod_questao = %s",
    (questao_id,),
    fetch=False
)
```

#### `get_db_connection()`

Obtém uma conexão diretamente do pool. Usada quando você precisa de mais controle sobre a transação (ex: múltiplas queries na mesma transação).

**Padrão de uso:**
```python
connection = get_db_connection()
cursor = connection.cursor(cursor_factory=RealDictCursor)

try:
    cursor.execute(query1, params1)
    cursor.execute(query2, params2)
    connection.commit()  # Confirma todas as operações
except Exception as e:
    connection.rollback()  # Desfaz em caso de erro
    raise
finally:
    cursor.close()
    Database.return_connection(connection)  # IMPORTANTE: retornar ao pool
```

### 3. Models e Padrão de Queries

Cada entidade do sistema tem um **Model** que encapsula todas as queries relacionadas. Exemplos: `PerguntasModel`, `FuncionariosModel`, `AvaliacoesModel`, etc.

#### Estrutura de um Model

```python
class PerguntasModel:
    @staticmethod
    def listar_todas(filtro_tipo=None, filtro_status=None):
        # 1. Construir query SQL dinamicamente
        query = "SELECT * FROM Questao WHERE 1=1"
        params = []
        
        # 2. Adicionar filtros condicionalmente
        if filtro_tipo:
            query += " AND tipo_questao = %s"
            params.append(filtro_tipo)
        
        # 3. Executar usando função auxiliar
        return execute_query(query, tuple(params) if params else None)
```

#### Tipos de Queries nos Models

**a) Queries Simples (usando `execute_query`)**
- Queries diretas que não precisam de controle de transação
- Exemplo: `listar_todas()`, `deletar()`

**b) Queries Complexas (usando `get_db_connection`)**
- Queries que precisam de múltiplas operações
- Queries com paginação (precisa contar total + buscar dados)
- Exemplo: `listar_com_paginacao()`, `criar()` (com inserções em múltiplas tabelas)

**c) Queries com JOINs**
- Queries que relacionam múltiplas tabelas
- Exemplo: Buscar avaliação com dados do funcionário e avaliador

```python
query = """
    SELECT 
        a.cod_avaliacao,
        f.nome AS funcionario,
        av.nome AS avaliador,
        q.nome AS questionario
    FROM Avaliacao a
    LEFT JOIN Funcionario f ON a.avaliado_cpf = f.cpf
    LEFT JOIN Funcionario av ON a.avaliador_cpf = av.cpf
    LEFT JOIN Questionario q ON a.questionario_cod = q.cod_questionario
"""
```

### 4. Proteção contra SQL Injection

**SEMPRE** use parâmetros nas queries, nunca concatene strings diretamente:

❌ **ERRADO:**
```python
query = f"SELECT * FROM Questao WHERE cod_questao = {id}"  # VULNERÁVEL!
```

✅ **CORRETO:**
```python
query = "SELECT * FROM Questao WHERE cod_questao = %s"
cursor.execute(query, (id,))  # SEGURO!
```

### 5. Gerenciamento de Transações

- **Commit**: Confirma as alterações no banco
- **Rollback**: Desfaz alterações em caso de erro
- **Padrão**: Sempre fazer rollback em caso de exceção

```python
try:
    cursor.execute(query, params)
    connection.commit()  # Sucesso: confirma
except Exception as e:
    connection.rollback()  # Erro: desfaz
    raise
```

---

## 🛣️ Como Funcionam as Rotas

### 1. Estrutura Geral

O arquivo `backend/app.py` contém todas as rotas da API. O Flask é usado como framework web.

#### Inicialização

```python
app = Flask(__name__, static_folder='../static/dist', static_url_path='')
CORS(app)  # Permite requisições do frontend

# Inicializa pool de conexões ao iniciar
Database.initialize_pool()
```

### 2. Padrão de Rotas RESTful

As rotas seguem o padrão REST (Representational State Transfer):

| Método HTTP | Ação | Exemplo |
|------------|------|---------|
| `GET` | Buscar/Listar | `GET /api/perguntas` |
| `POST` | Criar | `POST /api/perguntas` |
| `PUT` | Atualizar | `PUT /api/perguntas/123` |
| `DELETE` | Deletar | `DELETE /api/perguntas/123` |

### 3. Estrutura de uma Rota Completa

```python
@app.route('/api/perguntas/<int:pergunta_id>', methods=['GET'])
def get_pergunta(pergunta_id):
    """Busca uma pergunta específica"""
    try:
        # 1. Buscar dados usando o Model
        pergunta = PerguntasModel.buscar_por_id(pergunta_id)
        
        # 2. Validar resultado
        if not pergunta:
            return jsonify({'error': 'Pergunta não encontrada'}), 404
        
        # 3. Retornar sucesso com dados
        return jsonify(pergunta), 200
    except Exception as e:
        # 4. Tratar erros
        return jsonify({'error': str(e)}), 500
```

### 4. Grupos de Rotas

#### a) Rotas de Dashboard (`/api/dashboard/*`)
- `GET /api/dashboard/estatisticas` - Estatísticas gerais
- `GET /api/dashboard/avaliacoes-mes` - Avaliações por mês
- `GET /api/dashboard/motivos-saida` - Motivos de saída
- `GET /api/dashboard/status-avaliacoes` - Status das avaliações
- `GET /api/dashboard/atividades-recentes` - Atividades recentes

#### b) Rotas de Perguntas (`/api/perguntas`)
- `GET /api/perguntas` - Lista com paginação e filtros
- `GET /api/perguntas/<id>` - Busca por ID
- `POST /api/perguntas` - Cria nova pergunta
- `PUT /api/perguntas/<id>` - Atualiza pergunta
- `DELETE /api/perguntas/<id>` - Deleta pergunta

**Exemplo com paginação:**
```python
@app.route('/api/perguntas', methods=['GET'])
def get_perguntas():
    # Obter parâmetros da query string
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    categoria = request.args.get('categoria', type=int)
    busca = request.args.get('q')
    
    # Buscar com paginação
    perguntas, total = PerguntasModel.listar_com_paginacao(
        page=page, 
        per_page=per_page,
        filtro_busca=busca
    )
    
    # Calcular metadados de paginação
    total_pages = (total + per_page - 1) // per_page
    
    return jsonify({
        'perguntas': perguntas,
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': total,
            'total_pages': total_pages,
            'has_prev': page > 1,
            'has_next': page < total_pages
        }
    }), 200
```

#### c) Rotas de Funcionários (`/api/funcionarios`)
- `GET /api/funcionarios` - Lista com paginação
- `GET /api/funcionarios/<cpf>` - Busca por CPF
- `GET /api/funcionarios/total` - Total de funcionários
- `GET /api/funcionarios/estatisticas` - Estatísticas
- `POST /api/funcionarios` - Cria funcionário
- `PUT /api/funcionarios/<cpf>` - Atualiza funcionário
- `DELETE /api/funcionarios/<cpf>` - Deleta funcionário

#### d) Rotas de Avaliações (`/api/avaliacoes`)
- `GET /api/avaliacoes` - Lista todas
- `GET /api/avaliacoes/<id>` - Busca por ID (com respostas)
- `POST /api/avaliacoes` - Cria avaliação
- `PUT /api/avaliacoes/<id>` - Atualiza configurações
- `PUT /api/avaliacoes/<id>/status` - Atualiza status (rating/descrição)
- `DELETE /api/avaliacoes/<id>` - Deleta avaliação
- `POST /api/avaliacoes/respostas` - Salva resposta de avaliação

#### e) Rotas de Questionários (`/api/questionarios`)
- `GET /api/questionarios` - Lista todos
- `GET /api/questionarios/<id>` - Busca por ID (com perguntas)
- `POST /api/questionarios` - Cria questionário
- `PUT /api/questionarios/<id>` - Atualiza questionário
- `DELETE /api/questionarios/<id>` - Deleta questionário

#### f) Rotas de Avaliadores (`/api/avaliadores`)
- `GET /api/avaliadores` - Lista todos
- `GET /api/avaliadores/<cpf>` - Busca por CPF
- `GET /api/avaliadores/<cpf>/certificados` - Certificados do avaliador

#### g) Rotas de Treinamentos (`/api/treinamentos`)
- `GET /api/treinamentos` - Lista treinamentos
- `POST /api/funcionario-treinamento` - Vincula funcionário a treinamento
- `PUT /api/funcionario-treinamento` - Atualiza certificado
- `DELETE /api/funcionario-treinamento` - Remove vínculo

### 5. Validação de Dados

Todas as rotas que recebem dados validam os campos obrigatórios:

```python
@app.route('/api/perguntas', methods=['POST'])
def criar_pergunta():
    data = request.get_json()
    
    # Validações
    if not data.get('texto'):
        return jsonify({'error': 'Texto da pergunta é obrigatório'}), 400
    if not data.get('tipo'):
        return jsonify({'error': 'Tipo da pergunta é obrigatório'}), 400
    
    # Criar se válido
    pergunta = PerguntasModel.criar(...)
    return jsonify(pergunta[0]), 201
```

### 6. Tratamento de Erros

**Códigos HTTP utilizados:**
- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Erro de validação/requisição inválida
- `404` - Recurso não encontrado
- `500` - Erro interno do servidor

**Padrão de tratamento:**
```python
try:
    # Operação
    resultado = Model.operacao()
    return jsonify(resultado), 200
except Exception as e:
    return jsonify({'error': str(e)}), 500
```

### 7. Validações de Integridade

Antes de deletar, o sistema verifica dependências:

```python
@app.route('/api/perguntas/<int:pergunta_id>', methods=['DELETE'])
def deletar_pergunta(pergunta_id):
    # Verificar uso em respostas
    total_respostas = PerguntasModel.verificar_uso_em_respostas(pergunta_id)
    if total_respostas > 0:
        return jsonify({
            'error': f'Não é possível excluir. Usada em {total_respostas} resposta(s).'
        }), 400
    
    # Verificar uso em formulários
    total_formularios = PerguntasModel.verificar_uso_em_formularios(pergunta_id)
    if total_formularios > 0:
        return jsonify({
            'error': f'Não é possível excluir. Associada a {total_formularios} formulário(s).'
        }), 400
    
    # Se passou validações, deletar
    PerguntasModel.deletar(pergunta_id)
    return jsonify({'message': 'Pergunta deletada com sucesso'}), 200
```

### 8. Rotas do Frontend

As rotas que não começam com `/api/` servem o frontend React:

```python
@app.route('/')
def serve_frontend():
    """Serve o index.html do React"""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serve arquivos estáticos ou index.html para rotas do React Router"""
    if path.startswith('api/'):
        return jsonify({'error': 'Recurso não encontrado'}), 404
    
    file_path = os.path.join(app.static_folder, path)
    if os.path.exists(file_path):
        return send_from_directory(app.static_folder, path)
    else:
        # Para rotas do React Router, serve o index.html
        return send_from_directory(app.static_folder, 'index.html')
```

### 9. Fluxo Completo de uma Requisição

```
1. Cliente faz requisição HTTP
   ↓
2. Flask recebe a requisição na rota correspondente
   ↓
3. Rota valida parâmetros/dados recebidos
   ↓
4. Rota chama método do Model correspondente
   ↓
5. Model obtém conexão do pool
   ↓
6. Model executa query SQL
   ↓
7. Model retorna conexão ao pool
   ↓
8. Model retorna dados para a rota
   ↓
9. Rota formata resposta JSON
   ↓
10. Flask retorna resposta HTTP ao cliente
```

### 10. Exemplo Completo: Criar Pergunta

**Requisição:**
```http
POST /api/perguntas
Content-Type: application/json

{
  "texto": "Qual o motivo da saída?",
  "tipo": "Múltipla Escolha",
  "status": "Ativo",
  "opcoes": ["Salário", "Ambiente", "Outro"]
}
```

**Fluxo no código:**
1. Rota `criar_pergunta()` recebe dados
2. Valida campos obrigatórios
3. Chama `PerguntasModel.criar(...)`
4. Model:
   - Obtém conexão do pool
   - Insere na tabela `Questao`
   - Se for múltipla escolha, insere em `Questao_Multipla_Escolha`
   - Faz commit
   - Retorna conexão ao pool
5. Rota retorna JSON com a pergunta criada

**Resposta:**
```json
{
  "cod_questao": 123,
  "tipo_questao": "Múltipla Escolha",
  "texto_questao": "Qual o motivo da saída?",
  "status": "Ativo"
}
```

---

## 💻 Como o Frontend Faz Chamadas para o Backend

### 1. Serviço de API Centralizado

O frontend utiliza um **serviço centralizado** (`frontend/src/services/api.js`) que encapsula todas as chamadas HTTP para o backend. Isso centraliza a lógica de comunicação e facilita manutenção.

#### Configuração da URL Base

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'
```

**Características:**
- Usa variável de ambiente `VITE_API_URL` se disponível
- Fallback para `http://localhost:5001/api` em desenvolvimento
- Todas as requisições usam esta URL base

### 2. Classe ApiService

A classe `ApiService` contém um método genérico `request()` que é usado por todos os métodos específicos.

#### Método Base `request()`

```javascript
async request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
      const error = new Error(data.error || 'Erro na requisição')
      error.response = { status: response.status, data }
      throw error
    }

    return data
  } catch (error) {
    console.error(`Erro ao fazer requisição para ${endpoint}:`, error)
    throw error
  }
}
```

**Funcionalidades:**
- ✅ Constrói URL completa (base + endpoint)
- ✅ Define `Content-Type: application/json` automaticamente
- ✅ Converte resposta para JSON
- ✅ Verifica se a resposta foi bem-sucedida (`response.ok`)
- ✅ Lança erro com informações detalhadas em caso de falha
- ✅ Loga erros no console para debug

### 3. Métodos Específicos por Entidade

Cada entidade tem métodos específicos que usam o método `request()` base:

#### Exemplo: Métodos de Perguntas

```javascript
// GET - Listar perguntas com filtros e paginação
async getPerguntas(categoria = null, ativa = null, page = 1, per_page = 10, busca = null, tipo = null) {
  let query = ''
  const params = []
  
  // Construir query string dinamicamente
  if (categoria) params.push(`categoria=${categoria}`)
  if (ativa !== null) params.push(`ativa=${ativa}`)
  if (page) params.push(`page=${page}`)
  if (per_page) params.push(`per_page=${per_page}`)
  if (busca) params.push(`q=${encodeURIComponent(busca)}`)
  if (tipo && tipo !== 'Todos') params.push(`tipo=${encodeURIComponent(tipo)}`)
  
  if (params.length > 0) {
    query = '?' + params.join('&')
  }
  
  return this.request(`/perguntas${query}`)
}

// GET - Buscar pergunta por ID
async getPergunta(id) {
  return this.request(`/perguntas/${id}`)
}

// POST - Criar nova pergunta
async criarPergunta(dados) {
  return this.request('/perguntas', {
    method: 'POST',
    body: JSON.stringify(dados),
  })
}

// PUT - Atualizar pergunta
async atualizarPergunta(id, dados) {
  return this.request(`/perguntas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  })
}

// DELETE - Deletar pergunta
async deletarPergunta(id) {
  return this.request(`/perguntas/${id}`, {
    method: 'DELETE',
  })
}
```

### 4. Exportação como Singleton

O serviço é exportado como uma **instância única** (singleton):

```javascript
export default new ApiService()
```

**Vantagens:**
- Uma única instância compartilhada em toda a aplicação
- Não precisa criar novas instâncias
- Estado centralizado (URL base, configurações)

**Uso nos componentes:**
```javascript
import api from '../services/api'

// Usar diretamente sem instanciar
const perguntas = await api.getPerguntas()
```

### 5. Uso nos Componentes React

Os componentes React usam o serviço de API para fazer requisições:

#### Exemplo: Listar Perguntas

```javascript
import { useState, useEffect } from 'react'
import api from '../services/api'

function Perguntas() {
  const [perguntas, setPerguntas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, per_page: 10 })

  const carregarPerguntas = async (page = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      // Chamada para a API
      const response = await api.getPerguntas(
        null,        // categoria
        null,        // ativa
        page,        // page
        10,          // per_page
        null,        // busca
        null         // tipo
      )
      
      // Verificar estrutura da resposta
      if (response.perguntas && response.pagination) {
        setPerguntas(response.perguntas)
        setPagination(response.pagination)
      } else {
        setPerguntas(response)
      }
    } catch (error) {
      setError(error.message)
      console.error('Erro ao carregar perguntas:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarPerguntas()
  }, [])

  return (
    // JSX do componente
  )
}
```

#### Exemplo: Criar Pergunta

```javascript
const handleSubmit = async (dados) => {
  try {
    setSubmitting(true)
    
    // Preparar dados
    const dadosPergunta = {
      texto: dados.texto,
      tipo: dados.tipo,
      status: 'Ativo',
      opcoes: dados.opcoes || null
    }
    
    // Chamada para a API
    const resultado = await api.criarPergunta(dadosPergunta)
    
    // Sucesso: mostrar mensagem e redirecionar
    showToast('success', 'Sucesso', 'Pergunta criada com sucesso!')
    navigate('/perguntas')
    
  } catch (error) {
    // Tratar erro
    const errorMessage = error.response?.data?.error || error.message
    showToast('error', 'Erro', errorMessage)
  } finally {
    setSubmitting(false)
  }
}
```

### 6. Tratamento de Erros

O frontend trata erros de forma consistente:

```javascript
try {
  const resultado = await api.criarPergunta(dados)
  // Sucesso
} catch (error) {
  // Erro pode ter diferentes estruturas:
  
  // 1. Erro da API (com response)
  if (error.response) {
    const status = error.response.status
    const errorData = error.response.data
    
    if (status === 400) {
      // Erro de validação
      console.error('Dados inválidos:', errorData.error)
    } else if (status === 404) {
      // Recurso não encontrado
      console.error('Recurso não encontrado')
    } else if (status === 500) {
      // Erro do servidor
      console.error('Erro interno do servidor')
    }
  } else {
    // 2. Erro de rede ou outro erro
    console.error('Erro de conexão:', error.message)
  }
}
```

### 7. Configuração do Proxy (Desenvolvimento)

Durante o desenvolvimento, o Vite usa um **proxy** para redirecionar requisições `/api` para o backend:

```javascript
// vite.config.js
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})
```

**Como funciona:**
- Frontend roda em `http://localhost:3000`
- Backend roda em `http://localhost:5001`
- Requisições para `/api/*` são automaticamente redirecionadas para `http://localhost:5001/api/*`
- Evita problemas de CORS durante desenvolvimento

**Exemplo:**
```
Frontend faz: GET http://localhost:3000/api/perguntas
Vite redireciona para: GET http://localhost:5001/api/perguntas
```

### 8. Fluxo Completo de uma Chamada

```
1. Componente React chama método do api
   ↓
   api.getPerguntas(page=1, per_page=10)
   
2. ApiService.request() constrói URL completa
   ↓
   http://localhost:5001/api/perguntas?page=1&per_page=10
   
3. fetch() faz requisição HTTP
   ↓
   GET /api/perguntas?page=1&per_page=10
   
4. Vite proxy (em dev) redireciona para backend
   ↓
   Backend recebe em Flask
   
5. Flask processa rota e retorna JSON
   ↓
   { perguntas: [...], pagination: {...} }
   
6. ApiService converte resposta para JSON
   ↓
   Retorna objeto JavaScript
   
7. Componente recebe dados e atualiza estado
   ↓
   setPerguntas(response.perguntas)
```

### 9. Exemplo Completo: Criar Avaliação

**No componente:**
```javascript
const criarAvaliacao = async () => {
  try {
    setSubmitting(true)
    
    // 1. Preparar dados
    const dadosAvaliacao = {
      avaliado_cpf: formData.funcionarioCpf,
      avaliador_cpf: formData.avaliadorCpf,
      questionario_cod: parseInt(formData.questionarioId),
      local: formData.local || null,
      descricao: formData.descricao || null
    }
    
    // 2. Chamar API
    const resultado = await api.criarAvaliacao(dadosAvaliacao)
    
    // 3. Processar resposta
    const avaliacaoId = resultado?.cod_avaliacao || resultado?.id
    
    if (avaliacaoId) {
      // 4. Redirecionar para próxima tela
      navigate(`/avaliacoes/${avaliacaoId}/preencher`)
    }
    
  } catch (error) {
    // 5. Tratar erro
    const errorMessage = error.response?.data?.error || error.message
    showToast('error', 'Erro ao criar avaliação', errorMessage)
  } finally {
    setSubmitting(false)
  }
}
```

**No ApiService:**
```javascript
async criarAvaliacao(dados) {
  return this.request('/avaliacoes', {
    method: 'POST',
    body: JSON.stringify(dados),
  })
}
```

**Requisição HTTP gerada:**
```http
POST http://localhost:5001/api/avaliacoes
Content-Type: application/json

{
  "avaliado_cpf": "12345678900",
  "avaliador_cpf": "98765432100",
  "questionario_cod": 1,
  "local": "Sala de Reuniões",
  "descricao": null
}
```

**Resposta do backend:**
```json
{
  "cod_avaliacao": 42,
  "avaliado_cpf": "12345678900",
  "avaliador_cpf": "98765432100",
  "questionario_cod": 1,
  "local": "Sala de Reuniões",
  "data_completa": "2024-01-15T10:30:00"
}
```

### 10. Métodos Disponíveis no ApiService

#### Dashboard
- `getEstatisticas()` - Estatísticas gerais
- `getAvaliacoesPorMes(meses)` - Avaliações por mês
- `getMotivosSaida()` - Motivos de saída
- `getStatusAvaliacoes()` - Status das avaliações
- `getAtividadesRecentes(limite)` - Atividades recentes

#### Funcionários
- `getFuncionarios(status, departamento, page, per_page, busca)` - Listar
- `getFuncionario(cpf)` - Buscar por CPF
- `criarFuncionario(dados)` - Criar
- `atualizarFuncionario(cpf, dados)` - Atualizar
- `deletarFuncionario(cpf)` - Deletar
- `getDepartamentos()` - Listar departamentos
- `getTotalFuncionarios()` - Total de funcionários
- `getEstatisticasFuncionarios()` - Estatísticas

#### Perguntas
- `getPerguntas(categoria, ativa, page, per_page, busca, tipo)` - Listar
- `getPergunta(id)` - Buscar por ID
- `criarPergunta(dados)` - Criar
- `atualizarPergunta(id, dados)` - Atualizar
- `deletarPergunta(id)` - Deletar
- `getCategorias()` - Listar categorias

#### Avaliações
- `getAvaliacoes(status, funcionario)` - Listar
- `getAvaliacao(id)` - Buscar por ID
- `criarAvaliacao(dados)` - Criar
- `atualizarAvaliacao(id, dados)` - Atualizar configurações
- `atualizarStatusAvaliacao(id, dados)` - Atualizar status
- `salvarRespostaAvaliacao(dados)` - Salvar resposta
- `deletarAvaliacao(id)` - Deletar

#### Questionários
- `getQuestionarios()` - Listar
- `getQuestionario(id)` - Buscar por ID
- `criarQuestionario(dados)` - Criar
- `atualizarQuestionario(id, dados)` - Atualizar
- `deletarQuestionario(id)` - Deletar
- `getClassificacoes()` - Listar classificações

#### Avaliadores
- `getAvaliadores()` - Listar
- `getAvaliador(cpf)` - Buscar por CPF
- `getCertificadosAvaliador(cpf)` - Certificados

#### Treinamentos
- `getTreinamentos()` - Listar
- `criarVinculoFuncionarioTreinamento(dados)` - Criar vínculo
- `atualizarVinculoFuncionarioTreinamento(dados)` - Atualizar vínculo
- `deletarVinculoFuncionarioTreinamento(cpf, cod)` - Deletar vínculo

### 11. Boas Práticas

#### ✅ Sempre usar try/catch
```javascript
try {
  const resultado = await api.getPerguntas()
} catch (error) {
  // Tratar erro
}
```

#### ✅ Mostrar feedback ao usuário
```javascript
setLoading(true)  // Mostrar loading
try {
  const resultado = await api.criarPergunta(dados)
  showToast('success', 'Sucesso', 'Pergunta criada!')
} catch (error) {
  showToast('error', 'Erro', error.message)
} finally {
  setLoading(false)  // Ocultar loading
}
```

#### ✅ Validar dados antes de enviar
```javascript
if (!dados.texto || !dados.tipo) {
  showToast('error', 'Validação', 'Campos obrigatórios faltando')
  return
}

await api.criarPergunta(dados)
```

#### ✅ Usar estados de loading
```javascript
const [loading, setLoading] = useState(false)

const carregarDados = async () => {
  setLoading(true)
  try {
    const dados = await api.getPerguntas()
    setPerguntas(dados)
  } finally {
    setLoading(false)
  }
}
```

---

## 🏗️ Arquitetura do Sistema

### Camadas

```
┌─────────────────┐
│   Frontend       │  (React - interface do usuário)
│   (React)        │
└────────┬─────────┘
         │ HTTP (JSON)
         ↓
┌─────────────────┐
│   Flask App     │  (Rotas - backend/app.py)
│   (Rotas API)   │
└────────┬─────────┘
         │
         ↓
┌─────────────────┐
│   Models        │  (Lógica de negócio - backend/models/)
│   (Queries)     │
└────────┬─────────┘
         │
         ↓
┌─────────────────┐
│   Database      │  (Pool de conexões - backend/config/database.py)
│   (PostgreSQL)  │
└─────────────────┘
```

### Separação de Responsabilidades

- **Rotas (`app.py`)**: Recebem requisições HTTP, validam dados, formatam respostas
- **Models (`models/*.py`)**: Contêm a lógica de acesso ao banco, queries SQL
- **Database (`config/database.py`)**: Gerencia conexões, executa queries

### Vantagens desta Arquitetura

1. **Manutenibilidade**: Código organizado por responsabilidade
2. **Reutilização**: Models podem ser usados por diferentes rotas
3. **Testabilidade**: Cada camada pode ser testada independentemente
4. **Performance**: Pool de conexões otimiza uso do banco
5. **Segurança**: Proteção contra SQL injection via parâmetros

---

## 📝 Resumo

### Queries
- ✅ Pool de conexões para eficiência
- ✅ Funções auxiliares (`execute_query`, `get_db_connection`)
- ✅ Models encapsulam queries por entidade
- ✅ Proteção contra SQL injection
- ✅ Gerenciamento adequado de transações

### Rotas
- ✅ Padrão RESTful (GET, POST, PUT, DELETE)
- ✅ Validação de dados de entrada
- ✅ Tratamento de erros consistente
- ✅ Códigos HTTP apropriados
- ✅ Validações de integridade antes de deletar
- ✅ Suporte a paginação e filtros

### Frontend → Backend
- ✅ Serviço centralizado (`ApiService`) para todas as chamadas
- ✅ Método genérico `request()` reutilizável
- ✅ Tratamento de erros padronizado
- ✅ Proxy do Vite para desenvolvimento (evita CORS)
- ✅ Estados de loading e feedback ao usuário
- ✅ Validação de dados antes de enviar

