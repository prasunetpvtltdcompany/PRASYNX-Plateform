const { Pool } = require('pg');
const path = require('path');

const pool = new Pool({
  connectionString: 'postgresql://postgres.axwhtngxveaidbscsrca:Prasunet123*@aws-1-ap-south-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

const ORG = '00000000-0000-0000-0000-000000000001';
const STUDENTS = [
  '00000000-0000-0000-0000-000000000020',
  '00000000-0000-0000-0000-000000000021',
  '00000000-0000-0000-0000-000000000022',
  '00000000-0000-0000-0000-000000000023',
  '00000000-0000-0000-0000-000000000024',
  '00000000-0000-0000-0000-000000000025',
  '00000000-0000-0000-0000-000000000026',
  '00000000-0000-0000-0000-000000000027',
  '00000000-0000-0000-0000-000000000028',
  '00000000-0000-0000-0000-000000000029',
  '00000000-0000-0000-0000-00000000002a',
  '00000000-0000-0000-0000-00000000002b',
];

async function seed() {
  try {
    // 1. Learning games
    const games = [
      { title: 'Math Marathon', description: 'Race through arithmetic challenges', subject: 'Mathematics', difficulty: 'beginner', game_type: 'quiz', max_score: 100, duration_minutes: 10 },
      { title: 'Word Wizard', description: 'Build vocabulary with spelling puzzles', subject: 'English', difficulty: 'beginner', game_type: 'puzzle', max_score: 80, duration_minutes: 8 },
      { title: 'Science Explorer', description: 'Discover science facts through interactive quizzes', subject: 'Science', difficulty: 'intermediate', game_type: 'quiz', max_score: 120, duration_minutes: 15 },
      { title: 'History Quest', description: 'Travel through time answering history questions', subject: 'History', difficulty: 'intermediate', game_type: 'challenge', max_score: 150, duration_minutes: 20 },
      { title: 'Code Crusader', description: 'Learn programming basics with fun challenges', subject: 'Coding', difficulty: 'advanced', game_type: 'interactive', max_score: 200, duration_minutes: 25 },
      { title: 'Geo Genius', description: 'Explore world geography through maps and flags', subject: 'Geography', difficulty: 'beginner', game_type: 'flashcard', max_score: 60, duration_minutes: 5 },
      { title: 'Grammar Guardian', description: 'Master English grammar rules', subject: 'English', difficulty: 'intermediate', game_type: 'quiz', max_score: 100, duration_minutes: 12 },
      { title: 'Math Puzzle Pro', description: 'Solve complex math puzzles', subject: 'Mathematics', difficulty: 'advanced', game_type: 'puzzle', max_score: 180, duration_minutes: 20 },
    ];

    for (const g of games) {
      await pool.query(
        `INSERT INTO learning_games (organisation_id, title, description, subject, difficulty, game_type, max_score, duration_minutes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT DO NOTHING`,
        [ORG, g.title, g.description, g.subject, g.difficulty, g.game_type, g.max_score, g.duration_minutes]
      );
    }
    console.log('✓ Learning games seeded');

    // 2. Achievement definitions
    const achievements = [
      { name: 'First Steps', description: 'Complete your first game', icon: 'star', xp_reward: 10 },
      { name: 'Quick Learner', description: 'Score 100% on any game', icon: 'zap', xp_reward: 50 },
      { name: 'Math Whiz', description: 'Complete 5 math games', icon: 'calculator', xp_reward: 100 },
      { name: 'Word Master', description: 'Score 90%+ on 3 English games', icon: 'book', xp_reward: 75 },
      { name: 'Streak King', description: 'Play games 7 days in a row', icon: 'flame', xp_reward: 200 },
      { name: 'Top Performer', description: 'Earn 1000 total XP', icon: 'trophy', xp_reward: 500 },
      { name: 'Challenge Accepted', description: 'Complete an advanced difficulty game', icon: 'target', xp_reward: 150 },
      { name: 'Code Breaker', description: 'Complete the Code Crusader game', icon: 'code', xp_reward: 300 },
    ];

    for (const a of achievements) {
      await pool.query(
        `INSERT INTO achievement_definitions (organisation_id, name, description, icon, xp_reward)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING`,
        [ORG, a.name, a.description, a.icon, a.xp_reward]
      );
    }
    console.log('✓ Achievement definitions seeded');

    // 3. Student XP
    const xpValues = [120, 450, 780, 230, 1100, 340, 890, 560, 150, 670, 920, 410];
    for (let i = 0; i < STUDENTS.length; i++) {
      const xp = xpValues[i];
      const level = Math.floor(xp / 500) + 1;
      await pool.query(
        `INSERT INTO student_xp (organisation_id, student_id, total_xp, level, streak_days, last_activity_date)
         VALUES ($1, $2, $3, $4, $5, CURRENT_DATE)
         ON CONFLICT (student_id) DO UPDATE SET total_xp = $3, level = $4`,
        [ORG, STUDENTS[i], xp, level, Math.floor(Math.random() * 10)]
      );
    }
    console.log('✓ Student XP seeded');

    // 4. Leaderboard
    await pool.query('DELETE FROM leaderboard WHERE organisation_id = $1', [ORG]);
    const xpRows = await pool.query(
      'SELECT student_id, total_xp, level FROM student_xp WHERE organisation_id = $1 ORDER BY total_xp DESC',
      [ORG]
    );
    for (let i = 0; i < xpRows.rows.length; i++) {
      const r = xpRows.rows[i];
      await pool.query(
        'INSERT INTO leaderboard (organisation_id, student_id, total_xp, level, rank) VALUES ($1, $2, $3, $4, $5)',
        [ORG, r.student_id, r.total_xp, r.level, i + 1]
      );
    }
    console.log('✓ Leaderboard seeded');

    // 5. Assign some games
    const gameRows = await pool.query('SELECT id FROM learning_games WHERE organisation_id = $1 LIMIT 4', [ORG]);
    if (gameRows.rows.length > 0) {
      const g1 = gameRows.rows[0].id;
      const g2 = gameRows.rows[1].id;
      // Assign to individual students
      for (let i = 0; i < Math.min(5, STUDENTS.length); i++) {
        await pool.query(
          `INSERT INTO game_assignments (organisation_id, game_id, student_id, due_date)
           VALUES ($1, $2, $3, CURRENT_DATE + INTERVAL '7 days')
           ON CONFLICT DO NOTHING`,
          [ORG, g1, STUDENTS[i]]
        );
      }
      // Assign to class
      if (gameRows.rows.length >= 2) {
        const classRows = await pool.query('SELECT id FROM classes WHERE organisation_id = $1 LIMIT 1', [ORG]);
        if (classRows.rows.length > 0) {
          await pool.query(
            `INSERT INTO game_assignments (organisation_id, game_id, class_id, due_date)
             VALUES ($1, $2, $3, CURRENT_DATE + INTERVAL '14 days')
             ON CONFLICT DO NOTHING`,
            [ORG, g2, classRows.rows[0].id]
          );
        }
      }
      console.log('✓ Game assignments seeded');
    }

    console.log('\n✅ Demo data seeding complete!');
  } catch (e) {
    console.error('Seed error:', e.message);
  }
  pool.end();
}

seed();
