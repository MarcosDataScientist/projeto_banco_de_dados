import React, { useState, useEffect } from 'react'
import { QuestionsIcon, FormsIcon, UsersIcon, AvaliacaoIcon } from './Icons'
import api from '../services/api'

function Home() {
  const [stats, setStats] = useState([
    { number: '0', label: 'Avaliações Pendentes', icon: <AvaliacaoIcon />, color: '#e91e63', trend: '0%' },
    { number: '0', label: 'Funcionários Ativos', icon: <UsersIcon />, color: '#2196f3', trend: '0%' },
    { number: '0', label: 'Formulários Ativos', icon: <FormsIcon />, color: '#4caf50', trend: '0%' },
    { number: '0', label: 'Perguntas Cadastradas', icon: <QuestionsIcon />, color: '#ff9800', trend: '0%' }
  ])
  
  const [avaliacoesPorMes, setAvaliacoesPorMes] = useState([])
  const [motivosSaida, setMotivosSaida] = useState([])
  const [statusAvaliacoes, setStatusAvaliacoes] = useState([])
  const [atividadesRecentes, setAtividadesRecentes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setLoading(true)
      setError(null)

      // Carregar estatísticas gerais
      const estatisticas = await api.getEstatisticas()
      
      // Atualizar stats com dados reais
      setStats([
        { 
          number: estatisticas.avaliacoes_pendentes?.toString() || '0', 
          label: 'Avaliações Pendentes', 
          icon: <AvaliacaoIcon />, 
          color: '#e91e63', 
          trend: '+12%' 
        },
        { 
          number: estatisticas.funcionarios_ativos?.toString() || '0', 
          label: 'Funcionários Ativos', 
          icon: <UsersIcon />, 
          color: '#2196f3', 
          trend: '+5%' 
        },
        { 
          number: estatisticas.formularios_ativos?.toString() || '0', 
          label: 'Formulários Ativos', 
          icon: <FormsIcon />, 
          color: '#4caf50', 
          trend: '0%' 
        },
        { 
          number: estatisticas.perguntas_cadastradas?.toString() || '0', 
          label: 'Perguntas Cadastradas', 
          icon: <QuestionsIcon />, 
          color: '#ff9800', 
          trend: '+8%' 
        }
      ])

      // Carregar avaliações por mês
      const avaliacoesMes = await api.getAvaliacoesPorMes(6)
      setAvaliacoesPorMes(avaliacoesMes)

      // Carregar motivos de saída
      const motivos = await api.getMotivosSaida()
      setMotivosSaida(motivos)

      // Carregar status das avaliações
      const status = await api.getStatusAvaliacoes()
      setStatusAvaliacoes(status)

      // Carregar atividades recentes
      const atividades = await api.getAtividadesRecentes(4)
      setAtividadesRecentes(atividades)

    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err)
      setError('Não foi possível carregar os dados. Tente novamente mais tarde.')
    } finally {
      setLoading(false)
    }
  }

  const maxValor = avaliacoesPorMes.length > 0 
    ? Math.max(...avaliacoesPorMes.map(item => item.valor)) 
    : 1

  const totalAvaliacoes = statusAvaliacoes.reduce((sum, item) => sum + (item.valor || 0), 0)

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando dados do dashboard...</p>
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

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Visão geral do sistema de avaliação de desligamento</p>
        </div>
        <div className="header-date">
          <span>{new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="dashboard-stats">
        {stats.map((stat, index) => (
          <div key={index} className="dashboard-stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                {stat.icon}
              </div>
              <span className={`stat-trend ${stat.trend.includes('+') ? 'positive' : 'neutral'}`}>
                {stat.trend}
              </span>
            </div>
            <div className="stat-card-body">
              <h3 className="stat-card-number">{stat.number}</h3>
              <p className="stat-card-label">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="dashboard-charts">
        {/* Gráfico de Barras - Avaliações por Mês */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Avaliações por Mês</h3>
            <span className="chart-subtitle">Últimos 6 meses</span>
          </div>
          <div className="chart-content">
            {avaliacoesPorMes.length === 0 ? (
              <p className="chart-empty">Nenhum dado disponível</p>
            ) : (
              <div className="bar-chart">
                {avaliacoesPorMes.map((item, index) => (
                  <div key={index} className="bar-item">
                    <div className="bar-wrapper">
                      <div 
                        className="bar" 
                        style={{ height: `${(item.valor / maxValor) * 100}%` }}
                      >
                        <span className="bar-value">{item.valor}</span>
                      </div>
                    </div>
                    <span className="bar-label">{item.mes}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Gráfico de Pizza - Status das Avaliações */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Status das Avaliações</h3>
            <span className="chart-subtitle">Total: {totalAvaliacoes} avaliações</span>
          </div>
          <div className="chart-content">
            {statusAvaliacoes.length === 0 ? (
              <p className="chart-empty">Nenhum dado disponível</p>
            ) : (
              <>
                <div className="donut-chart">
                  <svg viewBox="0 0 200 200" className="donut-svg">
                    <circle cx="100" cy="100" r="80" fill="none" stroke="#f0f0f0" strokeWidth="40"/>
                    {(() => {
                      let offset = 0
                      return statusAvaliacoes.map((item, index) => {
                        const percentage = totalAvaliacoes > 0 ? (item.valor / totalAvaliacoes) * 100 : 0
                        const dashArray = (percentage / 100) * (2 * Math.PI * 80)
                        const dashOffset = -offset
                        offset += dashArray
                        return (
                          <circle
                            key={index}
                            cx="100"
                            cy="100"
                            r="80"
                            fill="none"
                            stroke={item.cor}
                            strokeWidth="40"
                            strokeDasharray={`${dashArray} ${(2 * Math.PI * 80) - dashArray}`}
                            strokeDashoffset={dashOffset}
                            transform="rotate(-90 100 100)"
                          />
                        )
                      })
                    })()}
                  </svg>
                  <div className="donut-center">
                    <span className="donut-total">{totalAvaliacoes}</span>
                    <span className="donut-label">Total</span>
                  </div>
                </div>
                <div className="donut-legend">
                  {statusAvaliacoes.map((item, index) => (
                    <div key={index} className="legend-item">
                      <span className="legend-color" style={{ background: item.cor }}></span>
                      <span className="legend-label">{item.status}</span>
                      <span className="legend-value">{item.valor}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Gráfico de Barras Horizontais - Motivos de Saída */}
      <div className="chart-card chart-full-width">
        <div className="chart-header">
          <h3>Principais Motivos de Saída</h3>
          <span className="chart-subtitle">Baseado nas últimas avaliações</span>
        </div>
        <div className="chart-content">
          {motivosSaida.length === 0 ? (
            <p className="chart-empty">Nenhum dado disponível</p>
          ) : (
            <div className="horizontal-bar-chart">
              {motivosSaida.map((item, index) => (
                <div key={index} className="horizontal-bar-item">
                  <div className="horizontal-bar-label-container">
                    <span className="horizontal-bar-label">{item.motivo}</span>
                    <span className="horizontal-bar-percentage">{item.percentual}%</span>
                  </div>
                  <div className="horizontal-bar-wrapper">
                    <div 
                      className="horizontal-bar" 
                      style={{ width: `${item.percentual}%`, background: item.cor }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Atividades Recentes */}
      <div className="dashboard-activity">
        <div className="activity-card">
          <div className="chart-header">
            <h3>Atividades Recentes</h3>
            <button className="btn-view-all" onClick={carregarDados}>Atualizar</button>
          </div>
          <div className="activity-list">
            {atividadesRecentes.length === 0 ? (
              <p className="chart-empty">Nenhuma atividade recente</p>
            ) : (
              atividadesRecentes.map((atividade, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon" style={{ background: `${atividade.cor}15`, color: atividade.cor }}>
                    {atividade.tipo === 'avaliacao' && <AvaliacaoIcon />}
                    {atividade.tipo === 'funcionario' && <UsersIcon />}
                    {atividade.tipo === 'formulario' && <FormsIcon />}
                    {atividade.tipo === 'pergunta' && <QuestionsIcon />}
                  </div>
                  <div className="activity-content">
                    <p className="activity-title">{atividade.titulo}</p>
                    <p className="activity-description">{atividade.descricao}</p>
                    <span className="activity-time">{atividade.tempo}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
