import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SearchIcon, PlusIcon, EditIcon, CalendarIcon, UserIcon, FormsIcon, ArrowRightIcon, EyeIcon, XIcon, DeleteIcon } from '../common/Icons'
import Toast from '../common/Toast'
import api from '../../services/api'

function Avaliacao() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [avaliacoes, setAvaliacoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 10,
    total: 0,
    total_pages: 0
  })
  
  const [toast, setToast] = useState({
    show: false,
    type: 'success',
    title: '',
    message: ''
  })
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [avaliacaoToDelete, setAvaliacaoToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Carregar avaliações
  useEffect(() => {
    carregarAvaliacoes()
  }, [])

  const carregarAvaliacoes = async () => {
    try {
      setLoading(true)
      setError(null)
      const dados = await api.getAvaliacoes()
      setAvaliacoes(Array.isArray(dados) ? dados : [])
    } catch (err) {
      console.error('Erro ao carregar avaliações:', err)
      setError('Erro ao carregar avaliações. Tente novamente.')
      setAvaliacoes([])
    } finally {
      setLoading(false)
    }
  }

  const handleEditConfig = (avaliacao) => {
    // Navegar para editar configurações da avaliação
    navigate(`/avaliacoes/${avaliacao.id}/editar`)
  }

  const handleCompleteAvaliacao = (avaliacao) => {
    // Navegar para completar a avaliação
    navigate(`/avaliacoes/${avaliacao.id}/preencher`)
  }

  const handleViewClick = (avaliacao) => {
    navigate(`/avaliacoes/${avaliacao.id}/visualizar`)
  }

  const handleDeleteClick = (avaliacao) => {
    setAvaliacaoToDelete(avaliacao)
    setIsDeleteModalOpen(true)
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setAvaliacaoToDelete(null)
  }

  const handleConfirmDelete = async () => {
    if (!avaliacaoToDelete) return

    try {
      setDeleting(true)
      await api.deletarAvaliacao(avaliacaoToDelete.id)
      
      // Remover da lista
      setAvaliacoes(avaliacoes.filter(a => a.id !== avaliacaoToDelete.id))
      
      // Fechar modal
      setIsDeleteModalOpen(false)
      setAvaliacaoToDelete(null)
      
      // Mostrar mensagem de sucesso
      showToast('success', 'Avaliação excluída!', 'A avaliação foi excluída com sucesso.')
    } catch (err) {
      console.error('Erro ao deletar avaliação:', err)
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao excluir avaliação'
      showToast('error', 'Erro ao excluir', errorMessage)
    } finally {
      setDeleting(false)
    }
  }

  const formatarData = (data) => {
    if (!data) return 'Não informado'
    try {
      const date = new Date(data)
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return data
    }
  }

  const getStatusBadgeColor = (rating) => {
    if (rating === null || rating === undefined) {
      return 'badge-rascunho' // Pendente
    }
    if (rating >= 4) {
      return 'badge-ativo' // Excelente
    }
    if (rating >= 3) {
      return 'badge-default' // Bom
    }
    return 'badge-inativo' // Precisa melhorar
  }

  const getStatusText = (rating) => {
    if (rating === null || rating === undefined) {
      return 'Pendente'
    }
    if (rating >= 4) {
      return 'Concluída'
    }
    if (rating >= 3) {
      return 'Em Andamento'
    }
    return 'Aguardando'
  }

  const filteredAvaliacoes = avaliacoes.filter(avaliacao => {
    if (!searchTerm.trim()) return true
    const termo = searchTerm.toLowerCase()
    return (
      avaliacao.funcionario?.toLowerCase().includes(termo) ||
      avaliacao.avaliador?.toLowerCase().includes(termo) ||
      avaliacao.questionario?.toLowerCase().includes(termo) ||
      avaliacao.local?.toLowerCase().includes(termo) ||
      avaliacao.funcionario_cpf?.includes(termo) ||
      avaliacao.departamento?.toLowerCase().includes(termo)
    )
  })

  // Calcular paginação
  const totalItems = filteredAvaliacoes.length
  const totalPages = Math.ceil(totalItems / pagination.per_page)
  const startIndex = (pagination.page - 1) * pagination.per_page
  const endIndex = startIndex + pagination.per_page
  const paginatedAvaliacoes = filteredAvaliacoes.slice(startIndex, endIndex)

  // Atualizar paginação quando os dados mudarem
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      total: totalItems,
      total_pages: totalPages,
      page: prev.page > totalPages && totalPages > 0 ? totalPages : prev.page
    }))
  }, [totalItems, totalPages])

  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }))
    // Scroll para o topo da lista
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const showToast = (type, title, message) => {
    setToast({ show: true, type, title, message })
  }

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }))
  }

  // Calcular estatísticas
  const totalAvaliacoes = avaliacoes.length
  const avaliacoesConcluidas = avaliacoes.filter(a => a.rating !== null && a.rating !== undefined).length
  const avaliacoesPendentes = avaliacoes.filter(a => a.rating === null || a.rating === undefined).length
  const funcionariosAvaliados = new Set(avaliacoes.map(a => a.funcionario_cpf).filter(Boolean)).size

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h2>Listagem de Avaliações</h2>
        </div>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando avaliações...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h2>Listagem de Avaliações</h2>
        </div>
        <div className="error-container">
          <h3>Erro ao carregar dados</h3>
          <p>{error}</p>
          <button onClick={carregarAvaliacoes} className="btn-primary">Tentar novamente</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Listagem de Avaliações</h2>
      </div>

      <div className="dashboard-layout">
        {/* Box de Stats na Lateral Esquerda */}
        <div className="stats-sidebar">
          <div className="stats-box">
            <h3>Estatísticas</h3>
            <div className="stats-list">
              <div className="stat-row">
                <span className="stat-label">Total de Avaliações</span>
                <span className="stat-number">{totalAvaliacoes}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Avaliações Concluídas</span>
                <span className="stat-number">{avaliacoesConcluidas}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Avaliações Pendentes</span>
                <span className="stat-number">{avaliacoesPendentes}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Funcionários Avaliados</span>
                <span className="stat-number">{funcionariosAvaliados}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lista Principal */}
        <div className="list-container">
          <div className="search-section">
            <div className="search-bar">
              <span className="search-icon"><SearchIcon /></span>
              <input
                type="text"
                placeholder="Buscar por funcionário, avaliador, questionário ou local..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <button 
              className="btn-primary" 
              onClick={() => navigate('/avaliacoes/nova')}
            >
              <PlusIcon /> Iniciar Nova Avaliação
            </button>
          </div>

          {filteredAvaliacoes.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon"><FormsIcon /></span>
              <h3>Nenhuma avaliação encontrada</h3>
              <p>
                {searchTerm 
                  ? 'Tente ajustar os termos de busca' 
                  : 'Inicie uma nova avaliação para começar'}
              </p>
              {!searchTerm && (
                <button 
                  className="btn-primary" 
                  onClick={() => navigate('/avaliacoes/nova')}
                  style={{ marginTop: '16px' }}
                >
                  <PlusIcon /> Iniciar Nova Avaliação
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="items-list">
                {paginatedAvaliacoes.map(avaliacao => (
                <div key={avaliacao.id} className="list-item">
                  <div className="item-main">
                    <div className="item-header">
                      <h4 className="item-title">
                        {avaliacao.funcionario || 'Funcionário não encontrado'}
                      </h4>
                      <div className="item-badges">
                        <span className={`badge ${getStatusBadgeColor(avaliacao.rating)}`}>
                          {getStatusText(avaliacao.rating)}
                        </span>
                      </div>
                    </div>
                    <p className="item-description">
                      <strong>Avaliador:</strong> {avaliacao.avaliador || 'Não informado'}
                      {avaliacao.questionario && ` • Questionário: ${avaliacao.questionario}`}
                      {avaliacao.departamento && ` • Departamento: ${avaliacao.departamento}`}
                    </p>
                    <div className="item-meta">
                      <span className="item-date">
                        <CalendarIcon /> {formatarData(avaliacao.data_completa)}
                      </span>
                      {avaliacao.local && (
                        <span className="item-date" style={{ marginLeft: '16px' }}>
                          <UserIcon /> Local: {avaliacao.local}
                        </span>
                      )}
                    </div>
                    {avaliacao.descricao && (
                      <p style={{ 
                        marginTop: '8px', 
                        fontSize: '13px', 
                        color: '#666',
                        fontStyle: 'italic'
                      }}>
                        {avaliacao.descricao.length > 100 
                          ? `${avaliacao.descricao.substring(0, 100)}...` 
                          : avaliacao.descricao}
                      </p>
                    )}
                  </div>
                  <div className="item-actions">
                    {/* Botão Visualizar - sempre disponível */}
                    <button 
                      className="btn-action btn-preview" 
                      title="Visualizar avaliação completa"
                      onClick={() => handleViewClick(avaliacao)}
                      style={{ marginRight: '8px' }}
                    >
                      <EyeIcon />
                    </button>
                    {/* Botão Editar Configurações - apenas quando não estiver completa */}
                    {(avaliacao.rating === null || avaliacao.rating === undefined) && (
                      <button 
                        className="btn-action btn-edit" 
                        title="Editar configurações da avaliação"
                        onClick={() => handleEditConfig(avaliacao)}
                        style={{ marginRight: '8px' }}
                      >
                        <EditIcon />
                      </button>
                    )}
                    {/* Botão Completar Avaliação - apenas quando não estiver completa */}
                    {(avaliacao.rating === null || avaliacao.rating === undefined) && (
                      <button 
                        className="btn-action btn-complete" 
                        title="Completar avaliação"
                        onClick={() => handleCompleteAvaliacao(avaliacao)}
                        style={{ marginRight: '8px' }}
                      >
                        <ArrowRightIcon />
                      </button>
                    )}
                    {/* Botão Deletar - sempre disponível */}
                    <button 
                      className="btn-action btn-delete" 
                      title="Excluir avaliação"
                      onClick={() => handleDeleteClick(avaliacao)}
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginação */}
            {totalItems > 0 && (
              <div className="pagination-container">
                <div className="pagination-info">
                  <span>
                    Mostrando {startIndex + 1} a {Math.min(endIndex, totalItems)} de {totalItems} avaliações
                  </span>
                </div>
                
                <div className="pagination-controls">
                  <button 
                    className="pagination-btn"
                    onClick={() => handlePageChange(1)}
                    disabled={pagination.page === 1}
                    title="Primeira página"
                  >
                    ««
                  </button>
                  
                  <button 
                    className="pagination-btn"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    title="Página anterior"
                  >
                    «
                  </button>
                  
                  <div className="pagination-pages">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
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
                    disabled={pagination.page >= totalPages}
                    title="Próxima página"
                  >
                    »
                  </button>
                  
                  <button 
                    className="pagination-btn"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={pagination.page >= totalPages}
                    title="Última página"
                  >
                    »»
                  </button>
                </div>
              </div>
            )}
          </>
          )}
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {isDeleteModalOpen && (
        <div className="modal-overlay" onClick={handleCloseDeleteModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Excluir Avaliação</h2>
              <button className="btn-close" onClick={handleCloseDeleteModal} title="Fechar" disabled={deleting}>
                <XIcon />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ margin: 0, fontSize: '16px', color: '#333' }}>
                Tem certeza que deseja excluir a avaliação de <strong>{avaliacaoToDelete?.funcionario || 'este funcionário'}</strong>?
              </p>
              <p style={{ marginTop: '12px', fontSize: '14px', color: '#666' }}>
                Esta ação não pode ser desfeita. Todas as respostas associadas a esta avaliação também serão excluídas.
              </p>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={handleCloseDeleteModal}
                disabled={deleting}
              >
                Não
              </button>
              <button 
                className="btn-danger" 
                onClick={handleConfirmDelete}
                disabled={deleting}
                style={{ 
                  backgroundColor: '#dc2626', 
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  opacity: deleting ? 0.6 : 1
                }}
              >
                {deleting ? 'Excluindo...' : (
                  <>
                    <DeleteIcon /> Sim, Excluir
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast para mensagens */}
      <Toast
        show={toast.show}
        onClose={hideToast}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        duration={5000}
      />
    </div>
  )
}

export default Avaliacao
