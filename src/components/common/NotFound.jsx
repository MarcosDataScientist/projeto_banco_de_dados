import React from 'react'
import { useNavigate } from 'react-router-dom'

function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="page-container">
      <div className="not-found">
        <div className="not-found-content">
          <h1>404</h1>
          <h2>Página não encontrada</h2>
          <p>A página que você está procurando não existe ou foi movida.</p>
          <div className="not-found-actions">
            <button 
              className="btn-primary"
              onClick={() => navigate('/')}
            >
              Voltar ao Dashboard
            </button>
            <button 
              className="btn-secondary"
              onClick={() => navigate(-1)}
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound
