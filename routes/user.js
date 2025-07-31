const exprees = require('express');
const router = exprees.Router();
const pool = require('../db');

router.post('/' , async (req ,res) => {
    try {
        const { name, balance } = req.body;
    
        const user = await pool.query(
          'INSERT INTO users (name, balance) VALUES ($1, $2) RETURNING *',
          [name, balance]
        );
    
        res.json(user.rows[0]); // ✅ درست شد
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
      }
})

// user profile
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
      
    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.rows[0]);

  } catch (err) {
    console.error('Error fetching user:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});


//users wallet
router.post('/:id/wallet/deposite', async (req,res) => {
  const {id} = req.params;
  const {amount} = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'مبلغ نامعتبر است' });
  }

  try {
    const result = await pool.query(
      'UPDATE users SET balance = balance + $1 WHERE id = $2 RETURNING * ',[amount,id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'کاربر پیدا نشد' });
    }

    res.json({ message: 'شارژ کیف پول موفق بود', user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'خطا در شارژ کیف پول' });
  }
});
module.exports = router;