const db = require('../db');
const validate = require('../middleware/validate');

const VALID_COLORS = ['#eb5a46','#61bd4f','#ff9f1a','#0079bf','#c377e0','#ff78cb','#f2d600','#00c2e0','#51e898','#344563'];

exports.getLabels = async (req, res) => {
  const r = await db.query('SELECT * FROM labels ORDER BY id');
  res.json(r.rows);
};

exports.createLabel = async (req, res) => {
  const err = validate({ name: { required: true, min: 1, max: 30 }, color: { required: true } }, req.body);
  if (err) return res.status(400).json(err);
  const { name, color } = req.body;
  if (!VALID_COLORS.includes(color))
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'color must be from predefined palette', field: 'color' } });
  const r = await db.query('INSERT INTO labels (name, color) VALUES ($1,$2) RETURNING *', [name.trim(), color]);
  res.status(201).json(r.rows[0]);
};

exports.getMembers = async (req, res) => {
  const r = await db.query('SELECT * FROM members ORDER BY id');
  res.json(r.rows);
};

exports.createMember = async (req, res) => {
  const err = validate({ name: { required: true, min: 1 }, avatar_url: { required: true, url: true } }, req.body);
  if (err) return res.status(400).json(err);
  const { name, avatar_url, email } = req.body;
  const r = await db.query('INSERT INTO members (name, avatar_url, email) VALUES ($1,$2,$3) RETURNING *', [name.trim(), avatar_url, email || null]);
  res.status(201).json(r.rows[0]);
};

exports.updateLabel = async (req, res) => {
  try {
    const { id } = req.params;
    const err = validate({ name: { required: true, min: 1, max: 30 } }, req.body);
    if (err) return res.status(400).json(err);
    const { name } = req.body;
    console.log(`Updating label ${id} to "${name}"`);
    const r = await db.query('UPDATE labels SET name = $1 WHERE id = $2 RETURNING *', [name.trim(), parseInt(id)]);
    if (r.rowCount === 0) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Label not found' } });
    res.json(r.rows[0]);
  } catch (err) {
    console.error('Label update failed:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message, stack: err.stack } });
  }
};
