import React, { useState } from 'react'
import {
  DashboardIcon,
  QuestionsIcon,
  FormsIcon,
  UsersIcon,
  ReportsIcon,
  AvaliadoresIcon,
  AvaliacaoIcon
} from './Icons'

function Navbar({ currentPage, setCurrentPage }) {
  const [isDarkTheme, setIsDarkTheme] = useState(false)
  
  const menuItems = [
    { id: 'avaliacoes', label: 'Avaliação', icon: <AvaliacaoIcon /> },
    { id: 'funcionarios', label: 'Funcionários', icon: <UsersIcon /> },
    { id: 'avaliadores', label: 'Avaliadores', icon: <AvaliadoresIcon /> },
    { id: 'questionarios', label: 'Questionários', icon: <FormsIcon /> },
    { id: 'perguntas', label: 'Perguntas', icon: <QuestionsIcon /> },
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> }
  ]

  const handleThemeToggle = () => {
    const newTheme = !isDarkTheme
    setIsDarkTheme(newTheme)
    // Aplicar tema ao body
    document.body.classList.toggle('dark-theme', newTheme)
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo">
          <img src="/favicon.png" alt="Logo" className="logo-image" />
          <h1>Lutica Beregula<br />system</h1>
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
          <div className="theme-toggle-container">
            <span className="theme-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            </span>
            <label className="theme-toggle-switch">
              <input
                type="checkbox"
                checked={isDarkTheme}
                onChange={handleThemeToggle}
              />
              <span className="theme-toggle-slider"></span>
            </label>
            <span className="theme-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            </span>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

