const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', async (req, res) => {
    try {
        const [result] = await db.query('SELECT * FROM users');
        const users = result;
        res.render('users_page/users', {
            title: 'Users Management',
            content: 'View list of users',
            users
        });
    } catch (err) {
        console.log(err);
    }
});

function renderFormPage(res, error = null, user = null) {
    const isUpdate = !!user;

    res.render('users_page/user_form', {
        title: isUpdate ? 'Update User' : 'Add New User',
        content: isUpdate ? 'Change information' : 'Fill in the details',
        error,
        user,
        formAction: isUpdate ? '/users/update/' + user.id + '?_method=PUT' : '/users/add'
    });
}

router.get('/update/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);

        if (rows.length < 1) {
            return res.status(404).send('User not found');
        }
        const user = rows[0];
        renderFormPage(res, null, user);
    } catch (err) {
        console.error(err);
    }
});

router.put('/update/:id', async(req, res)=>{
    const {name, phone, email} = req.body;
    
    // Check validation first, don't proceed if validation fails
    if (!validateForm(name, phone, email, res, req.params.id)) {
        return; // Validation failed, response already sent
    }

    try {
        const [result] = await db.query('UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?',
            [name, email, phone, req.params.id]);
        if(result.affectedRows == 0) return res.status(404).send('User not found');
        res.redirect('/users');
    } catch(err){
        console.log(err);
        renderFormPage(res, 'Database Error, please contact Administrator', {name, email, phone, id: req.params.id});
    }
});

function validateForm(name, phone, email, res, userId = null){
    if (!name || name.trim() == '') {
        renderFormPage(res, 'Name is required', {name, email, phone, id: userId});
        return false;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        renderFormPage(res, 'Please enter valid email', {name, email, phone, id: userId});
        return false;
    }
    if (!phone || !/^\d+$/.test(phone)) {
        renderFormPage(res, 'Phone number is required and must be number only', {name, email, phone, id: userId});
        return false;
    }
    return true;
}

router.get('/add', (req, res) => renderFormPage(res));

router.post('/add', async (req, res) => {
    const { name, email, phone } = req.body;

    // Check validation first, don't proceed if validation fails
    if (!validateForm(name, phone, email, res)) {
        return; // Validation failed, response already sent
    }

    try {
        await db.query("INSERT INTO users (name, email, phone) VALUES (?,?,?)", [name, email, phone]);
        res.redirect('/users');
    } catch (err) {
        console.log(err);
        renderFormPage(res, 'Database Error, please contact Administrator', {name, email, phone});
    }
});

router.get('/details/:id', async (req, res) => {
    try {
        const [result] = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
        const user = result[0];
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.render('users_page/user_details', {
            title: 'User Details',
            content: 'View User Information',
            user
        });
    } catch (err) {
        console.error(err);
    }
});

module.exports = router;

