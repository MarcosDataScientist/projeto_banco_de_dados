import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

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
        app.run(host='0.0.0.0', port=port, debug=debug)
    finally:
        Database.close_all_connections()

