const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/' , async (req,res) => {
    const {user_id , items} = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        let totalPrice = 0;
        const detailedItems = [];

        for(const item of items){
            const productRes = await client.query('SELECT * FROM products WHERE id = $1', [item.product_id]);
            if (productRes.rows.length === 0) throw new Error(`محصول با id ${item.product_id} پیدا نشد`);
      
            const product = productRes.rows[0];
            const price = parseFloat(product.price) * item.quantity;
            totalPrice += price;

            detailedItems.push({
                product_id: item.product_id,
                quantity: item.quantity,
                price_at_time: product.price
              });
        }

        const orderRes = await client.query(
            'INSERT INTO orders (user_id, total_price) VALUES ($1, $2) RETURNING *',
            [user_id, totalPrice]
          );

          const orderId = orderRes.rows[0].id;

          for (let item of detailedItems) {
            await client.query(
              'INSERT INTO order_items (order_id,user_id,total_price, product_id, quantity, price_at_time) VALUES ($1, $2, $3, $4,$5,$6)',
              [orderId,user_id,totalPrice,item.product_id, item.quantity, item.price_at_time]
            );
          }

          await client.query('COMMIT');
    res.status(201).json({ message: 'سفارش با موفقیت ثبت شد', order_id: orderId });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).send('خطا در ثبت سفارش');
      } finally {
        client.release();
      }
})

router.get('/' , async (req , res) => {
    const userId = req.query.user_id;

    if (!userId) {
        return res.status(400).json({ error: 'user_id الزامی است' });
      }

      try {
        const ordersRes = await pool.query(
            'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
          );

          const orders = ordersRes.rows;

          console.log(orders);
          console.log('///////////////////////////////');


          // اگر هیچ سفارشی نبود
          if (orders.length === 0) {
            return res.json([]);
          }

          const detailedOrders = [];
          for(const order of orders){
            const itemsRes = await pool.query(
                `
                SELECT 
                oi.product_id,
                oi.quantity,
                oi.price_at_time,
                p.name AS product_name
              FROM order_items oi
              JOIN products p ON oi.product_id = p.id
              WHERE oi.order_id = $1
                `,[order.id]
            )

            detailedOrders.push({
                ...order,
                items: itemsRes.rows
              });
            }

            res.json(detailedOrders);
      } catch (err) {
        console.error('خطا در گرفتن سفارش‌ها:', err);
        res.status(500).send('خطا در گرفتن سفارش‌ها');
      }
    })

   
    // GET /orders/:id 
      router.get('/:id', async (req, res) => {
        const orderId = req.params.id;
      
        try {
          // دریافت اطلاعات سفارش
          const orderRes = await pool.query(
            'SELECT * FROM orders WHERE id = $1',
            [orderId]
          );
      
          if (orderRes.rows.length === 0) {
            return res.status(404).json({ error: 'سفارش پیدا نشد' });
          }
      
          const order = orderRes.rows[0];
      
          // دریافت آیتم‌های سفارش به همراه اطلاعات محصول
          const itemsRes = await pool.query(
            `
            SELECT 
              oi.product_id,
              oi.quantity,
              oi.price_at_time,
              p.name AS product_name
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = $1
            `,
            [orderId]
          );
      
          res.json({
            ...order,
            items: itemsRes.rows
          });
      
        } catch (err) {
          console.error('خطا در گرفتن سفارش:', err);
          res.status(500).json({ error: 'خطای سرور در دریافت سفارش' });
        }
      });

      // DELETE /orders/:id - حذف یک سفارش خاص
router.delete('/:id', async (req, res) => {
    const orderId = req.params.id;
  
    const client = await pool.connect();
  
    try {
      await client.query('BEGIN');
  
      // حذف آیتم‌های سفارش
      await client.query(
        'DELETE FROM order_items WHERE order_id = $1',
        [orderId]
      );
  
      // حذف خود سفارش
      const deleteOrder = await client.query(
        'DELETE FROM orders WHERE id = $1 RETURNING *',
        [orderId]
      );
  
      if (deleteOrder.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'سفارشی با این ID پیدا نشد' });
      }
  
      await client.query('COMMIT');
      res.json({ message: 'سفارش با موفقیت حذف شد' });
  
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('خطا در حذف سفارش:', err);
      res.status(500).json({ error: 'خطای سرور در حذف سفارش' });
    } finally {
      client.release();
    }
  });

  // payment
  router.post('/:id/pay' , async(req,res) => {
    const { id } = req.params;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const orderRes = await client.query('SELECT * FROM orders WHERE id = $1', [id]);
        if (orderRes.rows.length === 0) {
            throw new Error('سفارش پیدا نشد');
          }

          const order = orderRes.rows[0];
          if (order.status === 'paid') {
            return res.status(400).json({ message: 'این سفارش قبلاً پرداخت شده' });
          }

          const userRes= await client.query('SELECT * FROM users WHERE id = $1',[order.user_id]);
          const user = userRes.rows[0];

          if (user.balance < order.total_price) {
            return res.status(400).json({ message: 'موجودی کیف پول کافی نیست' });
          }

            // کم کردن موجودی و به‌روزرسانی سفارش
    await client.query(
        'UPDATE users SET balance = balance - $1 WHERE id = $2',
        [order.total_price, user.id]
      );

      await client.query(
        'UPDATE orders SET status = $1, paid_at = NOW() WHERE id = $2',
        ['paid', id]
      );

      await client.query('COMMIT');
      res.json({ message: 'پرداخت با موفقیت از کیف پول انجام شد' });
  
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: 'خطا در پرداخت سفارش' });
      } finally {
        client.release();
      }        
  })




module.exports = router;