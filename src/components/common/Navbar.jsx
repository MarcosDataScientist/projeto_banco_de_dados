import React, { useState, useEffect, useRef } from 'react'
import {
  DashboardIcon,
  QuestionsIcon,
  FormsIcon,
  UsersIcon,
  ReportsIcon,
  BellIcon,
  SettingsIcon,
  LogOutIcon,
  AvaliadoresIcon,
  AvaliacaoIcon
} from './Icons'

function Navbar({ currentPage, setCurrentPage }) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isDarkTheme, setIsDarkTheme] = useState(false)
  const dropdownRef = useRef(null)
  
  const menuItems = [
    { id: 'avaliacao', label: 'Avaliação', icon: <AvaliacaoIcon /> },
    { id: 'funcionarios', label: 'Funcionários', icon: <UsersIcon /> },
    { id: 'avaliadores', label: 'Avaliadores', icon: <AvaliadoresIcon /> },
    { id: 'questionarios', label: 'Questionários', icon: <FormsIcon /> },
    { id: 'perguntas', label: 'Perguntas', icon: <QuestionsIcon /> },
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'relatorios', label: 'Relatórios', icon: <ReportsIcon /> }
  ]

  const userMenuItems = [
    { id: 'profile', label: 'Perfil', icon: <UsersIcon /> },
    { id: 'configuracoes', label: 'Configurações', icon: <SettingsIcon /> },
    { id: 'theme', label: 'Tema Escuro', icon: null, isToggle: true },
    { id: 'logout', label: 'Sair', icon: <LogOutIcon /> }
  ]

  const handleUserMenuToggle = () => {
    setIsUserMenuOpen(!isUserMenuOpen)
  }

  const handleUserMenuItemClick = (itemId) => {
    if (itemId === 'logout') {
      // Lógica para logout
      console.log('Logout clicked')
    } else if (itemId === 'theme') {
      // Toggle do tema escuro
      const newTheme = !isDarkTheme
      setIsDarkTheme(newTheme)
      // Aplicar tema ao body
      document.body.classList.toggle('dark-theme', newTheme)
    } else {
      setCurrentPage(itemId)
    }
    if (itemId !== 'theme') {
      setIsUserMenuOpen(false)
    }
  }

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isUserMenuOpen])

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo">
          <div className="logo-icon">S</div>
          <h1>SADEF</h1>
        </div>
        
        <ul className="nav-menu">
          {menuItems.map(item => (
            <li key={item.id} className="nav-item">
              <button
                className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => setCurrentPage(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="navbar-right">
          <button className="notification-icon">
            <BellIcon />
          </button>
          <div className="navbar-user-container" ref={dropdownRef}>
            <div className="navbar-user" onClick={handleUserMenuToggle}>
              <div className="user-avatar">U</div>
              <span className="user-name">Olá, Usuário</span>
            </div>
            
            {isUserMenuOpen && (
              <div className="user-dropdown">
                <div className="user-dropdown-header">
                  <div className="user-dropdown-avatar">U</div>
                  <div className="user-dropdown-info">
                    <span className="user-dropdown-name">Usuário Sistema</span>
                    <span className="user-dropdown-email">usuario@sistema.com</span>
                  </div>
                </div>
                <div className="user-dropdown-divider"></div>
                {userMenuItems.map(item => (
                  item.isToggle ? (
                    <div key={item.id} className="user-dropdown-item user-dropdown-toggle">
                      <span className="user-dropdown-label">{item.label}</span>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={isDarkTheme}
                          onChange={() => handleUserMenuItemClick(item.id)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  ) : (
                    <button
                      key={item.id}
                      className="user-dropdown-item"
                      onClick={() => handleUserMenuItemClick(item.id)}
                    >
                      <span className="user-dropdown-icon">{item.icon}</span>
                      <span className="user-dropdown-label">{item.label}</span>
                    </button>
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

