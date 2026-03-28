const db = require('../db');
const validate = require('../middleware/validate');

exports.getBoards = async (req, res) => {
  const r = await db.query('SELECT * FROM boards ORDER BY created_at DESC');
  res.json(r.rows);
};

exports.createBoard = async (req, res) => {
  const err = validate({ title: { required: true, min: 1, max: 100 } }, req.body);
  if (err) return res.status(400).json(err);
  const { title, bg_type = 'color', bg_value = '#0052cc' } = req.body;
  const r = await db.query(
    'INSERT INTO boards (title, bg_type, bg_value) VALUES ($1,$2,$3) RETURNING *',
    [title.trim(), bg_type, bg_value]
  );
  res.status(201).json(r.rows[0]);
};

exports.getBoard = async (req, res) => {
  const { id } = req.params;
  const board = await db.query('SELECT * FROM boards WHERE id=$1', [id]);
  if (!board.rows.length) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Board not found' } });

  const lists = await db.query('SELECT * FROM lists WHERE board_id=$1 AND archived=FALSE ORDER BY position', [id]);
  const listIds = lists.rows.map(l => l.id);

  let cards = [];
  if (listIds.length) {
    const r = await db.query(
      `SELECT c.*,
        COALESCE(json_agg(DISTINCT jsonb_build_object('id',l.id,'name',l.name,'color',l.color)) FILTER (WHERE l.id IS NOT NULL), '[]') AS labels,
        COALESCE(json_agg(DISTINCT jsonb_build_object('id',m.id,'name',m.name,'avatar_url',m.avatar_url)) FILTER (WHERE m.id IS NOT NULL), '[]') AS members,
        (SELECT COUNT(*) FROM checklist_items ci WHERE ci.card_id = c.id) AS checklist_total,
        (SELECT COUNT(*) FROM checklist_items ci WHERE ci.card_id = c.id AND ci.is_complete = TRUE) AS checklist_done,
        (SELECT COUNT(*) FROM attachments a WHERE a.card_id = c.id) AS attachment_count,
        (SELECT COUNT(*) FROM comments co WHERE co.card_id = c.id) AS comment_count
       FROM cards c
       LEFT JOIN card_labels cl ON cl.card_id = c.id
       LEFT JOIN labels l ON l.id = cl.label_id
       LEFT JOIN card_members cm ON cm.card_id = c.id
       LEFT JOIN members m ON m.id = cm.member_id
       WHERE c.list_id = ANY($1::int[]) AND c.archived = FALSE
       GROUP BY c.id ORDER BY c.position`,
      [listIds]
    );
    cards = r.rows;
  }

  res.json({ ...board.rows[0], lists: lists.rows, cards });
};

exports.getArchive = async (req, res) => {
  const { id } = req.params;
  const board = await db.query('SELECT id FROM boards WHERE id=$1', [id]);
  if (!board.rows.length) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Board not found' } });

  const [archivedCards, archivedLists] = await Promise.all([
    db.query(
      `SELECT c.*, l.title AS list_title
       FROM cards c
       JOIN lists l ON l.id = c.list_id
       WHERE l.board_id=$1 AND c.archived=TRUE
       ORDER BY c.created_at DESC`,
      [id]
    ),
    db.query(
      'SELECT * FROM lists WHERE board_id=$1 AND archived=TRUE ORDER BY created_at DESC',
      [id]
    ),
  ]);

  res.json({ cards: archivedCards.rows, lists: archivedLists.rows });
};

exports.updateBoard = async (req, res) => {
  const { id } = req.params;
  const err = validate({ title: { min: 1, max: 100 } }, req.body);
  if (err) return res.status(400).json(err);
  const { title, bg_type, bg_value, is_starred } = req.body;
  const r = await db.query(
    `UPDATE boards SET
      title=COALESCE($1,title), 
      bg_type=COALESCE($2,bg_type), 
      bg_value=COALESCE($3,bg_value),
      is_starred=COALESCE($4,is_starred)
     WHERE id=$5 RETURNING *`,
    [title?.trim(), bg_type, bg_value, is_starred, id]
  );
  if (!r.rows.length) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Board not found' } });
  res.json(r.rows[0]);
};

exports.deleteBoard = async (req, res) => {
  await db.query('DELETE FROM boards WHERE id=$1', [req.params.id]);
  res.status(204).end();
};
