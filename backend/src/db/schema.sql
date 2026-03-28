-- Drop all tables in reverse dependency order
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS attachments CASCADE;
DROP TABLE IF EXISTS checklist_items CASCADE;
DROP TABLE IF EXISTS card_members CASCADE;
DROP TABLE IF EXISTS card_labels CASCADE;
DROP TABLE IF EXISTS labels CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS cards CASCADE;
DROP TABLE IF EXISTS lists CASCADE;
DROP TABLE IF EXISTS boards CASCADE;

-- Boards
CREATE TABLE boards (
  id        SERIAL PRIMARY KEY,
  title     VARCHAR(100) NOT NULL CHECK (char_length(trim(title)) BETWEEN 1 AND 100),
  bg_type   VARCHAR(20)  NOT NULL DEFAULT 'color' CHECK (bg_type IN ('color','gradient','image')),
  bg_value  VARCHAR(255) NOT NULL DEFAULT '#0052cc',
  is_starred BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lists
CREATE TABLE lists (
  id        SERIAL PRIMARY KEY,
  board_id  INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  title     VARCHAR(50) NOT NULL CHECK (char_length(trim(title)) BETWEEN 1 AND 50),
  position  INTEGER NOT NULL DEFAULT 0,
  archived  BOOLEAN NOT NULL DEFAULT FALSE,
  is_collapsed BOOLEAN NOT NULL DEFAULT FALSE,
  bg_type   VARCHAR(20) DEFAULT NULL CHECK (bg_type IN ('color','gradient','image')),
  bg_value  VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Members
CREATE TABLE members (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL CHECK (char_length(trim(name)) >= 1),
  avatar_url VARCHAR(255) NOT NULL,
  email      VARCHAR(100)
);

-- Cards
CREATE TABLE cards (
  id          SERIAL PRIMARY KEY,
  list_id     INTEGER NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  title       VARCHAR(100) NOT NULL CHECK (char_length(trim(title)) BETWEEN 1 AND 100),
  description TEXT CHECK (char_length(description) <= 5000),
  cover_type  VARCHAR(10) CHECK (cover_type IN ('color','gradient','image')),
  cover_value VARCHAR(255),
  cover_mode  VARCHAR(10) DEFAULT 'top' CHECK (cover_mode IN ('top','full')),
  archived    BOOLEAN NOT NULL DEFAULT FALSE,
  position    INTEGER NOT NULL DEFAULT 0,
  due_date    TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Labels
CREATE TABLE labels (
  id    SERIAL PRIMARY KEY,
  name  VARCHAR(30) NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 30),
  color VARCHAR(20) NOT NULL
);

-- Card <-> Labels (join)
CREATE TABLE card_labels (
  card_id  INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  label_id INTEGER NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  PRIMARY KEY (card_id, label_id)
);

-- Card <-> Members (join)
CREATE TABLE card_members (
  card_id   INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  PRIMARY KEY (card_id, member_id)
);

-- Checklist items (directly on card, no checklists table)
CREATE TABLE checklist_items (
  id          SERIAL PRIMARY KEY,
  card_id     INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  text        VARCHAR(200) NOT NULL CHECK (char_length(trim(text)) BETWEEN 1 AND 200),
  is_complete BOOLEAN NOT NULL DEFAULT FALSE,
  position    INTEGER NOT NULL DEFAULT 0
);

-- Attachments
CREATE TABLE attachments (
  id      SERIAL PRIMARY KEY,
  card_id INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  url     TEXT NOT NULL,
  name    VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments
CREATE TABLE comments (
  id         SERIAL PRIMARY KEY,
  card_id    INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  author_id  INTEGER NOT NULL REFERENCES members(id),
  text       TEXT NOT NULL CHECK (char_length(trim(text)) >= 1),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Log
CREATE TABLE activity_logs (
  id           SERIAL PRIMARY KEY,
  card_id      INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  action_type  VARCHAR(50) NOT NULL,
  performed_by INTEGER REFERENCES members(id),
  details      JSONB,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);


-- ===================== SEED DATA =====================

-- Members
INSERT INTO members (id, name, avatar_url, email) VALUES
  (1, 'Chahal Goyal',  'https://randomuser.me/api/portraits/men/44.jpg', 'chahal@example.com'),
  (2, 'Aman Patel',    'https://randomuser.me/api/portraits/men/46.jpg',  'aman@example.com'),
  (3, 'Priya Verma',   'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop', 'priya@example.com'),
  (4, 'Rahul Mehta',   'https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=150&h=150&fit=crop',  'rahul@example.com'),
  (5, 'Sneha Kapoor',  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop', 'sneha@example.com');

-- Labels (Standard set we can use across boards)
INSERT INTO labels (id, name, color) VALUES
  (1, 'bug',         '#eb5a46'),
  (2, 'feature',     '#61bd4f'),
  (3, 'urgent',      '#ff9f1a'),
  (4, 'frontend',    '#0079bf'),
  (5, 'backend',     '#c377e0'),
  (6, 'design',      '#ff78cb'),
  (7, 'marketing',   '#00c2e0'),
  (8, 'finance',     '#51e898'),
  (9, 'ops',         '#4d4d4d');

-- ==========================================
-- BOARD 1: Tech Startup Roadmap
-- ==========================================
INSERT INTO boards (id, title, bg_type, bg_value, is_starred) VALUES
  (1, 'Tech Startup Roadmap', 'image', 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1920&auto=format&fit=crop', true);

INSERT INTO lists (id, board_id, title, position, is_collapsed, bg_type, bg_value) VALUES
  (1, 1, 'Q1 Backlog',        1, false, null, null),
  (2, 1, 'Sprint 43 (Active)',2, false, 'color', '#ebecf0'),
  (3, 1, 'QA / Review',       3, false, null, null),
  (4, 1, 'Deployed 🚀',       4, true, 'gradient', 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)');

INSERT INTO cards (id, list_id, title, description, cover_type, cover_value, cover_mode, position, due_date) VALUES
  (1, 1, 'Implement Next.js SSR', 'Migration to Next.js for better SEO and perceived performance.', 'gradient', 'linear-gradient(120deg, #f093fb 0%, #f5576c 100%)', 'full', 1, null),
  (2, 2, 'Kanban Drag & Drop overhaul', 'Use dnd-kit for accessible cross-list dragging. 

Must fix the flicker issue.', 'image', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop', 'top', 1, '2026-04-10 10:00:00'),
  (3, 2, 'Database Migration script', 'Write the JS script to run SQL migrations programmatically.', 'color', '#c377e0', 'top', 2, '2026-04-05 18:00:00'),
  (4, 3, 'Memory Leak in Navbar', 'Investigate heap snapshot during route changes.', null, null, 'top', 1, null),
  (5, 4, 'Setup Github Actions CI/CD', 'Automate the tests and deployments.', null, null, 'top', 1, null);

INSERT INTO card_labels (card_id, label_id) VALUES (1, 4), (1, 2), (2, 2), (2, 4), (2, 3), (3, 5), (4, 1), (4, 3), (5, 9);
INSERT INTO card_members (card_id, member_id) VALUES (1, 1), (2, 1), (2, 3), (3, 4), (4, 2), (5, 5);

INSERT INTO checklist_items (card_id, text, is_complete, position) VALUES
  (2, 'Install dnd-kit', true, 1),
  (2, 'Sortable context for lists', true, 2),
  (2, 'Sortable context for cards', false, 3),
  (2, 'Handle drag end events and API calls', false, 4);

INSERT INTO attachments (card_id, url, name) VALUES
  (2, 'https://docs.dndkit.com/', 'Dnd-Kit Docs'),
  (3, 'https://mysql.com/', 'MySQL Documentation');

INSERT INTO comments (card_id, author_id, text) VALUES
  (2, 3, 'Make sure we test this on Safari iOS as well!'),
  (4, 2, 'I noticed this only happens after logging in/out twice.');

-- ==========================================
-- BOARD 2: Marketing Campaign Launch
-- ==========================================
INSERT INTO boards (id, title, bg_type, bg_value, is_starred) VALUES
  (2, 'Summer Ad Campaign', 'gradient', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', true);

INSERT INTO lists (id, board_id, title, position) VALUES
  (5, 2, 'Brainstorming', 1),
  (6, 2, 'Content Creation', 2),
  (7, 2, 'Legal Review', 3),
  (8, 2, 'Scheduled Ads', 4);

INSERT INTO cards (id, list_id, title, description, cover_type, cover_value, cover_mode, position, archived) VALUES
  (6, 5, 'TikTok Influencer Outreach', 'Draft the email template and gather a list of 50 potential influencers.', 'image', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=800&auto=format&fit=crop', 'full', 1, false),
  (7, 6, 'Design Vector Banners', 'We need 3 distinct sizes: Square, Story, and landscape.', 'gradient', 'linear-gradient(to right, #43e97b 0%, #38f9d7 100%)', 'top', 1, false),
  (8, 6, 'Write Blog Post: Top 10 Features', 'SEO optimized post focusing on our new features.', null, null, 'top', 2, false),
  (9, 7, 'Terms and Conditions Update', 'Legal needs to review the promo code constraints.', 'color', '#eb5a46', 'top', 1, false),
  (10, 8, 'Discarded Ideas', 'Just saving these for later', null, null, 'top', 1, true);

INSERT INTO card_labels (card_id, label_id) VALUES (6, 7), (7, 6), (7, 7), (8, 7), (9, 3), (9, 9);
INSERT INTO card_members (card_id, member_id) VALUES (6, 5), (7, 3), (8, 1), (9, 4);

-- ==========================================
-- BOARD 3: Personal Productivity & Habits
-- ==========================================
INSERT INTO boards (id, title, bg_type, bg_value, is_starred) VALUES
  (3, 'Personal OKRs 2026', 'image', 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=1920&auto=format&fit=crop', false);

INSERT INTO lists (id, board_id, title, position, is_collapsed) VALUES
  (9, 3, 'Annual Goals', 1, false),
  (10, 3, 'Q2 Focus', 2, false),
  (11, 3, 'Weekly Routine', 3, false),
  (12, 3, 'Achieved! 🏆', 4, false);

INSERT INTO cards (id, list_id, title, description, cover_type, cover_value, cover_mode, position, due_date) VALUES
  (11, 9, 'Run a Half Marathon', 'Training plan:
- Week 1: 3x 5km
- Week 2: 2x 5km, 1x 10km
...', 'image', 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=800&auto=format&fit=crop', 'top', 1, '2026-10-15 08:00:00'),
  (12, 9, 'Read 24 Books', 'Average 2 books a month.', 'color', '#0079bf', 'top', 2, '2026-12-31 23:59:59'),
  (13, 10, 'Learn Rust Programming', 'Go through the rust book.', 'gradient', 'linear-gradient(to top, #09203f 0%, #537895 100%)', 'full', 1, null),
  (14, 11, 'Meal Prep Sunday', 'Cook lunches for Mon-Wed.', null, null, 'top', 1, null),
  (15, 12, 'Visit Japan', 'Done in Spring 2026!', 'image', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop', 'full', 1, '2026-03-10 12:00:00');

INSERT INTO checklist_items (card_id, text, is_complete, position) VALUES
  (12, 'Dune by Frank Herbert', true, 1),
  (12, 'Atomic Habits', true, 2),
  (12, 'Project Hail Mary', false, 3),
  (12, 'The Three-Body Problem', false, 4),
  (13, 'Chapter 1-3', true, 1),
  (13, 'Ownership & Borrowing', false, 2);

-- ==========================================
-- BOARD 4: Conference Planning
-- ==========================================
INSERT INTO boards (id, title, bg_type, bg_value, is_starred) VALUES
  (4, 'Global Tech Summit 2026', 'color', '#172b4d', false);

INSERT INTO lists (id, board_id, title, position, bg_type, bg_value) VALUES
  (13, 4, 'Speakers & Content', 1, null, null),
  (14, 4, 'Venue & Logistics', 2, 'gradient', 'linear-gradient(120deg, #d4fc79 0%, #96e6a1 100%)'),
  (15, 4, 'Sponsorships', 3, null, null);

INSERT INTO cards (id, list_id, title, description, cover_type, cover_value, cover_mode, position) VALUES
  (16, 13, 'Secure Keynote Speaker', 'Reach out to industry leaders.', 'image', 'https://images.unsplash.com/photo-1475721025505-44fbbf23d920?q=80&w=800&auto=format&fit=crop', 'top', 1),
  (17, 13, 'Finalize Schedule', 'We need to lock in the 3 parallel tracks.', 'color', '#ff9f1a', 'top', 2),
  (18, 14, 'Catering Menu Selection', 'Include vegan and gluten-free options.', null, null, 'top', 1),
  (19, 14, 'Order Swag Bags', 'T-shirts, stickers, mugs.', 'gradient', 'linear-gradient(to top, #ff0844 0%, #ffb199 100%)', 'full', 2),
  (20, 15, 'Gold Tier Sponsors', 'Pitch deck sent out, need followups.', null, null, 'top', 1);

INSERT INTO card_labels (card_id, label_id) VALUES (16, 7), (17, 9), (18, 9), (19, 6), (20, 8);
INSERT INTO card_members (card_id, member_id) VALUES (16, 2), (18, 5), (19, 3), (20, 4);

-- Fix auto-increment sequences after explicit ID inserts
SELECT setval('boards_id_seq', (SELECT MAX(id) FROM boards));
SELECT setval('lists_id_seq', (SELECT MAX(id) FROM lists));
SELECT setval('cards_id_seq', (SELECT MAX(id) FROM cards));
SELECT setval('members_id_seq', (SELECT MAX(id) FROM members));
SELECT setval('labels_id_seq', (SELECT MAX(id) FROM labels));
SELECT setval('checklist_items_id_seq', (SELECT MAX(id) FROM checklist_items));
SELECT setval('attachments_id_seq', (SELECT MAX(id) FROM attachments));
SELECT setval('comments_id_seq', (SELECT MAX(id) FROM comments));
SELECT setval('activity_logs_id_seq', (SELECT MAX(id) FROM activity_logs));
