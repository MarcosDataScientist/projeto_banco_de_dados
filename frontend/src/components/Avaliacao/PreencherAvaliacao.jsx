import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { UserIcon, FormsIcon, BuildingIcon, SaveIcon, XIcon, QuestionsIcon } from '../common/Icons'
import Toast from '../common/Toast'
import api from '../../services/api'

function PreencherAvaliacao() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [avaliacao, setAvaliacao] = useState(null)
  const [perguntas, setPerguntas] = useState([])
  const [respostas, setRespostas] = useState({})
  const [rating, setRating] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const [toast, setToast] = useState({
    show: false,
    type: 'success',
    title: '',
    message: ''
  })

  useEffect(() => {
    if (id) {
      carregarAvaliacao()
    }
  }, [id])

  const carregarAvaliacao = async () => {
    try {
      setLoading(true)
      console.log('Carregando avaliação com ID:', id)
      
      // Carregar avaliação
      const avaliacaoData = await api.getAvaliacao(id)
      console.log('Dados da avaliação carregados:', avaliacaoData)
      
      if (!avaliacaoData) {
        throw new Error('Avaliação não encontrada')
      }

      setAvaliacao(avaliacaoData)
      
      // Carregar rating existente se houver
      if (avaliacaoData.rating !== null && avaliacaoData.rating !== undefined) {
        setRating(avaliacaoData.rating.toString())
      }
      
      // Carregar perguntas do questionário
      // O campo pode ser questionario_id ou questionario_cod dependendo do modelo
      const questionarioId = avaliacaoData.questionario_id || avaliacaoData.questionario_cod
      
      console.log('ID do questionário:', questionarioId)
      
      if (questionarioId) {
        const questionario = await api.getQuestionario(questionarioId)
        console.log('Questionário carregado:', questionario)
        
        if (questionario?.perguntas && questionario.perguntas.length > 0) {
          // Processar perguntas: garantir que opcoes seja um array
          const perguntasProcessadas = questionario.perguntas.map(pergunta => {
            let opcoes = pergunta.opcoes
            
            console.log('Processando pergunta:', pergunta.id, 'Tipo:', pergunta.tipo, 'Opções:', opcoes)
            
            // Se opcoes for uma string JSON, fazer parse
            if (typeof opcoes === 'string') {
              try {
                opcoes = JSON.parse(opcoes)
              } catch (e) {
                console.warn('Erro ao fazer parse das opções:', e)
                opcoes = []
              }
            }
            
            // Se opcoes não for um array, tentar converter
            if (!Array.isArray(opcoes) && opcoes) {
              // Se for um objeto, tentar converter para array
              if (typeof opcoes === 'object') {
                opcoes = Object.values(opcoes)
              } else {
                opcoes = [opcoes]
              }
            }
            
            return {
              ...pergunta,
              opcoes: Array.isArray(opcoes) ? opcoes : []
            }
          })
          
          console.log('Perguntas processadas:', perguntasProcessadas)
          setPerguntas(perguntasProcessadas)
          
          // Inicializar respostas: carregar existentes ou criar vazias
          const respostasIniciais = {}
          perguntasProcessadas.forEach(pergunta => {
            respostasIniciais[pergunta.id] = ''
          })
          
          // Se a avaliação já tem respostas, carregar elas
          if (avaliacaoData.respostas && Array.isArray(avaliacaoData.respostas) && avaliacaoData.respostas.length > 0) {
            console.log('Carregando respostas existentes:', avaliacaoData.respostas)
            avaliacaoData.respostas.forEach(resposta => {
              // Usar questao_cod que vem do backend
              const questaoCod = resposta.questao_cod
              if (questaoCod && respostasIniciais.hasOwnProperty(questaoCod)) {
                // Se for resposta de texto, usar texto_resposta
                if (resposta.tipo_resposta === 'Texto' && resposta.texto_resposta) {
                  respostasIniciais[questaoCod] = resposta.texto_resposta
                }
                // Se for resposta de escolha, usar escolha
                else if (resposta.tipo_resposta === 'Escolha' && resposta.escolha) {
                  respostasIniciais[questaoCod] = resposta.escolha
                }
              }
            })
            console.log('Respostas carregadas:', respostasIniciais)
          }
          
          setRespostas(respostasIniciais)
        } else {
          console.warn('Questionário não possui perguntas')
          setPerguntas([])
        }
      } else {
        console.error('ID do questionário não encontrado na avaliação')
        showToast('error', 'Erro', 'Questionário não encontrado na avaliação.')
      }
    } catch (error) {
      console.error('Erro ao carregar avaliação:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Não foi possível carregar os dados da avaliação.'
      showToast('error', 'Erro ao carregar avaliação', errorMessage)
      setTimeout(() => {
        navigate('/avaliacoes')
      }, 2000)
    } finally {
      setLoading(false)
    }
  }

  const handleRespostaChange = (perguntaId, valor) => {
    setRespostas(prev => ({
      ...prev,
      [perguntaId]: valor
    }))
    
    // Limpar erro da pergunta
    if (errors[perguntaId]) {
      setErrors(prev => {
        const novosErros = { ...prev }
        delete novosErros[perguntaId]
        return novosErros
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    perguntas.forEach(pergunta => {
      if (!respostas[pergunta.id] || respostas[pergunta.id].trim() === '') {
        newErrors[pergunta.id] = 'Esta pergunta é obrigatória'
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      showToast('error', 'Formulário incompleto', 'Por favor, responda todas as perguntas.')
      return
    }
    
    setSaving(true)
    
    try {
      // Salvar cada resposta
      const promises = perguntas.map(pergunta => {
        const resposta = respostas[pergunta.id]
        const tipoResposta = pergunta.tipo === 'Múltipla Escolha' ? 'Escolha' : 'Texto'
        
        const dadosResposta = {
          avaliacao_cod: parseInt(id),
          questao_cod: pergunta.id,
          tipo_resposta: tipoResposta
        }
        
        // Adicionar texto ou escolha conforme o tipo
        if (tipoResposta === 'Texto') {
          dadosResposta.texto_resposta = resposta
        } else {
          dadosResposta.escolha = resposta
        }
        
        return api.salvarRespostaAvaliacao(dadosResposta)
      })
      
      await Promise.all(promises)
      
      // Atualizar rating da avaliação se foi informado
      if (rating && rating.trim() !== '') {
        try {
          const ratingValue = parseInt(rating)
          if (!isNaN(ratingValue) && ratingValue >= 1 && ratingValue <= 5) {
            await api.atualizarStatusAvaliacao(parseInt(id), {
              rating: ratingValue
            })
            console.log('Rating da avaliação atualizado:', ratingValue)
          }
        } catch (error) {
          console.error('Erro ao atualizar rating da avaliação:', error)
          // Não impedir o sucesso mesmo se a atualização do rating falhar
        }
      }
      
      // Mostrar toast de sucesso
      showToast('success', 'Avaliação concluída!', 'As respostas foram salvas com sucesso.')
      
      // Redirecionar para a listagem após 1.5 segundos
      setTimeout(() => {
        navigate('/avaliacoes')
      }, 1500)
      
    } catch (error) {
      console.error('Erro ao salvar respostas:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Não foi possível salvar as respostas. Tente novamente.'
      showToast('error', 'Erro ao salvar', errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const showToast = (type, title, message) => {
    setToast({ show: true, type, title, message })
  }

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }))
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando questionário...</p>
        </div>
      </div>
    )
  }

  if (!avaliacao) {
    return (
      <div className="page-container">
        <div className="error-container">
          <h3>Avaliação não encontrada</h3>
          <p>A avaliação solicitada não foi encontrada.</p>
          <button onClick={() => navigate('/avaliacoes')} className="btn-primary">
            Voltar para Listagem
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2>Preencher Avaliação</h2>
            <p>Responda todas as perguntas do questionário</p>
          </div>
          <button 
            className="btn-secondary"
            onClick={() => navigate('/avaliacoes')}
            disabled={saving}
          >
            <XIcon /> Cancelar
          </button>
        </div>
      </div>

      <div className="page-content">
        <div className="form-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Informações da Avaliação */}
          <div style={{
            padding: '20px',
            background: '#f8f8f8',
            borderRadius: '8px',
            marginBottom: '24px',
            border: '1px solid #e0e0e0'
          }}>
            <h3 style={{ marginBottom: '16px', color: '#2a2a2a' }}>Informações da Avaliação</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div>
                <strong>Funcionário:</strong> {avaliacao.funcionario || 'Não informado'}
              </div>
              <div>
                <strong>Avaliador:</strong> {avaliacao.avaliador || 'Não informado'}
              </div>
              <div>
                <strong>Questionário:</strong> {avaliacao.questionario || 'Não informado'}
              </div>
              {avaliacao.local && (
                <div>
                  <strong>Local:</strong> {avaliacao.local}
                </div>
              )}
            </div>
            {avaliacao.descricao && (
              <div style={{ marginTop: '12px' }}>
                <strong>Descrição:</strong> {avaliacao.descricao}
              </div>
            )}
          </div>

          {/* Formulário de Perguntas */}
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h4>Perguntas do Questionário</h4>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>
                Responda todas as perguntas abaixo. Campos marcados com * são obrigatórios.
              </p>

              {perguntas.length === 0 ? (
                <div className="empty-state">
                  <QuestionsIcon />
                  <h3>Nenhuma pergunta encontrada</h3>
                  <p>Este questionário não possui perguntas vinculadas.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {perguntas.map((pergunta, index) => (
                    <div key={pergunta.id} className="form-group" style={{
                      padding: '20px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      background: errors[pergunta.id] ? '#fff5f5' : '#ffffff'
                    }}>
                      <label className="form-label" style={{ marginBottom: '12px' }}>
                        <span style={{ marginRight: '8px', color: '#e91e63' }}>*</span>
                        {index + 1}. {pergunta.texto}
                      </label>
                      
                      {errors[pergunta.id] && (
                        <span className="error-message" style={{ display: 'block', marginBottom: '8px' }}>
                          {errors[pergunta.id]}
                        </span>
                      )}

                      {pergunta.tipo === 'Múltipla Escolha' ? (
                        <div style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '12px',
                          paddingLeft: '4px'
                        }}>
                          {pergunta.opcoes && Array.isArray(pergunta.opcoes) && pergunta.opcoes.length > 0 ? (
                            pergunta.opcoes.map((opcao, idx) => (
                              <label 
                                key={idx}
                                htmlFor={`opcao-${pergunta.id}-${idx}`}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  cursor: 'pointer',
                                  gap: '10px',
                                  padding: '8px 4px',
                                  userSelect: 'none'
                                }}
                              >
                                <input
                                  type="radio"
                                  id={`opcao-${pergunta.id}-${idx}`}
                                  name={`pergunta-${pergunta.id}`}
                                  value={opcao}
                                  checked={respostas[pergunta.id] === opcao}
                                  onChange={(e) => handleRespostaChange(pergunta.id, e.target.value)}
                                  style={{
                                    width: '18px',
                                    height: '18px',
                                    cursor: 'pointer',
                                    accentColor: '#e91e63',
                                    flexShrink: 0,
                                    margin: 0
                                  }}
                                />
                                <span style={{
                                  fontSize: '15px',
                                  color: '#2a2a2a',
                                  lineHeight: '1.5'
                                }}>
                                  {opcao}
                                </span>
                              </label>
                            ))
                          ) : (
                            <p style={{ color: '#999', fontStyle: 'italic', padding: '12px' }}>
                              Opções não disponíveis
                            </p>
                          )}
                        </div>
                      ) : (
                        <textarea
                          value={respostas[pergunta.id] || ''}
                          onChange={(e) => handleRespostaChange(pergunta.id, e.target.value)}
                          className="form-textarea"
                          rows={4}
                          placeholder="Digite sua resposta aqui..."
                          style={{
                            width: '100%',
                            minHeight: '100px'
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Campo de Rating */}
            <div className="form-section" style={{ marginTop: '32px', paddingTop: '24px', borderTop: '2px solid #e0e0e0' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="rating">
                  Nota Final (Rating)
                </label>
                <select
                  id="rating"
                  name="rating"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="form-input"
                  style={{ maxWidth: '200px' }}
                >
                  <option value="">Selecione uma nota</option>
                  <option value="1">1 - Muito Insatisfeito</option>
                  <option value="2">2 - Insatisfeito</option>
                  <option value="3">3 - Neutro</option>
                  <option value="4">4 - Satisfeito</option>
                  <option value="5">5 - Muito Satisfeito</option>
                </select>
                <p style={{ marginTop: '8px', fontSize: '13px', color: '#666' }}>
                  Opcional: Avalie a experiência geral desta avaliação.
                </p>
              </div>
            </div>

            {/* Botões de Ação */}
            {perguntas.length > 0 && (
              <div className="form-actions" style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                marginTop: '32px',
                paddingTop: '24px',
                borderTop: '2px solid #e0e0e0'
              }}>
                <button
                  type="button"
                  onClick={() => navigate('/avaliacoes')}
                  className="btn-secondary"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving}
                >
                  <SaveIcon /> {saving ? 'Salvando...' : 'Salvar Respostas'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Toast para mensagens */}
      <Toast
        show={toast.show}
        onClose={hideToast}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        duration={5000}
      />
    </div>
  )
}

export default PreencherAvaliacao

