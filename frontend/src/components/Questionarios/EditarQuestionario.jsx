import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckIcon, SearchIcon, XIcon } from '../common/Icons'
import api from '../../services/api'

function EditarQuestionario() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [formData, setFormData] = useState({
    nome: '',
    tipo: '',
    classificacao_cod: '',
    status: 'Ativo'
  })
  
  const [perguntas, setPerguntas] = useState([])
  const [perguntasTotal, setPerguntasTotal] = useState([]) // Total sem filtros
  const [classificacoes, setClassificacoes] = useState([])
  const [perguntasSelecionadas, setPerguntasSelecionadas] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('Todos') // 'Todos', 'Múltipla Escolha', 'Texto Livre'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [loadingData, setLoadingData] = useState(true)
  const [loadingPerguntas, setLoadingPerguntas] = useState(false)
  const isInitialMount = useRef(true)

  useEffect(() => {
    carregarDados()
    isInitialMount.current = false
  }, [id])

  useEffect(() => {
    if (isInitialMount.current) {
      return
    }
    const timeoutId = setTimeout(() => {
      carregarPerguntas(searchTerm.trim(), filtroTipo)
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [searchTerm, filtroTipo])

  const carregarDados = async () => {
    try {
      setLoadingData(true)
      setError(null)
      
      // Carregar questionário (que já vem com perguntas) e classificações
      const [questionarioData, classificacoesData] = await Promise.all([
        api.getQuestionario(id),
        api.getClassificacoes()
      ])
      
      setClassificacoes(Array.isArray(classificacoesData) ? classificacoesData : [])
      
      // Preencher dados do questionário
      if (questionarioData) {
        setFormData({
          nome: questionarioData.titulo || '',
          tipo: questionarioData.tipo || '',
          classificacao_cod: questionarioData.classificacao_id || '',
          status: questionarioData.status || 'Ativo'
        })
        
        // Preencher perguntas já selecionadas
        if (questionarioData.perguntas && Array.isArray(questionarioData.perguntas)) {
          const idsPerguntas = questionarioData.perguntas.map(p => {
            // O backend retorna 'id' mas pode ser 'cod_questao' também
            return p.id || p.cod_questao || p.questao_cod
          }).filter(id => id !== undefined && id !== null)
          setPerguntasSelecionadas(idsPerguntas)
        }
      }
      
      // Carregar todas as perguntas disponíveis
      await Promise.all([
        carregarPerguntas('', 'Todos'),
        carregarPerguntasTotal()
      ])
      
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setError('Erro ao carregar dados do questionário. Tente novamente.')
    } finally {
      setLoadingData(false)
    }
  }

  const carregarPerguntasTotal = async () => {
    try {
      // Carregar todas as perguntas ativas sem filtros para o contador total
      const perguntasData = await api.getPerguntas(
        null, // categoria
        true, // apenas ativas
        1, // page
        10000, // per_page alto para carregar todas
        null, // busca
        null // tipo (todos)
      )
      
      // Tratar resposta: pode ser objeto com paginação ou array direto
      let perguntasArray = []
      if (Array.isArray(perguntasData)) {
        perguntasArray = perguntasData
      } else if (perguntasData && perguntasData.perguntas) {
        perguntasArray = perguntasData.perguntas
      }
      
      setPerguntasTotal(perguntasArray)
    } catch (err) {
      console.error('Erro ao carregar total de perguntas:', err)
      setPerguntasTotal([])
    }
  }

  const carregarPerguntas = async (termoBusca = '', tipoFiltro = 'Todos') => {
    try {
      setLoadingPerguntas(true)
      setError(null)
      
      // Carregar todas as perguntas ativas (per_page alto) com busca e filtro de tipo opcionais
      const perguntasData = await api.getPerguntas(
        null, // categoria
        true, // apenas ativas
        1, // page
        10000, // per_page alto para carregar todas
        termoBusca || null, // busca
        tipoFiltro !== 'Todos' ? tipoFiltro : null // tipo
      )
      
      // Tratar resposta: pode ser objeto com paginação ou array direto
      let perguntasArray = []
      if (Array.isArray(perguntasData)) {
        perguntasArray = perguntasData
      } else if (perguntasData && perguntasData.perguntas) {
        perguntasArray = perguntasData.perguntas
      }
      
      setPerguntas(perguntasArray)
    } catch (err) {
      console.error('Erro ao carregar perguntas:', err)
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao carregar perguntas'
      setError(errorMessage)
      setPerguntas([])
    } finally {
      setLoadingPerguntas(false)
    }
  }


  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const togglePergunta = (perguntaId) => {
    setPerguntasSelecionadas(prev => {
      if (prev.includes(perguntaId)) {
        return prev.filter(id => id !== perguntaId)
      } else {
        return [...prev, perguntaId]
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validações
    if (!formData.nome.trim()) {
      setError('Nome é obrigatório')
      return
    }
    if (!formData.classificacao_cod) {
      setError('Classificação é obrigatória')
      return
    }
    if (perguntasSelecionadas.length === 0) {
      setError('Selecione pelo menos uma pergunta')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const dados = {
        nome: formData.nome.trim(),
        tipo: formData.tipo.trim() || null,
        classificacao_cod: parseInt(formData.classificacao_cod),
        status: formData.status,
        questoes_ids: perguntasSelecionadas
      }

      const resultado = await api.atualizarQuestionario(id, dados)
      
      // Redirecionar de volta para a lista de formulários com mensagem de sucesso
      navigate('/questionarios?success=updated&nome=' + encodeURIComponent(dados.nome))
    } catch (err) {
      console.error('Erro ao atualizar questionário:', err)
      setError(err.message || 'Erro ao atualizar questionário')
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h2>Editar Formulário</h2>
          <p>Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Editar Formulário</h2>
      </div>

      <form onSubmit={handleSubmit} className="form-container">
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <div className="form-card">
          <div className="form-section">
            <h4>Informações Básicas</h4>
            
            <div className="form-row">
              <div className="form-group" style={{ flex: 2 }}>
                <label htmlFor="nome">Nome do Formulário *</label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Ex: Avaliação de Desligamento Geral"
                  required
                />
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Rascunho">Rascunho</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="tipo">Tipo</label>
                <input
                  type="text"
                  id="tipo"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  placeholder="Ex: Padrão, Executivo, Simplificado"
                />
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="classificacao_cod">Classificação *</label>
                <select
                  id="classificacao_cod"
                  name="classificacao_cod"
                  value={formData.classificacao_cod}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione uma classificação</option>
                  {classificacoes.map(classificacao => (
                    <option key={classificacao.id} value={classificacao.id}>
                      {classificacao.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>Perguntas do Formulário</h4>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
              Selecione as perguntas que farão parte deste formulário ({perguntasSelecionadas.length} selecionadas)
            </p>

            {/* Caixas de contagem */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '15px', 
              marginBottom: '15px' 
            }}>
              <div style={{
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e0e0e0'
              }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                  Total de Perguntas
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
                  {perguntasTotal.length}
                </div>
              </div>
              <div style={{
                padding: '15px',
                backgroundColor: '#e3f2fd',
                borderRadius: '8px',
                border: '1px solid #90caf9'
              }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                  Perguntas Filtradas
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1976d2' }}>
                  {perguntas.length}
                </div>
              </div>
            </div>

            {/* Filtros e busca */}
            <div style={{ marginBottom: '15px' }}>
              <div style={{ 
                display: 'flex', 
                gap: '15px', 
                marginBottom: '15px',
                flexWrap: 'wrap',
                alignItems: 'center'
              }}>
                <div style={{ flex: '1', minWidth: '200px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '5px', 
                    fontSize: '14px', 
                    fontWeight: '500',
                    color: '#333'
                  }}>
                    Filtrar por Tipo
                  </label>
                  <select
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1px solid #ddd',
                      fontSize: '14px',
                      backgroundColor: '#fff',
                      cursor: 'pointer'
                    }}
                    disabled={loadingPerguntas}
                  >
                    <option value="Todos">Todos os Tipos</option>
                    <option value="Múltipla Escolha">Múltipla Escolha</option>
                    <option value="Texto Livre">Texto Livre</option>
                  </select>
                </div>
                <div style={{ flex: '2', minWidth: '250px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '5px', 
                    fontSize: '14px', 
                    fontWeight: '500',
                    color: '#333'
                  }}>
                    Buscar Perguntas
                  </label>
                  <div className="search-bar">
                    <span className="search-icon"><SearchIcon /></span>
                    <input
                      type="text"
                      placeholder="Buscar perguntas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                      disabled={loadingPerguntas}
                    />
                    {loadingPerguntas && (
                      <span style={{ marginLeft: '10px', color: '#666', fontSize: '14px' }}>
                        Buscando...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="perguntas-list">
              {loadingPerguntas && perguntas.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                  Carregando perguntas...
                </p>
              ) : perguntas.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                  {searchTerm ? 'Nenhuma pergunta encontrada' : 'Nenhuma pergunta disponível'}
                </p>
              ) : (
                perguntas.map(pergunta => {
                  const perguntaId = pergunta.cod_questao || pergunta.id
                  return (
                    <div
                      key={perguntaId}
                      className={`pergunta-item ${perguntasSelecionadas.includes(perguntaId) ? 'selected' : ''}`}
                      onClick={() => togglePergunta(perguntaId)}
                    >
                      <div className="pergunta-checkbox">
                        <input
                          type="checkbox"
                          checked={perguntasSelecionadas.includes(perguntaId)}
                          onChange={(e) => {
                            e.stopPropagation()
                            togglePergunta(perguntaId)
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="pergunta-content">
                        <p className="pergunta-texto">{pergunta.texto_questao}</p>
                        <span className="pergunta-tipo badge badge-default">
                          {pergunta.tipo_questao}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/questionarios')}
            disabled={loading}
          >
            <XIcon /> Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Salvando...' : (
              <>
                <CheckIcon /> Salvar Alterações
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditarQuestionario

