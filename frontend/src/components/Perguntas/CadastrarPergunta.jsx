import React, { useState, useEffect } from 'react'
import { XIcon, QuestionIcon, ToggleIcon, CheckIcon } from '../common/Icons'
import api from '../../services/api'

function CadastrarPergunta({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    texto: '',
    status: 'Ativo', // Default value
    opcoes: ['', '', '', ''] // 4 opções padrão para múltipla escolha (Modelo 2: apenas múltipla escolha)
  })
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      carregarCategorias()
    }
  }, [isOpen])

  const carregarCategorias = async () => {
    try {
      const categoriasData = await api.getCategorias()
      setCategorias(categoriasData)
    } catch (err) {
      console.error('Erro ao carregar categorias:', err)
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
    if (formData.opcoes.length < 6) { // Máximo 6 opções
      setFormData(prev => ({
        ...prev,
        opcoes: [...prev.opcoes, '']
      }))
    }
  }

  const removerOpcao = (index) => {
    if (formData.opcoes.length > 2) { // Mínimo 2 opções
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

    // Verificar se todas as opções disponíveis estão preenchidas
    const opcoesVazias = formData.opcoes.filter(opcao => opcao.trim() === '')
    
    if (opcoesVazias.length > 0) {
      newErrors.opcoes = 'Todas as opções disponíveis devem ser preenchidas. Não é permitido deixar opções em branco.'
    } else {
      // Verificar quantidade mínima
      if (formData.opcoes.length < 2) {
        newErrors.opcoes = 'Múltipla escolha deve ter pelo menos 2 opções'
      }
      
      // Verificar se há opções duplicadas
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
          .filter(opcao => opcao !== '') // Filtro de segurança adicional
      }

      await api.criarPergunta(dadosParaEnvio)
      
      // Resetar formulário
      setFormData({
        texto: '',
        status: 'Ativo',
        opcoes: ['', '', '', '']
      })
      setErrors({})
      
      onSuccess()
      onClose()
      
    } catch (err) {
      console.error('Erro ao cadastrar pergunta:', err)
      alert('Erro ao cadastrar pergunta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      texto: '',
      status: 'Ativo',
      opcoes: ['', '', '', '']
    })
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">
            <QuestionIcon /> Nova Pergunta
          </h2>
          <button 
            className="modal-close"
            onClick={handleClose}
          >
            <XIcon />
          </button>
        </div>
        
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
                  />
                  {formData.opcoes.length > 2 && (
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
              
              {formData.opcoes.length < 6 && (
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
              disabled={loading}
            >
              {loading ? 'Cadastrando...' : 'Cadastrar Pergunta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CadastrarPergunta