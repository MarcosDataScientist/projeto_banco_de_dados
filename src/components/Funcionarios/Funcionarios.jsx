import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SearchIcon, PlusIcon, EditIcon, DeleteIcon, CalendarIcon, UsersIcon, EyeIcon, XIcon } from '../common/Icons'
import ConfirmModal from '../common/ConfirmModal'
import CadastrarFuncionario from './CadastrarFuncionario'
import api from '../../services/api'

function Funcionarios() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCadastroModalOpen, setIsCadastroModalOpen] = useState(false)
  const [isVisualizarModalOpen, setIsVisualizarModalOpen] = useState(false)
  const [funcionarioToDelete, setFuncionarioToDelete] = useState(null)
  const [funcionarioToView, setFuncionarioToView] = useState(null)
  const [funcionarios, setFuncionarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    total_pages: 0,
    has_prev: false,
    has_next: false
  })

  useEffect(() => {
    carregarFuncionarios()
  }, [pagination.page])

  const carregarFuncionarios = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.getFuncionarios(null, null, pagination.page, pagination.per_page)
      
      if (response.funcionarios && response.pagination) {
        setFuncionarios(response.funcionarios)
        setPagination(response.pagination)
      } else {
        // Fallback para resposta sem paginação
        setFuncionarios(response)
      }
    } catch (err) {
      console.error('Erro ao carregar funcionários:', err)
      setError('Não foi possível carregar os funcionários. Tente novamente mais tarde.')
    } finally {
      setLoading(false)
    }
  }

  // Função para navegar entre páginas
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      setPagination(prev => ({ ...prev, page: newPage }))
    }
  }

  const getStatusBadgeColor = (status) => {
    switch (status.toLowerCase()) {
      case 'ativo': return 'badge-ativo'
      case 'processo de saída': return 'badge-rascunho'
      case 'desligado': return 'badge-inativo'
      default: return 'badge-default'
    }
  }

  const handleDeleteClick = (funcionario) => {
    setFuncionarioToDelete(funcionario)
    setIsModalOpen(true)
  }

  const handleViewClick = (funcionario) => {
    setFuncionarioToView(funcionario)
    setIsVisualizarModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (funcionarioToDelete) {
      try {
        console.log('Tentando excluir funcionário:', funcionarioToDelete.cpf)
        const response = await api.deletarFuncionario(funcionarioToDelete.cpf)
        console.log('Resposta da API:', response)
        
        // Atualizar a lista após deletar
        setFuncionarios(funcionarios.filter(f => f.cpf !== funcionarioToDelete.cpf))
        console.log('Funcionário excluído com sucesso:', funcionarioToDelete)
        alert('Funcionário excluído com sucesso!')
      } catch (err) {
        console.error('Erro ao deletar funcionário:', err)
        console.error('Detalhes do erro:', err.response)
        
        // Verificar se é erro de validação (funcionário com avaliações)
        if (err.response && err.response.status === 400) {
          const errorData = err.response.data
          alert(`Não é possível excluir este funcionário: ${errorData.error}`)
        } else {
          alert('Erro ao excluir funcionário. Tente novamente.')
        }
      }
    }
    setIsModalOpen(false)
    setFuncionarioToDelete(null)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setFuncionarioToDelete(null)
  }

  const handleCloseViewModal = () => {
    setIsVisualizarModalOpen(false)
    setFuncionarioToView(null)
  }

  const handleCadastroSuccess = () => {
    // Recarregar a lista de funcionários após cadastro
    carregarFuncionarios()
  }

  // Calcular estatísticas
  const totalFuncionarios = funcionarios.length
  const emProcesso = funcionarios.filter(f => f.status.toLowerCase() === 'processo de saída').length
  const ativos = funcionarios.filter(f => f.status.toLowerCase() === 'ativo').length
  const departamentos = new Set(funcionarios.map(f => f.setor || f.departamento).filter(Boolean)).size

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando funcionários...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-container">
          <h3>Erro ao carregar dados</h3>
          <p>{error}</p>
          <button onClick={carregarFuncionarios} className="btn-primary">Tentar novamente</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Listagem funcionários</h2>
        
      </div>

      <div className="stats-row">
        <div className="stat-item">
          <span className="stat-number">{totalFuncionarios}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{emProcesso}</span>
          <span className="stat-label">Em Processo</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{ativos}</span>
          <span className="stat-label">Ativos</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{departamentos}</span>
          <span className="stat-label">Departamentos</span>
        </div>
      </div>

      <div className="list-container">
        <div className="search-section">
          <div className="search-bar">
            <span className="search-icon"><SearchIcon /></span>
            <input
              type="text"
              placeholder="Buscar por nome, cargo, departamento ou status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button 
            className="btn-primary"
            onClick={() => setIsCadastroModalOpen(true)}
          >
            <PlusIcon /> Novo Funcionário
          </button>
        </div>
        {funcionarios.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon"><UsersIcon /></span>
            <h3>Nenhum funcionário encontrado</h3>
            <p>{searchTerm ? 'Tente ajustar os termos de busca' : 'Cadastre seu primeiro funcionário para começar'}</p>
          </div>
        ) : (
          <div className="items-list">
            {funcionarios.map(funcionario => {
              // Extrair iniciais do nome
              const getInitials = (name) => {
                if (!name) return '?'
                const names = name.split(' ')
                if (names.length >= 2) {
                  return names[0][0] + names[names.length - 1][0]
                }
                return names[0][0]
              }

              const departamento = funcionario.setor || funcionario.departamento || 'Não informado'
              const cargo = funcionario.cargo || funcionario.tipo || 'Não informado'

              return (
                <div key={funcionario.cpf} className="list-item">
                  <div className="employee-avatar">
                    {funcionario.foto_url ? (
                      <img src={funcionario.foto_url} alt={funcionario.nome} className="avatar-image" />
                    ) : (
                      <div className="avatar-placeholder">
                        {getInitials(funcionario.nome)}
                      </div>
                    )}
                  </div>
                  <div className="item-main">
                    <div className="item-header">
                      <h4 className="item-title">{funcionario.nome}</h4>
                      <div className="item-badges">
                        <span className="badge badge-categoria">
                          {departamento}
                        </span>
                        <span className={`badge ${getStatusBadgeColor(funcionario.status)}`}>
                          {funcionario.status}
                        </span>
                      </div>
                    </div>
                    <p className="item-description">
                      <strong>{cargo}</strong>
                      {funcionario.email && ` • ${funcionario.email}`}
                      {funcionario.ctps && ` • CTPS: ${funcionario.ctps}`}
                    </p>
                    <div className="item-meta">
                      <span className="item-date">
                        <CalendarIcon /> CPF: {funcionario.cpf}
                      </span>
                    </div>
                  </div>
                  <div className="item-actions">
                    <button 
                      className="btn-action btn-edit" 
                      onClick={() => navigate(`/funcionarios/editar/${funcionario.cpf}`)}
                      title="Editar"
                    >
                      <EditIcon />
                    </button>
                    <button 
                      className="btn-action btn-preview"
                      onClick={() => handleViewClick(funcionario)}
                      title="Visualizar"
                    >
                      <EyeIcon />
                    </button>
                    <button 
                      className="btn-action btn-delete"
                      onClick={() => handleDeleteClick(funcionario)}
                      title="Excluir"
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Componente de Paginação */}
        {pagination.total > 0 && (
          <div className="pagination-container">
            <div className="pagination-info">
              <span>
                Mostrando {((pagination.page - 1) * pagination.per_page) + 1} a {Math.min(pagination.page * pagination.per_page, pagination.total)} de {pagination.total} funcionários
              </span>
            </div>
            
            <div className="pagination-controls">
              <button 
                className="pagination-btn"
                onClick={() => handlePageChange(1)}
                disabled={!pagination.has_prev}
                title="Primeira página"
              >
                ««
              </button>
              
              <button 
                className="pagination-btn"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.has_prev}
                title="Página anterior"
              >
                «
              </button>
              
              <div className="pagination-pages">
                {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                  let pageNum;
                  if (pagination.total_pages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.total_pages - 2) {
                    pageNum = pagination.total_pages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      className={`pagination-btn ${pageNum === pagination.page ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button 
                className="pagination-btn"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.has_next}
                title="Próxima página"
              >
                »
              </button>
              
              <button 
                className="pagination-btn"
                onClick={() => handlePageChange(pagination.total_pages)}
                disabled={!pagination.has_next}
                title="Última página"
              >
                »»
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        title="Excluir Funcionário"
        message={`Tem certeza que deseja excluir o funcionário ${funcionarioToDelete?.nome}? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
      />

      <CadastrarFuncionario
        isOpen={isCadastroModalOpen}
        onClose={() => setIsCadastroModalOpen(false)}
        onSuccess={handleCadastroSuccess}
      />

      {/* Modal de Visualização */}
      {isVisualizarModalOpen && funcionarioToView && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2 className="modal-title">Dados do Funcionário</h2>
              <button 
                className="modal-close"
                onClick={handleCloseViewModal}
              >
                <XIcon />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="funcionario-details">
                <div className="detail-section">
                  <h3>Informações Pessoais</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Nome Completo:</label>
                      <span>{funcionarioToView.nome}</span>
                    </div>
                    <div className="detail-item">
                      <label>CPF:</label>
                      <span>{funcionarioToView.cpf}</span>
                    </div>
                    <div className="detail-item">
                      <label>Email:</label>
                      <span>{funcionarioToView.email || 'Não informado'}</span>
                    </div>
                    <div className="detail-item">
                      <label>CTPS:</label>
                      <span>{funcionarioToView.ctps || 'Não informado'}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Informações Profissionais</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Setor:</label>
                      <span>{funcionarioToView.setor || 'Não informado'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Tipo de Contrato:</label>
                      <span>{funcionarioToView.tipo || 'Não informado'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Status:</label>
                      <span className={`status-badge ${getStatusBadgeColor(funcionarioToView.status)}`}>
                        {funcionarioToView.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={handleCloseViewModal}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Funcionarios
