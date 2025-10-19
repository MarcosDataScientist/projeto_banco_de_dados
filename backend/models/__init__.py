"""
Módulo de Models - Queries SQL organizadas
"""
from .perguntas import PerguntasModel
from .funcionarios import FuncionariosModel
from .avaliacoes import AvaliacoesModel
from .dashboard import DashboardModel
from .questionarios import QuestionariosModel
from .avaliadores import AvaliadoresModel

__all__ = [
    'PerguntasModel',
    'FuncionariosModel',
    'AvaliacoesModel',
    'DashboardModel',
    'QuestionariosModel',
    'AvaliadoresModel'
]

