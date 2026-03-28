import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  closestCorners, pointerWithin, rectIntersection, getFirstCollision,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  SortableContext, useSortable, arrayMove,
  horizontalListSortingStrategy, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBoard, updateBoard, createList, updateList, reorderList, deleteList, createCard, moveCard, deleteCard, updateCard, getArchive } from '../api';
import Navbar from '../components/Navbar';


import CardModal from '../components/CardModal';
import Popover from '../components/Popover';
import { useMember } from '../context/MemberContext';
import { BOARD_COLORS, BOARD_GRADIENTS, BOARD_IMAGES, LIST_COLORS, LIST_GRADIENTS } from '../constants';

export default function Board() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentMember } = useMember();
  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [cards, setCards] = useState({}); // { listId: [card] }
  const [activeId, setActiveId] = useState(null);
  const [activeType, setActiveType] = useState(null);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editBoardTitle, setEditBoardTitle] = useState(false);
  const [boardTitle, setBoardTitle] = useState('');
  const [starred, setStarred] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  useEffect(() => {
    getBoard(id).then(data => {
      setBoard(data);
      setBoardTitle(data.title);
      setStarred(data.is_starred || false);
      setLists(data.lists);
      const byList = {};
      data.lists.forEach(l => { byList[l.id] = []; });
      data.cards.forEach(c => { if (byList[c.list_id]) byList[c.list_id].push(c); });
      setCards(byList);
    });
  }, [id]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const findContainer = (id) => {
    if (lists.find(l => `list-${l.id}` === id)) return id;
    const list = lists.find(l => (cards[l.id] || []).some(c => `card-${c.id}` === id));
    return list ? `list-${list.id}` : null;
  };

  const onDragOver = ({ active, over }) => {
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    const actIdNum = active.data.current.id;
    const overIdNum = over.data.current.id;
    const actListId = parseInt(activeContainer.replace('list-', ''));
    const overListId = parseInt(overContainer.replace('list-', ''));

    setCards(prev => {
      const activeItems = prev[actListId] || [];
      const overItems = prev[overListId] || [];
      
      const activeIndex = activeItems.findIndex(c => c.id === actIdNum);
      const overIndex = over.data.current.type === 'list' 
        ? overItems.length 
        : overItems.findIndex(c => c.id === overIdNum);

      let newIndex;
      if (overIndex in overItems) {
        newIndex = overIndex;
      } else {
        newIndex = overItems.length;
      }

      const movedCard = activeItems[activeIndex];
      if (!movedCard) return prev;

      return {
        ...prev,
        [actListId]: activeItems.filter(c => c.id !== actIdNum),
        [overListId]: [
          ...overItems.slice(0, newIndex),
          { ...movedCard, list_id: overListId },
          ...overItems.slice(newIndex)
        ]
      };
    });
  };

  const onDragStart = ({ active }) => {
    setActiveId(active.data.current?.id);
    setActiveType(active.data.current?.type);
  };

  const onDragEnd = ({ active, over, cancelled }) => {
    setActiveId(null);
    setActiveType(null);
    if (!over || cancelled) return;

    const type = active.data.current?.type;
    const activeIdNum = active.data.current?.id;
    const overIdNum = over.data.current?.id;
    const overType = over.data.current?.type;

    if (type === 'list') {
      const oldIdx = lists.findIndex(l => l.id === activeIdNum);
      const newIdx = lists.findIndex(l => l.id === overIdNum);
      if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
        setLists(prev => arrayMove(prev, oldIdx, newIdx));
        reorderList(activeIdNum, { newPosition: newIdx + 1 });
      }
      return;
    }

    if (type === 'card') {
      const activeId = active.id;
      const overId = over.id;
      const activeContainer = findContainer(activeId);
      const overContainer = findContainer(overId);

      if (!activeContainer || !overContainer) return;

      const actListId = parseInt(activeContainer.replace('list-', ''));
      const overListId = parseInt(overContainer.replace('list-', ''));
      const listCards = cards[overListId] || [];
      
      const oldIdx = listCards.findIndex(c => c.id === activeIdNum);
      const newIdx = overType === 'list' 
        ? listCards.length - 1 
        : listCards.findIndex(c => c.id === overIdNum);

      if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
        const reordered = arrayMove(listCards, oldIdx, newIdx);
        setCards(prev => ({ ...prev, [overListId]: reordered }));
        moveCard(activeIdNum, { newListId: overListId, newPosition: Math.max(0, newIdx) + 1, performed_by: currentMember?.id });
      } else if (oldIdx !== -1 || activeContainer !== overContainer) {
        // Position might be same but list changed, or dropped on list container
        moveCard(activeIdNum, { newListId: overListId, newPosition: Math.max(0, newIdx) + 1, performed_by: currentMember?.id });
      }
    }
  };

  const collisionDetectionStrategy = useCallback((args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) return pointerCollisions;
    return closestCorners(args);
  }, []);

  const listIds = useMemo(() => lists.map(l => `list-${l.id}`), [lists]);

  const handleCardUpdated = (updated) => {
    setCards(prev => {
      const next = {};
      Object.keys(prev).forEach(lid => {
        next[lid] = prev[lid].map(c => {
          if (c.id !== updated.id) return c;
          // Merge only the raw card fields — preserve computed badge aggregates
          return { ...c, ...updated };
        });
        // If list_id changed, move the card to the new list
        if (updated.list_id && String(updated.list_id) !== lid) {
          next[lid] = next[lid].filter(c => c.id !== updated.id);
        }
      });
      const targetLid = String(updated.list_id);
      if (next[targetLid] && !next[targetLid].find(c => c.id === updated.id)) {
        const existing = Object.values(prev).flat().find(c => c.id === updated.id);
        next[targetLid] = [...next[targetLid], { ...existing, ...updated }].sort((a, b) => a.position - b.position);
      }
      return next;
    });
  };

  const handleToggleCollapse = async (listId, isCollapsed) => {
    const updated = await updateList(listId, { is_collapsed: isCollapsed });
    setLists(prev => prev.map(l => l.id === listId ? { ...l, is_collapsed: updated.is_collapsed } : l));
  };

  const activeCard = activeType === 'card' ? Object.values(cards).flat().find(c => c.id === activeId) : null;
  const activeList = activeType === 'list' ? lists.find(l => l.id === activeId) : null;
  const selectedCard = selectedCardId ? Object.values(cards).flat().find(c => c.id === selectedCardId) : null;
  const selectedListTitle = selectedCard ? lists.find(l => l.id === selectedCard.list_id)?.title : '';

  if (!board) return <div className="board-loading"><div className="spinner" /></div>;

  return (
    <div className="app-container" style={{ 
      background: board.bg_type === 'image' ? `url(${board.bg_value}) center/cover fixed` : board.bg_value 
    }}>
      <Navbar boardTitle={board.title} />
      
      <div className="app-body">

        
        <main className="board-page">
          <div className="board-header">
            <div className="bh-left">
              {editBoardTitle
                ? <input className="board-title-input" autoFocus value={boardTitle}
                    onChange={e => setBoardTitle(e.target.value)}
                    onBlur={() => { setEditBoardTitle(false); if (boardTitle.trim()) { updateBoard(id, { title: boardTitle.trim() }); setBoard(b => ({ ...b, title: boardTitle.trim() })); } else setBoardTitle(board.title); }}
                    onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') { setEditBoardTitle(false); setBoardTitle(board.title); } }} />
                : <h1 className="board-title-btn" onClick={() => setEditBoardTitle(true)}>{board.title}</h1>
              }
              <button
                className="icon-btn bh-star"
                title={starred ? 'Unstar board' : 'Star board'}
                onClick={() => {
                  const ns = !starred;
                  setStarred(ns);
                  updateBoard(id, { is_starred: ns }).catch(console.error);
                  setBoard(b => ({...b, is_starred: ns}));
                }}
                style={{ color: starred ? '#f7cd56' : undefined, fontSize: 20 }}
              >{starred ? '★' : '☆'}</button>
              <div className="sidebar-divider vr" />
            </div>

            <div className="bh-right" style={{ position: 'relative', gap: '8px', display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.15)', borderRadius: '16px', height: 32, padding: '0 12px', gap: 6, border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.2s', width: searchQuery ? 180 : 140 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input 
                  type="text" 
                  placeholder="Search..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%', fontSize: 13, height: '100%' }}
                />
                {searchQuery && (
                  <button className="icon-btn" style={{ padding: 2, margin: 0, fontSize: 12 }} onClick={() => setSearchQuery('')}>✕</button>
                )}
              </div>
              <button className="icon-btn bh-share" title="Share Board" onClick={() => setShowShare(true)} style={{ width: 32, height: 32, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', padding: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
              </button>
              <button className="btn-primary bh-menu" title="Menu" onClick={() => setMenuOpen(o => !o)} style={{ width: 32, height: 32, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 16 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
              </button>
              {menuOpen && <BoardMenuPanel board={board} onClose={() => setMenuOpen(false)} 
                onUpdated={updated => setBoard(b => ({ ...b, ...updated }))}
                boardId={id}
                onCardRestored={(card) => {
                  const restoredCard = { ...card, archived: false, labels: card.labels || [], members: card.members || [], checklist_total: card.checklist_total || 0, checklist_done: card.checklist_done || 0, attachment_count: card.attachment_count || 0, comment_count: card.comment_count || 0 };
                  setCards(prev => ({
                    ...prev,
                    [restoredCard.list_id]: [...(prev[restoredCard.list_id] || []), restoredCard].sort((a,b) => a.position - b.position)
                  }));
                }}
                onListRestored={(list) => {
                  const restoredList = { ...list, archived: false };
                  setLists(ls => [...ls, restoredList].sort((a,b) => a.position - b.position));
                  // Re-fetch board to get cards for the restored list
                  getBoard(id).then(data => {
                    const byList = {};
                    data.lists.forEach(l => { byList[l.id] = []; });
                    data.cards.forEach(c => { if (byList[c.list_id]) byList[c.list_id].push(c); });
                    setLists(data.lists);
                    setCards(byList);
                  });
                }}
              />}
            </div>
          </div>

          <DndContext sensors={sensors} collisionDetection={collisionDetectionStrategy}
            onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}>
            <SortableContext items={listIds} strategy={horizontalListSortingStrategy}>
              <div className="lists-row">
                {lists.map(list => {
                  const listCards = (cards[list.id] || []).filter(c => !c.archived);
                  const searchLower = searchQuery.toLowerCase();
                  const listTitleMatch = list.title.toLowerCase().includes(searchLower);
                  const matchingCards = searchQuery 
                    ? listCards.filter(c => c.title.toLowerCase().includes(searchLower))
                    : listCards;

                  if (searchQuery && !listTitleMatch && matchingCards.length === 0) return null;

                  return (
                    <SortableList key={list.id} list={list} cards={matchingCards} isFiltering={!!searchQuery}
                      onCardClick={setSelectedCardId}
                      onCardAdded={(card) => setCards(prev => ({ ...prev, [list.id]: [...(prev[list.id]||[]), card] }))}
                      onCardDeleted={(cardId) => setCards(prev => ({ ...prev, [list.id]: prev[list.id].filter(c => c.id !== cardId) }))}
                      onListDeleted={() => { setLists(ls => ls.filter(l => l.id !== list.id)); setCards(prev => { const n = {...prev}; delete n[list.id]; return n; }); }}
                      onListArchived={() => { setLists(ls => ls.filter(l => l.id !== list.id)); }}
                      onListUpdated={(updated) => setLists(ls => ls.map(l => l.id === list.id ? { ...l, ...updated } : l))}
                      onToggleCollapse={(isCollapsed) => handleToggleCollapse(list.id, isCollapsed)}
                      currentMember={currentMember}
                    />
                  );
                })}
                {!searchQuery && <AddListForm boardId={id} onAdded={(list) => { setLists(ls => [...ls, list]); setCards(prev => ({ ...prev, [list.id]: [] })); }} />}
              </div>
            </SortableContext>

            <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }) }}>
              {activeCard && <CardItemOverlay card={activeCard} />}
              {activeList && <ListOverlay list={activeList} cards={cards[activeList.id] || []} />}
            </DragOverlay>
          </DndContext>
          

        </main>
      </div>



      {showShare && (
        <div className="overlay" onClick={() => setShowShare(false)}>
          <div className="card-modal" style={{ width: 400, padding: 24 }} onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowShare(false)}>✕</button>
            <h2 style={{ marginBottom: 16, fontSize: 18, fontWeight: 700 }}>Share Board</h2>
            <p style={{ color: 'var(--text-sub)', marginBottom: 12, fontSize: 14 }}>Anyone with this link can view the board:</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input readOnly value={window.location.href} style={{ flex: 1 }} />
              <button className="btn-primary" onClick={() => { navigator.clipboard.writeText(window.location.href); }}>Copy</button>
            </div>
          </div>
        </div>
      )}



      {selectedCardId && (
        <CardModal cardId={selectedCardId} listTitle={selectedListTitle}
          onClose={() => setSelectedCardId(null)} onUpdated={handleCardUpdated} />
      )}
    </div>
  );
}

