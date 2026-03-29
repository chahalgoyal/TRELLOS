const { Pool } = require('pg');
require('dotenv').config({ path: './backend/.env' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  const client = await pool.connect();
  try {
    console.log('--- Starting Vibrant & Feature-Showcase Seeding ---');

    const q = (text, params) => client.query(text, params);

    // 1. Cleanup old boards first to clear the "mess"
    const oldTitles = [
      '🚀 Product Launch 2024',
      '🏠 Modern House Construction',
      '🎨 Marketing Agency',
      '🎸 Master Guitar'
    ];
    for (const title of oldTitles) {
      await q("DELETE FROM boards WHERE title = $1", [title]);
    }
    console.log('--- Cleanup of old boards complete. ---');

    // 2. Fetch existing Labels and Members
    const labelIds = (await q('SELECT id FROM labels')).rows.map(r => r.id);
    const memberIds = (await q('SELECT id FROM members')).rows.map(r => r.id);

    // --- BOARD 1: 🌈 Showcase: Visual Overload ---
    // Theme: Vibrant Neon & Space
    const b1Id = (await q("INSERT INTO boards (title, bg_type, bg_value, is_starred) VALUES ($1, $2, $3, $4) RETURNING id", 
      ['🌈 Showcase: Visual Overload', 'image', 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=1920&auto=format&fit=crop', true])).rows[0].id;
    
    // Lists with vibrant gradients
    const l1_1 = (await q("INSERT INTO lists (board_id, title, position, bg_type, bg_value) VALUES ($1, $2, $3, $4, $5) RETURNING id", 
      [b1Id, 'Full-Mode Covers', 1, 'gradient', 'linear-gradient(135deg, rgba(102, 126, 234, 0.4) 0%, rgba(118, 75, 162, 0.4) 100%)'])).rows[0].id;
    const l1_2 = (await q("INSERT INTO lists (board_id, title, position, bg_type, bg_value) VALUES ($1, $2, $3, $4, $5) RETURNING id", 
      [b1Id, 'Gradient Headers', 2, 'gradient', 'linear-gradient(135deg, rgba(240, 147, 251, 0.4) 0%, rgba(245, 87, 108, 0.4) 100%)'])).rows[0].id;
    const l1_3 = (await q("INSERT INTO lists (board_id, title, position) VALUES ($1, $2, $3) RETURNING id", 
      [b1Id, 'Glassmorphism', 3])).rows[0].id;

    // Feature Cards
    await q("INSERT INTO cards (list_id, title, description, cover_type, cover_value, cover_mode, position) VALUES ($1, $2, $3, $4, $5, $6, $7)", 
      [l1_1, 'Epic Galaxy Full-Mode Cover', 'This card demonstrates the "Full-Mode" cover feature using a high-contrast space image.', 'image', 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=800&auto=format&fit=crop', 'full', 1]);
    await q("INSERT INTO cards (list_id, title, description, cover_type, cover_value, cover_mode, position) VALUES ($1, $2, $3, $4, $5, $6, $7)", 
      [l1_2, 'Vibrant Sunset Gradient Header', 'This card uses a "Top-Mode" gradient cover to create a modern, sleek look.', 'gradient', 'linear-gradient(135deg, #f7971e 0%, #f7cd56 100%)', 'top', 1]);
    await q("INSERT INTO cards (list_id, title, description, cover_type, cover_value, cover_mode, position) VALUES ($1, $2, $3, $4, $5, $6, $7)", 
      [l1_3, 'Transparent Glass Lists!', 'Notice how the lists themselves have transparency and glassmorphism effects, letting the board background shine through.', 'color', '#61bd4f', 'top', 1]);

    // --- BOARD 2: 📅 Showcase: Power Productivity ---
    // Theme: Vibrant Nature & Sunlight
    const b2Id = (await q("INSERT INTO boards (title, bg_type, bg_value) VALUES ($1, $2, $3) RETURNING id", 
      ['📅 Showcase: Power Productivity', 'image', 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=1920&auto=format&fit=crop'])).rows[0].id;
    
    const l2_1 = (await q("INSERT INTO lists (board_id, title, position) VALUES ($1, $2, $3) RETURNING id", [b2Id, 'Advanced Tasking', 1])).rows[0].id;

    // Feature Cards
    const c2_1 = (await q("INSERT INTO cards (list_id, title, description, cover_type, cover_value, position, due_date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id", 
      [l2_1, 'Multi-Level Checklist Mastery', 'Check out how I can track complex sub-tasks and maintain progress across different stages.', 'color', '#0079bf', 1, new Date(Date.now() + 86400000 * 5)])).rows[0].id;
    await q("INSERT INTO checklist_items (card_id, text, is_complete, position) VALUES ($1, $2, $3, $4)", [c2_1, 'Install dependencies', true, 1]);
    await q("INSERT INTO checklist_items (card_id, text, is_complete, position) VALUES ($1, $2, $3, $4)", [c2_1, 'Configure database pool', true, 2]);
    await q("INSERT INTO checklist_items (card_id, text, is_complete, position) VALUES ($1, $2, $3, $4)", [c2_1, 'Final deployment audit', false, 3]);

    const c2_2 = (await q("INSERT INTO cards (list_id, title, description, cover_type, cover_value, position) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id", 
      [l2_1, 'Visual Labels & Tagging System', 'I use multiple labels across different categories to make task status clear at a single glance.', 'color', '#ff8b00', 2])).rows[0].id;
    for (let i = 0; i < 3; i++) {
        await q("INSERT INTO card_labels (card_id, label_id) VALUES ($1, $2)", [c2_2, labelIds[i % labelIds.length]]);
    }

    // --- BOARD 3: 🚀 Realistic: Pulse Platform v2.0 ---
    // Theme: Vibrant Futuristic Tech
    const b3Id = (await q("INSERT INTO boards (title, bg_type, bg_value) VALUES ($1, $2, $3) RETURNING id", 
      ['🚀 Realistic: Pulse Platform v2.0', 'image', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1920&auto=format&fit=crop'])).rows[0].id;
    
    const lists3 = ['Strategic Backlog', 'Sprint Dev (Active)', 'Final Review', 'Live 🚀'];
    for (let i = 0; i < lists3.length; i++) {
        const lId = (await q("INSERT INTO lists (board_id, title, position) VALUES ($1, $2, $3) RETURNING id", [b3Id, lists3[i], i + 1])).rows[0].id;
        
        if (i === 1) { // Developing list
            const cId = (await q("INSERT INTO cards (list_id, title, description, cover_type, cover_value, position) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id", 
                [lId, 'Refactor Auth Middleware for JWT', 'We need to move away from stateful session-based auth to support our stateless mobile API.', 'gradient', 'linear-gradient(to top, #09203f 0%, #537895 100%)', 1])).rows[0].id;
            await q("INSERT INTO card_labels (card_id, label_id) VALUES ($1, $2)", [cId, labelIds[4] || 1]); // backend
            await q("INSERT INTO card_members (card_id, member_id) VALUES ($1, $2)", [cId, memberIds[0] || 1]);

            await q("INSERT INTO cards (list_id, title, description, cover_type, cover_value, position, due_date) VALUES ($1, $2, $3, $4, $5, $6, $7)", 
                [lId, 'Optimize Postgres Search Queries', 'The current search index is causing 500ms latency on the dashboard. Need to audit slow logs.', 'color', '#eb5a46', 2, new Date(Date.now() + 86400000 * 2)]);
        }
        if (i === 2) { // Review list
            await q("INSERT INTO cards (list_id, title, description, cover_type, cover_value, cover_mode, position) VALUES ($1, $2, $3, $4, $5, $6, $7)", 
                [lId, 'Fix CSS Grid on Ultra-Wide Monitors', 'Layout breaks at 3440px width. Need to cap the main container and fix column spanning.', 'image', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop', 'top', 1]);
        }
    }

    // --- BOARD 4: 🎨 Realistic: Aura Brand Guidelines ---
    // Theme: Vibrant Abstract Art
    const b4Id = (await q("INSERT INTO boards (title, bg_type, bg_value) VALUES ($1, $2, $3) RETURNING id", 
      ['🎨 Realistic: Aura Brand Guidelines', 'image', 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1920&auto=format&fit=crop'])).rows[0].id;
    
    // Lists with image backgrounds
    const l4_1 = (await q("INSERT INTO lists (board_id, title, position, bg_type, bg_value) VALUES ($1, $2, $3, $4, $5) RETURNING id", 
      [b4Id, 'Initial Concepts', 1, 'image', 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=400&auto=format&fit=crop'])).rows[0].id;
    const l4_2 = (await q("INSERT INTO lists (board_id, title, position) VALUES ($1, $2, $3) RETURNING id", [b4Id, 'Aura Styleguide', 2])).rows[0].id;
    
    await q("INSERT INTO cards (list_id, title, description, cover_type, cover_value, cover_mode, position) VALUES ($1, $2, $3, $4, $5, $6, $7)", 
      [l4_1, 'Select Vibrant Moodboard Assets', 'Curate high-impact color palettes that feel "vibrant" and "alive".', 'color', '#ff78cb', 'full', 1]);

    const c4_2 = (await q("INSERT INTO cards (list_id, title, description, cover_type, cover_value, position, due_date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id", 
      [l4_2, 'Finalize Primary Neon Palette', 'Define the hex codes for the neon magenta and electric cyan colors.', 'gradient', 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 1, new Date(Date.now() + 86400000 * 20)])).rows[0].id;
    await q("INSERT INTO checklist_items (card_id, text, is_complete, position) VALUES ($1, $2, $3, $4)", [c4_2, 'Neon Pink - #ff00ff', true, 1]);
    await q("INSERT INTO checklist_items (card_id, text, is_complete, position) VALUES ($1, $2, $3, $4)", [c4_2, 'Cyber Blue - #00ffff', true, 2]);

    console.log('--- Vibrant Seeding Complete! ---');
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
