import sys
import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente do .env na raiz
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(project_root, '.env'))

# Adicionar a raiz do projeto ao path do Python
current_dir = os.path.dirname(os.path.abspath(__file__))

if project_root not in sys.path:
    sys.path.insert(0, project_root)

from backend.app import app, Database

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

