import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import QuestionariosBarChart from '../Dashboard/charts/QuestionariosBarChart'
import RespostasBarChart from '../Dashboard/charts/RespostasBarChart'
import AvaliacoesTempoBarChart from '../Dashboard/charts/AvaliacoesTempoBarChart'
import SetoresPieChart from '../Dashboard/charts/SetoresPieChart'
import SetorAvaliadoresChart from '../Dashboard/SetorAvaliadoresChart'

function Home() {
  // Estados para cada conjunto de dados
  const [questionarios, setQuestionarios] = useState([])
  const [respostas, setRespostas] = useState([])
  const [avaliacoesTempo, setAvaliacoesTempo] = useState([])
  const [setores, setSetores] = useState([])
  const [avaliadoresPorSetor, setAvaliadoresPorSetor] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [setorSelecionado, setSetorSelecionado] = useState(null)

  // Buscar todos os dados ao montar
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Buscar dados de todas as APIs em paralelo
        const [
          questionariosData,
          respostasData,
          avaliacoesTempoData,
          setoresData,
          avaliadoresData
        ] = await Promise.all([
          api.getQuestionariosUsados().catch(() => []),
          api.getRespostasFrequencia().catch(() => []),
          api.getAvaliacoesTempo(2).catch(() => []),
          api.getAvaliacoesSetor().catch(() => []),
          api.getAvaliadoresPorSetor().catch(() => [])
        ])

        setQuestionarios(questionariosData || [])
        setRespostas(respostasData || [])
        setAvaliacoesTempo(avaliacoesTempoData || [])
        setSetores(setoresData || [])
        setAvaliadoresPorSetor(avaliadoresData || [])
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err)
        setError('Erro ao carregar dados do dashboard. Tente recarregar a página.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSetorClick = (setor) => {
    setSetorSelecionado(setor)
  }

  const handleLimparSelecao = () => {
    setSetorSelecionado(null)
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h2>Dashboard</h2>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div className="spinner" style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #2196f3',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: '#666' }}>Carregando dados do dashboard...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h2>Dashboard</h2>
        </div>
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          color: '#d32f2f',
          background: '#ffebee',
          borderRadius: '8px',
          margin: '20px 0'
        }}>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary"
            style={{ marginTop: '20px' }}
          >
            Recarregar Página
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '14px' }}>
            Visualizações e insights do sistema de avaliação
          </p>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Gráfico de Questionários */}
        <div className="dashboard-card">
          <QuestionariosBarChart data={questionarios} />
        </div>

        {/* Gráfico de Respostas */}
        <div className="dashboard-card">
          <RespostasBarChart data={respostas} />
        </div>

        {/* Gráfico de Avaliações por Tempo */}
        <div className="dashboard-card">
          <AvaliacoesTempoBarChart data={avaliacoesTempo} />
        </div>

        {/* Gráfico de Pizza - Setores */}
        <div className="dashboard-card">
          <SetoresPieChart 
            data={setores} 
            onSetorClick={handleSetorClick}
          />
        </div>

        {/* Gráfico de Avaliadores por Setor (aparece quando um setor é selecionado) */}
        {setorSelecionado && (
          <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
            <SetorAvaliadoresChart 
              data={avaliadoresPorSetor}
              setor={setorSelecionado}
            />
            <button
              onClick={handleLimparSelecao}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                background: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              ← Voltar para visão geral
            </button>
          </div>
        )}
      </div>

      {/* Mensagem quando não há dados */}
      {!loading && 
       questionarios.length === 0 && 
       respostas.length === 0 && 
       avaliacoesTempo.length === 0 && 
       setores.length === 0 && (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          color: '#666',
          background: '#f5f5f5',
          borderRadius: '8px',
          margin: '20px 0'
        }}>
          <p style={{ fontSize: '16px', marginBottom: '10px' }}>
            Nenhum dado disponível para exibir
          </p>
          <p style={{ fontSize: '14px', color: '#999' }}>
            Crie avaliações, questionários e respostas para ver os gráficos
          </p>
        </div>
      )}
    </div>
  )
}

export default Home
