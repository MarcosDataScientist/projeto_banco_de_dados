import React, { useState, useEffect, useRef } from 'react'
import { SearchIcon, PlusIcon, EditIcon, DeleteIcon, QuestionsIcon, EyeIcon, QuestionIcon, XIcon } from '../common/Icons'
import CadastrarPergunta from './CadastrarPergunta'
import EditarPergunta from './EditarPergunta'
import Toast from '../common/Toast'
import ConfirmModal from '../common/ConfirmModal'
import api from '../../services/api'

function Perguntas() {
  const [searchTerm, setSearchTerm] = useState('')
  const [perguntas, setPerguntas] = useState([])
  const [categorias, setCategorias] = useState([])
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isCadastroModalOpen, setIsCadastroModalOpen] = useState(false)
  const [isEditarModalOpen, setIsEditarModalOpen] = useState(false)
  const [isVisualizarModalOpen, setIsVisualizarModalOpen] = useState(false)
  const [perguntaToView, setPerguntaToView] = useState(null)
  const [perguntaToEdit, setPerguntaToEdit] = useState(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [perguntaToDelete, setPerguntaToDelete] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 10,
    total: 0,
    total_pages: 0,
    has_prev: false,
    has_next: false
  })
  
  // Estado do Toast
  const [toast, setToast] = useState({
    show: false,
    type: 'success',
    title: '',
    message: ''
  })

  const isInitialMount = useRef(true)
  const searchTimeoutRef = useRef(null)

  // Carregar dados inicialmente
  useEffect(() => {
    carregarDados()
    isInitialMount.current = false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Debounce para busca - apenas resetar página
  useEffect(() => {
    if (isInitialMount.current) {
      return
    }

    // Limpar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Resetar para página 1 quando buscar (isso vai disparar o useEffect de carregarDados)
    searchTimeoutRef.current = setTimeout(() => {
      if (pagination.page !== 1) {
        setPagination(prev => ({ ...prev, page: 1 }))
      } else {
        // Se já está na página 1, recarregar diretamente
        carregarDados()
      }
    }, 500)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm])

  // Carregar dados quando página ou filtros mudarem
  useEffect(() => {
    if (isInitialMount.current) {
      return
    }
    carregarDados()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, filtroTipo, filtroStatus])

  const carregarDados = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Preparar parâmetros de filtro
      const statusAtivo = filtroStatus === 'Ativo' ? true : filtroStatus === 'Inativo' ? false : null
      const tipoFiltro = filtroTipo || null
      const buscaTermo = searchTerm.trim() || null
      
      const [perguntasResponse, categoriasData] = await Promise.all([
        api.getPerguntas(null, statusAtivo, pagination.page, pagination.per_page, buscaTermo, tipoFiltro),
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

  const handleEditClick = async (pergunta) => {
    try {
      // Carregar dados completos da pergunta para verificar se tem respostas
      const perguntaData = await api.getPergunta(pergunta.cod_questao)
      setPerguntaToEdit(perguntaData)
      setIsEditarModalOpen(true)
    } catch (err) {
      console.error('Erro ao carregar pergunta:', err)
      showToast('error', 'Erro', 'Não foi possível carregar os dados da pergunta.')
    }
  }

  const handleCloseEditModal = () => {
    setIsEditarModalOpen(false)
    setPerguntaToEdit(null)
  }

  const handleEditSuccess = () => {
    carregarDados()
    showToast('success', 'Pergunta atualizada!', 'A pergunta foi atualizada com sucesso.')
  }

  // Perguntas já vêm filtradas do backend
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

  const handleDeleteClick = (pergunta) => {
    setPerguntaToDelete(pergunta)
    setIsDeleteModalOpen(true)
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setPerguntaToDelete(null)
  }

  const handleConfirmDelete = async () => {
    if (!perguntaToDelete) return

    try {
      await api.deletarPergunta(perguntaToDelete.cod_questao)
      setPerguntas(perguntas.filter(p => p.cod_questao !== perguntaToDelete.cod_questao))
      showToast(
        'success',
        'Pergunta excluída!',
        'A pergunta foi excluída com sucesso.'
      )
      // Recarregar dados para atualizar a paginação
      carregarDados()
      handleCloseDeleteModal()
    } catch (err) {
      console.error('Erro ao deletar pergunta:', err)
      
      // Extrair mensagem de erro do backend
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao excluir pergunta'
      
      // Verificar se é erro de associação a formulários ou respostas
      if (errorMessage.includes('formulário') || errorMessage.includes('formularios')) {
        showToast(
          'error',
          'Não é possível excluir',
          errorMessage
        )
      } else if (errorMessage.includes('resposta') || errorMessage.includes('avaliação')) {
        showToast(
          'error',
          'Não é possível excluir',
          errorMessage
        )
      } else {
        showToast(
          'error',
          'Erro ao excluir pergunta',
          errorMessage
        )
      }
      
      handleCloseDeleteModal()
    }
  }

  // Obter texto da pergunta para exibir no modal
  const getPerguntaText = () => {
    if (!perguntaToDelete) return ''
    const texto = perguntaToDelete.texto_questao || perguntaToDelete.texto || ''
    // Limitar a 100 caracteres para não ficar muito longo
    return texto.length > 100 ? texto.substring(0, 100) + '...' : texto
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

      <div className="dashboard-layout">
        {/* Sidebar de Estatísticas - mesmo estilo das outras telas */}
        <div className="stats-sidebar">
          <div className="stats-box">
            <h3>Estatísticas</h3>
            <div className="stats-list">
              <div className="stat-row">
                <span className="stat-label">Total de Perguntas</span>
                <span className="stat-number">{totalPerguntas}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Perguntas Ativas</span>
                <span className="stat-number">{ativas}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Categorias</span>
                <span className="stat-number">{totalCategorias}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Tipos de Questão</span>
                <span className="stat-number">{tiposUnicos.size}</span>
              </div>
            </div>
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
                      onClick={() => handleEditClick(pergunta)}
                      title={(pergunta.total_respostas || 0) > 0 ? 'Não é possível editar: pergunta possui respostas vinculadas' : 'Editar'}
                      disabled={(pergunta.total_respostas || 0) > 0}
                    >
                      <EditIcon />
                    </button>
                    <button 
                      className="btn-action btn-delete"
                      onClick={() => handleDeleteClick(pergunta)}
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

          <EditarPergunta
            isOpen={isEditarModalOpen}
            onClose={handleCloseEditModal}
            onSuccess={handleEditSuccess}
            perguntaId={perguntaToEdit?.cod_questao}
          />

          <Toast
            show={toast.show}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={closeToast}
            duration={6000}
          />

          {/* Modal de Confirmação de Exclusão */}
          <ConfirmModal
            isOpen={isDeleteModalOpen}
            onClose={handleCloseDeleteModal}
            onConfirm={handleConfirmDelete}
            title="Excluir Pergunta"
            message={
              perguntaToDelete ? (
                <>
                  Tem certeza que deseja excluir esta pergunta?
                  <br /><br />
                  <strong>Pergunta:</strong> {getPerguntaText()}
                  <br />
                  <strong>Tipo:</strong> {perguntaToDelete.tipo_questao || perguntaToDelete.tipo || 'N/A'}
                  <br />
                  <strong>Status:</strong> {perguntaToDelete.status || 'N/A'}
                  {(perguntaToDelete.total_respostas || 0) > 0 && (
                    <>
                      <br />
                      <br />
                      <span style={{ color: '#dc2626', fontWeight: 'bold' }}>
                        ⚠️ Atenção: Esta pergunta possui {perguntaToDelete.total_respostas} resposta(s) vinculada(s).
                        Ao excluir, todas as respostas relacionadas também serão removidas.
                      </span>
                    </>
                  )}
                  <br /><br />
                  <span style={{ color: '#dc2626' }}>
                    Esta ação não pode ser desfeita.
                  </span>
                </>
              ) : (
                'Tem certeza que deseja excluir esta pergunta?'
              )
            }
            confirmText="Sim, Excluir"
            cancelText="Cancelar"
          />

          {/* Modal de Visualização */}
          {isVisualizarModalOpen && perguntaToView && (
            <div className="modal-overlay">
              <div className="modal-container">
                <div className="modal-header">
                  <h2 className="modal-title">
                    <QuestionIcon /> Detalhes da Pergunta
                  </h2>
                  <button 
                    className="modal-close" 
                    onClick={handleCloseViewModal}
                    title="Fechar"
                  >
                    <XIcon />
                  </button>
                </div>
                
                <div className="modal-body">
                  <div className="pergunta-details">
                    {/* Informações Básicas */}
                    <div className="detail-section info-basicas">
                      <h3>
                        <QuestionIcon /> Informações Básicas
                      </h3>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <label>ID da Pergunta</label>
                          <span className="detail-value">#{perguntaToView.cod_questao}</span>
                        </div>
                        <div className="detail-item">
                          <label>Status</label>
                          <span className={`badge ${perguntaToView.status === 'Ativo' ? 'badge-ativo' : 'badge-inativo'}`}>
                            {perguntaToView.status}
                          </span>
                        </div>
                        <div className="detail-item">
                          <label>Tipo de Pergunta</label>
                          <span className={`badge ${getTipoBadgeColor(perguntaToView.tipo_questao)}`}>
                            {perguntaToView.tipo_questao}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Texto da Pergunta */}
                    <div className="detail-section texto-pergunta">
                      <h3>
                        <QuestionIcon /> Texto da Pergunta
                      </h3>
                      <div className="pergunta-texto-box">
                        <p className="pergunta-texto-content">{perguntaToView.texto_questao}</p>
                      </div>
                    </div>

                    {/* Opções de Resposta */}
                    {perguntaToView.tipo_questao === 'Múltipla Escolha' && perguntaToView.opcoes && perguntaToView.opcoes.length > 0 && (
                      <div className="detail-section opcoes-resposta">
                        <h3>
                          <QuestionIcon /> Opções de Resposta
                        </h3>
                        <div className="opcoes-list-view">
                          {perguntaToView.opcoes.map((opcao, index) => (
                            <div key={index} className="opcao-item-view">
                              <div className="opcao-number-view">{index + 1}</div>
                              <div className="opcao-text-view">{opcao}</div>
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
    </div>
  )
}

export default Perguntas
