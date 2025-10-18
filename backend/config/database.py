"""
Configuração de conexão com PostgreSQL
"""
import psycopg2
from psycopg2 import pool
from psycopg2.extras import RealDictCursor
import os

class Database:
    """Classe para gerenciar conexões com o banco de dados PostgreSQL"""
    
    _connection_pool = None
    
    @classmethod
    def initialize_pool(cls, minconn=1, maxconn=10):
        """Inicializa o pool de conexões"""
        try:
            cls._connection_pool = psycopg2.pool.SimpleConnectionPool(
                minconn,
                maxconn,
                host=os.getenv('DB_HOST', 'localhost'),
                port=os.getenv('DB_PORT', '5432'),
                database=os.getenv('DB_NAME', 'sistema_avaliacao'),
                user=os.getenv('DB_USER', 'postgres'),
                password=os.getenv('DB_PASSWORD', 'postgres')
            )
            print("[OK] Pool de conexões inicializado com sucesso!")
        except Exception as error:
            print(f"[ERRO] Erro ao inicializar pool de conexões: {error}")
            raise
    
    @classmethod
    def get_connection(cls):
        """Obtém uma conexão do pool"""
        if cls._connection_pool is None:
            cls.initialize_pool()
        return cls._connection_pool.getconn()
    
    @classmethod
    def return_connection(cls, connection):
        """Retorna a conexão ao pool"""
        if cls._connection_pool:
            cls._connection_pool.putconn(connection)
    
    @classmethod
    def close_all_connections(cls):
        """Fecha todas as conexões do pool"""
        if cls._connection_pool:
            cls._connection_pool.closeall()
            print("[OK] Todas as conexões foram fechadas")

def get_db_connection():
    """
    Função auxiliar para obter uma conexão com o banco
    Retorna uma conexão com cursor em formato de dicionário
    """
    return Database.get_connection()

def execute_query(query, params=None, fetch=True):
    """
    Executa uma query SQL e retorna os resultados
    
    Args:
        query (str): Query SQL a ser executada
        params (tuple): Parâmetros da query (opcional)
        fetch (bool): Se True, retorna os resultados. Se False, faz commit
    
    Returns:
        list: Lista de resultados (se fetch=True)
        int: Número de linhas afetadas (se fetch=False)
    """
    connection = None
    cursor = None
    
    try:
        connection = get_db_connection()
        cursor = connection.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute(query, params)
        
        if fetch:
            results = cursor.fetchall()
            return [dict(row) for row in results]
        else:
            connection.commit()
            return cursor.rowcount
            
    except Exception as error:
        if connection:
            connection.rollback()
        print(f"[ERRO] Erro ao executar query: {error}")
        raise
    finally:
        if cursor:
            cursor.close()
        if connection:
            Database.return_connection(connection)

def execute_many(query, params_list):
    """
    Executa múltiplas queries com diferentes parâmetros
    Útil para inserções em lote
    
    Args:
        query (str): Query SQL a ser executada
        params_list (list): Lista de tuplas com parâmetros
    
    Returns:
        int: Número total de linhas afetadas
    """
    connection = None
    cursor = None
    
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        cursor.executemany(query, params_list)
        connection.commit()
        
        return cursor.rowcount
            
    except Exception as error:
        if connection:
            connection.rollback()
        print(f"[ERRO] Erro ao executar queries em lote: {error}")
        raise
    finally:
        if cursor:
            cursor.close()
        if connection:
            Database.return_connection(connection)

