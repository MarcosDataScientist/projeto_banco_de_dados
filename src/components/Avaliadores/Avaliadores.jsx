import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SearchIcon, PlusIcon, EditIcon, DeleteIcon, UserIcon, EyeIcon } from '../common/Icons'
import api from '../../services/api'

function Avaliadores() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [avaliadores, setAvaliadores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    carregarAvaliadores()
  }, [])

  const carregarAvaliadores = async () => {
    try {
      setLoading(true)
      setError(null)
      const dados = await api.getAvaliadores()
      setAvaliadores(dados)
    } catch (err) {
      console.error('Erro ao carregar avaliadores:', err)
      setError('Erro ao carregar avaliadores. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleViewClick = (avaliador) => {
    console.log('Visualizar avaliador:', avaliador)
  }

  const handleEditClick = (avaliador) => {
    console.log('Editar avaliador:', avaliador)
  }

  const handleDeleteClick = (avaliador) => {
    console.log('Deletar avaliador:', avaliador)
  }

  const filteredAvaliadores = avaliadores.filter(avaliador => {
    const searchLower = searchTerm.toLowerCase()
    return (
      avaliador.nome?.toLowerCase().includes(searchLower) ||
      avaliador.email?.toLowerCase().includes(searchLower) ||
      avaliador.setor?.toLowerCase().includes(searchLower) ||
      avaliador.status?.toLowerCase().includes(searchLower)
    )
  })

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Ativo': return 'badge-ativo'
      case 'Inativo': return 'badge-inativo'
      case 'Pendente': return 'badge-rascunho'
      default: return 'badge-default'
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h2>Listagem avaliadores</h2>
        </div>
        <div className="empty-state">
          <p>Carregando avaliadores...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h2>Listagem avaliadores</h2>
        </div>
        <div className="empty-state">
          <p style={{ color: 'red' }}>{error}</p>
          <button className="btn-primary" onClick={carregarAvaliadores}>
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Listagem avaliadores</h2>
      </div>

      <div className="dashboard-layout">
        {/* Box de Stats na Lateral Esquerda */}
        <div className="stats-sidebar">
          <div className="stats-box">
            <h3>Estatísticas</h3>
            <div className="stats-list">
              <div className="stat-row">
                <span className="stat-label">Total de Avaliadores</span>
                <span className="stat-number">{avaliadores.length}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Avaliadores Ativos</span>
                <span className="stat-number">{avaliadores.filter(a => a.status === 'Ativo').length}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Total de Certificados</span>
                <span className="stat-number">{avaliadores.reduce((acc, a) => acc + (a.total_certificados || 0), 0)}</span>
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
              placeholder="Buscar por nome, email ou setor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="btn-primary" onClick={() => navigate('/avaliadores/novo')}>
            <PlusIcon /> Novo Avaliador
          </button>
        </div>

        {filteredAvaliadores.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon"><UserIcon /></span>
            <h3>Nenhum avaliador encontrado</h3>
            <p>{searchTerm ? 'Tente ajustar os termos de busca' : 'Adicione seu primeiro avaliador para começar'}</p>
          </div>
        ) : (
          <div className="items-list">
            {filteredAvaliadores.map(avaliador => (
              <div key={avaliador.id} className="list-item">
                <div className="item-main">
                  <div className="item-header">
                    <h4 className="item-title">{avaliador.nome}</h4>
                    <div className="item-badges">
                      <span className={`badge ${getStatusBadgeColor(avaliador.status)}`}>
                        {avaliador.status}
                      </span>
                    </div>
                  </div>
                  <div className="item-description">
                    <p><strong>Email:</strong> {avaliador.email}</p>
                    <p><strong>Setor:</strong> {avaliador.setor}</p>
                    <p><strong>CPF:</strong> {avaliador.cpf}</p>
                  </div>
                  <div className="item-stats">
                    <div className="stat-mini">
                      <span className="stat-mini-number">{avaliador.total_certificados || 0}</span>
                      <span className="stat-mini-label">Certificados</span>
                    </div>
                    <div className="stat-mini">
                      <span className="stat-mini-number">{avaliador.treinamentos_unicos || 0}</span>
                      <span className="stat-mini-label">Treinamentos</span>
                    </div>
                  </div>
                </div>
                <div className="item-actions">
                  <button 
                    className="btn-action btn-preview" 
                    title="Visualizar avaliador"
                    onClick={() => handleViewClick(avaliador)}
                  >
                    <EyeIcon />
                  </button>
                  <button 
                    className="btn-action btn-edit"
                    onClick={() => handleEditClick(avaliador)}
                    title="Editar avaliador"
                  >
                    <EditIcon />
                  </button>
                  <button 
                    className="btn-action btn-delete"
                    onClick={() => handleDeleteClick(avaliador)}
                    title="Excluir avaliador"
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
    </div>
  )
}

export default Avaliadores

