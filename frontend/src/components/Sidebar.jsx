import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { icon: (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
      <rect x="7" y="7" width="3" height="10" rx="1" />
      <rect x="14" y="7" width="3" height="6" rx="1" />
    </svg>
  ), label: 'Boards', path: '/' },
  { icon: (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
      <path d="M4 4h16v4H4zM4 10h16v4H4zM4 16h16v4H4z" opacity="0.8" />
    </svg>
  ), label: 'Templates', path: '#' },
  { icon: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ), label: 'Home', path: '#' },
];

const workspaceItems = [
  { icon: (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM5 5h14v14H5V5z"/>
      <path d="M7 10h2v7H7zM11 7h2v10h-2zM15 13h2v4h-2z"/>
    </svg>
  ), label: 'Boards', id: 'ws-boards' },
  { icon: (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
      <path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
    </svg>
  ), label: 'Members', id: 'ws-members', hasAdd: true },
  { icon: (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.33-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
    </svg>
  ), label: 'Settings', id: 'ws-settings' },
  { icon: (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zM4 6h16v2H4V6zm16 12H4V12h16v6z"/>
    </svg>
  ), label: 'Billing', id: 'ws-billing' },
];

export default function Sidebar({ className = '' }) {
  const [activeTab, setActiveTab] = useState('ws-boards');
  const [wsExpanded, setWsExpanded] = useState(true);
  const [toastMsg, setToastMsg] = useState('');
  const location = useLocation();

  const showToast = (msg) => {
    setToastMsg(msg);
  };

  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  const handleNavClick = (e, item) => {
    if (item.label !== 'Boards') {
      e.preventDefault();
      showToast("Magical things are happening behind the scenes... ✨ Feature coming soon!");
    }
  };

  const handleWsClick = (item) => {
    setActiveTab(item.id);
    if (item.id === 'ws-billing') {
      showToast("We're still learning the ropes! No charges here, just 💙!");
    } else if (item.id !== 'ws-boards') {
      showToast("This feature is still in the workshop! 🛠️ Stay tuned!");
    }
  };

  return (
    <aside className={`app-sidebar glass ${className}`} style={{ position: 'relative' }}>
      <div className="sidebar-section">
        {navItems.map(item => {
          const isActive = location.pathname === item.path && item.path === '/';
          return (
            <Link 
              key={item.label} 
              to={item.path} 
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              onClick={(e) => handleNavClick(e, item)}
            >
              <span className="sidebar-icon" style={{ color: isActive ? 'var(--accent)' : 'inherit' }}>{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </Link>
          );
        })}
      </div>
      
      <div className="sidebar-divider" />
      
      <div className="sidebar-heading" style={{ margin: '8px 0 4px 12px' }}>Workspaces</div>
      
      <div className="sidebar-section">
        <button 
          className="sidebar-ws-header"
          onClick={() => setWsExpanded(!wsExpanded)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, width: '100%',
            padding: '8px 12px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer',
            borderRadius: 8, transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <div className="home-ws-avatar sm" style={{ background: '#22c55e', color: '#fff', borderRadius: 4 }}>T</div>
          <span style={{ fontWeight: 600, fontSize: 14, flex: 1, textAlign: 'left' }}>Trello Workspace</span>
          <span style={{ opacity: 0.6, transform: wsExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
        </button>

        {wsExpanded && (
          <div className="sidebar-ws-items" style={{ paddingLeft: 12, marginTop: 4 }}>
            {workspaceItems.map(item => (
              <div 
                key={item.id} 
                className={`sidebar-item${activeTab === item.id ? ' active' : ''}`}
                onClick={() => handleWsClick(item)}
                style={{ position: 'relative' }}
              >
                <span className="sidebar-icon" style={{ fontSize: 16 }}>{item.icon}</span>
                <span className="sidebar-label" style={{ fontWeight: activeTab === item.id ? 600 : 500 }}>{item.label}</span>
                {item.hasAdd && (
                  <button 
                    className="ws-add-btn"
                    onClick={(e) => { e.stopPropagation(); showToast("This feature is still in the workshop! 🛠️"); }}
                    style={{ background: 'transparent', border: 'none', color: 'inherit', padding: '0 4px', cursor: 'pointer', fontSize: 16 }}
                  >+</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: '500', letterSpacing: '0.02em', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <a href="https://github.com/chahalgoyal" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'} onMouseOut={(e) => e.currentTarget.style.color = 'inherit'}>
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          </a>
          <a href="https://www.linkedin.com/in/chahalgoyal/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#0077b5'} onMouseOut={(e) => e.currentTarget.style.color = 'inherit'}>
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
          </a>
        </div>
        Developed by Chahal Goyal
      </div>

      {toastMsg && (
        <div style={{
          position: 'absolute',
          bottom: '60px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.85)',
          color: '#fff',
          padding: '8px 16px',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: '500',
          whiteSpace: 'nowrap',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.1)',
          pointerEvents: 'none',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {toastMsg}
        </div>
      )}
    </aside>
  );
}
