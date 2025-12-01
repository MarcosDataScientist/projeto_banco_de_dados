"""
Controller para Dashboard - Estatísticas e gráficos
"""
from flask import jsonify, request

from backend.models.dashboard import DashboardModel


class DashboardController:
    """Controller para gerenciar rotas do Dashboard"""
    
    @staticmethod
    def get_estatisticas_gerais():
        """Retorna estatísticas gerais do dashboard"""
        try:
            stats = DashboardModel.estatisticas_gerais()
            return jsonify(stats), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def get_avaliacoes_mes():
        """Retorna avaliações por mês"""
        try:
            meses = request.args.get('meses', 6, type=int)
            data = DashboardModel.avaliacoes_por_mes(meses)
            return jsonify(data), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def get_motivos_saida():
        """Retorna principais motivos de saída"""
        try:
            data = DashboardModel.motivos_saida_principais()
            return jsonify(data), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def get_status_avaliacoes():
        """Retorna distribuição de status das avaliações"""
        try:
            data = DashboardModel.status_avaliacoes()
            return jsonify(data), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def get_atividades_recentes():
        """Retorna atividades recentes"""
        try:
            limite = request.args.get('limite', 10, type=int)
            data = DashboardModel.atividades_recentes(limite)
            return jsonify(data), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def get_questionarios_usados():
        """Retorna frequência de uso dos questionários"""
        try:
            data = DashboardModel.questionarios_mais_usados()
            return jsonify(data), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def get_avaliacoes_por_questionario():
        """Retorna quantidade de avaliações por questionário para gráfico de pizza"""
        try:
            data = DashboardModel.avaliacoes_por_questionario()
            return jsonify(data), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def get_respostas_frequencia():
        """Retorna frequência de cada resposta"""
        try:
            data = DashboardModel.distribuicao_respostas_escolha()
            return jsonify(data), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def get_avaliacoes_tempo():
        """Retorna avaliações por mês/ano"""
        try:
            anos = request.args.get('anos', 2, type=int)
            data = DashboardModel.avaliacoes_por_tempo(anos)
            return jsonify(data), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def get_avaliacoes_setor():
        """Retorna avaliações por setor"""
        try:
            data = DashboardModel.avaliacoes_por_setor()
            return jsonify(data), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def get_avaliadores_por_setor():
        """Retorna avaliadores e suas contribuições por setor"""
        try:
            data = DashboardModel.avaliacoes_por_setor_e_avaliador()
            return jsonify(data), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @staticmethod
    def get_pontos_por_data():
        """Retorna total de pontos agrupados por data"""
        try:
            data_inicial = request.args.get('data_inicial', None)
            data_final = request.args.get('data_final', None)
            limite_dias = request.args.get('limite_dias', None, type=int)
            
            data = DashboardModel.pontos_por_data(
                data_inicial=data_inicial,
                data_final=data_final,
                limite_dias=limite_dias
            )
            return jsonify(data), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

