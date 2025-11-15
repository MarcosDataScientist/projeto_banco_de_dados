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
  
  const [toast, setToast] = useState({
    show: false,
    type: 'success',
    title: '',
    message: ''
  })
  
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [avaliacaoToView, setAvaliacaoToView] = useState(null)
  const [loadingAvaliacao, setLoadingAvaliacao] = useState(false)
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

  const handleViewClick = async (avaliacao) => {
    try {
      setLoadingAvaliacao(true)
      setIsViewModalOpen(true)
      
      // Carregar dados completos da avaliação
      const avaliacaoCompleta = await api.getAvaliacao(avaliacao.id)
      setAvaliacaoToView(avaliacaoCompleta)
    } catch (err) {
      console.error('Erro ao carregar avaliação:', err)
      showToast('error', 'Erro ao carregar avaliação', 'Não foi possível carregar os dados completos da avaliação.')
      setIsViewModalOpen(false)
      setAvaliacaoToView(null)
    } finally {
      setLoadingAvaliacao(false)
    }
  }

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false)
    setAvaliacaoToView(null)
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
        <p>Gerencie e acompanhe as avaliações de desligamento</p>
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
            <div className="items-list">
              {filteredAvaliacoes.map(avaliacao => (
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
                        {avaliacao.rating !== null && avaliacao.rating !== undefined && (
                          <span className="badge badge-default">
                            Nota: {avaliacao.rating}
                          </span>
                        )}
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
          )}
        </div>
      </div>

      {/* Modal de Visualização */}
      {isViewModalOpen && (
        <div className="modal-overlay" onClick={handleCloseViewModal}>
          <div className="modal-content" style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalhes da Avaliação</h2>
              <button 
                className="btn-close" 
                onClick={handleCloseViewModal}
                title="Fechar"
              >
                <XIcon />
              </button>
            </div>
            
            <div className="modal-body">
              {loadingAvaliacao ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div className="spinner" style={{ margin: '0 auto' }}></div>
                  <p style={{ marginTop: '16px', color: '#666' }}>Carregando dados da avaliação...</p>
                </div>
              ) : avaliacaoToView ? (
                <div>
                  {/* Informações Básicas */}
                  <div className="detail-section" style={{ marginBottom: '24px' }}>
                    <h3 style={{ marginBottom: '16px', color: '#333', fontSize: '18px', borderBottom: '2px solid #e0e0e0', paddingBottom: '8px' }}>
                      Informações Básicas
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px', fontWeight: '600' }}>
                          Funcionário Avaliado
                        </label>
                        <p style={{ margin: 0, fontSize: '14px', color: '#333', fontWeight: '500' }}>
                          {avaliacaoToView.funcionario || 'Não informado'}
                        </p>
                        {avaliacaoToView.funcionario_cpf && (
                          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>
                            CPF: {avaliacaoToView.funcionario_cpf}
                          </p>
                        )}
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px', fontWeight: '600' }}>
                          Avaliador
                        </label>
                        <p style={{ margin: 0, fontSize: '14px', color: '#333', fontWeight: '500' }}>
                          {avaliacaoToView.avaliador || 'Não informado'}
                        </p>
                        {avaliacaoToView.avaliador_cpf && (
                          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>
                            CPF: {avaliacaoToView.avaliador_cpf}
                          </p>
                        )}
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px', fontWeight: '600' }}>
                          Questionário
                        </label>
                        <p style={{ margin: 0, fontSize: '14px', color: '#333', fontWeight: '500' }}>
                          {avaliacaoToView.questionario || 'Não informado'}
                        </p>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px', fontWeight: '600' }}>
                          Data da Avaliação
                        </label>
                        <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>
                          {formatarData(avaliacaoToView.data_completa)}
                        </p>
                      </div>
                      {avaliacaoToView.local && (
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px', fontWeight: '600' }}>
                            Local
                          </label>
                          <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>
                            {avaliacaoToView.local}
                          </p>
                        </div>
                      )}
                      {avaliacaoToView.departamento && (
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px', fontWeight: '600' }}>
                            Departamento
                          </label>
                          <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>
                            {avaliacaoToView.departamento}
                          </p>
                        </div>
                      )}
                      {avaliacaoToView.rating !== null && avaliacaoToView.rating !== undefined && (
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px', fontWeight: '600' }}>
                            Nota Final
                          </label>
                          <p style={{ margin: 0, fontSize: '20px', color: '#333', fontWeight: 'bold' }}>
                            {avaliacaoToView.rating}
                          </p>
                        </div>
                      )}
                    </div>
                    {avaliacaoToView.descricao && (
                      <div style={{ marginTop: '16px' }}>
                        <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px', fontWeight: '600' }}>
                          Descrição
                        </label>
                        <p style={{ margin: 0, fontSize: '14px', color: '#333', lineHeight: '1.6', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                          {avaliacaoToView.descricao}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Respostas */}
                  {avaliacaoToView.respostas && avaliacaoToView.respostas.length > 0 ? (
                    <div className="detail-section">
                      <h3 style={{ marginBottom: '16px', color: '#333', fontSize: '18px', borderBottom: '2px solid #e0e0e0', paddingBottom: '8px' }}>
                        Respostas ({avaliacaoToView.respostas.length})
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {avaliacaoToView.respostas.map((resposta, index) => (
                          <div 
                            key={resposta.id || index} 
                            style={{ 
                              padding: '16px', 
                              backgroundColor: '#f8f9fa', 
                              borderRadius: '8px',
                              border: '1px solid #e0e0e0'
                            }}
                          >
                            <div style={{ marginBottom: '8px' }}>
                              <span style={{ 
                                fontSize: '12px', 
                                color: '#666', 
                                backgroundColor: '#fff',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontWeight: '600'
                              }}>
                                Pergunta {index + 1}
                              </span>
                              {resposta.tipo_pergunta && (
                                <span style={{ 
                                  fontSize: '11px', 
                                  color: '#999', 
                                  marginLeft: '8px',
                                  padding: '2px 6px',
                                  backgroundColor: '#e0e0e0',
                                  borderRadius: '3px'
                                }}>
                                  {resposta.tipo_pergunta}
                                </span>
                              )}
                            </div>
                            <p style={{ 
                              margin: '0 0 12px 0', 
                              fontSize: '14px', 
                              color: '#333', 
                              fontWeight: '500',
                              lineHeight: '1.5'
                            }}>
                              {resposta.pergunta || 'Pergunta não encontrada'}
                            </p>
                            <div style={{ 
                              padding: '12px', 
                              backgroundColor: '#fff', 
                              borderRadius: '6px',
                              border: '1px solid #ddd'
                            }}>
                              {resposta.tipo_resposta === 'Texto' && resposta.texto_resposta ? (
                                <p style={{ margin: 0, fontSize: '14px', color: '#333', lineHeight: '1.6' }}>
                                  {resposta.texto_resposta}
                                </p>
                              ) : resposta.tipo_resposta === 'Escolha' && resposta.escolha ? (
                                <p style={{ margin: 0, fontSize: '14px', color: '#333', fontWeight: '500' }}>
                                  {resposta.escolha}
                                </p>
                              ) : (
                                <p style={{ margin: 0, fontSize: '13px', color: '#999', fontStyle: 'italic' }}>
                                  Sem resposta
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ 
                      padding: '24px', 
                      textAlign: 'center', 
                      backgroundColor: '#f8f9fa', 
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0'
                    }}>
                      <p style={{ margin: 0, color: '#999', fontSize: '14px' }}>
                        Esta avaliação ainda não possui respostas cadastradas.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <p style={{ color: '#999' }}>Não foi possível carregar os dados da avaliação.</p>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={handleCloseViewModal}
              >
                <XIcon /> Fechar
              </button>
            </div>
          </div>
        </div>
      )}

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
