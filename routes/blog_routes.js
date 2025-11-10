const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('All blog posts');
});

router.get('/post/:id', (req, res) => {
    res.send('You are viewing blog post ID: '+ req.params.id);
});

module.exports = router;