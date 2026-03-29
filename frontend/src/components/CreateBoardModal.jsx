import { useState, useEffect } from 'react';
import { createBoard } from '../api';
import { BOARD_COLORS, BOARD_GRADIENTS, BOARD_IMAGES } from '../constants';

const ALL_COLORS = [...BOARD_GRADIENTS, ...BOARD_COLORS];

export default function CreateBoardModal({ onClose, onCreated }) {
  const [view, setView] = useState('main'); // main, bg-selection, photos-view, colors-view
  const [history, setHistory] = useState([]);
  
  const [title, setTitle] = useState('');
  const [bgType, setBgType] = useState('image');
  const [bgValue, setBgValue] = useState(BOARD_IMAGES[0]);
  const [visibility, setVisibility] = useState('Workspace');
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const navigateTo = (newView) => {
    setHistory(prev => [...prev, view]);
    setView(newView);
  };

  const goBack = () => {
    const prevView = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    setView(prevView || 'main');
  };

  const submit = async (e) => {
    if (e) e.preventDefault();
    if (!title.trim()) { setTouched(true); return; }
    try {
      const board = await createBoard({ title: title.trim(), bg_type: bgType, bg_value: bgValue });
      onCreated(board);
    } catch (err) {
      setError(err.message || 'Failed to create board');
    }
  };

  const pickBg = (val, type) => {
    setBgValue(val);
    setBgType(type);
  };

  const renderHeader = (titleText) => (
    <div className="modal-header">
      {view !== 'main' && (
        <button className="modal-back-btn" onClick={goBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
      )}
      <div className="modal-header-title">{titleText}</div>
      <button className="icon-btn" onClick={onClose} style={{ position: 'absolute', right: 8 }}>✕</button>
    </div>
  );

  const PreviewSkeleton = () => (
    <svg width="140" height="80" viewBox="0 0 180 100" fill="none" className="board-preview-skeleton">
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
  );

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal-box create-board-modal" onClick={e => e.stopPropagation()}>
        
        {view === 'main' && (
          <div className="view-container">
            {renderHeader('Create board')}
            <div className="modal-body">
              <div className="board-preview-container" style={{ background: bgType === 'image' ? `url(${bgValue}) center/cover` : bgValue }}>
                <PreviewSkeleton />
              </div>

              <div className="bg-selector-label">Background</div>
              <div className="bg-grid-photos" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 8 }}>
                {BOARD_IMAGES.slice(0, 4).map(img => (
                  <button key={img} className={`bg-swatch${bgValue===img?' sel':''}`} 
                    style={{ backgroundImage: `url(${img})` }} onClick={() => pickBg(img, 'image')} />
                ))}
              </div>
              <div className="bg-grid-colors" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, marginBottom: 16 }}>
                {ALL_COLORS.slice(0, 5).map(val => (
                  <button key={val} className={`bg-swatch${bgValue===val?' sel':''}`} 
                    style={{ background: val }} onClick={() => pickBg(val, val.includes('gradient') ? 'gradient' : 'color')} />
                ))}
                <button className="bg-swatch more-btn" onClick={() => navigateTo('bg-selection')}>···</button>
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="field-label">Custom Image URL</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input 
                    type="text" 
                    placeholder="https://..." 
                    style={{ background: '#22272b', border: '1px solid #444c53', color: '#b6c2cf', padding: '6px 8px', borderRadius: '4px', flex: 1, fontSize: '13px' }}
                    onChange={e => { if (e.target.value.trim()) pickBg(e.target.value.trim(), 'image'); }} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="field-label">Board title <span className="req">*</span></label>
                <input 
                  autoFocus 
                  className={touched && !title.trim() ? 'input-error' : ''}
                  value={title} 
                  onChange={e => { setTitle(e.target.value); setError(''); }} 
                  onBlur={() => setTouched(true)}
                />
                {touched && !title.trim() && (
                  <div className="validation-msg">👋 Board title is required</div>
                )}
              </div>

              <button className="btn-primary full" disabled={!title.trim()} onClick={submit}>Create</button>
            </div>
          </div>
        )}

        {view === 'bg-selection' && (
          <div className="view-container">
            {renderHeader('Board background')}
            <div className="modal-body">
              <div className="bg-selector-label">
                Photos <span className="view-more-link" onClick={() => navigateTo('photos-view')}>View more</span>
              </div>
              <div className="bg-grid selection-grid">
                {BOARD_IMAGES.slice(0, 6).map(img => (
                  <button key={img} className={`bg-swatch${bgValue===img?' sel':''}`} 
                    style={{ backgroundImage: `url(${img})`, height: 56 }} onClick={() => pickBg(img, 'image')} />
                ))}
              </div>

              <div className="bg-selector-label" style={{ marginTop: 16 }}>
                Colors <span className="view-more-link" onClick={() => navigateTo('colors-view')}>View more</span>
              </div>
              <div className="bg-grid selection-grid">
                {ALL_COLORS.slice(0, 6).map(val => (
                  <button key={val} className={`bg-swatch${bgValue===val?' sel':''}`} 
                    style={{ background: val, height: 56 }} onClick={() => pickBg(val, val.includes('gradient') ? 'gradient' : 'color')} />
                ))}
              </div>
            </div>
          </div>
        )}

        {view === 'photos-view' && (
          <div className="view-container">
            {renderHeader('Photos')}
            <div className="modal-body">
              <div className="bg-grid selection-grid">
                {BOARD_IMAGES.map(img => (
                  <button key={img} className={`bg-swatch${bgValue===img?' sel':''}`} 
                    style={{ backgroundImage: `url(${img})`, height: 56 }} onClick={() => pickBg(img, 'image')} />
                ))}
              </div>
            </div>
          </div>
        )}

        {view === 'colors-view' && (
          <div className="view-container">
            {renderHeader('Colors')}
            <div className="modal-body">
              <div className="bg-grid selection-grid">
                {ALL_COLORS.map(val => (
                  <button key={val} className={`bg-swatch${bgValue===val?' sel':''}`} 
                    style={{ background: val, height: 56 }} onClick={() => pickBg(val, val.includes('gradient') ? 'gradient' : 'color')} />
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
