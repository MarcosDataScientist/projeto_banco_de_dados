import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, XIcon } from '../common/Icons'
import api from '../../services/api'

function VisualizarAvaliacao() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [avaliacao, setAvaliacao] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    carregarDados()
  }, [id])

  const carregarDados = async () => {
    try {
      setLoading(true)
      setError(null)
      const avaliacaoCompleta = await api.getAvaliacao(id)
      console.log('Dados completos da avaliação:', avaliacaoCompleta)
      console.log('Respostas recebidas:', avaliacaoCompleta?.respostas)
      setAvaliacao(avaliacaoCompleta)
    } catch (err) {
      console.error('Erro ao carregar avaliação:', err)
      setError('Não foi possível carregar os dados da avaliação.')
    } finally {
      setLoading(false)
    }
  }

  const formatarData = (data) => {
    if (!data) return 'Não informado'
    try {
      const date = new Date(data)
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return data
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando dados da avaliação...</p>
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
          <button onClick={() => navigate('/avaliacoes')} className="btn-secondary" style={{ marginLeft: '10px' }}>
            <ArrowLeftIcon /> Voltar
          </button>
        </div>
      </div>
    )
  }

  if (!avaliacao) {
    return (
      <div className="page-container">
        <div className="error-container">
          <h3>Avaliação não encontrada</h3>
          <p>Não foi possível encontrar os dados desta avaliação.</p>
          <button onClick={() => navigate('/avaliacoes')} className="btn-secondary">
            <ArrowLeftIcon /> Voltar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Detalhes da Avaliação</h2>
      </div>

      <div className="dashboard-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px', alignItems: 'stretch', height: '600px' }}>
        {/* Coluna Esquerda - Informações Básicas */}
        <div className="form-card" style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '25px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '16px', color: '#333', fontSize: '18px', borderBottom: '2px solid #e0e0e0', paddingBottom: '8px', flexShrink: 0 }}>
            Informações Básicas
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px', fontWeight: '600' }}>
                Funcionário Avaliado
              </label>
              <p style={{ margin: 0, fontSize: '14px', color: '#333', fontWeight: '500' }}>
                {avaliacao.funcionario || 'Não informado'}
              </p>
              {avaliacao.funcionario_cpf && (
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>
                  CPF: {avaliacao.funcionario_cpf}
                </p>
              )}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px', fontWeight: '600' }}>
                Avaliador
              </label>
              <p style={{ margin: 0, fontSize: '14px', color: '#333', fontWeight: '500' }}>
                {avaliacao.avaliador || 'Não informado'}
              </p>
              {avaliacao.avaliador_cpf && (
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>
                  CPF: {avaliacao.avaliador_cpf}
                </p>
              )}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px', fontWeight: '600' }}>
                Questionário
              </label>
              <p style={{ margin: 0, fontSize: '14px', color: '#333', fontWeight: '500' }}>
                {avaliacao.questionario || 'Não informado'}
              </p>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px', fontWeight: '600' }}>
                Data da Avaliação
              </label>
              <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>
                {formatarData(avaliacao.data_completa)}
              </p>
            </div>
            {avaliacao.local && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px', fontWeight: '600' }}>
                  Local
                </label>
                <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>
                  {avaliacao.local}
                </p>
              </div>
            )}
            {avaliacao.departamento && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px', fontWeight: '600' }}>
                  Departamento
                </label>
                <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>
                  {avaliacao.departamento}
                </p>
              </div>
            )}
            {avaliacao.rating !== null && avaliacao.rating !== undefined && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px', fontWeight: '600' }}>
                  Nota Final
                </label>
                <p style={{ margin: 0, fontSize: '20px', color: '#333', fontWeight: 'bold' }}>
                  {avaliacao.rating}
                </p>
              </div>
            )}
            {avaliacao.descricao && (
              <div style={{ marginTop: '8px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px', fontWeight: '600' }}>
                  Descrição
                </label>
                <p style={{ margin: 0, fontSize: '14px', color: '#333', lineHeight: '1.6', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                  {avaliacao.descricao}
                </p>
              </div>
            )}
          </div>
          <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #e5e7eb', flexShrink: 0 }}>
            <button 
              className="btn-secondary" 
              onClick={() => navigate('/avaliacoes')}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <ArrowLeftIcon /> Voltar
            </button>
          </div>
        </div>

        {/* Coluna Direita - Respostas */}
        <div className="form-card" style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '25px', display: 'flex', flexDirection: 'column', height: '97%', overflow: 'hidden' }}>
          {avaliacao.respostas && Array.isArray(avaliacao.respostas) && avaliacao.respostas.length > 0 ? (
            <>
              <h3 style={{ marginBottom: '16px', color: '#333', fontSize: '18px', borderBottom: '2px solid #e0e0e0', paddingBottom: '8px', flexShrink: 0 }}>
                Respostas ({avaliacao.respostas.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', overflowX: 'hidden', flex: 1, minHeight: 0, paddingRight: '8px' }}>
                {avaliacao.respostas.map((resposta, index) => (
                  <div 
                    key={resposta.id || index} 
                    style={{ 
                      padding: '16px', 
                      backgroundColor: '#f8f9fa', 
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0'
                    }}
                  >
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ 
                        fontSize: '12px', 
                        color: '#666', 
                        backgroundColor: '#fff',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontWeight: '600'
                      }}>
                        Pergunta {index + 1}
                      </span>
                      {resposta.tipo_pergunta && (
                        <span style={{ 
                          fontSize: '11px', 
                          color: '#999', 
                          marginLeft: '8px',
                          padding: '2px 6px',
                          backgroundColor: '#e0e0e0',
                          borderRadius: '3px'
                        }}>
                          {resposta.tipo_pergunta}
                        </span>
                      )}
                    </div>
                    <p style={{ 
                      margin: '0 0 12px 0', 
                      fontSize: '14px', 
                      color: '#333', 
                      fontWeight: '500',
                      lineHeight: '1.5'
                    }}>
                      {resposta.pergunta || 'Pergunta não encontrada'}
                    </p>
                    <div style={{ 
                      padding: '12px', 
                      backgroundColor: '#fff', 
                      borderRadius: '6px',
                      border: '1px solid #ddd'
                    }}>
                      {resposta.tipo_resposta === 'Texto' && resposta.texto_resposta ? (
                        <p style={{ margin: 0, fontSize: '14px', color: '#333', lineHeight: '1.6' }}>
                          {resposta.texto_resposta}
                        </p>
                      ) : resposta.tipo_resposta === 'Escolha' && resposta.escolha ? (
                        <p style={{ margin: 0, fontSize: '14px', color: '#333', fontWeight: '500' }}>
                          {resposta.escolha}
                        </p>
                      ) : (
                        <p style={{ margin: 0, fontSize: '13px', color: '#999', fontStyle: 'italic' }}>
                          Sem resposta
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <h3 style={{ marginBottom: '16px', color: '#333', fontSize: '18px', borderBottom: '2px solid #e0e0e0', paddingBottom: '8px' }}>
                Respostas
              </h3>
              <div style={{ 
                padding: '24px', 
                textAlign: 'center', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '8px',
                border: '1px solid #e0e0e0'
              }}>
                <p style={{ margin: 0, color: '#999', fontSize: '14px' }}>
                  Esta avaliação ainda não possui respostas cadastradas.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default VisualizarAvaliacao

