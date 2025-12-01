import React, { useState, useEffect } from 'react'
import { XIcon, QuestionIcon, ToggleIcon, CheckIcon } from '../common/Icons'
import api from '../../services/api'

function EditarPergunta({ isOpen, onClose, onSuccess, perguntaId }) {
  const [formData, setFormData] = useState({
    texto: '',
    status: 'Ativo',
    opcoes: ['', ''] // Modelo 2: apenas múltipla escolha
  })
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [errors, setErrors] = useState({})
  const [temRespostas, setTemRespostas] = useState(false)

  useEffect(() => {
    if (isOpen && perguntaId) {
      carregarDados()
    }
  }, [isOpen, perguntaId])

  const carregarDados = async () => {
    try {
      setLoadingData(true)
      const perguntaData = await api.getPergunta(perguntaId)
      
      // Verificar se tem respostas vinculadas
      // A API pode retornar total_respostas ou podemos verificar de outra forma
      const totalRespostas = perguntaData.total_respostas || perguntaData.total_respostas_vinculadas || 0
      setTemRespostas(totalRespostas > 0)

      // Processar opções - pode vir como array de strings ou array de objetos
      let opcoesProcessadas = ['', '']
      if (perguntaData.opcoes) {
        if (Array.isArray(perguntaData.opcoes)) {
          // Se for array de objetos (nova estrutura)
          if (perguntaData.opcoes.length > 0 && typeof perguntaData.opcoes[0] === 'object') {
            opcoesProcessadas = perguntaData.opcoes.map(op => op.texto_opcao || op)
          } else {
            // Se for array de strings
            opcoesProcessadas = perguntaData.opcoes
          }
        } else if (typeof perguntaData.opcoes === 'string') {
          // Se for string JSON
          try {
            const parsed = JSON.parse(perguntaData.opcoes)
            if (Array.isArray(parsed)) {
              opcoesProcessadas = parsed.map(op => typeof op === 'object' ? op.texto_opcao || op : op)
            }
          } catch (e) {
            console.error('Erro ao fazer parse das opções:', e)
          }
        }
      }

      setFormData({
        texto: perguntaData.texto_questao || perguntaData.texto || '',
        status: perguntaData.status || 'Ativo',
        opcoes: opcoesProcessadas.length > 0 ? opcoesProcessadas : ['', '']
      })
    } catch (err) {
      console.error('Erro ao carregar pergunta:', err)
      alert('Erro ao carregar dados da pergunta.')
    } finally {
      setLoadingData(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }

    // Não precisa mais ajustar tipo (Modelo 2: apenas múltipla escolha)
  }

  const handleOpcaoChange = (index, value) => {
    const novasOpcoes = [...formData.opcoes]
    novasOpcoes[index] = value
    setFormData(prev => ({
      ...prev,
      opcoes: novasOpcoes
    }))
    
    // Limpar erro de opções quando o usuário começar a preencher
    if (errors.opcoes && value.trim() !== '') {
      setErrors(prev => ({
        ...prev,
        opcoes: ''
      }))
    }
  }

  const adicionarOpcao = () => {
    if (formData.opcoes.length < 6) {
      setFormData(prev => ({
        ...prev,
        opcoes: [...prev.opcoes, '']
      }))
    }
  }

  const removerOpcao = (index) => {
    if (formData.opcoes.length > 2) {
      const novasOpcoes = formData.opcoes.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        opcoes: novasOpcoes
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.texto.trim()) {
      newErrors.texto = 'Texto da pergunta é obrigatório'
    } else if (formData.texto.trim().length < 10) {
      newErrors.texto = 'Texto deve ter pelo menos 10 caracteres'
    }

    // Validar opções (Modelo 2: sempre múltipla escolha)
    const opcoesVazias = formData.opcoes.filter(opcao => opcao.trim() === '')
    
    if (opcoesVazias.length > 0) {
      newErrors.opcoes = 'Todas as opções disponíveis devem ser preenchidas. Não é permitido deixar opções em branco.'
    } else {
      if (formData.opcoes.length < 2) {
        newErrors.opcoes = 'Múltipla escolha deve ter pelo menos 2 opções'
      }
      
      const opcoesValidas = formData.opcoes.map(opcao => opcao.trim())
      const opcoesUnicas = [...new Set(opcoesValidas)]
      if (opcoesUnicas.length !== opcoesValidas.length) {
        newErrors.opcoes = 'Não é possível ter opções duplicadas'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (temRespostas) {
      alert('Não é possível editar perguntas que já possuem respostas vinculadas.')
      return
    }
    
    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      
      const dadosParaEnvio = {
        texto: formData.texto.trim(),
        status: formData.status,
        opcoes: formData.opcoes
          .map(opcao => opcao.trim())
          .filter(opcao => opcao !== '')
      }

      await api.atualizarPergunta(perguntaId, dadosParaEnvio)
      
      onSuccess()
      onClose()
      
    } catch (err) {
      console.error('Erro ao atualizar pergunta:', err)
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao atualizar pergunta. Tente novamente.'
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      texto: '',
      status: 'Ativo',
      opcoes: ['', '']
    })
    setErrors({})
    setTemRespostas(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">
            <QuestionIcon /> Editar Pergunta
          </h2>
          <button 
            className="modal-close"
            onClick={handleClose}
          >
            <XIcon />
          </button>
        </div>
        
        {loadingData ? (
          <div className="modal-body" style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner"></div>
            <p>Carregando dados da pergunta...</p>
          </div>
        ) : (
          <>
            {temRespostas && (
              <div style={{
                margin: '0 24px 20px 24px',
                padding: '12px 16px',
                background: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '8px',
                color: '#856404',
                fontSize: '14px'
              }}>
                ⚠️ Esta pergunta possui respostas vinculadas e não pode ser editada.
              </div>
            )}

            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label htmlFor="texto" className="form-label">
                  <QuestionIcon /> Texto da Pergunta *
                </label>
                <textarea
                  id="texto"
                  name="texto"
                  value={formData.texto}
                  onChange={handleInputChange}
                  className={`form-input ${errors.texto ? 'error' : ''}`}
                  placeholder="Digite o texto da pergunta..."
                  rows={4}
                  required
                  disabled={temRespostas}
                />
                {errors.texto && <span className="error-message">{errors.texto}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="status" className="form-label">
                    <ToggleIcon /> Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="form-input"
                    disabled={temRespostas}
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <CheckIcon /> Opções de Resposta * (Múltipla Escolha)
                </label>
                <div className="opcoes-container">
                  {formData.opcoes.map((opcao, index) => (
                    <div key={index} className="opcao-item">
                      <input
                        type="text"
                        value={opcao}
                        onChange={(e) => handleOpcaoChange(index, e.target.value)}
                        className={`form-input opcao-input ${errors.opcoes && opcao.trim() === '' ? 'error' : ''}`}
                        placeholder={`Opção ${index + 1}`}
                        disabled={temRespostas}
                      />
                      {formData.opcoes.length > 2 && !temRespostas && (
                        <button
                          type="button"
                          className="btn-remove-opcao"
                          onClick={() => removerOpcao(index)}
                          title="Remover opção"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {formData.opcoes.length < 6 && !temRespostas && (
                    <button
                      type="button"
                      className="btn-add-opcao"
                      onClick={adicionarOpcao}
                    >
                      + Adicionar Opção
                    </button>
                  )}
                </div>
                {errors.opcoes && <span className="error-message">{errors.opcoes}</span>}
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={loading || temRespostas}
                >
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default EditarPergunta
