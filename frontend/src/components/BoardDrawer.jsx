import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBoards } from '../api';

export default function BoardDrawer({ isOpen, onClose }) {
  const [boards, setBoards] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      getBoards().then(setBoards).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className={`board-drawer glass-heavy ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <span className="drawer-title">Your Workspaces</span>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="drawer-body">
          <p className="drawer-section-label">All Boards</p>
          <div className="drawer-board-list">
            {boards.map(b => (
              <button 
                key={b.id} 
                className="drawer-board-item"
                onClick={() => { navigate(`/board/${b.id}`); onClose(); }}
              >
                <div 
                  className="board-mini-preview" 
                  style={{ background: b.bg_type === 'image' ? `url(${b.bg_value}) center/cover` : b.bg_value }} 
                />
                <span className="board-selector-name">{b.title}</span>
              </button>
            ))}
          </div>
          
          <button className="sidebar-item add-board-sidebar-btn" onClick={() => { navigate('/'); onClose(); }}>
            <span className="sidebar-icon">+</span>
            <span className="sidebar-label">Create new board</span>
          </button>
        </div>
      </div>
    </>
  );
}