// ── Sortable List ──────────────────────────────────────────────────────────────
const SortableList = React.memo(({ 
  list, cards, isFiltering, onCardClick, onCardAdded, onCardDeleted, onListDeleted, onListArchived, onListUpdated, onToggleCollapse, currentMember 
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `list-${list.id}`, data: { type: 'list', id: list.id }, disabled: isFiltering
  });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  const [listMenu, setListMenu] = useState(false);
  const [bgPanel, setBgPanel] = useState(false);
  const [editTitle, setEditTitle] = useState(false);
  const [titleVal, setTitleVal] = useState(list.title);
  const [addingCard, setAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [customBgUrl, setCustomBgUrl] = useState('');
  const menuBtnRef = useRef();
  const cardInputRef = useRef();

  useEffect(() => { if (addingCard && cardInputRef.current) cardInputRef.current.focus(); }, [addingCard]);

  const cardIds = useMemo(() => cards.map(c => `card-${c.id}`), [cards]);

  const listBgStyle = list.bg_type === 'color' || list.bg_type === 'gradient' ? { background: list.bg_value }
    : list.bg_type === 'image' ? { backgroundImage: `url("${list.bg_value}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {};

  const saveTitle = () => {
    setEditTitle(false);
    if (titleVal.trim() && titleVal.trim() !== list.title) {
      updateList(list.id, { title: titleVal.trim() }).then(u => onListUpdated(u));
    } else setTitleVal(list.title);
  };

  const submitCard = async () => {
    if (!newCardTitle.trim()) return;
    const card = await createCard(list.id, { title: newCardTitle.trim(), performed_by: currentMember?.id });
    onCardAdded(card);
    setNewCardTitle('');
    cardInputRef.current?.focus();
  };

  return (
    <div ref={setNodeRef} style={{ ...style, ...listBgStyle }} className={`list-wrapper${list.is_collapsed ? ' collapsed' : ''}${list.bg_type ? ' has-bg' : ''}`}>
      <div className="list">
        <div className="list-header" {...attributes} {...listeners}>
          {list.is_collapsed ? (
            <div className="collapsed-header" onClick={() => onToggleCollapse(false)}>
              <button className="icon-btn collapse-btn" onClick={(e) => { e.stopPropagation(); onToggleCollapse(false); }}>↔</button>
              <span className="list-title rotated">{list.title}</span>
            </div>
          ) : (
            <>
              <div className="list-title-container">
                {editTitle
                  ? <input className="list-title-input" autoFocus value={titleVal} maxLength={50}
                      onChange={e => setTitleVal(e.target.value)}
                      onBlur={saveTitle}
                      onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') { setEditTitle(false); setTitleVal(list.title); } }}
                      onClick={e => e.stopPropagation()} />
                  : <span className="list-title" onClick={e => { e.stopPropagation(); setEditTitle(true); }}>{list.title}</span>
                }
                <button className="icon-btn collapse-btn list-header-collapse" onClick={(e) => { e.stopPropagation(); onToggleCollapse(true); }} title="Collapse list">↔</button>
              </div>
              <button 
                ref={menuBtnRef}
                className="icon-btn list-menu-btn" 
                onClick={e => { e.stopPropagation(); setListMenu(o => !o); }}
              >···</button>
            </>
          )}
        </div>

        {!list.is_collapsed && (
          <>
            {listMenu && (
          <Popover 
            anchor={menuBtnRef.current} 
            onClose={() => { setListMenu(false); setBgPanel(false); }} 
            width={280}
          >
            {!bgPanel ? (
              <>
                <div className="lcm-header">
                  <span>List actions</span>
                  <button className="icon-btn" onClick={() => setListMenu(false)}>✕</button>
                </div>
                
                <div className="lcm-section">
                  <button className="lcm-item" onClick={() => { setEditTitle(true); setListMenu(false); }}>
                    <span className="icon">✏️</span>
                    <span>Rename list…</span>
                  </button>

                  <button className="lcm-item" onClick={() => setBgPanel(true)}>
                    <span className="icon">🎨</span>
                    <span>Change background</span>
                  </button>
                  
                  <button className="lcm-item" onClick={async () => {
                    await updateList(list.id, { archived: true });
                    onListArchived();
                    setListMenu(false);
                  }}>
                    <span className="icon">🗄️</span>
                    <span>Archive this list</span>
                  </button>
                </div>

                <div className="lcm-divider" />

                <div className="lcm-section">
                  <button className="lcm-item danger" onClick={async () => {
                    await deleteList(list.id);
                    onListDeleted();
                    setListMenu(false);
                  }}>
                    <span className="icon">🗑️</span>
                    <span>Delete list…</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="sidebar-panel" style={{ padding: 0 }}>
                <div className="panel-header" style={{ padding: '8px 12px' }}>
                  <button className="icon-btn sm" onClick={() => setBgPanel(false)}>‹</button>
                  <span style={{ flex: 1, textAlign: 'center', fontSize: 14 }}>Background</span>
                  <button className="icon-btn" onClick={() => { setListMenu(false); setBgPanel(false); }}>✕</button>
                </div>
                
                <div className="bg-menu-body" style={{ padding: 12 }}>
                  <div className="bg-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                    {/* Refined sophisticated list background colors */}
                    {LIST_COLORS.map(c => (
                      <div key={c} className="bg-swatch sm" style={{ background: c, height: 40, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }} 
                        onClick={() => { updateList(list.id, { bg_type: 'color', bg_value: c }).then(u => onListUpdated(u)); setListMenu(false); }} />
                    ))}
                  </div>
                  
                  <p className="bg-menu-section-title" style={{ marginTop: 12, fontSize: 12, color: 'var(--text-sub)' }}>Gradients</p>
                  <div className="bg-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                    {LIST_GRADIENTS.map(g => (
                      <div key={g} className="bg-swatch sm" style={{ background: g, height: 40, cursor: 'pointer' }} 
                        onClick={() => { updateList(list.id, { bg_type: 'gradient', bg_value: g }).then(u => onListUpdated(u)); setListMenu(false); }} />
                    ))}
                  </div>

                  <p className="bg-menu-section-title" style={{ marginTop: 12, fontSize: 12, color: 'var(--text-sub)' }}>Custom URL</p>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <input className="list-title-input" placeholder="https://..." value={customBgUrl} onChange={e => setCustomBgUrl(e.target.value)} style={{ padding: '4px 8px', flex: 1 }} />
                    <button className="btn-primary sm" onClick={() => { updateList(list.id, { bg_type: 'image', bg_value: customBgUrl }).then(u => onListUpdated(u)); setListMenu(false); }}>Add</button>
                  </div>

                  <button className="btn-ghost full" style={{ marginTop: 12, fontSize: 12, width: '100%' }} 
                    onClick={() => { updateList(list.id, { bg_type: null, bg_value: null }).then(u => onListUpdated(u)); setListMenu(false); }}>Remove background</button>
                </div>
              </div>
            )}
          </Popover>
        )}

        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          <div className="cards-container">
            {cards.map(card => (
              <SortableCard key={card.id} card={card} isFiltering={isFiltering} onClick={() => onCardClick(card.id)}
                onDelete={async (e) => { e.stopPropagation(); await deleteCard(card.id); onCardDeleted(card.id); }} />
            ))}
          </div>
        </SortableContext>

        {addingCard ? (
          <div className="add-card-form">
            <textarea ref={cardInputRef} placeholder="Enter a title for this card…" value={newCardTitle}
              onChange={e => setNewCardTitle(e.target.value)} maxLength={100}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitCard(); } if (e.key === 'Escape') { setAddingCard(false); setNewCardTitle(''); } }} />
            <div className="form-row">
              <button className="btn-primary" onClick={submitCard} disabled={!newCardTitle.trim()}>Add card</button>
              <button className="icon-btn" onClick={() => { setAddingCard(false); setNewCardTitle(''); }}>✕</button>
            </div>
          </div>
        ) : (
          <button className="add-card-trigger" onClick={() => setAddingCard(true)}>+ Add a card</button>
        )}
      </>
    )}
  </div>
</div>
  );
});

// ── Sortable Card ──────────────────────────────────────────────────────────────
const SortableCard = React.memo(({ card, isFiltering, onClick, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `card-${card.id}`, data: { type: 'card', id: card.id }, disabled: isFiltering
  });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      className={`card${card.cover_mode === 'full' ? ' full-bg' : ''}`} onClick={onClick}>
      <CardContent card={card} onDelete={onDelete} />
    </div>
  );
});

const CardContent = React.memo(({ card, onDelete }) => {
  const coverStyle = card.cover_type === 'color' || card.cover_type === 'gradient' ? { background: card.cover_value }
    : card.cover_type === 'image' ? { backgroundImage: `url("${card.cover_value}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : null;
  const checklistTotal = parseInt(card.checklist_total || 0);
  const checklistDone = parseInt(card.checklist_done || 0);
  
  const todayStr = new Date().toISOString().slice(0,10);
  const cardDateStr = card.due_date ? card.due_date.slice(0,10) : null;
  const isOverdue = cardDateStr && cardDateStr < todayStr;

  const getFormatDate = (iso) => {
    if (!iso) return '';
    const date = new Date(iso);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  };
  const displayDate = getFormatDate(card.due_date);

  return (
    <>
      {isOverdue && <div className="overdue-pointer" title="Overdue" />}
      {coverStyle && card.cover_mode !== 'full' && <div className="card-cover" style={coverStyle} />}
      <div className="card-content-inner" style={card.cover_mode === 'full' ? { ...coverStyle, padding: '12px 10px', minHeight: 48 } : {}}>
        {card.cover_mode === 'full' && <div className="card-full-bg-overlay" />}
        <div className="card-content-wrapper">
          {card.labels?.length > 0 && (
            <div className="card-labels">
              {card.labels.map(l => <span key={l.id} className="card-label-pip" style={{ background: l.color }} title={l.name} />)}

            </div>
          )}
          <div className="card-title-text" style={card.cover_mode === 'full' ? { fontSize: 16, fontWeight: 700, textShadow: '0 1px 4px rgba(0,0,0,0.5)', color: '#fff' } : {}}>{card.title}</div>
          <div className="card-badges">
            <div className="card-badge-left">
              {displayDate && (
                <span className="card-badge" title={`Due: ${cardDateStr}`}>
                  {displayDate}
                </span>
              )}
              {checklistTotal > 0 && (
                <span className={`card-badge${checklistDone===checklistTotal?' badge-done':''}`}>
                  ☑ {checklistDone}/{checklistTotal}
                </span>
              )}
              {parseInt(card.attachment_count||0) > 0 && <span className="card-badge">📎 {card.attachment_count}</span>}
              {parseInt(card.comment_count||0) > 0 && <span className="card-badge">💬 {card.comment_count}</span>}
            </div>
            <div className="card-badge-right">
              {card.members?.map(m => (
                <img key={m.id} src={m.avatar_url} alt={m.name} className="avatar-img xs" title={m.name} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <button className="card-delete-btn" onClick={onDelete} title="Delete">✕</button>
    </>
  );
});

function CardItemOverlay({ card }) {
  return <div className="card dragging"><CardContent card={card} onDelete={() => {}} /></div>;
}
function ListOverlay({ list, cards }) {
  return (
    <div className="list-wrapper" style={{ opacity: 0.9 }}>
      <div className="list">
        <div className="list-header"><span className="list-title">{list.title}</span></div>
        <div className="cards-container" style={{ maxHeight: 200, overflow: 'hidden' }}>
          {cards.slice(0,3).map(c => <div key={c.id} className="card"><div className="card-title-text">{c.title}</div></div>)}
        </div>
      </div>
    </div>
  );
}

// ── Add List Form ──────────────────────────────────────────────────────────────
function AddListForm({ boardId, onAdded }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const submit = async () => {
    if (!title.trim()) return;
    const list = await createList(boardId, { title: title.trim() });
    onAdded(list);
    setTitle('');
  };
  if (!open) return <button className="add-list-trigger" onClick={() => setOpen(true)}>+ Add another list</button>;
  return (
    <div className="add-list-form">
      <input autoFocus placeholder="Enter list title…" value={title} maxLength={50}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') { setOpen(false); setTitle(''); } }} />
      <div className="form-row">
        <button className="btn-primary" onClick={submit} disabled={!title.trim()}>Add list</button>
        <button className="icon-btn" onClick={() => { setOpen(false); setTitle(''); }}>✕</button>
      </div>
    </div>
  );
}

// ── Board Menu ─────────────────────────────────────────────────────────────────
function BoardMenuPanel({ board, onClose, onUpdated, boardId, onCardRestored, onListRestored }) {
  const [view, setView] = useState('main');
  const [archiveTab, setArchiveTab] = useState('cards');
  const [archive, setArchive] = useState(null); // { cards: [], lists: [] }
  const [archiveLoading, setArchiveLoading] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const clickHandler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) onClose(); };
    const keyHandler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', clickHandler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('mousedown', clickHandler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, [onClose]);

  const openArchive = async () => {
    setView('archive');
    setArchiveLoading(true);
    try {
      const data = await getArchive(boardId);
      setArchive(data);
    } catch (e) {
      console.error('Failed to load archive:', e);
      setArchive({ cards: [], lists: [] });
    } finally {
      setArchiveLoading(false);
    }
  };

  const restoreCard = async (card) => {
    const updated = await updateCard(card.id, { archived: false });
    onCardRestored({ ...card, ...updated, archived: false });
    setArchive(prev => ({ ...prev, cards: prev.cards.filter(c => c.id !== card.id) }));
  };

  const deleteArchivedCard = async (card) => {
    await deleteCard(card.id);
    setArchive(prev => ({ ...prev, cards: prev.cards.filter(c => c.id !== card.id) }));
  };

  const restoreList = async (list) => {
    const updated = await updateList(list.id, { archived: false });
    onListRestored({ ...list, ...updated, archived: false });
    setArchive(prev => ({ ...prev, lists: prev.lists.filter(l => l.id !== list.id) }));
  };

  const deleteArchivedList = async (list) => {
    await deleteList(list.id);
    setArchive(prev => ({ ...prev, lists: prev.lists.filter(l => l.id !== list.id) }));
  };

  const changeBg = async (value, type) => {
    const updated = await updateBoard(board.id, { bg_type: type, bg_value: value });
    onUpdated(updated);
  };

  return (
    <div ref={menuRef} className="bg-menu-popover glass-heavy">
      <div className="bg-menu-header">
        {view !== 'main' && <button className="icon-btn" onClick={() => setView('main')}>←</button>}
        <span className="bg-menu-title">
          {view === 'main' ? 'Menu' : view === 'background' ? 'Change background' : 'Archived items'}
        </span>
        <button className="icon-btn" onClick={onClose}>✕</button>
      </div>
      <div className="bg-menu-body">
        {view === 'main' && (
          <div className="board-menu-items">
            <button className="sidebar-item" onClick={() => setView('background')}>🎨 Change background</button>
            <button className="sidebar-item" onClick={openArchive}>🗄 Archive</button>
          </div>
        )}

        {view === 'background' && (
          <div className="background-picker">
            <p className="bg-menu-section-title">Colors</p>
            <div className="bg-grid">
              {BOARD_COLORS.map(c => <button key={c} className={`bg-swatch${board.bg_value===c?' sel':''}`} style={{ background: c }} onClick={() => changeBg(c,'color')} />)}
            </div>
            <p className="bg-menu-section-title">Gradients</p>
            <div className="bg-grid">
              {BOARD_GRADIENTS.map(g => <button key={g} className={`bg-swatch${board.bg_value===g?' sel':''}`} style={{ background: g }} onClick={() => changeBg(g,'gradient')} />)}
            </div>
            <p className="bg-menu-section-title">Photos</p>
            <div className="bg-grid">
              {BOARD_IMAGES.map(img => (
                <button key={img} className={`bg-swatch${board.bg_value===img?' sel':''}`} 
                  style={{ backgroundImage: `url(${img})`, backgroundSize: 'cover' }} 
                  onClick={() => changeBg(img,'image')} />
              ))}
            </div>
          </div>
        )}

        {view === 'archive' && (
          <div className="archive-panel">
            <div className="archive-tabs">
              <button className={`archive-tab${archiveTab==='cards'?' active':''}`} onClick={() => setArchiveTab('cards')}>Cards</button>
              <button className={`archive-tab${archiveTab==='lists'?' active':''}`} onClick={() => setArchiveTab('lists')}>Lists</button>
            </div>

            {archiveLoading && <div className="archive-empty">Loading…</div>}

            {!archiveLoading && archiveTab === 'cards' && (
              <div className="archive-list">
                {(!archive?.cards?.length) && <p className="archive-empty">No archived cards</p>}
                {archive?.cards?.map(card => (
                  <div key={card.id} className="archive-item">
                    <div className="archive-item-info">
                      <span className="archive-item-name">{card.title}</span>
                      <span className="archive-item-sub">in {card.list_title}</span>
                    </div>
                    <div className="archive-item-actions">
                      <button className="archive-action-btn restore" title="Restore" onClick={() => restoreCard(card)}>↩</button>
                      <button className="archive-action-btn delete" title="Delete permanently" onClick={() => deleteArchivedCard(card)}>🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!archiveLoading && archiveTab === 'lists' && (
              <div className="archive-list">
                {(!archive?.lists?.length) && <p className="archive-empty">No archived lists</p>}
                {archive?.lists?.map(list => (
                  <div key={list.id} className="archive-item">
                    <div className="archive-item-info">
                      <span className="archive-item-name">{list.title}</span>
                      <span className="archive-item-sub">list</span>
                    </div>
                    <div className="archive-item-actions">
                      <button className="archive-action-btn restore" title="Restore" onClick={() => restoreList(list)}>↩</button>
                      <button className="archive-action-btn delete" title="Delete permanently" onClick={() => deleteArchivedList(list)}>🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
