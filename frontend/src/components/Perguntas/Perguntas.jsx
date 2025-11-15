import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SearchIcon, PlusIcon, EditIcon, DeleteIcon, QuestionsIcon, EyeIcon } from '../common/Icons'
import CadastrarPergunta from './CadastrarPergunta'
import api from '../../services/api'

function Perguntas() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [perguntas, setPerguntas] = useState([])
  const [categorias, setCategorias] = useState([])
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isCadastroModalOpen, setIsCadastroModalOpen] = useState(false)
  const [isVisualizarModalOpen, setIsVisualizarModalOpen] = useState(false)
  const [perguntaToView, setPerguntaToView] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 10,
    total: 0,
    total_pages: 0,
    has_prev: false,
    has_next: false
  })

  useEffect(() => {
    carregarDados()
  }, [pagination.page])

  const carregarDados = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [perguntasResponse, categoriasData] = await Promise.all([
        api.getPerguntas(null, null, pagination.page, pagination.per_page),
        api.getCategorias()
      ])
      
      if (perguntasResponse.perguntas && perguntasResponse.pagination) {
        setPerguntas(perguntasResponse.perguntas)
        setPagination(perguntasResponse.pagination)
      } else {
        // Fallback para resposta sem paginação
        setPerguntas(perguntasResponse)
      }
      setCategorias(categoriasData)
    } catch (err) {
      console.error('Erro ao carregar perguntas:', err)
      setError('Não foi possível carregar as perguntas. Tente novamente mais tarde.')
    } finally {
      setLoading(false)
    }
  }

  const handleCadastroSuccess = () => {
    // Recarregar a lista de perguntas após cadastro
    carregarDados()
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }))
  }

  const handleViewClick = (pergunta) => {
    setPerguntaToView(pergunta)
    setIsVisualizarModalOpen(true)
  }

  const handleCloseViewModal = () => {
    setIsVisualizarModalOpen(false)
    setPerguntaToView(null)
  }

  // Usar perguntas diretamente, filtros serão implementados no backend futuramente
  const filteredPerguntas = perguntas

  const getTipoBadgeColor = (tipo) => {
    switch (tipo) {
      case 'Escala': return 'badge-escala'
      case 'Múltipla Escolha': return 'badge-multipla'
      case 'Sim/Não': return 'badge-simnao'
      case 'Texto Livre': return 'badge-texto'
      default: return 'badge-default'
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta pergunta?')) return

    try {
      await api.deletarPergunta(id)
      setPerguntas(perguntas.filter(p => p.cod_questao !== id))
    } catch (err) {
      console.error('Erro ao deletar pergunta:', err)
      alert('Erro ao excluir pergunta. Tente novamente.')
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando perguntas...</p>
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
          <button onClick={carregarDados} className="btn-primary">Tentar novamente</button>
        </div>
      </div>
    )
  }

  const totalPerguntas = perguntas.length
  const ativas = perguntas.filter(p => p.status === 'Ativo').length
  const totalCategorias = new Set(perguntas.map(p => p.categoria)).size
  const tiposUnicos = new Set(perguntas.map(p => p.tipo_questao))

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Listagem perguntas</h2>
      </div>

      <div className="stats-row">
        <div className="stat-item">
          <span className="stat-number">{totalPerguntas}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{ativas}</span>
          <span className="stat-label">Ativas</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{totalCategorias}</span>
          <span className="stat-label">Categorias</span>
        </div>
      </div>

      <div className="list-container">
        <div className="search-section">
          <div className="search-bar">
            <span className="search-icon"><SearchIcon /></span>
            <input
              type="text"
              placeholder="Buscar por texto ou tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button 
            className="btn-primary"
            onClick={() => setIsCadastroModalOpen(true)}
          >
            <PlusIcon /> Nova Pergunta
          </button>
        </div>
        
        <div className="filter-section-row">
          <span className="filter-label">Filtrar por:</span>
          <select 
            className="filter-select" 
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
          >
            <option value="">Todos os Tipos</option>
            {Array.from(tiposUnicos).map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
          <select 
            className="filter-select"
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
          >
            <option value="">Todos os Status</option>
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
          </select>
        </div>

        {filteredPerguntas.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon"><QuestionsIcon /></span>
            <h3>Nenhuma pergunta encontrada</h3>
            <p>{searchTerm ? 'Tente ajustar os termos de busca' : 'Cadastre sua primeira pergunta para começar'}</p>
          </div>
        ) : (
          <div className="items-list">
            {filteredPerguntas.map(pergunta => (
              <div key={pergunta.cod_questao} className="list-item">
                <div className="item-main">
                  <div className="item-header">
                    <h4 className="item-title">{pergunta.texto_questao}</h4>
                    <div className="item-badges">
                      <span className={`badge ${getTipoBadgeColor(pergunta.tipo_questao)}`}>
                        {pergunta.tipo_questao}
                      </span>
                      <span className={`badge ${pergunta.status === 'Ativo' ? 'badge-ativo' : 'badge-inativo'}`}>
                        {pergunta.status}
                      </span>
                    </div>
                  </div>
                  <div className="item-meta">
                    <span className="item-date">ID: {pergunta.cod_questao}</span>
                  </div>
                </div>
                <div className="item-actions">
                  <button 
                    className="btn-action btn-view"
                    onClick={() => handleViewClick(pergunta)}
                    title="Visualizar"
                  >
                    <EyeIcon />
                  </button>
                  <button 
                    className="btn-action btn-edit"
                    onClick={() => navigate(`/perguntas/editar/${pergunta.cod_questao}`)}
                    title="Editar"
                  >
                    <EditIcon />
                  </button>
                  <button 
                    className="btn-action btn-delete"
                    onClick={() => handleDelete(pergunta.cod_questao)}
                    title="Excluir"
                  >
                    <DeleteIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginação */}
        {pagination.total > 0 && (
          <div className="pagination-container">
            <div className="pagination-info">
              <span>
                Mostrando {((pagination.page - 1) * pagination.per_page) + 1} a {Math.min(pagination.page * pagination.per_page, pagination.total)} de {pagination.total} perguntas
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

        <CadastrarPergunta
          isOpen={isCadastroModalOpen}
          onClose={() => setIsCadastroModalOpen(false)}
          onSuccess={handleCadastroSuccess}
        />

        {/* Modal de Visualização */}
        {isVisualizarModalOpen && perguntaToView && (
          <div className="modal-overlay">
            <div className="modal-content pergunta-modal">
              <div className="modal-header">
                <h2>Detalhes da Pergunta</h2>
                <button 
                  className="btn-close" 
                  onClick={handleCloseViewModal}
                  title="Fechar"
                >
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                <div className="pergunta-details">
                  <div className="detail-section">
                    <h3>Informações Básicas</h3>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <label>ID:</label>
                        <span>{perguntaToView.cod_questao}</span>
                      </div>
                      <div className="detail-item">
                        <label>Status:</label>
                        <span className={`badge ${perguntaToView.status === 'Ativo' ? 'badge-ativo' : 'badge-inativo'}`}>
                          {perguntaToView.status}
                        </span>
                      </div>
                      <div className="detail-item">
                        <label>Tipo:</label>
                        <span className={`badge ${getTipoBadgeColor(perguntaToView.tipo_questao)}`}>
                          {perguntaToView.tipo_questao}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h3>Texto da Pergunta</h3>
                    <div className="pergunta-texto">
                      <p>{perguntaToView.texto_questao}</p>
                    </div>
                  </div>

                  {perguntaToView.tipo_questao === 'Múltipla Escolha' && perguntaToView.opcoes && perguntaToView.opcoes.length > 0 && (
                    <div className="detail-section">
                      <h3>Opções de Resposta</h3>
                      <div className="opcoes-list">
                        {perguntaToView.opcoes.map((opcao, index) => (
                          <div key={index} className="opcao-item">
                            <span className="opcao-number">{index + 1}.</span>
                            <span className="opcao-text">{opcao}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
    </div>
  )
}

export default Perguntas
