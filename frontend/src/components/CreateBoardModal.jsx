import { useState, useEffect } from 'react';
import { createBoard } from '../api';
import { BOARD_COLORS, BOARD_GRADIENTS, BOARD_IMAGES } from '../constants';

export default function CreateBoardModal({ onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [bgType, setBgType] = useState('image');
  const [bgValue, setBgValue] = useState(BOARD_IMAGES[0]);
  const [customUrl, setCustomUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return setError('Title is required');
    if (title.trim().length > 100) return setError('Title max 100 chars');
    try {
      const board = await createBoard({ title: title.trim(), bg_type: bgType, bg_value: bgValue });
      if (board?.error) return setError(board.error.message);
      onCreated(board);
    } catch (err) {
      setError(err.message || 'API Error: Could not reach the server');
    }
  };

  const pickBg = (val, type) => { setBgValue(val); setBgType(type); };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal-box create-board-modal glass-heavy" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span>Create board</span>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body">
          <div className="bg-selector-group">
            <div className="bg-selector-label" style={{ marginBottom: 6 }}>Photos</div>
            <div className="bg-grid" style={{ marginBottom: 16 }}>
              {BOARD_IMAGES.slice(0, 8).map(img => (
                <button key={img} className={`bg-swatch${bgValue===img?' sel':''}`} 
                  style={{ backgroundImage: `url(${img})` }} onClick={() => pickBg(img, 'image')} />
              ))}
            </div>

            <div className="bg-selector-label" style={{ marginBottom: 6 }}>Gradients</div>
            <div className="bg-grid">
              {BOARD_GRADIENTS.slice(0, 8).map(grad => (
                <button key={grad} className={`bg-swatch${bgValue===grad?' sel':''}`} 
                  style={{ background: grad }} onClick={() => pickBg(grad, 'gradient')} />
              ))}
            </div>

            <div className="bg-selector-label" style={{ marginBottom: 4, marginTop: 16 }}>Custom Image URL</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <input type="text" placeholder="https://..." value={customUrl} onChange={e => setCustomUrl(e.target.value)} />
              <button type="button" className="btn-primary sm" disabled={!customUrl.trim()} onClick={() => pickBg(customUrl.trim(), 'image')}>Preview</button>
            </div>
          </div>

          <div className="board-preview" style={{ 
            background: bgType === 'image' ? `url(${bgValue}) center/cover` : bgValue,
            marginTop: 20,
            marginBottom: 20
          }}>
            <svg width="180" height="100" viewBox="0 0 180 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="10" y="10" width="45" height="40" rx="4" fill="rgba(255,255,255,0.8)" />
              <rect x="65" y="10" width="45" height="70" rx="4" fill="rgba(255,255,255,0.8)" />
              <rect x="120" y="10" width="45" height="25" rx="4" fill="rgba(255,255,255,0.8)" />
              <rect x="15" y="15" width="20" height="4" rx="2" fill="rgba(0,0,0,0.2)" />
              <rect x="70" y="15" width="20" height="4" rx="2" fill="rgba(0,0,0,0.2)" />
              <rect x="125" y="15" width="20" height="4" rx="2" fill="rgba(0,0,0,0.2)" />
              <rect x="15" y="25" width="35" height="15" rx="3" fill="rgba(0,0,0,0.1)" />
              <rect x="70" y="25" width="35" height="15" rx="3" fill="rgba(0,0,0,0.1)" />
              <rect x="70" y="45" width="35" height="15" rx="3" fill="rgba(0,0,0,0.1)" />
            </svg>
          </div>

          <form onSubmit={submit}>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="field-label">Board title <span className="req">*</span></label>
              <input autoFocus maxLength={100} placeholder="e.g. Sales Pipeline" value={title} 
                onChange={e => { setTitle(e.target.value); setError(''); }} />
              {error && <p className="field-error">{error}</p>}
            </div>

            <button type="submit" className="btn-primary full" disabled={!title.trim()}>Create</button>
          </form>

          <p style={{ marginTop: 12, fontSize: 12, color: 'var(--text-sub)', textAlign: 'center' }}>
            By using images from Unsplash, you agree to their license and terms of service.
          </p>
        </div>
      </div>
    </div>
  );
}
