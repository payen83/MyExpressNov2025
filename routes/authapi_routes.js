const express = require('express');
const router = express.Router();
const db = require('../database');
const multer = require('multer');
const bcrypt = require('bcrypt');
const upload = multer();
require('dotenv').config();
const jwt = require('jsonwebtoken');

router.post('/login', upload.none(), async(req, res) => {
    const data = { ...req.body, ...req.query };
    const { email, password } = data;
    try{
        const [rows] = await db.query(
            `SELECT * FROM users WHERE email = ? AND type = ?`,
            [email, 'admin']
        );
        if(rows.length < 1){
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        const admin = rows[0];
        const isMatch = await bcrypt.compare(password, admin.hash_password);
        if(!isMatch){
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        const token = jwt.sign(
            { id: admin.id, email: admin.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        res.json({
            success: true,
            message: 'Login successfull',
            token,
            user: {
                id: admin.id,
                name: admin.name,
                email: admin.email
            }
        });
    } catch(err){
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: err.message
        });
    }
});

//POST - Register
router.post('/register', upload.none(), async(req, res)=>{
    const data = {...req.body, ...req.query};
    const {name, email, password} = data;
    const errors = [];

    if(!name || name.trim() == ''){
        errors.push('Name is required');
    } 
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Please enter valid email');
    }
    if(!password || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)){
        errors.push('Password must be minimum 8 characters with at least 1 capital letter,  1 digit and 1 special character');
    }

    if(errors.length > 0){
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }
    try {
        const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if(existingUser.length > 0){
            return res.status(409).json({
                success: false,
                message: 'User with this email is already registered'
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const type = 'admin';
        const [result] = await db.query(`
            INSERT INTO users (name, email, hash_password, type) 
            VALUES (?,?,?,?)`, [name, email, hashedPassword, type]);
       
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: { id: result.insertId }
        });

    } catch(err){
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: err.message
        });
    }
});
module.exports = router;