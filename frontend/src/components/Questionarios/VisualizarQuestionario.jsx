import React, { useState, useEffect } from 'react'
import { XIcon, QuestionsIcon, UsersIcon } from '../common/Icons'
import api from '../../services/api'

function VisualizarFormulario({ isOpen, onClose, questionario }) {
  const [detalhes, setDetalhes] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('perguntas') // 'perguntas' ou 'avaliacoes'

  useEffect(() => {
    if (isOpen && questionario) {
      carregarDetalhes()
    }
  }, [isOpen, questionario])

  const carregarDetalhes = async () => {
    try {
      setLoading(true)
      setError(null)
      const dados = await api.getQuestionario(questionario.id)
      setDetalhes(dados)
    } catch (err) {
      console.error('Erro ao carregar detalhes:', err)
      setError('Não foi possível carregar os detalhes do questionário')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setDetalhes(null)
    setActiveTab('perguntas')
    onClose()
  }

  if (!isOpen || !questionario) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>{questionario.titulo}</h3>
            <div className="modal-badges">
              {questionario.tipo && (
                <span className="badge badge-default">{questionario.tipo}</span>
              )}
              <span className={`badge ${getStatusBadgeColor(questionario.status)}`}>
                {questionario.status}
              </span>
            </div>
          </div>
          <button className="btn-icon" onClick={handleClose}>
            <XIcon />
          </button>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab-button ${activeTab === 'perguntas' ? 'active' : ''}`}
            onClick={() => setActiveTab('perguntas')}
          >
            <QuestionsIcon />
            Perguntas ({questionario.total_perguntas || 0})
          </button>
          <button
            className={`tab-button ${activeTab === 'avaliacoes' ? 'active' : ''}`}
            onClick={() => setActiveTab('avaliacoes')}
          >
            <UsersIcon />
            Aplicações ({questionario.total_aplicacoes || 0})
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Carregando detalhes...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <button className="btn-secondary" onClick={carregarDetalhes}>
                Tentar novamente
              </button>
            </div>
          ) : (
            <>
              {activeTab === 'perguntas' && detalhes && (
                <div className="tab-content">
                  <div className="info-section">
                    <h4>Informações do Questionário</h4>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">Classificação:</span>
                        <span className="info-value">{detalhes.classificacao || 'Não informada'}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Total de Perguntas:</span>
                        <span className="info-value">{detalhes.perguntas?.length || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="perguntas-section">
                    <h4>Perguntas Vinculadas</h4>
                    {detalhes.perguntas && detalhes.perguntas.length > 0 ? (
                      <div className="perguntas-visualizacao">
                        {detalhes.perguntas.map((pergunta, index) => (
                          <div key={pergunta.id} className="pergunta-visualizacao-item">
                            <div className="pergunta-numero">{index + 1}</div>
                            <div className="pergunta-info">
                              <p className="pergunta-texto">{pergunta.texto}</p>
                              <div className="pergunta-meta">
                                <span className="badge badge-default">{pergunta.tipo}</span>
                                <span className={`badge ${getStatusBadgeColor(pergunta.status)}`}>
                                  {pergunta.status}
                                </span>
                              </div>
                              {pergunta.opcoes && pergunta.opcoes.length > 0 && (
                                <div className="pergunta-opcoes">
                                  <strong>Opções:</strong>
                                  <ul>
                                    {pergunta.opcoes.map((opcao, idx) => (
                                      <li key={idx}>{opcao}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state-small">
                        <QuestionsIcon />
                        <p>Nenhuma pergunta vinculada a este questionário</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'avaliacoes' && (
                <div className="tab-content">
                  <div className="avaliacoes-section">
                    <h4>Avaliações Realizadas</h4>
                    <p className="section-description">
                      Lista de funcionários que responderam este questionário
                    </p>
                    
                    <div className="avaliacoes-info">
                      <div className="info-card">
                        <div className="info-card-content">
                          <span className="info-card-number">{questionario.total_aplicacoes || 0}</span>
                          <span className="info-card-label">Avaliações realizadas</span>
                        </div>
                      </div>
                      <div className="info-card">
                        <div className="info-card-content">
                          <span className="info-card-number">{questionario.total_perguntas || 0}</span>
                          <span className="info-card-label">Perguntas por avaliação</span>
                        </div>
                      </div>
                    </div>

                    {questionario.total_aplicacoes > 0 ? (
                      <div className="avaliacoes-lista">
                        <p className="info-note">
                          Para ver detalhes das avaliações e respostas, acesse a seção de Relatórios.
                        </p>
                      </div>
                    ) : (
                      <div className="empty-state-small">
                        <UsersIcon />
                        <p>Este questionário ainda não foi utilizado em nenhuma avaliação</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={handleClose}>
            Fechar
          </button>
        </div>
      </div>

      <style jsx="true">{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .modal-header {
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
        }

        .modal-header h3 {
          margin: 0 0 8px 0;
          font-size: 20px;
          color: #1f2937;
          font-weight: 600;
        }

        .modal-badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .modal-tabs {
          display: flex;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
        }

        .tab-button {
          flex: 1;
          padding: 16px 20px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #6b7280;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
          border-bottom: 3px solid transparent;
        }

        .tab-button:hover {
          background: white;
          color: #374151;
        }

        .tab-button.active {
          color: #e91e63;
          background: white;
          border-bottom-color: #e91e63;
        }

        .modal-body {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
        }

        .tab-content {
          animation: fadeIn 0.3s ease;
        }

        .info-section {
          margin-bottom: 30px;
          padding: 20px;
          background: #f9fafb;
          border-radius: 8px;
        }

        .info-section h4 {
          margin: 0 0 15px 0;
          font-size: 16px;
          color: #374151;
          font-weight: 600;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .info-label {
          font-size: 13px;
          color: #6b7280;
          font-weight: 500;
        }

        .info-value {
          font-size: 15px;
          color: #1f2937;
          font-weight: 600;
        }

        .perguntas-section,
        .avaliacoes-section {
          margin-top: 20px;
        }

        .perguntas-section h4,
        .avaliacoes-section h4 {
          margin: 0 0 15px 0;
          font-size: 18px;
          color: #1f2937;
          font-weight: 600;
        }

        .section-description {
          margin: 0 0 20px 0;
          font-size: 14px;
          color: #6b7280;
        }

        .perguntas-visualizacao {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .pergunta-visualizacao-item {
          display: flex;
          gap: 15px;
          padding: 16px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .pergunta-visualizacao-item:hover {
          border-color: #e91e63;
          box-shadow: 0 2px 8px rgba(233, 30, 99, 0.1);
        }

        .pergunta-numero {
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #e91e63;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
        }

        .pergunta-info {
          flex: 1;
        }

        .pergunta-texto {
          margin: 0 0 10px 0;
          font-size: 15px;
          color: #1f2937;
          line-height: 1.6;
        }

        .pergunta-meta {
          display: flex;
          gap: 8px;
          margin-bottom: 10px;
        }

        .pergunta-opcoes {
          margin-top: 12px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 6px;
        }

        .pergunta-opcoes strong {
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          color: #6b7280;
        }

        .pergunta-opcoes ul {
          margin: 0;
          padding-left: 20px;
        }

        .pergunta-opcoes li {
          margin: 4px 0;
          font-size: 14px;
          color: #374151;
        }

        .avaliacoes-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 25px;
        }

        .info-card {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          padding: 20px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }

        .info-card-icon {
          font-size: 32px;
        }

        .info-card-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .info-card-number {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
        }

        .info-card-label {
          font-size: 13px;
          color: #6b7280;
        }

        .avaliacoes-lista {
          padding: 20px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 8px;
        }

        .info-message {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: #1e40af;
          font-weight: 500;
        }

        .info-note {
          margin: 0;
          font-size: 13px;
          color: #6b7280;
        }

        .empty-state-small {
          padding: 40px 20px;
          text-align: center;
          color: #9ca3af;
        }

        .empty-state-small svg {
          width: 48px;
          height: 48px;
          margin-bottom: 12px;
          opacity: 0.5;
        }

        .empty-state-small p {
          margin: 0;
          font-size: 14px;
        }

        .loading-state,
        .error-state {
          padding: 60px 20px;
          text-align: center;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #e91e63;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-state p,
        .error-state p {
          margin: 0;
          color: #6b7280;
        }

        .modal-footer {
          padding: 20px 24px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .btn-icon {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          color: #6b7280;
          transition: color 0.2s;
        }

        .btn-icon:hover {
          color: #1f2937;
        }

        @media (max-width: 768px) {
          .modal-content {
            max-width: 100%;
            max-height: 100vh;
            border-radius: 0;
          }

          .info-grid,
          .avaliacoes-info {
            grid-template-columns: 1fr;
          }

          .tab-button {
            font-size: 13px;
            padding: 14px 16px;
          }
        }
      `}</style>
    </div>
  )
}

function getStatusBadgeColor(status) {
  switch (status) {
    case 'Ativo': return 'badge-ativo'
    case 'Rascunho': return 'badge-rascunho'
    case 'Inativo': return 'badge-inativo'
    case 'Arquivado': return 'badge-arquivado'
    default: return 'badge-default'
  }
}

export default VisualizarFormulario

