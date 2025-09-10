import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { rows } = await pool.query('SELECT * FROM timeslots');
    res.status(200).json(rows);
  } else if (req.method === 'POST') {
    const { time, listName, maxPlayers, dayOfWeek } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO timeslots (time, listName, maxPlayers, dayOfWeek) VALUES ($1, $2, $3, $4) RETURNING *',
      [time, listName, maxPlayers, dayOfWeek]
    );
    res.status(201).json(rows[0]);
  } else if (req.method === 'DELETE') {
    const { id } = req.body;
    await pool.query('DELETE FROM timeslots WHERE id = $1', [id]);
    res.status(204).end();
  } else {
    res.status(405).end();
  }
}
