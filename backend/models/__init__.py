"""
Módulo de Models - Queries SQL organizadas
"""
from .perguntas import PerguntasModel
from .funcionarios import FuncionariosModel
from .avaliacoes import AvaliacoesModel
from .dashboard import DashboardModel

__all__ = [
    'PerguntasModel',
    'FuncionariosModel',
    'AvaliacoesModel',
    'DashboardModel'
]

