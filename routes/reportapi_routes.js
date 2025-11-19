const express = require('express');
const router = express.Router();
const db = require('../database');
const multer = require('multer');
const path = require('path');

//configure storage files, location & filename
const storage = multer.diskStorage({
    destination: function (req, file, callback){
        callback(null, 'files/images')
    },
    filename: function(req, file, callback){
        const uniqueName = 'image-' + Date.now() + path.extname(file.originalname);
        callback(null, uniqueName);
    }
});
const upload = multer({storage: storage});

router.post('/add', upload.single('image'), async(req, res) => {
    const {title, date, category, user_id} = req.body;
    const image_path = req.file ? `files/images/${req.file.filename}`: null;
    const errors = [];
    //validation here
    //submit data
    try {
        let query = 'INSERT INTO reports (title, date, category, user_id';
        let values = 'VALUES (?, ?, ?, ?';
        const params = [title, date, category, user_id];
        if(image_path){
            query += ', image_path';
            values += ', ?';
            params.push(image_path);
        }
        query += ') ' + values + ')';
        const [result] = await db.query(query, params);
        const data = {
            id: result.insertId
        }
        successResponse(res, 201, 'Report added successfully', data);
    } catch(err){
        errorResponse(res, 
            500, 
            'Server or DB error, failed to add report', err.message
        );
    }
});

//Helper functions
function successResponse(
    res,
    code = 200,
    message = "successfull",
    data = null
){
    return res.status(code).json({
        success: true,
        message,
        data
    });
}

function errorResponse(
    res,
    code = 500,
    message = "Something went wrong",
    error = null,
    errors = null
){
    return res.status(code).json({
        success: false,
        message,
        error,
        errors
    });
}

//Get all reports
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM reports');
        successResponse(res, 200, "Reports retrieved successfully", rows);
    } catch (err) {
        errorResponse(res, 500, "Server or database error, Get reports faild", err.message);
    }
});

router.get('/:id', async (req, res)=>{
    try {
        const [rows] = await db.query(
           `SELECT
            report.id AS report_id,
            report.title,
            report.date,
            report.image_path,
            report.user_id,
            user.id AS user_id,
            user.name AS user_name,
            user.email AS user_email
            FROM reports report
            LEFT JOIN users user ON report.user_id = user.id
            WHERE report.id = ?
           `, [req.params.id]  
        );

        if(rows.length < 1){
            return errorResponse(res, 404, "Report not found", err.message)
        }
        const row = rows[0];
        const detailReport = {
            id: row.report_id,
            title: row.title,
            date: row.date,
            category: row.category,
            image_path: row.image_path,
            user: {
                id: row.user_id,
                name: row.user_name,
                email: row.user_email
            }
        };
        successResponse(res, 200, "Report details retrieved succssfully", detailReport);
    } catch (err) {
        errorResponse(res, 500, 'Server or database error. Get details report failed', err.message);
    }
});

module.exports = router;