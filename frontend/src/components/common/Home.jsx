import React from 'react'

function Home() {
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
        </div>
      </div>

      <p 
        className="dashboard-placeholder-text"
        style={{
          margin: '0 0 24px 0',
          fontSize: '18px',
          fontWeight: 500,
          maxWidth: '800px',
          marginInline: 'auto',
          lineHeight: 1.5,
          textAlign: 'center'
        }}
      >
        O Marcos não implementou nada da tela de dashboard ainda. Ele será o primeiro demitido do projeto.
      </p>

      <div 
        className="dashboard-placeholder"
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '60vh',
          borderRadius: '16px',
          overflow: 'hidden',
          backgroundImage: 'url(/roberto_justus.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: '40px'
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: '64px',
            fontWeight: 'bold',
            color: '#ffffff',
            textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8)',
            letterSpacing: '4px'
          }}
        >
          MARCOS
        </h1>
      </div>
    </div>
  )
}

export default Home
