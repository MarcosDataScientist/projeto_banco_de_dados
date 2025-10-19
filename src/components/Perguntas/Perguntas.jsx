import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SearchIcon, PlusIcon, EditIcon, DeleteIcon, QuestionsIcon } from '../common/Icons'
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

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [perguntasData, categoriasData] = await Promise.all([
        api.getPerguntas(),
        api.getCategorias()
      ])
      
      setPerguntas(perguntasData)
      setCategorias(categoriasData)
    } catch (err) {
      console.error('Erro ao carregar perguntas:', err)
      setError('Não foi possível carregar as perguntas. Tente novamente mais tarde.')
    } finally {
      setLoading(false)
    }
  }

  const filteredPerguntas = perguntas.filter(pergunta => {
    const matchSearch = pergunta.texto_questao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (pergunta.tipo_questao && pergunta.tipo_questao.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchCategoria = !filtroCategoria || pergunta.categoria === filtroCategoria
    const matchTipo = !filtroTipo || pergunta.tipo_questao === filtroTipo
    const matchStatus = !filtroStatus || pergunta.status === filtroStatus

    return matchSearch && matchCategoria && matchTipo && matchStatus
  })

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
            onClick={() => alert('Página de cadastro de pergunta será implementada em breve!')}
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
      </div>
    </div>
  )
}

export default Perguntas
