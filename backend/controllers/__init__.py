"""
Módulo de Controllers - Lógica de controle da aplicação
"""
from .dashboard_controller import DashboardController
from .perguntas_controller import PerguntasController
from .funcionarios_controller import FuncionariosController
from .avaliacoes_controller import AvaliacoesController
from .questionarios_controller import QuestionariosController
from .avaliadores_controller import AvaliadoresController
from .admin_controller import AdminController

__all__ = [
    'DashboardController',
    'PerguntasController',
    'FuncionariosController',
    'AvaliacoesController',
    'QuestionariosController',
    'AvaliadoresController',
    'AdminController'
]

