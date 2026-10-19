const { getPool } = require("../db/connection");
class Review {
 static async hasPurchased(userId, productId){const pool=getPool();const [rows]=await pool.query(`SELECT oi.order_item_id FROM order_items oi INNER JOIN orders o ON oi.order_id=o.order_id WHERE o.user_id=? AND oi.product_id=? AND o.order_status!='cancelled' LIMIT 1`,[userId,productId]);return rows.length>0;}
 static async addReview(userId,productId,rating,review){const pool=getPool();const [result]=await pool.query(`INSERT INTO reviews (user_id,product_id,rating,review_text,status) VALUES (?,?,?,?, 'pending')`,[userId,productId,Number(rating),String(review).trim()]);return result;}
 static async getProductReviews(productId){const pool=getPool();const [rows]=await pool.query(`SELECT r.review_id,r.rating,r.review_text AS review,r.created_at,u.name FROM reviews r INNER JOIN users u ON r.user_id=u.user_id WHERE r.product_id=? AND r.status='approved' ORDER BY r.review_id DESC`,[productId]);return rows;}
 static async deleteReview(reviewId){const pool=getPool();const [result]=await pool.query(`DELETE FROM reviews WHERE review_id=?`,[reviewId]);return result;}
}
module.exports=Review;
