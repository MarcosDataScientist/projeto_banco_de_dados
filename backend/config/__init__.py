"""
Módulo de configuração do backend
"""
from .database import Database, get_db_connection, execute_query, execute_many

__all__ = ['Database', 'get_db_connection', 'execute_query', 'execute_many']

