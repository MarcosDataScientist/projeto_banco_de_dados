import React, { useState } from 'react'
import { SearchIcon, PlusIcon, EditIcon, CopyIcon, DeleteIcon, CalendarIcon, RefreshIcon, EyeIcon, FormsIcon } from './Icons'

function Formularios() {
  const [searchTerm, setSearchTerm] = useState('')
  const [formularios, setFormularios] = useState([
    {
      id: 1,
      titulo: "Avaliação Geral de Desligamento",
      descricao: "Formulário completo para avaliação de funcionários em processo de desligamento",
      status: "Ativo",
      perguntas: 8,
      respostas: 24,
      dataCriacao: "2024-01-20",
      ultimoUso: "2024-01-25"
    },
    {
      id: 2,
      titulo: "Avaliação Rápida",
      descricao: "Formulário simplificado para desligamentos urgentes",
      status: "Ativo",
      perguntas: 5,
      respostas: 12,
      dataCriacao: "2024-01-15",
      ultimoUso: "2024-01-24"
    },
    {
      id: 3,
      titulo: "Avaliação Executiva",
      descricao: "Formulário detalhado para cargos de liderança",
      status: "Rascunho",
      perguntas: 12,
      respostas: 0,
      dataCriacao: "2024-01-22",
      ultimoUso: null
    }
  ])

  const filteredFormularios = formularios.filter(formulario =>
    formulario.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formulario.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formulario.status.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Ativo': return 'badge-ativo'
      case 'Rascunho': return 'badge-rascunho'
      case 'Inativo': return 'badge-inativo'
      case 'Arquivado': return 'badge-arquivado'
      default: return 'badge-default'
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Gerar Formulários</h2>
        <p>Crie e gerencie formulários personalizados para avaliação de desligamento</p>
      </div>

      <div className="stats-row">
        <div className="stat-item">
          <span className="stat-number">{formularios.length}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{formularios.filter(f => f.status === 'Ativo').length}</span>
          <span className="stat-label">Ativos</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{formularios.reduce((acc, f) => acc + f.respostas, 0)}</span>
          <span className="stat-label">Respostas</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{formularios.reduce((acc, f) => acc + f.perguntas, 0)}</span>
          <span className="stat-label">Perguntas</span>
        </div>
      </div>

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
          <button className="btn-primary">
            <PlusIcon /> Novo Formulário
          </button>
        </div>
        {filteredFormularios.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon"><FormsIcon /></span>
            <h3>Nenhum formulário encontrado</h3>
            <p>{searchTerm ? 'Tente ajustar os termos de busca' : 'Crie seu primeiro formulário para começar'}</p>
          </div>
        ) : (
          <div className="items-list">
            {filteredFormularios.map(formulario => (
              <div key={formulario.id} className="list-item">
                <div className="item-main">
                  <div className="item-header">
                    <h4 className="item-title">{formulario.titulo}</h4>
                    <div className="item-badges">
                      <span className={`badge ${getStatusBadgeColor(formulario.status)}`}>
                        {formulario.status}
                      </span>
                    </div>
                  </div>
                  <p className="item-description">{formulario.descricao}</p>
                  <div className="item-stats">
                    <div className="stat-mini">
                      <span className="stat-mini-number">{formulario.perguntas}</span>
                      <span className="stat-mini-label">Perguntas</span>
                    </div>
                    <div className="stat-mini">
                      <span className="stat-mini-number">{formulario.respostas}</span>
                      <span className="stat-mini-label">Respostas</span>
                    </div>
                    <div className="item-meta">
                      <span className="item-date">
                        <CalendarIcon /> Criado em {new Date(formulario.dataCriacao).toLocaleDateString('pt-BR')}
                      </span>
                      {formulario.ultimoUso && (
                        <span className="item-date">
                          <RefreshIcon /> Último uso: {new Date(formulario.ultimoUso).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="item-actions">
                  <button className="btn-action btn-preview"><EyeIcon /></button>
                  <button className="btn-action btn-edit"><EditIcon /></button>
                  <button className="btn-action btn-copy"><CopyIcon /></button>
                  <button className="btn-action btn-delete"><DeleteIcon /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Formularios
