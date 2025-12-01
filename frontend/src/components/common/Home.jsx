import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import api from '../../services/api'
import AvaliacaoRespostasBarChart from '../Dashboard/charts/AvaliacaoRespostasBarChart'
import QuestionariosPieChart from '../Dashboard/charts/QuestionariosPieChart'
import QuestaoBarChart from '../Dashboard/charts/QuestaoBarChart'
// Removido gráfico de barras por avaliador, mantendo apenas ranking
import SetoresPieChart from '../Dashboard/charts/SetoresPieChart'
import PontosTemporalLineChart from '../Dashboard/charts/PontosTemporalLineChart'
import { SearchIcon } from './Icons'

function Home() {
  // Estados para Ranking Empresa
  const [dadosPontos, setDadosPontos] = useState([])
  const [loadingPontos, setLoadingPontos] = useState(false)
  const [dataInicial, setDataInicial] = useState('')
  const [dataFinal, setDataFinal] = useState('')

  // Estados para Visão Questões
  const [questaoSelecionada, setQuestaoSelecionada] = useState(null)
  const [questaoSelecionadaTexto, setQuestaoSelecionadaTexto] = useState('')
  const [dadosQuestao, setDadosQuestao] = useState([])
  const [perguntas, setPerguntas] = useState([])
  const [perguntasFiltradas, setPerguntasFiltradas] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [loadingQuestao, setLoadingQuestao] = useState(false)
  const [loadingPerguntas, setLoadingPerguntas] = useState(false)
  const searchRef = useRef(null)
  const dropdownRef = useRef(null)

  // Estados para Visão Questionário
  const [questionarioSelecionado, setQuestionarioSelecionado] = useState(null)
  const [dadosGrafico, setDadosGrafico] = useState([])
  const [dadosQuestionarios, setDadosQuestionarios] = useState([])
  const [loadingGrafico, setLoadingGrafico] = useState(false)
  const [loadingQuestionarios, setLoadingQuestionarios] = useState(false)
  const [error, setError] = useState(null)

  // Estados para Visão Avaliação
  const [dadosAvaliadores, setDadosAvaliadores] = useState([])
  const [dadosAvaliacoesSetor, setDadosAvaliacoesSetor] = useState([])
  const [loadingAvaliadores, setLoadingAvaliadores] = useState(false)
  const [loadingAvaliacoesSetor, setLoadingAvaliacoesSetor] = useState(false)

  // Ranking por avaliador (total de avaliações)
  const rankingAvaliadores = useMemo(() => {
    if (!Array.isArray(dadosAvaliadores) || dadosAvaliadores.length === 0) {
      return []
    }

    const map = {}
    dadosAvaliadores.forEach((item) => {
      const nome = item.avaliador_nome || item.nome || 'Sem nome'
      const total = item.total_avaliacoes ?? item.total ?? 0

      if (!map[nome]) {
        map[nome] = { nome, total: 0 }
      }
      map[nome].total += total
    })

    return Object.values(map)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
  }, [dadosAvaliadores])

  // Carregar dados ao montar
  useEffect(() => {
    carregarDadosQuestionarios()
    carregarPerguntas()
    carregarDadosAvaliacao()
    carregarDadosPontos()
  }, [])

  const carregarDadosPontos = useCallback(async () => {
    try {
      setLoadingPontos(true)
      const dados = await api.getPontosPorData(
        dataInicial || null,
        dataFinal || null,
        null // Não usar limite_dias quando há datas específicas
      )
      console.log('Dados de pontos recebidos:', dados)
      console.log('Tipo de dados:', typeof dados, Array.isArray(dados))
      if (Array.isArray(dados)) {
        console.log('Total de registros:', dados.length)
        if (dados.length > 0) {
          console.log('Primeiro registro:', dados[0])
          console.log('Último registro:', dados[dados.length - 1])
        }
        setDadosPontos(dados)
      } else {
        console.warn('Dados não são um array:', dados)
        setDadosPontos([])
      }
    } catch (err) {
      console.error('Erro ao carregar dados de pontos:', err)
      setDadosPontos([])
    } finally {
      setLoadingPontos(false)
    }
  }, [dataInicial, dataFinal])

  // Aplicar filtro quando as datas mudarem
  useEffect(() => {
    // Usar um pequeno delay para evitar múltiplas chamadas ao digitar
    const timeoutId = setTimeout(() => {
      carregarDadosPontos()
    }, 300)
    
    return () => clearTimeout(timeoutId)
  }, [carregarDadosPontos])

  const aplicarFiltroRapido = (dias) => {
    if (dias === null) {
      // Buscar todos os dados
      setDataInicial('')
      setDataFinal('')
    } else {
      const hoje = new Date()
      const dataFinalObj = new Date(hoje)
      const dataInicialObj = new Date(hoje)
      dataInicialObj.setDate(hoje.getDate() - dias)
      
      // Formatar para YYYY-MM-DD
      const formatarData = (data) => {
        const ano = data.getFullYear()
        const mes = String(data.getMonth() + 1).padStart(2, '0')
        const dia = String(data.getDate()).padStart(2, '0')
        return `${ano}-${mes}-${dia}`
      }
      
      setDataInicial(formatarData(dataInicialObj))
      setDataFinal(formatarData(dataFinalObj))
    }
  }

  // Carregar dados da questão quando selecionada
  useEffect(() => {
    if (questaoSelecionada) {
      carregarDadosQuestao(questaoSelecionada)
    } else {
      setDadosQuestao([])
    }
  }, [questaoSelecionada])

  // Filtrar perguntas baseado no termo de busca
  useEffect(() => {
    if (!Array.isArray(perguntas)) {
      console.warn('Perguntas não é um array:', perguntas)
      setPerguntasFiltradas([])
      return
    }

    if (!searchTerm.trim()) {
      setPerguntasFiltradas(perguntas)
    } else {
      const termo = searchTerm.toLowerCase().trim()
      const filtradas = perguntas.filter(pergunta => {
        // Tentar múltiplas propriedades possíveis para o texto da pergunta
        const texto = (
          pergunta.texto_questao || 
          pergunta.texto || 
          pergunta.pergunta || 
          pergunta.descricao ||
          ''
        ).toLowerCase()
        
        // Buscar também no ID se o termo for numérico
        const id = String(pergunta.id || pergunta.cod_questao || pergunta.cod_questao_id || '')
        
        return texto.includes(termo) || id.includes(termo)
      })
      
      console.log('Termo de busca:', termo)
      console.log('Perguntas filtradas:', filtradas.length, 'de', perguntas.length)
      setPerguntasFiltradas(filtradas)
    }
  }, [searchTerm, perguntas])

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Carregar dados do gráfico quando um questionário for selecionado
  useEffect(() => {
    if (questionarioSelecionado) {
      carregarDadosGrafico(questionarioSelecionado)
    } else {
      setDadosGrafico([])
    }
  }, [questionarioSelecionado])

  const carregarDadosQuestionarios = async () => {
    try {
      setLoadingQuestionarios(true)
      setError(null)
      const dados = await api.getAvaliacoesPorQuestionario()
      setDadosQuestionarios(Array.isArray(dados) ? dados : [])
    } catch (err) {
      console.error('Erro ao carregar dados de questionários:', err)
      setError('Erro ao carregar dados de questionários. Tente recarregar a página.')
      setDadosQuestionarios([])
    } finally {
      setLoadingQuestionarios(false)
    }
  }

  const carregarDadosGrafico = async (questionarioId) => {
    try {
      setLoadingGrafico(true)
      setError(null)
      const dados = await api.getGraficoRespostasQuestionario(questionarioId)
      setDadosGrafico(Array.isArray(dados) ? dados : [])
    } catch (err) {
      console.error('Erro ao carregar dados do gráfico:', err)
      setError('Erro ao carregar dados do gráfico. Tente novamente.')
      setDadosGrafico([])
    } finally {
      setLoadingGrafico(false)
    }
  }

  const carregarPerguntas = async () => {
    try {
      setLoadingPerguntas(true)
      // Carregar todas as perguntas (sem filtro de ativa) para permitir busca completa
      const dados = await api.getPerguntas(null, null, 1, 1000)
      console.log('Dados recebidos de getPerguntas:', dados)
      
      // Verificar se é um objeto com perguntas ou um array direto
      let perguntasList = []
      if (Array.isArray(dados)) {
        perguntasList = dados
      } else if (dados && dados.perguntas && Array.isArray(dados.perguntas)) {
        perguntasList = dados.perguntas
      }
      
      console.log('Perguntas processadas:', perguntasList)
      console.log('Total de perguntas carregadas:', perguntasList.length)
      
      setPerguntas(perguntasList)
      setPerguntasFiltradas(perguntasList)
    } catch (err) {
      console.error('Erro ao carregar perguntas:', err)
      setPerguntas([])
      setPerguntasFiltradas([])
    } finally {
      setLoadingPerguntas(false)
    }
  }

  const carregarDadosQuestao = async (questaoId) => {
    try {
      setLoadingQuestao(true)
      const dados = await api.getRespostasQuestao(questaoId)
      setDadosQuestao(Array.isArray(dados) ? dados : [])
    } catch (err) {
      console.error('Erro ao carregar dados da questão:', err)
      setDadosQuestao([])
    } finally {
      setLoadingQuestao(false)
    }
  }

  const handleQuestaoSelect = (pergunta) => {
    const perguntaId = pergunta.id || pergunta.cod_questao || pergunta.cod_questao_id
    const perguntaTexto = pergunta.texto_questao || pergunta.texto || pergunta.pergunta || 'Sem texto'
    
    setQuestaoSelecionada(perguntaId)
    setQuestaoSelecionadaTexto(perguntaTexto)
    setSearchTerm(perguntaTexto)
    setShowDropdown(false)
  }

  const handleSearchChange = (e) => {
    const valor = e.target.value
    setSearchTerm(valor)
    setShowDropdown(true)
    
    // Se limpar o campo, limpar também a seleção
    if (!valor.trim()) {
      setQuestaoSelecionada(null)
      setQuestaoSelecionadaTexto('')
    }
  }

  const handleSearchFocus = () => {
    // Mostrar dropdown sempre que houver perguntas, mesmo sem termo de busca
    if (perguntas.length > 0) {
      setShowDropdown(true)
    }
  }

  const handleClear = () => {
    setSearchTerm('')
    setQuestaoSelecionada(null)
    setQuestaoSelecionadaTexto('')
    setShowDropdown(false)
    setDadosQuestao([])
  }

  const handleQuestionarioClick = (questionarioId) => {
    setQuestionarioSelecionado(questionarioId)
  }

  const carregarDadosAvaliacao = async () => {
    try {
      setLoadingAvaliadores(true)
      setLoadingAvaliacoesSetor(true)
      
      // Carregar dados de avaliadores e avaliações por setor
      const [avaliadoresData, setoresData] = await Promise.all([
        api.getAvaliadoresPorSetor(),
        api.getAvaliacoesSetor()
      ])
      
      setDadosAvaliadores(Array.isArray(avaliadoresData) ? avaliadoresData : [])
      setDadosAvaliacoesSetor(Array.isArray(setoresData) ? setoresData : [])
    } catch (err) {
      console.error('Erro ao carregar dados de avaliação:', err)
      setDadosAvaliadores([])
      setDadosAvaliacoesSetor([])
    } finally {
      setLoadingAvaliadores(false)
      setLoadingAvaliacoesSetor(false)
    }
  }

  // Utilitário simples para exportar dados em CSV
  const downloadCsv = (filename, rows, columns) => {
    try {
      if (!rows || rows.length === 0) return

      const header = columns.map(c => c.label).join(';')
      const dataLines = rows.map(row =>
        columns.map(c => {
          const v = row[c.key]
          const s = v === null || v === undefined ? '' : String(v)
          // Escapar ; e quebras de linha
          return `"${s.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`
        }).join(';')
      )

      const csvContent = [header, ...dataLines].join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Erro ao gerar CSV:', e)
    }
  }

  // Exportações específicas
  const exportPontosCsv = () => {
    if (!dadosPontos || dadosPontos.length === 0) return

    // Adicionar coluna de média (total_pontos / total_avaliacoes)
    const rows = dadosPontos.map((d) => {
      const totalPontos = Number(d.total_pontos) || 0
      const totalAvaliacoes = Number(d.total_avaliacoes) || 0
      const media =
        totalAvaliacoes > 0 ? (totalPontos / totalAvaliacoes).toFixed(2) : ''

      return {
        ...d,
        media,
      }
    })

    downloadCsv('pontos_por_data.csv', rows, [
      { key: 'data', label: 'data' },
      { key: 'data_formatada', label: 'data_formatada' },
      { key: 'total_pontos', label: 'total_pontos' },
      { key: 'total_avaliacoes', label: 'total_avaliacoes' },
      { key: 'media', label: 'media' }
    ])
  }

  const exportQuestionariosCsv = () => {
    if (!dadosQuestionarios || dadosQuestionarios.length === 0) return
    downloadCsv('avaliacoes_por_questionario.csv', dadosQuestionarios, [
      { key: 'id', label: 'questionario_id' },
      { key: 'questionario', label: 'questionario' },
      { key: 'total', label: 'total_avaliacoes' }
    ])
  }

  const exportRespostasQuestionarioCsv = () => {
    if (!dadosGrafico || dadosGrafico.length === 0) return

    // Alguns registros não trazem o questionario_id no payload.
    // Forçamos a coluna questionario_id usando o questionário atualmente selecionado.
    const rows = dadosGrafico.map((d) => ({
      questionario_id: questionarioSelecionado || d.questionario_id || '',
      questao_id: d.questao_id,
      pergunta: d.pergunta,
      alternativa_selecionada: d.alternativa_selecionada,
      quantidade: d.quantidade
    }))

    downloadCsv('respostas_por_pergunta_e_alternativa.csv', rows, [
      { key: 'questionario_id', label: 'questionario_id' },
      { key: 'questao_id', label: 'questao_id' },
      { key: 'pergunta', label: 'pergunta' },
      { key: 'alternativa_selecionada', label: 'alternativa' },
      { key: 'quantidade', label: 'quantidade' }
    ])
  }

  const exportRespostasQuestaoCsv = () => {
    if (!dadosQuestao || dadosQuestao.length === 0) return
    downloadCsv('respostas_por_questao.csv', dadosQuestao, [
      { key: 'questao_id', label: 'questao_id' },
      { key: 'pergunta', label: 'pergunta' },
      { key: 'alternativa_selecionada', label: 'alternativa' },
      { key: 'quantidade', label: 'quantidade' }
    ])
  }

  const exportAvaliacoesSetorCsv = () => {
    if (!dadosAvaliacoesSetor || dadosAvaliacoesSetor.length === 0) return
    downloadCsv('avaliacoes_por_setor.csv', dadosAvaliacoesSetor, [
      { key: 'departamento', label: 'departamento' },
      { key: 'total', label: 'total_avaliacoes' },
      { key: 'concluidas', label: 'avaliacoes_concluidas' },
      { key: 'pendentes', label: 'avaliacoes_pendentes' },
      { key: 'pontuacao_media', label: 'pontuacao_media' }
    ])
  }

  if (error && dadosQuestionarios.length === 0) {
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
            onClick={carregarDadosQuestionarios}
            className="btn-primary"
            style={{ marginTop: '20px' }}
          >
            Tentar Novamente
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
        </div>
      </div>

      {/* Seção: Ranking Empresa */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ 
          fontSize: '20px', 
          fontWeight: 600, 
          marginBottom: '20px',
          color: '#333',
          borderBottom: '2px solid #e91e63',
          paddingBottom: '10px'
        }}>
          Ranking Empresa
        </h3>

        {/* Filtro de Data */}
        <div style={{
          marginBottom: '20px',
          padding: '15px',
          background: '#f8f9fa',
          borderRadius: '8px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '15px',
          alignItems: 'flex-end'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '14px', fontWeight: 500, color: '#555' }}>
              Data Inicial
            </label>
            <input
              type="date"
              value={dataInicial}
              onChange={(e) => setDataInicial(e.target.value)}
              style={{
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                minWidth: '150px'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '14px', fontWeight: 500, color: '#555' }}>
              Data Final
            </label>
            <input
              type="date"
              value={dataFinal}
              onChange={(e) => setDataFinal(e.target.value)}
              style={{
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                minWidth: '150px'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => aplicarFiltroRapido(30)}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                border: '1px solid #e91e63',
                borderRadius: '4px',
                background: 'white',
                color: '#e91e63',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#e91e63'
                e.target.style.color = 'white'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'white'
                e.target.style.color = '#e91e63'
              }}
            >
              30 Dias
            </button>
            
            <button
              onClick={() => aplicarFiltroRapido(90)}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                border: '1px solid #e91e63',
                borderRadius: '4px',
                background: 'white',
                color: '#e91e63',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#e91e63'
                e.target.style.color = 'white'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'white'
                e.target.style.color = '#e91e63'
              }}
            >
              90 Dias
            </button>
            
            <button
              onClick={() => aplicarFiltroRapido(365)}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                border: '1px solid #e91e63',
                borderRadius: '4px',
                background: 'white',
                color: '#e91e63',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#e91e63'
                e.target.style.color = 'white'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'white'
                e.target.style.color = '#e91e63'
              }}
            >
              1 Ano
            </button>
            
            <button
              onClick={() => aplicarFiltroRapido(null)}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                border: '1px solid #e91e63',
                borderRadius: '4px',
                background: !dataInicial && !dataFinal ? '#e91e63' : 'white',
                color: !dataInicial && !dataFinal ? 'white' : '#e91e63',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Todos
            </button>
          </div>
        </div>

        <div className="dashboard-card" style={{ 
          padding: '20px',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          minHeight: '450px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#333' }}>
              Evolução de Pontos
            </h4>
            {dadosPontos.length > 0 && (
              <button
                type="button"
                onClick={exportPontosCsv}
                style={{
                  padding: '6px 10px',
                  fontSize: '12px',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb',
                  background: '#f9fafb',
                  cursor: 'pointer',
                  color: '#374151'
                }}
              >
                Exportar CSV
              </button>
            )}
          </div>
          {loadingPontos ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              flex: '1',
              minHeight: '400px',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <div className="spinner" style={{
                width: '40px',
                height: '40px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #e91e63',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ color: '#666' }}>Carregando dados de pontos...</p>
            </div>
          ) : dadosPontos.length > 0 ? (
            <div style={{ flex: '1', width: '100%', height: '100%' }}>
              <PontosTemporalLineChart data={dadosPontos} />
            </div>
          ) : (
            <div style={{ 
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flex: '1',
              minHeight: '400px',
              padding: '40px', 
              textAlign: 'center', 
              color: '#666',
              background: '#f5f5f5',
              borderRadius: '8px',
              flexDirection: 'column',
              gap: '15px'
            }}>
              <h4 style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#666',
                margin: 0
              }}>
                Nenhum dado disponível
              </h4>
              <p style={{
                fontSize: '14px',
                color: '#999',
                margin: 0
              }}>
                Não há dados de pontos para exibir no período selecionado.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Seção: Visão Questões */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ 
          fontSize: '20px', 
          fontWeight: 600, 
          marginBottom: '20px',
          color: '#333',
          borderBottom: '2px solid #e91e63',
          paddingBottom: '10px'
        }}>
          Visão Questões
        </h3>
        
        <div style={{ marginBottom: '20px', position: 'relative' }}>
          <label 
            htmlFor="pesquisa-questao" 
            style={{ 
              display: 'block', 
              marginBottom: '10px', 
              fontSize: '14px', 
              fontWeight: 600,
              color: '#333'
            }}
          >
            Pesquisar Questão:
          </label>
          <div 
            ref={searchRef}
            style={{ 
              position: 'relative',
              width: '100%',
              maxWidth: '600px'
            }}
          >
            <div className="search-bar">
              <span className="search-icon"><SearchIcon /></span>
              <input
                id="pesquisa-questao"
                type="text"
                placeholder="Digite para buscar uma pergunta..."
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                className="search-input"
                disabled={loadingPerguntas}
                style={{
                  width: '100%',
                  paddingRight: questaoSelecionada ? '80px' : '40px'
                }}
              />
              {questaoSelecionada && (
                <button
                  onClick={handleClear}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#999',
                    cursor: 'pointer',
                    padding: '5px',
                    fontSize: '18px',
                    lineHeight: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Limpar seleção"
                >
                  ×
                </button>
              )}
              {loadingPerguntas && (
                <span style={{ 
                  position: 'absolute',
                  right: questaoSelecionada ? '45px' : '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#666', 
                  fontSize: '14px'
                }}>
                  Buscando...
                </span>
              )}
            </div>

            {/* Dropdown de resultados */}
            {showDropdown && !loadingPerguntas && (perguntas.length > 0 || searchTerm.trim()) && (
              <div
                ref={dropdownRef}
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  maxHeight: '300px',
                  overflowY: 'auto',
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderTop: 'none',
                  borderRadius: '0 0 4px 4px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  zIndex: 1000,
                  marginTop: '2px'
                }}
              >
                {perguntasFiltradas.length > 0 ? (
                  perguntasFiltradas.map(pergunta => {
                    const perguntaId = pergunta.id || pergunta.cod_questao || pergunta.cod_questao_id
                    const perguntaTexto = pergunta.texto_questao || pergunta.texto || pergunta.pergunta || 'Sem texto'
                    const isSelected = questaoSelecionada === perguntaId
                    
                    return (
                      <div
                        key={perguntaId}
                        onClick={() => handleQuestaoSelect(pergunta)}
                        style={{
                          padding: '12px 16px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #f0f0f0',
                          backgroundColor: isSelected ? '#e3f2fd' : 'white',
                          transition: 'background-color 0.2s',
                          wordWrap: 'break-word'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = '#f5f5f5'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = 'white'
                          }
                        }}
                      >
                        <div style={{
                          fontSize: '14px',
                          color: '#333',
                          lineHeight: '1.5'
                        }}>
                          {perguntaTexto}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div style={{
                    padding: '20px',
                    textAlign: 'center',
                    color: '#999',
                    fontSize: '14px'
                  }}>
                    {searchTerm.trim() 
                      ? `Nenhuma pergunta encontrada para "${searchTerm}"` 
                      : perguntas.length === 0
                        ? 'Nenhuma pergunta disponível. Verifique se há perguntas cadastradas.'
                        : 'Digite para buscar perguntas...'
                    }
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-card" style={{ 
          padding: '20px',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#333' }}>
              Respostas por Questão
            </h4>
            {dadosQuestao.length > 0 && (
              <button
                type="button"
                onClick={exportRespostasQuestaoCsv}
                style={{
                  padding: '6px 10px',
                  fontSize: '12px',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb',
                  background: '#f9fafb',
                  cursor: 'pointer',
                  color: '#374151'
                }}
              >
                Exportar CSV
              </button>
            )}
          </div>
          {!questaoSelecionada ? (
            <div style={{ 
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flex: '1',
              minHeight: '400px',
              flexDirection: 'column',
              gap: '20px',
              padding: '40px',
              textAlign: 'center'
            }}>
              <h4 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#666',
                margin: 0
              }}>
                Selecione uma questão para visualizar as respostas
              </h4>
              <p style={{
                fontSize: '14px',
                color: '#999',
                margin: 0,
                maxWidth: '500px'
              }}>
                Use o campo de pesquisa acima para buscar e selecionar uma pergunta. 
                O gráfico mostrará a distribuição das respostas recebidas.
              </p>
            </div>
          ) : loadingQuestao ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              flex: '1',
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
              <p style={{ color: '#666' }}>Carregando respostas da questão...</p>
            </div>
          ) : dadosQuestao.length > 0 ? (
            <div style={{ flex: '1' }}>
              <QuestaoBarChart data={dadosQuestao} />
            </div>
          ) : (
            <div style={{ 
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flex: '1',
              minHeight: '400px',
              padding: '40px', 
              textAlign: 'center', 
              color: '#666',
              background: '#f5f5f5',
              borderRadius: '8px',
              flexDirection: 'column',
              gap: '15px'
            }}>
              <div style={{
                fontSize: '48px',
                color: '#ddd'
              }}>
                📭
              </div>
              <h4 style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#666',
                margin: 0
              }}>
                Nenhuma resposta disponível
              </h4>
              <p style={{
                fontSize: '14px',
                color: '#999',
                margin: 0
              }}>
                Esta questão ainda não possui respostas de avaliações.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Seção: Visão Questionário */}
      <div>
        <h3 style={{ 
          fontSize: '20px', 
          fontWeight: 600, 
          marginBottom: '20px',
          color: '#333',
          borderBottom: '2px solid #e91e63',
          paddingBottom: '10px'
        }}>
          Visão Questionário
        </h3>

        <div style={{ 
          display: 'flex', 
          flexDirection: 'row', 
          gap: '30px',
          flexWrap: 'nowrap',
          alignItems: 'flex-start'
        }}>
          {/* Gráfico de Pizza - Avaliações por Questionário (Lado Esquerdo) */}
          <div className="dashboard-card" style={{ 
            padding: '20px',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            flex: '0 0 400px',
            minWidth: '350px',
            maxWidth: '400px',
            height: '720px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#333' }}>
                Avaliações por Questionário
              </h4>
              {dadosQuestionarios.length > 0 && (
                <button
                  type="button"
                  onClick={exportQuestionariosCsv}
                  style={{
                    padding: '6px 10px',
                    fontSize: '12px',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                    background: '#f9fafb',
                    cursor: 'pointer',
                    color: '#374151'
                  }}
                >
                  Exportar CSV
                </button>
              )}
            </div>
            {loadingQuestionarios ? (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                flex: '1',
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
                <p style={{ color: '#666' }}>Carregando dados de questionários...</p>
              </div>
            ) : dadosQuestionarios.length > 0 ? (
              <QuestionariosPieChart 
                data={dadosQuestionarios} 
                onQuestionarioClick={handleQuestionarioClick}
              />
            ) : (
              <div style={{ 
                padding: '40px', 
                textAlign: 'center', 
                color: '#666',
                background: '#f5f5f5',
                borderRadius: '8px',
                flex: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <p>Nenhum dado de questionários disponível.</p>
              </div>
            )}
          </div>

          {/* Gráfico de Barras - Respostas por Pergunta (Lado Direito) */}
          <div className="dashboard-card" style={{ 
            padding: '20px',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            flex: '1 1 auto',
            minWidth: '500px',
            maxWidth: 'none',
            height: '720px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#333' }}>
                Respostas por Pergunta e Alternativa
              </h4>
              {dadosGrafico.length > 0 && (
                <button
                  type="button"
                  onClick={exportRespostasQuestionarioCsv}
                  style={{
                    padding: '6px 10px',
                    fontSize: '12px',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                    background: '#f9fafb',
                    cursor: 'pointer',
                    color: '#374151'
                  }}
                >
                  Exportar CSV
                </button>
              )}
            </div>
            {questionarioSelecionado ? (
              loadingGrafico ? (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  flex: '1',
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
                  <p style={{ color: '#666' }}>Carregando dados do gráfico...</p>
                </div>
              ) : dadosGrafico.length > 0 ? (
                <div
                  className="custom-scroll"
                  style={{ 
                    flex: '1',
                    overflow: 'auto',
                    width: '100%'
                  }}
                >
                  <AvaliacaoRespostasBarChart data={dadosGrafico} />
                </div>
              ) : (
                <div style={{ 
                  padding: '40px', 
                  textAlign: 'center', 
                  color: '#666',
                  background: '#f5f5f5',
                  borderRadius: '8px',
                  flex: '1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column'
                }}>
                  <p>Nenhum dado disponível para este questionário.</p>
                  <p style={{ fontSize: '14px', color: '#999', marginTop: '10px' }}>
                    Este questionário não possui respostas de múltipla escolha para exibir ou ainda não foi aplicado em avaliações.
                  </p>
                </div>
              )
            ) : (
              <div style={{ 
                padding: '40px', 
                textAlign: 'center', 
                color: '#666',
                background: '#f5f5f5',
                borderRadius: '8px',
                flex: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <p>Selecione um questionário no gráfico ao lado para ver os detalhes das respostas.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Seção: Visão Avaliação */}
      <div style={{ marginTop: '40px' }}>
        <h3 style={{ 
          fontSize: '20px', 
          fontWeight: 600, 
          marginBottom: '20px',
          color: '#333',
          borderBottom: '2px solid #e91e63',
          paddingBottom: '10px'
        }}>
          Visão Avaliação
        </h3>

        <div style={{ 
          display: 'flex', 
          flexDirection: 'row', 
          gap: '30px',
          flexWrap: 'nowrap',
          alignItems: 'flex-start'
        }}>
          {/* Gráfico de Barras - Avaliações por Avaliador (Lado Esquerdo) */}
          <div className="dashboard-card" style={{ 
            padding: '20px',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            flex: '0 0 380px',
            minWidth: '340px',
            maxWidth: '380px',
            height: '600px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {loadingAvaliadores ? (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                flex: '1',
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
                <p style={{ color: '#666' }}>Carregando dados de avaliadores...</p>
              </div>
            ) : rankingAvaliadores.length > 0 ? (
              <div style={{ 
                flex: '1',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <h4 style={{ 
                  fontSize: '16px', 
                  fontWeight: 600,
                  marginBottom: '20px',
                  color: '#333',
                  paddingBottom: '10px',
                  borderBottom: '2px solid #e91e63'
                }}>
                  Ranking por Avaliador
                </h4>
                <div
                  className="custom-scroll"
                  style={{
                    flex: '1',
                    overflowY: 'auto',
                    paddingRight: '10px'
                  }}
                >
                  <ol style={{ 
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    counterReset: 'ranking-avaliador'
                  }}>
                    {rankingAvaliadores.map((item, index) => {
                      const isTop = index === 0
                      return (
                        <li
                          key={item.nome || index}
                          style={{
                            counterIncrement: 'ranking-avaliador',
                            padding: '15px',
                            marginBottom: '12px',
                            background: isTop ? '#fff3cd' : '#f8f9fa',
                            border: isTop ? '2px solid #ffc107' : '1px solid #dee2e6',
                            borderRadius: '8px',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}
                        >
                          <div style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                          }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              background: isTop ? '#ffc107' : '#6c757d',
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '14px',
                              flexShrink: 0
                            }}>
                              {index + 1}
                            </span>
                            <span style={{
                              fontWeight: isTop ? 600 : 500,
                              fontSize: '15px',
                              color: '#333',
                              flex: '1'
                            }}>
                              {item.nome}
                            </span>
                          </div>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingLeft: '38px',
                            fontSize: '13px'
                          }}>
                            <span style={{ color: '#666' }}>
                              <strong style={{ color: '#333' }}>Avaliações:</strong> {item.total}
                            </span>
                            {isTop && (
                              <span style={{ fontSize: '20px' }}>🏆</span>
                            )}
                          </div>
                        </li>
                      )
                    })}
                  </ol>
                </div>
              </div>
            ) : (
              <div style={{ 
                padding: '40px', 
                textAlign: 'center', 
                color: '#666',
                background: '#f5f5f5',
                borderRadius: '8px',
                flex: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <p>Nenhum dado de avaliadores disponível.</p>
              </div>
            )}
          </div>

          {/* Gráfico de Pizza - Avaliações por Setor e Lista de Pontuação (Lado Direito) */}
          <div style={{ 
            flex: '1 1 auto',
            minWidth: '500px',
            maxWidth: 'none',
            display: 'flex',
            flexDirection: 'row',
            gap: '20px',
            height: '600px'
          }}>
            {/* Gráfico de Pizza */}
            <div className="dashboard-card" style={{ 
              padding: '20px',
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              flex: '1 1 65%',
              minWidth: '380px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#333' }}>
                  Avaliações por Setor
                </h4>
                {dadosAvaliacoesSetor.length > 0 && (
                  <button
                    type="button"
                    onClick={exportAvaliacoesSetorCsv}
                    style={{
                      padding: '6px 10px',
                      fontSize: '12px',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb',
                      background: '#f9fafb',
                      cursor: 'pointer',
                      color: '#374151'
                    }}
                  >
                    Exportar CSV
                  </button>
                )}
              </div>
              {loadingAvaliacoesSetor ? (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  flex: '1',
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
                  <p style={{ color: '#666' }}>Carregando dados de setores...</p>
                </div>
              ) : dadosAvaliacoesSetor.length > 0 ? (
                <div style={{ 
                  flex: '1',
                  overflow: 'auto',
                  width: '100%'
                }}>
                  <SetoresPieChart data={dadosAvaliacoesSetor} />
                </div>
              ) : (
                <div style={{ 
                  padding: '40px', 
                  textAlign: 'center', 
                  color: '#666',
                  background: '#f5f5f5',
                  borderRadius: '8px',
                  flex: '1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <p>Nenhum dado de avaliações por setor disponível.</p>
                </div>
              )}
            </div>

            {/* Lista de Pontuação por Setor */}
            <div className="dashboard-card" style={{ 
              padding: '20px',
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              flex: '0 0 360px',
              minWidth: '340px',
              maxWidth: '380px',
              height: '600px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              <h4 style={{ 
                fontSize: '16px', 
                fontWeight: 600,
                marginBottom: '20px',
                color: '#333',
                paddingBottom: '10px',
                borderBottom: '2px solid #e91e63'
              }}>
                Ranking por Pontuação
              </h4>
              {loadingAvaliacoesSetor ? (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  flex: '1',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div className="spinner" style={{
                    width: '30px',
                    height: '30px',
                    border: '3px solid #f3f3f3',
                    borderTop: '3px solid #2196f3',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <p style={{ color: '#666', fontSize: '14px' }}>Carregando...</p>
                </div>
              ) : dadosAvaliacoesSetor.length > 0 ? (
                <div
                  className="custom-scroll"
                  style={{ 
                    flex: '1',
                    overflowY: 'auto',
                    paddingRight: '10px'
                  }}
                >
                  <ol style={{ 
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    counterReset: 'ranking'
                  }}>
                    {dadosAvaliacoesSetor
                      .sort((a, b) => {
                        const pontuacaoA = a.pontuacao_media || 0
                        const pontuacaoB = b.pontuacao_media || 0
                        if (pontuacaoB !== pontuacaoA) {
                          return pontuacaoB - pontuacaoA
                        }
                        return (b.total || 0) - (a.total || 0)
                      })
                      .map((item, index) => {
                        const pontuacao = item.pontuacao_media !== null && item.pontuacao_media !== undefined 
                          ? parseFloat(item.pontuacao_media).toFixed(1) 
                          : 'N/A'
                        const total = item.total || 0
                        const isTop = index === 0
                        
                        return (
                          <li 
                            key={item.departamento || index}
                            style={{
                              counterIncrement: 'ranking',
                              padding: '15px',
                              marginBottom: '12px',
                              background: isTop ? '#fff3cd' : '#f8f9fa',
                              border: isTop ? '2px solid #ffc107' : '1px solid #dee2e6',
                              borderRadius: '8px',
                              position: 'relative',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '8px'
                            }}
                          >
                            <div style={{ 
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px'
                            }}>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: isTop ? '#ffc107' : '#6c757d',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                flexShrink: 0
                              }}>
                                {index + 1}
                              </span>
                              <span style={{
                                fontWeight: isTop ? 600 : 500,
                                fontSize: '15px',
                                color: '#333',
                                flex: '1'
                              }}>
                                {item.departamento || 'Sem setor'}
                              </span>
                            </div>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              paddingLeft: '38px',
                              fontSize: '13px'
                            }}>
                              <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px'
                              }}>
                                <span style={{ color: '#666' }}>
                                  <strong style={{ color: '#333' }}>Pontuação:</strong> {pontuacao}
                                </span>
                                <span style={{ color: '#666' }}>
                                  <strong style={{ color: '#333' }}>Avaliações:</strong> {total}
                                </span>
                              </div>
                              {isTop && (
                                <span style={{
                                  fontSize: '20px'
                                }}>🏆</span>
                              )}
                            </div>
                          </li>
                        )
                      })}
                  </ol>
                </div>
              ) : (
                <div style={{ 
                  padding: '20px', 
                  textAlign: 'center', 
                  color: '#999',
                  fontSize: '14px',
                  flex: '1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  Nenhum dado disponível
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Home
