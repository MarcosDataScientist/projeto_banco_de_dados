"""
Controller para Avaliadores
"""
from flask import jsonify, request

from backend.models.avaliadores import AvaliadoresModel
from backend.config.database import Database


class AvaliadoresController:
    """Controller para gerenciar rotas de Avaliadores"""
    
    @staticmethod
    def listar():
        """Lista todos os avaliadores (funcionários com certificados)"""
        try:
            avaliadores = AvaliadoresModel.listar_avaliadores()
            return jsonify(avaliadores), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def buscar_por_cpf(cpf):
        """Busca um avaliador específico por CPF"""
        try:
            avaliador = AvaliadoresModel.buscar_avaliador_por_cpf(cpf)
            if avaliador:
                return jsonify(avaliador), 200
            else:
                return jsonify({'error': 'Avaliador não encontrado'}), 404
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def listar_certificados(cpf):
        """Lista todos os certificados de um avaliador"""
        try:
            certificados = AvaliadoresModel.listar_certificados_avaliador(cpf)
            return jsonify(certificados), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def listar_treinamentos():
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
    
    @staticmethod
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
    
    @staticmethod
    def atualizar_vinculo_funcionario_treinamento():
        """Atualiza vínculo entre funcionário e treinamento (apenas n_certificado)"""
        try:
            dados = request.get_json()
            conn = Database.get_connection()
            if not conn:
                raise Exception("Não foi possível conectar ao banco de dados")
            
            if not dados.get('funcionario_cpf') or not dados.get('treinamento_cod'):
                return jsonify({'error': 'CPF do funcionário e código do treinamento são obrigatórios'}), 400
            
            with conn.cursor() as cursor:
                cursor.execute("""
                    UPDATE Funcionario_Treinamento
                    SET n_certificado = %s
                    WHERE funcionario_cpf = %s AND treinamento_cod = %s
                """, (dados.get('n_certificado'), dados['funcionario_cpf'], dados['treinamento_cod']))
                
                if cursor.rowcount == 0:
                    conn.rollback()
                    return jsonify({'error': 'Certificado não encontrado'}), 404
                
                conn.commit()
                return jsonify({'message': 'Certificado atualizado com sucesso'}), 200
        except Exception as e:
            if conn:
                conn.rollback()
            return jsonify({'error': str(e)}), 500
        finally:
            if 'conn' in locals():
                Database.return_connection(conn)
    
    @staticmethod
    def deletar_vinculo_funcionario_treinamento():
        """Deleta vínculo entre funcionário e treinamento"""
        try:
            funcionario_cpf = request.args.get('funcionario_cpf')
            treinamento_cod = request.args.get('treinamento_cod')
            
            if not funcionario_cpf or not treinamento_cod:
                return jsonify({'error': 'CPF do funcionário e código do treinamento são obrigatórios'}), 400
            
            conn = Database.get_connection()
            if not conn:
                raise Exception("Não foi possível conectar ao banco de dados")
            
            with conn.cursor() as cursor:
                cursor.execute("""
                    DELETE FROM Funcionario_Treinamento
                    WHERE funcionario_cpf = %s AND treinamento_cod = %s
                """, (funcionario_cpf, treinamento_cod))
                
                if cursor.rowcount == 0:
                    conn.rollback()
                    return jsonify({'error': 'Certificado não encontrado'}), 404
                
                conn.commit()
                return jsonify({'message': 'Certificado deletado com sucesso'}), 200
        except Exception as e:
            if conn:
                conn.rollback()
            return jsonify({'error': str(e)}), 500
        finally:
            if 'conn' in locals():
                Database.return_connection(conn)

