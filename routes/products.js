const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /products
router.get('/' , async (req,res) => {
    try {
        const result = await pool.query('SELECT * FROM products');

        const etag = `"${result.rows.length}-${result.rows[result.rows.length - 1]?.id || 0}"`;
        res.set('ETag', etag);

        if (req.headers['if-none-match'] === etag) {
            return res.status(304).end();
          }

        res.set('Cache-Control', 'max-age=300, public');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('server error');
    }
})

// GET /products/:id
router.get('/:id', async (req ,res) => {
    const {id} = req.params;
    try {
        const result = await pool.query('SELECT * FROM products WHERE id = $1',[id]);
        if (result.rows.length === 0 ) {
            return res.status(404).send('can not find any product');
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('server error');
    }
})


// POST /products
router.post('/' , async (req ,res) => {
    try {
    const {name , price ,stock} = req.body;

        const product = await pool.query(
            'INSERT INTO products (name , price , stock) VALUES ($1 , $2, $3) RETURNING *' , [name , price,stock]
        )
        res.status(201).json(product.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('خطا در ایجاد محصول');        
    }
})

// PUT /products/:id
router.put('/:id' , async (req , res) => {
    const {id} = req.params;
    const { name, price, stock} = req.body;
    try {
        const result = await pool.query(
            'UPDATE products SET name = $1 , price=$2 , stock=$3 WHERE id = $4 RETURNING *'
            ,[name,price,stock,id]
        );
        if (result.rows.length === 0) {
            return res.status(404).send('محصولی با این ID پیدا نشد');
          }
          res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('خطا در ویرایش محصول');
    }
})

// DELETE /products/:id 
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
  
      if (result.rows.length === 0) {
        return res.status(404).send('محصولی با این ID پیدا نشد');
      }
  
      res.json({ message: 'محصول با موفقیت حذف شد', deleted: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).send('خطا در حذف محصول');
    }
  });

module.exports = router;