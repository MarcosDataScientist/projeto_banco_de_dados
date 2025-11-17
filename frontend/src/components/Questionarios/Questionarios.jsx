import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SearchIcon, PlusIcon, EyeIcon, FormsIcon, DeleteIcon, EditIcon } from '../common/Icons'
import ConfirmDeleteQuestionario from './ConfirmDeleteQuestionario'
import Toast from '../common/Toast'
import api from '../../services/api'

function Formularios() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [formularios, setFormularios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [questionarioToDelete, setQuestionarioToDelete] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 10,
    total: 0,
    total_pages: 0
  })
  
  // Estado do Toast
  const [toast, setToast] = useState({
    show: false,
    type: 'success',
    title: '',
    message: ''
  })

  // Carregar questionários do banco de dados
  useEffect(() => {
    carregarQuestionarios()
  }, [])

  // Detectar parâmetros de sucesso na URL
  useEffect(() => {
    const success = searchParams.get('success')
    const nome = searchParams.get('nome')
    
    if (success === 'created' && nome) {
      showToast(
        'success',
        'Questionário criado com sucesso!',
        `O questionário "${decodeURIComponent(nome)}" foi criado e está pronto para uso.`
      )
      // Limpar parâmetros da URL
      setSearchParams({})
    } else if (success === 'updated' && nome) {
      showToast(
        'success',
        'Questionário atualizado com sucesso!',
        `O questionário "${decodeURIComponent(nome)}" foi atualizado.`
      )
      // Limpar parâmetros da URL
      setSearchParams({})
      // Recarregar lista
      carregarQuestionarios()
    }
  }, [searchParams, setSearchParams])

  const carregarQuestionarios = async () => {
    try {
      setLoading(true)
      setError(null)
      const dados = await api.getQuestionarios()
      setFormularios(dados)
    } catch (err) {
      console.error('Erro ao carregar questionários:', err)
      setError('Erro ao carregar questionários. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleViewClick = (formulario) => {
    navigate(`/questionarios/editar/${formulario.id}?view=true`)
  }

  const handleDeleteClick = (formulario) => {
    setQuestionarioToDelete(formulario)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (questionarioToDelete) {
      try {
        const resultado = await api.deletarQuestionario(questionarioToDelete.id)
        console.log('Questionário deletado:', resultado)
        
        // Atualizar a lista removendo o questionário deletado
        setFormularios(formularios.filter(f => f.id !== questionarioToDelete.id))
        
        // Fechar modal
        setIsDeleteModalOpen(false)
        setQuestionarioToDelete(null)
        
        // Mostrar mensagem de sucesso
        const stats = resultado.detalhes?.estatisticas
        const mensagem = stats 
          ? `O questionário e seus vínculos foram removidos.`
          : 'O questionário foi removido com sucesso.'
        
        setToast({
          show: true,
          type: 'success',
          title: 'Questionário excluído com sucesso!',
          message: mensagem
        })
      } catch (err) {
        console.error('Erro ao deletar questionário:', err)
        
        // Extrair mensagem de erro do backend
        const errorMessage = err.response?.data?.error || err.message || 'Não foi possível excluir o questionário. Tente novamente.'
        
        // Fechar modal mesmo em caso de erro
        setIsDeleteModalOpen(false)
        
        // Mostrar mensagem de erro
        setToast({
          show: true,
          type: 'error',
          title: 'Não é possível excluir',
          message: errorMessage
        })
      }
    }
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setQuestionarioToDelete(null)
  }


  const showToast = (type, title, message) => {
    setToast({
      show: true,
      type,
      title,
      message
    })
  }

  const closeToast = () => {
    setToast(prev => ({ ...prev, show: false }))
  }

  const filteredFormularios = formularios.filter(formulario => {
    const searchLower = searchTerm.toLowerCase()
    return (
      formulario.titulo?.toLowerCase().includes(searchLower) ||
      formulario.tipo?.toLowerCase().includes(searchLower) ||
      formulario.status?.toLowerCase().includes(searchLower) ||
      formulario.classificacao?.toLowerCase().includes(searchLower)
    )
  })

  // Calcular paginação
  const totalItems = filteredFormularios.length
  const totalPages = Math.ceil(totalItems / pagination.per_page)
  const startIndex = (pagination.page - 1) * pagination.per_page
  const endIndex = startIndex + pagination.per_page
  const paginatedFormularios = filteredFormularios.slice(startIndex, endIndex)

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

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Ativo': return 'badge-ativo'
      case 'Rascunho': return 'badge-rascunho'
      case 'Inativo': return 'badge-inativo'
      case 'Arquivado': return 'badge-arquivado'
      default: return 'badge-default'
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h2>Listagem questionários</h2>
        </div>
        <div className="empty-state">
          <p>Carregando questionários...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h2>Listagem questionários</h2>
        </div>
        <div className="empty-state">
          <p style={{ color: 'red' }}>{error}</p>
          <button className="btn-primary" onClick={carregarQuestionarios}>
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Listagem questionários</h2>
      </div>

      <div className="dashboard-layout">
        {/* Box de Stats na Lateral Esquerda */}
        <div className="stats-sidebar">
          <div className="stats-box">
            <h3>Estatísticas</h3>
            <div className="stats-list">
              <div className="stat-row">
                <span className="stat-label">Total de Questionários</span>
                <span className="stat-number">{formularios.length}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Questionários Ativos</span>
                <span className="stat-number">{formularios.filter(f => f.status === 'Ativo').length}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Total de Aplicações</span>
                <span className="stat-number">{formularios.reduce((acc, f) => acc + (f.total_aplicacoes || 0), 0)}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Total de Perguntas</span>
                <span className="stat-number">{formularios.reduce((acc, f) => acc + (f.total_perguntas || 0), 0)}</span>
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
              placeholder="Buscar por título, descrição ou status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="btn-primary" onClick={() => navigate('/questionarios/novo')}>
            <PlusIcon /> Novo Questionário
          </button>
        </div>
        {filteredFormularios.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon"><FormsIcon /></span>
            <h3>Nenhum formulário encontrado</h3>
            <p>{searchTerm ? 'Tente ajustar os termos de busca' : 'Crie seu primeiro formulário para começar'}</p>
          </div>
        ) : (
          <>
            <div className="items-list">
              {paginatedFormularios.map(formulario => (
              <div key={formulario.id} className="list-item">
                <div className="item-main">
                  <div className="item-header">
                    <h4 className="item-title">{formulario.titulo}</h4>
                    <div className="item-badges">
                      <span className={`badge ${getStatusBadgeColor(formulario.status)}`}>
                        {formulario.status}
                      </span>
                      {formulario.tipo && (
                        <span className="badge badge-default">
                          {formulario.tipo}
                        </span>
                      )}
                    </div>
                  </div>
                  {formulario.classificacao && (
                    <p className="item-description">Classificação: {formulario.classificacao}</p>
                  )}
                  <div className="item-stats">
                    <div className="stat-mini">
                      <span className="stat-mini-number">{formulario.total_perguntas || 0}</span>
                      <span className="stat-mini-label">Perguntas</span>
                    </div>
                    <div className="stat-mini">
                      <span className="stat-mini-number">{formulario.total_aplicacoes || 0}</span>
                      <span className="stat-mini-label">Aplicações</span>
                    </div>
                  </div>
                </div>
                <div className="item-actions">
                  <button 
                    className="btn-action btn-preview" 
                    title="Visualizar questionário"
                    onClick={() => handleViewClick(formulario)}
                  >
                    <EyeIcon />
                  </button>
                  <button 
                    className="btn-action btn-edit" 
                    title={(formulario.total_aplicacoes || 0) > 0 ? 'Não é possível editar: questionário possui aplicações vinculadas' : 'Editar questionário'}
                    onClick={() => navigate(`/questionarios/editar/${formulario.id}`)}
                    disabled={(formulario.total_aplicacoes || 0) > 0}
                  >
                    <EditIcon />
                  </button>
                  <button 
                    className="btn-action btn-delete"
                    onClick={() => handleDeleteClick(formulario)}
                    title="Excluir questionário"
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
                    Mostrando {startIndex + 1} a {Math.min(endIndex, totalItems)} de {totalItems} questionários
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

      <ConfirmDeleteQuestionario
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        questionario={questionarioToDelete}
      />

      <Toast
        show={toast.show}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={closeToast}
        duration={5000}
      />
    </div>
  )
}

export default Formularios
