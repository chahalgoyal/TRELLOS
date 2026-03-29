import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useMember } from '../context/MemberContext';
import BoardDrawer from './BoardDrawer';

export default function Navbar({ boardTitle }) {
  const { members, currentMember, switchMember } = useMember();
  const [open, setOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const dropdownRef = useRef();

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  return (
    <>
      <nav className="navbar glass-heavy">
      <div className="navbar-left">
        <button className="nav-icon-btn" onClick={() => setDrawerOpen(true)}>▦</button>
        <Link to="/" className="navbar-logo" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', color: 'inherit' }}>
          <img src="/icons8-trello.svg" alt="Trello Logo" width="24" height="24" style={{ filter: 'brightness(0) invert(1)' }} />
          <span className="logo-text">TRELLOS</span>
        </Link>
      </div>



      <div className="navbar-right">

        {currentMember && (
          <div className="member-switcher" ref={dropdownRef}>
            <button
              className="current-member-btn"
              onClick={() => setOpen(o => !o)}
              title={`Signed in as ${currentMember.name}`}
            >
              <img src={currentMember.avatar_url} alt={currentMember.name} className="nav-avatar" />
              <div className="member-status-dot" />
            </button>

            {open && (
              <div className="member-dropdown glass-heavy">
                <div className="dropdown-header" style={{ padding: '12px 14px 8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img src={currentMember.avatar_url} alt={currentMember.name} className="nav-avatar" />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>{currentMember.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-sub)' }}>Active account</div>
                    </div>
                  </div>
                </div>
                <div className="dropdown-label">Switch member</div>
                {members.map(m => (
                  <button
                    key={m.id}
                    className={`dropdown-item${currentMember.id === m.id ? ' active' : ''}`}
                    onClick={() => { switchMember(m); setOpen(false); }}
                  >
                    <img src={m.avatar_url} alt={m.name} className="nav-avatar sm" />
                    <span style={{ flex: 1 }}>{m.name}</span>
                    {currentMember.id === m.id && <span className="check">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
    <BoardDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
</>
  );
}
