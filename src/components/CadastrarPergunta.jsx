import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SaveIcon, XIcon, PlusIcon, DeleteIcon } from './Icons'

function CadastrarPergunta() {
  const navigate = useNavigate()
  
  const [pergunta, setPergunta] = useState({
    texto: '',
    categoria: '',
    tipo: 'multipla_escolha',
    opcoes: ['', ''],
    ativa: true
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setPergunta(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleTipoChange = (e) => {
    const tipo = e.target.value
    setPergunta(prev => ({
      ...prev,
      tipo,
      opcoes: tipo === 'multipla_escolha' ? ['', ''] : []
    }))
  }

  const addOpcao = () => {
    setPergunta(prev => ({
      ...prev,
      opcoes: [...prev.opcoes, '']
    }))
  }

  const removeOpcao = (index) => {
    setPergunta(prev => ({
      ...prev,
      opcoes: prev.opcoes.filter((_, i) => i !== index)
    }))
  }

  const updateOpcao = (index, value) => {
    setPergunta(prev => ({
      ...prev,
      opcoes: prev.opcoes.map((opcao, i) => i === index ? value : opcao)
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validação básica
    if (!pergunta.texto.trim()) {
      alert('Por favor, digite o texto da pergunta')
      return
    }
    
    if (!pergunta.categoria.trim()) {
      alert('Por favor, selecione uma categoria')
      return
    }
    
    if (pergunta.tipo === 'multipla_escolha' && pergunta.opcoes.some(op => !op.trim())) {
      alert('Por favor, preencha todas as opções de múltipla escolha')
      return
    }
    
    // Aqui você faria o envio dos dados para o backend
    console.log('Pergunta cadastrada:', pergunta)
    
    // Redirecionar de volta para a lista
    navigate('/perguntas')
  }

  const handleCancel = () => {
    navigate('/perguntas')
  }

  const renderOpcoesMultiplaEscolha = () => {
    if (pergunta.tipo !== 'multipla_escolha') return null

    return (
      <div className="form-group">
        <label className="form-label">
          Opções de Resposta <span className="required">*</span>
        </label>
        <div className="opcoes-container">
          {pergunta.opcoes.map((opcao, index) => (
            <div key={index} className="opcao-item">
              <input
                type="text"
                value={opcao}
                onChange={(e) => updateOpcao(index, e.target.value)}
                className="form-input opcao-input"
                placeholder={`Opção ${index + 1}`}
              />
              {pergunta.opcoes.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOpcao(index)}
                  className="btn-remove-opcao"
                >
                  <DeleteIcon />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addOpcao}
            className="btn-add-opcao"
          >
            <PlusIcon /> Adicionar Opção
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Cadastrar Nova Pergunta</h2>
        <p>Adicione uma nova pergunta ao sistema de avaliação</p>
      </div>

      <div className="form-container">
        <div className="form-card">
          <form onSubmit={handleSubmit} className="pergunta-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="texto" className="form-label">
                  Texto da Pergunta <span className="required">*</span>
                </label>
                <textarea
                  id="texto"
                  name="texto"
                  value={pergunta.texto}
                  onChange={handleChange}
                  className="form-textarea"
                  placeholder="Digite a pergunta aqui..."
                  rows="4"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="categoria" className="form-label">
                  Categoria <span className="required">*</span>
                </label>
                <select
                  id="categoria"
                  name="categoria"
                  value={pergunta.categoria}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  <option value="Ambiente">Ambiente</option>
                  <option value="Saída">Saída</option>
                  <option value="Recomendação">Recomendação</option>
                  <option value="Geral">Geral</option>
                  <option value="Satisfação">Satisfação</option>
                  <option value="Gestão">Gestão</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="tipo" className="form-label">
                  Tipo de Pergunta <span className="required">*</span>
                </label>
                <select
                  id="tipo"
                  name="tipo"
                  value={pergunta.tipo}
                  onChange={handleTipoChange}
                  className="form-select"
                  required
                >
                  <option value="multipla_escolha">Múltipla Escolha</option>
                  <option value="sim_nao">Sim/Não</option>
                  <option value="texto">Texto Livre</option>
                </select>
              </div>
            </div>

            {renderOpcoesMultiplaEscolha()}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Status da Pergunta</label>
                <div className="toggle-container">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={pergunta.ativa}
                      onChange={(e) => setPergunta(prev => ({ ...prev, ativa: e.target.checked }))}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <span className="toggle-label">
                    {pergunta.ativa ? 'Pergunta ativa' : 'Pergunta inativa'}
                  </span>
                </div>
              </div>
            </div>

            {/* Preview da Pergunta */}
            <div className="form-group">
              <label className="form-label">Preview da Pergunta</label>
              <div className="pergunta-preview">
                <div className="preview-header">
                  <h4>{pergunta.texto || 'Texto da pergunta aparecerá aqui...'}</h4>
                  <span className="preview-badge">{pergunta.categoria || 'Categoria'}</span>
                </div>
                <div className="preview-body">
                  {pergunta.tipo === 'multipla_escolha' && (
                    <div className="preview-opcoes">
                      {pergunta.opcoes.map((opcao, index) => (
                        <label key={index} className="preview-option">
                          <input type="radio" name="preview" disabled />
                          <span>{opcao || `Opção ${index + 1}`}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {pergunta.tipo === 'sim_nao' && (
                    <div className="preview-opcoes">
                      <label className="preview-option">
                        <input type="radio" name="preview" disabled />
                        <span>Sim</span>
                      </label>
                      <label className="preview-option">
                        <input type="radio" name="preview" disabled />
                        <span>Não</span>
                      </label>
                    </div>
                  )}
                  {pergunta.tipo === 'texto' && (
                    <textarea
                      className="preview-textarea"
                      placeholder="Resposta em texto livre aparecerá aqui..."
                      disabled
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="form-actions">
              <button type="button" onClick={handleCancel} className="btn-cancel">
                <XIcon /> Cancelar
              </button>
              <button type="submit" className="btn-save">
                <SaveIcon /> Salvar Pergunta
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CadastrarPergunta
