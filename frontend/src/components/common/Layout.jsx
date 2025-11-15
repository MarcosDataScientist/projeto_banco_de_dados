import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate, Outlet } from 'react-router-dom'
import Navbar from './Navbar'

function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState('dashboard')

  // Atualizar página atual baseado na URL
  useEffect(() => {
    const path = location.pathname.substring(1) // Remove a barra inicial
    if (path === '' || path === 'dashboard') {
      setCurrentPage('dashboard')
    } else if (path.startsWith('avaliacoes')) {
      // Se for uma rota de avaliações (incluindo subrotas), usar 'avaliacoes'
      setCurrentPage('avaliacoes')
    } else {
      // Pegar apenas a primeira parte da rota para o menu
      const firstPart = path.split('/')[0]
      setCurrentPage(firstPart)
    }
  }, [location])

  // Função para navegar entre páginas
  const handlePageChange = (pageId) => {
    setCurrentPage(pageId)
    
    // Navegar para a rota correspondente
    switch (pageId) {
      case 'dashboard':
        navigate('/')
        break
      default:
        navigate(`/${pageId}`)
        break
    }
  }

  return (
    <div className="app">
      <Navbar currentPage={currentPage} setCurrentPage={handlePageChange} />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  )
}

export default Layout
