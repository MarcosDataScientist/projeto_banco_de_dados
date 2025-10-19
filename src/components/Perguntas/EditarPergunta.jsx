import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { SaveIcon, XIcon, QuestionsIcon, PlusIcon, DeleteIcon } from '../common/Icons'
import api from '../../services/api'

function EditarPergunta() {
  const { id } = useParams() // id é o cod_questao
  const navigate = useNavigate()
  
  const [pergunta, setPergunta] = useState({
    cod_questao: '',
    texto_questao: '',
    tipo_questao: '',
    status: 'Ativo'
  })
  const [opcoes, setOpcoes] = useState([]) // Para múltipla escolha
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    carregarDados()
  }, [id])

  const carregarDados = async () => {
    try {
      setLoading(true)
      setError(null)

      const perguntaData = await api.getPergunta(id)

      setPergunta({
        cod_questao: perguntaData.cod_questao || '',
        texto_questao: perguntaData.texto_questao || '',
        tipo_questao: perguntaData.tipo_questao || '',
        status: perguntaData.status || 'Ativo'
      })

      // Se for múltipla escolha e tiver opções
      if (perguntaData.tipo_questao === 'Múltipla Escolha' && perguntaData.opcoes) {
        // opcoes pode ser um array JSON
        const opcoesArray = Array.isArray(perguntaData.opcoes) 
          ? perguntaData.opcoes 
          : JSON.parse(perguntaData.opcoes)
        setOpcoes(opcoesArray)
      }
    } catch (err) {
      console.error('Erro ao carregar pergunta:', err)
      setError('Não foi possível carregar os dados da pergunta.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setPergunta(prev => ({
      ...prev,
      [name]: value
    }))

    // Se mudar o tipo, limpar opções se necessário
    if (name === 'tipo_questao' && value !== 'Múltipla Escolha') {
      setOpcoes([])
    }
  }

  const handleAddOpcao = () => {
    setOpcoes([...opcoes, ''])
  }

  const handleOpcaoChange = (index, value) => {
    const novasOpcoes = [...opcoes]
    novasOpcoes[index] = value
    setOpcoes(novasOpcoes)
  }

  const handleRemoveOpcao = (index) => {
    setOpcoes(opcoes.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validações
    if (pergunta.tipo_questao === 'Múltipla Escolha' && opcoes.filter(o => o.trim()).length < 2) {
      alert('Questões de múltipla escolha precisam ter pelo menos 2 opções.')
      return
    }

    try {
      setLoading(true)
      
      // Dados para atualizar
      const dados = {
        texto_questao: pergunta.texto_questao,
        tipo_questao: pergunta.tipo_questao,
        status: pergunta.status
      }

      // Se for múltipla escolha, incluir opções (será tratado pelo backend)
      if (pergunta.tipo_questao === 'Múltipla Escolha') {
        dados.opcoes = opcoes.filter(o => o.trim())
      }

      await api.atualizarPergunta(id, dados)
      alert('Pergunta atualizada com sucesso!')
      navigate('/perguntas')
    } catch (err) {
      console.error('Erro ao atualizar pergunta:', err)
      alert('Erro ao atualizar pergunta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/perguntas')
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando dados da pergunta...</p>
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
        <h2>Editar Pergunta</h2>
        <p>Atualize as informações da pergunta</p>
      </div>

      <div className="form-container">
        <div className="form-card">
          {/* Header Section */}
          <div className="form-avatar-section">
            <div className="form-avatar-placeholder" style={{ background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)' }}>
              <QuestionsIcon />
            </div>
            <div className="form-avatar-info">
              <h3>Questão #{pergunta.cod_questao}</h3>
              <p className="form-avatar-subtitle">
                {pergunta.tipo_questao || 'Tipo de questão'}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="employee-form">
            <div className="form-group">
              <label htmlFor="texto_questao" className="form-label">
                Texto da Pergunta <span className="required">*</span>
              </label>
              <textarea
                id="texto_questao"
                name="texto_questao"
                value={pergunta.texto_questao}
                onChange={handleChange}
                className="form-textarea"
                rows="4"
                placeholder="Digite o texto da pergunta..."
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="tipo_questao" className="form-label">
                  Tipo de Questão <span className="required">*</span>
                </label>
                <select
                  id="tipo_questao"
                  name="tipo_questao"
                  value={pergunta.tipo_questao}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Selecione o tipo</option>
                  <option value="Múltipla Escolha">Múltipla Escolha</option>
                  <option value="Texto Livre">Texto Livre</option>
                  <option value="Sim/Não">Sim/Não</option>
                  <option value="Escala">Escala</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="status" className="form-label">
                  Status <span className="required">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={pergunta.status}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>
            </div>

            {/* Opções de Múltipla Escolha */}
            {pergunta.tipo_questao === 'Múltipla Escolha' && (
              <div className="form-group">
                <label className="form-label">
                  Opções de Resposta <span className="required">*</span>
                </label>
                <div className="opcoes-list">
                  {opcoes.map((opcao, index) => (
                    <div key={index} className="opcao-item">
                      <input
                        type="text"
                        value={opcao}
                        onChange={(e) => handleOpcaoChange(index, e.target.value)}
                        className="form-input"
                        placeholder={`Opção ${index + 1}`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveOpcao(index)}
                        className="btn-remove-opcao"
                        title="Remover opção"
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddOpcao}
                    className="btn-add-opcao"
                  >
                    <PlusIcon /> Adicionar Opção
                  </button>
                </div>
              </div>
            )}

            {/* Info sobre outros tipos */}
            {pergunta.tipo_questao === 'Texto Livre' && (
              <div className="form-info">
                <p>Questões de texto livre permitem que o usuário digite uma resposta aberta.</p>
              </div>
            )}

            {pergunta.tipo_questao === 'Sim/Não' && (
              <div className="form-info">
                <p>Questões Sim/Não apresentam apenas duas opções de resposta.</p>
              </div>
            )}

            {pergunta.tipo_questao === 'Escala' && (
              <div className="form-info">
                <p>Questões de escala permitem avaliação numérica (geralmente de 1 a 5).</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="form-actions">
              <button type="button" onClick={handleCancel} className="btn-cancel" disabled={loading}>
                <XIcon /> Cancelar
              </button>
              <button type="submit" className="btn-save" disabled={loading}>
                <SaveIcon /> {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditarPergunta

