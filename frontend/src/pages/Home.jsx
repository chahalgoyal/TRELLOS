import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBoards, updateBoard, deleteBoard } from '../api';
import Navbar from '../components/Navbar';
import CreateBoardModal from '../components/CreateBoardModal';


import Sidebar from '../components/Sidebar';

export default function Home() {
  const [boards, setBoards] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [contextMenu, setContextMenu] = useState(null); // { x, y, id }
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const toggleStar = async (board, e) => {
    e.stopPropagation();
    const newStarred = !board.is_starred;
    setBoards(prev => prev.map(b => b.id === board.id ? { ...b, is_starred: newStarred } : b));
    try {
      await updateBoard(board.id, { is_starred: newStarred });
    } catch (err) {
      console.error(err);
      setBoards(prev => prev.map(b => b.id === board.id ? { ...b, is_starred: board.is_starred } : b));
    }
  };

  useEffect(() => {
    getBoards()
      .then(setBoards)
      .catch(err => setError(err.message || 'Failed to connect to backend database'));
  }, []);

  useEffect(() => {
    const handleGlobalClick = () => setContextMenu(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const handleContextMenu = (e, boardId) => {
    e.preventDefault();
    setContextMenu({ x: e.pageX, y: e.pageY, id: boardId });
  };

  const handleDeleteBoard = async (id) => {
    const board = boards.find(b => b.id === id);
    if (!window.confirm(`Are you sure you want to delete board "${board.title}"?`)) return;

    try {
      await deleteBoard(id);
      setBoards(prev => prev.filter(b => b.id !== id));
      setContextMenu(null);
    } catch (err) {
      console.error(err);
      alert('Failed to delete board');
    }
  };

  return (
    <div className="home-page-container app-container">
      <Navbar />
      <div className="app-body">
        <Sidebar className="home-sidebar" />
        <main className="home-main" style={{ flex: 1, padding: '32px 48px', overflowY: 'auto' }}>
          <section className="board-section">
            {boards.some(b => b.is_starred) && (
              <>
                <header className="home-section-header" style={{ marginBottom: 16 }}>
                  <h2 className="section-title">
                    <span className="ws-avatar sm" style={{ background: '#f7cd56' }}>★</span> Starred boards
                  </h2>
                </header>
                <div className="boards-grid" style={{ marginBottom: 32 }}>
                  {boards.filter(b => b.is_starred).map(b => (
                    <button 
                      key={`star-${b.id}`} 
                      className="board-tile" 
                      style={{ background: b.bg_type === 'image' ? `url(${b.bg_value}) center/cover` : b.bg_value }} 
                      onClick={() => navigate(`/board/${b.id}`)}
                      onContextMenu={(e) => handleContextMenu(e, b.id)}
                    >
                      <div className="board-tile-overlay" />
                      <span className="board-tile-title">{b.title}</span>
                      <div className="board-tile-star is-starred" onClick={(e) => toggleStar(b, e)}>★</div>
                    </button>
                  ))}
                </div>
              </>
            )}

            <header className="home-section-header" style={{ marginBottom: 16 }}>
              <h2 className="section-title">
                <span className="ws-avatar sm">T</span> Your boards
              </h2>
            </header>
            
            {error && (
              <div className="api-error-alert glass">
                <strong>API Error:</strong> {error}.
              </div>
            )}

            <div className="boards-grid">
              {boards.map(b => (
                <button 
                  key={b.id} 
                  className="board-tile" 
                  style={{ background: b.bg_type === 'image' ? `url(${b.bg_value}) center/cover` : b.bg_value }} 
                  onClick={() => navigate(`/board/${b.id}`)}
                  onContextMenu={(e) => handleContextMenu(e, b.id)}
                >
                  <div className="board-tile-overlay" />
                  <span className="board-tile-title">{b.title}</span>
                  <div 
                    className={`board-tile-star ${b.is_starred ? 'is-starred' : ''}`}
                    onClick={(e) => toggleStar(b, e)}
                  >
                    {b.is_starred ? '★' : '☆'}
                  </div>
                </button>
              ))}
              <button className="board-tile create-tile glass" onClick={() => setShowModal(true)}>
                Create new board
              </button>
            </div>
          </section>
        </main>
      </div>
      {showModal && (
        <CreateBoardModal onClose={() => setShowModal(false)}
          onCreated={b => { setBoards(p => [b, ...p]); setShowModal(false); navigate(`/board/${b.id}`); }} />
      )}

      {contextMenu && (
        <div 
          className="board-context-menu glass-heavy"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="context-menu-item delete" onClick={() => handleDeleteBoard(contextMenu.id)}>
            <span className="icon">🗑️</span> Delete Board
          </button>
        </div>
      )}
    </div>
  );
}
