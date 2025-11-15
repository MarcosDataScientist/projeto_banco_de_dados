# Projeto Lutica Beregula - Sistema de Avaliação de Desligamento de Funcionários

Sistema completo para gerenciar avaliações de saída de funcionários, permitindo cadastro de perguntas, criação de formulários e análise de respostas através de dashboards.

## Tecnologias

- **Frontend**: React 18 + Vite
- **Backend**: Flask (Python)
- **Estilo**: CSS3 com cores pastel
- **Banco de dados**: PostgreSQL 18.0

## Instalação

### 1. Configurar Variáveis de Ambiente

Primeiro, configure o arquivo `.env` na raiz do projeto:

```bash
# Se o arquivo .env ainda não existe, copie o template
cp .env.example .env
```

Edite o arquivo `.env` e ajuste as configurações conforme necessário:

- **Backend**: Porta, host, ambiente (PORT, FLASK_HOST, FLASK_ENV)
- **Banco de dados**: Host, porta, nome, usuário, senha (DB_*)
- **Frontend**: URL da API (VITE_API_URL)

**Importante**: Se você estiver trabalhando em rede local e quiser que outro computador acesse o backend:
1. No `.env`, altere `VITE_API_URL` para usar o IP da sua máquina (ex: `http://192.168.1.100:5001/api`)
2. A URL da API é a única variável que seu amigo precisa alterar facilmente!

### 2. Instalar Dependências

#### Backend (Flask)

```bash
# Navegar para a pasta backend
cd backend

# Instalar dependências Python
pip install -r requirements.txt
```

#### Frontend (React)

```bash
# Navegar para a pasta frontend
cd frontend

# Instalar dependências Node
npm install
```

## Executando o Projeto

### Desenvolvimento

1. **Iniciar o backend Flask** (Terminal 1):
```bash
cd backend
python run.py
```
O servidor Flask estará rodando na rota configurada em `.env`

2. **Iniciar o frontend React** (Terminal 2):
```bash
cd frontend
npm run dev
```
O servidor de desenvolvimento estará rodando na rota configurada em `.env`

## Configuração de Variáveis de Ambiente

Todas as configurações do projeto estão centralizadas no arquivo `.env` na raiz do projeto. Este arquivo não é commitado no Git (está no `.gitignore`), então cada desenvolvedor precisa criar o seu próprio.

### Variáveis Principais

**Para alterar a URL da API (o que seu amigo precisa fazer):**
```env
VITE_API_URL=http://localhost:5001/api
```

Se estiver trabalhando em rede local e precisar que outro computador acesse:
```env
VITE_API_URL=http://192.168.1.100:5001/api
```
(Substitua `192.168.1.100` pelo IP da máquina que está rodando o backend)

**Para alterar a porta do backend:**
```env
PORT=5001
FLASK_HOST=0.0.0.0  # 0.0.0.0 permite conexões de qualquer IP na rede local
```

**Para alterar configurações do banco de dados:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sistema_avaliacao
DB_USER=postgres
DB_PASSWORD=postgres
```

Veja o arquivo `.env.example` para mais detalhes sobre todas as variáveis disponíveis.