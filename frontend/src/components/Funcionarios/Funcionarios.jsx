import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { SearchIcon, PlusIcon, DeleteIcon, CalendarIcon, UsersIcon, EyeIcon } from '../common/Icons'
import ConfirmModal from '../common/ConfirmModal'
import Toast from '../common/Toast'
import CadastrarFuncionario from './CadastrarFuncionario'
import api from '../../services/api'

function Funcionarios() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const searchTimeoutRef = useRef(null)
  const isSearchingRef = useRef(false)
  const hasLoadedRef = useRef(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCadastroModalOpen, setIsCadastroModalOpen] = useState(false)
  const [funcionarioToDelete, setFuncionarioToDelete] = useState(null)
  const [funcionarios, setFuncionarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalGlobal, setTotalGlobal] = useState(0)
  const [totalAtivo, setTotalAtivo] = useState(0)
  const [totalInativo, setTotalInativo] = useState(0)
  const [totalProcesso, setTotalProcesso] = useState(0)
  const [toast, setToast] = useState({
    show: false,
    type: 'success',
    title: '',
    message: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    total_pages: 0,
    has_prev: false,
    has_next: false
  })

  // Carregar dados iniciais apenas uma vez
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true
      carregarFuncionarios(pagination.page, pagination.per_page, searchTerm)
      carregarTotalGlobal()
    }
  }, [])

  // Carregar estatísticas gerais
  const carregarTotalGlobal = async () => {
    try {
      const response = await api.getEstatisticasFuncionarios()
      console.log('Resposta das estatísticas:', response)
      setTotalGlobal(response.total_geral ?? 0)
      setTotalAtivo(response.total_ativo ?? 0)
      setTotalInativo(response.total_inativo ?? 0)
      setTotalProcesso(response.total_processo ?? 0)
      console.log('Estatísticas definidas:', { 
        total_geral: response.total_geral, 
        total_ativo: response.total_ativo,
        total_inativo: response.total_inativo,
        total_processo: response.total_processo 
      })
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err)
      // Fallback: tentar buscar apenas o total geral
      try {
        const totalResponse = await api.getTotalFuncionarios()
        const total = totalResponse.total ?? totalResponse ?? 0
        setTotalGlobal(total)
      } catch (fallbackErr) {
        console.error('Erro ao carregar total geral:', fallbackErr)
        setTotalGlobal(0)
      }
      setTotalAtivo(0)
      setTotalInativo(0)
      setTotalProcesso(0)
    }
  }

  // Carregar quando a página muda (navegação de páginas) - mas não durante busca
  useEffect(() => {
    // Não executar se:
    // - Ainda não carregou inicialmente
    // - Está em uma busca ativa
    // - Há busca pendente
    if (hasLoadedRef.current && !isSearchingRef.current && !searchTimeoutRef.current) {
      carregarFuncionarios(pagination.page, pagination.per_page, searchTerm)
    }
  }, [pagination.page])

  // Busca com debounce - apenas quando o searchTerm muda
  useEffect(() => {
    // Não fazer nada na primeira renderização (já foi carregado acima)
    if (!hasLoadedRef.current) {
      return
    }

    // Limpar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
      searchTimeoutRef.current = null
    }

    // Criar novo timeout para busca
    searchTimeoutRef.current = setTimeout(() => {
      // Marcar que estamos buscando
      isSearchingRef.current = true
      // Buscar sempre na página 1
      const pageToLoad = 1
      carregarFuncionarios(pageToLoad, pagination.per_page, searchTerm, true).finally(() => {
        // Desmarcar após busca completar
        setTimeout(() => {
          isSearchingRef.current = false
          searchTimeoutRef.current = null
        }, 100)
      })
    }, 500)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
        searchTimeoutRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm])

  const carregarFuncionarios = async (page = pagination.page, perPage = pagination.per_page, termo = searchTerm, updatePage = false) => {
    try {
      setLoading(true)
      setError(null)
      const queryTerm = termo?.trim() ? termo.trim() : null
      const response = await api.getFuncionarios(null, null, page, perPage, queryTerm)
      
      // Validar se response existe e tem a estrutura esperada
      if (!response) {
        throw new Error('Resposta vazia da API')
      }
      
      if (response.funcionarios && response.pagination) {
        setFuncionarios(response.funcionarios || [])
        
        // Se updatePage for true, é uma busca - atualizar sem disparar useEffect
        if (updatePage) {
          // Temporariamente desabilitar verificação para evitar loop
          isSearchingRef.current = true
          setPagination(prev => {
            const newPagination = {
              ...response.pagination,
              per_page: response.pagination.per_page ?? prev.per_page,
              page: 1
            }
            // Aguardar um pouco antes de permitir navegação novamente
            setTimeout(() => {
              isSearchingRef.current = false
            }, 200)
            return newPagination
          })
        } else {
          // Atualização normal (navegação de páginas)
          setPagination(prev => ({
            ...response.pagination,
            per_page: response.pagination.per_page ?? prev.per_page
          }))
        }
      } else if (Array.isArray(response)) {
        // Fallback para resposta sem paginação (array direto)
        setFuncionarios(response)
        setPagination(prev => ({
          ...prev,
          page,
          per_page: perPage,
          total: response.length,
          total_pages: 1,
          has_prev: false,
          has_next: false
        }))
      } else {
        // Resposta inesperada
        console.warn('Resposta da API com estrutura inesperada:', response)
        throw new Error('Estrutura de resposta inválida da API')
      }
    } catch (err) {
      console.error('Erro ao carregar funcionários:', err)
      const errorMessage = err.response?.data?.error || err.message || 'Não foi possível carregar os funcionários. Tente novamente mais tarde.'
      setError(errorMessage)
      setFuncionarios([]) // Limpar lista em caso de erro
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
    if (!status) return 'badge-default'

    switch (status.toLowerCase()) {
      case 'ativo': return 'badge-ativo'
      case 'inativo': return 'badge-inativo'
      case 'processo de saída': return 'badge-rascunho'
      case 'desligado': return 'badge-inativo'
      default: return 'badge-default'
    }
  }

  const handleSearchChange = (event) => {
    const { value } = event.target
    setSearchTerm(value)
    // Não resetar página aqui - será feito no useEffect da busca
  }

  const handleDeleteClick = (funcionario) => {
    setFuncionarioToDelete(funcionario)
    setIsModalOpen(true)
  }

  const showToast = (type, title, message = '') => {
    setToast({ show: true, type, title, message })
  }

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }))
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
        
        // Atualizar total global
        carregarTotalGlobal()
        
        // Mostrar Toast de sucesso
        showToast('success', 'Funcionário excluído!', 'O funcionário foi removido com sucesso.')
      } catch (err) {
        console.error('Erro ao deletar funcionário:', err)
        console.error('Detalhes do erro:', err.response)
        
        // Verificar se é erro de validação (funcionário com avaliações)
        if (err.response && err.response.status === 400) {
          const errorData = err.response.data
          showToast('error', 'Não é possível excluir', errorData.error || 'Este funcionário possui avaliações associadas.')
        } else {
          showToast('error', 'Erro ao excluir', 'Não foi possível excluir o funcionário. Tente novamente.')
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

  const handleCadastroSuccess = () => {
    // Recarregar a lista de funcionários após cadastro
    carregarFuncionarios()
    carregarTotalGlobal()
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

      <div className="dashboard-layout">
        {/* Sidebar de Estatísticas - mesmo estilo das outras telas */}
        <div className="stats-sidebar">
          {/* Estatísticas Globais Destacadas */}
          <div className="stats-box" style={{ marginBottom: '20px' }}>
            <h3>Estatísticas Gerais do Sistema</h3>
            <div className="stats-list">
              <div className="stat-row">
                <span className="stat-label">Total Geral</span>
                <span className="stat-number">{totalGlobal}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Total Ativo</span>
                <span className="stat-number">{totalAtivo}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Total Inativo</span>
                <span className="stat-number">{totalInativo}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Em Processo</span>
                <span className="stat-number">{totalProcesso}</span>
              </div>
            </div>
            <div style={{
              marginTop: '16px',
              padding: '10px 12px',
              background: '#f8fafc',
              borderRadius: '6px',
              textAlign: 'center',
              fontSize: '11px',
              color: '#6b7280',
              fontStyle: 'italic',
              border: '1px solid #e2e8f0'
            }}>
              ℹ️ Todas as contagens são referentes ao total de funcionários cadastrados no sistema (independente de filtros ou paginação)
            </div>
          </div>

          <div className="stats-box">
            <h3>Estatísticas da View</h3>
            <div className="stats-list">
              <div className="stat-row">
                <span className="stat-label">Total</span>
                <span className="stat-number">{totalFuncionarios}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Em Processo</span>
                <span className="stat-number">{emProcesso}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Ativos</span>
                <span className="stat-number">{ativos}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Departamentos</span>
                <span className="stat-number">{departamentos}</span>
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
              placeholder="Buscar por nome, cargo, departamento ou status..."
              value={searchTerm}
              onChange={handleSearchChange}
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
                      className="btn-action btn-preview" 
                      onClick={() => navigate(`/funcionarios/visualizar/${funcionario.cpf}`)}
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

      {/* Toast para mensagens de sucesso/erro */}
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

export default Funcionarios
