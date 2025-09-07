const db = require('./db');

(async () => {
  try {
    const res = await db.query('SELECT NOW() AS current_time');
    console.log('DB connected! Time is:', res.rows[0].current_time);
  } catch (err) {
    console.error('DB connection failed:', err);
  } finally {
    process.exit();
  }
})();
