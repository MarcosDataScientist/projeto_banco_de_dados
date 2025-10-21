import React, { useState, useEffect } from 'react'
import { XIcon, QuestionIcon, TagIcon, ToggleIcon, CheckIcon } from '../common/Icons'
import api from '../../services/api'

function CadastrarPergunta({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    texto: '',
    tipo: 'Múltipla Escolha', // Default value
    status: 'Ativo', // Default value
    opcoes: ['', '', '', ''] // 4 opções padrão para múltipla escolha
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

    if (!formData.tipo) {
      newErrors.tipo = 'Tipo da pergunta é obrigatório'
    }

    if (formData.tipo === 'Múltipla Escolha') {
      const opcoesValidas = formData.opcoes.filter(opcao => opcao.trim() !== '')
      if (opcoesValidas.length < 2) {
        newErrors.opcoes = 'Múltipla escolha deve ter pelo menos 2 opções'
      }
      
      // Verificar se há opções duplicadas
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
        tipo: formData.tipo,
        status: formData.status
      }

      // Se for múltipla escolha, incluir opções válidas
      if (formData.tipo === 'Múltipla Escolha') {
        const opcoesValidas = formData.opcoes.filter(opcao => opcao.trim() !== '')
        dadosParaEnvio.opcoes = opcoesValidas
      }

      await api.criarPergunta(dadosParaEnvio)
      
      // Resetar formulário
      setFormData({
        texto: '',
        tipo: 'Múltipla Escolha',
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
      tipo: 'Múltipla Escolha',
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
              <label htmlFor="tipo" className="form-label">
                <TagIcon /> Tipo da Pergunta *
              </label>
              <select
                id="tipo"
                name="tipo"
                value={formData.tipo}
                onChange={handleInputChange}
                className={`form-input ${errors.tipo ? 'error' : ''}`}
                required
              >
                <option value="Múltipla Escolha">Múltipla Escolha</option>
                <option value="Texto Livre">Texto Livre</option>
              </select>
              {errors.tipo && <span className="error-message">{errors.tipo}</span>}
            </div>

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

          {formData.tipo === 'Múltipla Escolha' && (
            <div className="form-group">
              <label className="form-label">
                <CheckIcon /> Opções de Resposta *
              </label>
              <div className="opcoes-container">
                {formData.opcoes.map((opcao, index) => (
                  <div key={index} className="opcao-item">
                    <input
                      type="text"
                      value={opcao}
                      onChange={(e) => handleOpcaoChange(index, e.target.value)}
                      className="form-input opcao-input"
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
          )}

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