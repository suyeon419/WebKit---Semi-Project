//adminController.js
const pool = require('../config/dbPool');

exports.listUser = async (req, res) => {
    const sql = `select id,name,email,role,
                    date_format(createdAt,'%Y-%m-%d') createdAt 
                    from members order by id desc`;
    try {
        const [result] = await pool.query(sql);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ result: 'fail', message: 'Error: ' + error.message });
    }
};
