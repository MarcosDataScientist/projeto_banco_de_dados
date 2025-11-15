import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckIcon, SearchIcon, XIcon } from '../common/Icons'
import api from '../../services/api'

function CadastrarFormulario() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    nome: '',
    tipo: '',
    classificacao_cod: '',
    status: 'Ativo'
  })
  
  const [perguntas, setPerguntas] = useState([])
  const [classificacoes, setClassificacoes] = useState([])
  const [perguntasSelecionadas, setPerguntasSelecionadas] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setLoadingData(true)
      const [perguntasData, classificacoesData] = await Promise.all([
        api.getPerguntas(null, true), // Apenas perguntas ativas
        api.getClassificacoes()
      ])
      setPerguntas(perguntasData)
      setClassificacoes(classificacoesData)
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setError('Erro ao carregar dados necessários')
    } finally {
      setLoadingData(false)
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

      const resultado = await api.criarQuestionario(dados)
      
      // Redirecionar de volta para a lista de formulários com mensagem de sucesso
      navigate('/questionarios?success=created&nome=' + encodeURIComponent(dados.nome))
    } catch (err) {
      console.error('Erro ao criar questionário:', err)
      setError(err.message || 'Erro ao criar questionário')
    } finally {
      setLoading(false)
    }
  }

  const filteredPerguntas = perguntas.filter(pergunta => {
    const searchLower = searchTerm.toLowerCase()
    return (
      pergunta.texto_questao?.toLowerCase().includes(searchLower) ||
      pergunta.tipo_questao?.toLowerCase().includes(searchLower)
    )
  })

  if (loadingData) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h2>Novo Formulário</h2>
          <p>Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Novo Formulário</h2>
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

            <div className="search-bar" style={{ marginBottom: '15px' }}>
              <span className="search-icon"><SearchIcon /></span>
              <input
                type="text"
                placeholder="Buscar perguntas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="perguntas-list">
              {filteredPerguntas.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                  {searchTerm ? 'Nenhuma pergunta encontrada' : 'Nenhuma pergunta disponível'}
                </p>
              ) : (
                filteredPerguntas.map(pergunta => (
                  <div
                    key={pergunta.cod_questao}
                    className={`pergunta-item ${perguntasSelecionadas.includes(pergunta.cod_questao) ? 'selected' : ''}`}
                    onClick={() => togglePergunta(pergunta.cod_questao)}
                  >
                    <div className="pergunta-checkbox">
                      <input
                        type="checkbox"
                        checked={perguntasSelecionadas.includes(pergunta.cod_questao)}
                        onChange={() => {}}
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
                ))
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
            {loading ? 'Criando...' : (
              <>
                <CheckIcon /> Criar Formulário
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CadastrarFormulario
