import React, { useState } from 'react'
import { ReportsIcon, SearchIcon, CalendarIcon, FileIcon, PlusIcon, EditIcon, EyeIcon, DeleteIcon, DownloadIcon } from '../common/Icons'

function Relatorios() {
  const [searchTerm, setSearchTerm] = useState('')
  const [relatorios, setRelatorios] = useState([
    {
      id: 1,
      titulo: "Relatório Mensal - Janeiro 2024",
      descricao: "Análise completa das avaliações de desligamento do mês",
      tipo: "Mensal",
      periodo: "2024-01",
      status: "Concluído",
      dataGeracao: "2024-02-01",
      downloadUrl: "/relatorios/janeiro-2024.pdf"
    },
    {
      id: 2,
      titulo: "Relatório por Departamento",
      descricao: "Avaliações segmentadas por departamento da empresa",
      tipo: "Departamental",
      periodo: "2024-Q1",
      status: "Concluído",
      dataGeracao: "2024-01-15",
      downloadUrl: "/relatorios/departamental-q1.pdf"
    },
    {
      id: 3,
      titulo: "Relatório Executivo",
      descricao: "Resumo executivo para a diretoria",
      tipo: "Executivo",
      periodo: "2023",
      status: "Em Geração",
      dataGeracao: null,
      downloadUrl: null
    }
  ])

  const filteredRelatorios = relatorios.filter(relatorio =>
    relatorio.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    relatorio.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    relatorio.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    relatorio.status.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Concluído': return 'badge-ativo'
      case 'Em Geração': return 'badge-rascunho'
      case 'Erro': return 'badge-inativo'
      default: return 'badge-default'
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Relatórios</h2>
      </div>

      <div className="dashboard-layout">
        {/* Sidebar de Estatísticas */}
        <div className="stats-sidebar">
          <div className="stats-box">
            <h3>Estatísticas</h3>
            <div className="stats-list">
              <div className="stat-row">
                <span className="stat-label">Total de Relatórios</span>
                <span className="stat-number">{relatorios.length}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Concluídos</span>
                <span className="stat-number">{relatorios.filter(r => r.status === 'Concluído').length}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Em Geração</span>
                <span className="stat-number">{relatorios.filter(r => r.status === 'Em Geração').length}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Tipos de Relatório</span>
                <span className="stat-number">{new Set(relatorios.map(r => r.tipo)).size}</span>
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
                placeholder="Buscar por título, tipo ou período..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <button className="btn-primary">
              <PlusIcon /> Gerar Relatório
            </button>
          </div>
          {filteredRelatorios.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon"><ReportsIcon /></span>
              <h3>Nenhum relatório encontrado</h3>
              <p>{searchTerm ? 'Tente ajustar os termos de busca' : 'Gere seu primeiro relatório para começar'}</p>
            </div>
          ) : (
            <div className="items-list">
              {filteredRelatorios.map(relatorio => (
                <div key={relatorio.id} className="list-item">
                  <div className="item-main">
                    <div className="item-header">
                      <h4 className="item-title">{relatorio.titulo}</h4>
                      <div className="item-badges">
                        <span className="badge badge-categoria">
                          {relatorio.tipo}
                        </span>
                        <span className={`badge ${getStatusBadgeColor(relatorio.status)}`}>
                          {relatorio.status}
                        </span>
                      </div>
                    </div>
                    <p className="item-description">{relatorio.descricao}</p>
                    <div className="item-stats">
                      <div className="stat-mini">
                        <span className="stat-mini-number">{relatorio.periodo}</span>
                        <span className="stat-mini-label">Período</span>
                      </div>
                      <div className="item-meta">
                        {relatorio.dataGeracao && (
                          <span className="item-date">
                            <CalendarIcon /> Gerado em {new Date(relatorio.dataGeracao).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="item-actions">
                    {relatorio.status === 'Concluído' ? (
                      <>
                        <button className="btn-action btn-preview"><EyeIcon /></button>
                        <button className="btn-action btn-download"><DownloadIcon /></button>
                      </>
                    ) : (
                      <button className="btn-action btn-edit"><EditIcon /></button>
                    )}
                    <button className="btn-action btn-delete"><DeleteIcon /></button>
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

export default Relatorios
