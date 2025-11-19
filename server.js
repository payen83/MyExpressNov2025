const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static('public'));

app.engine('ejs', require('ejs').__express);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const methodOverride = require( 'method-override' );
app.use( methodOverride( '_method' ));

app.use('/api/files/images', express.static(path.join(__dirname, 'files/images')));

app.get('/', (req, res) => {
    res.send('Hello Express!');
});

app.get('/about', (req, res) => {
    res.send('About us page');
});

app.get('/products/:id', (req, res) => {
    const {id} = req.params;
    res.send("Product ID: " + id);
});

app.get('/search', (req, res) => {
    const {keyword, page } = req.query;
    res.send("Search: " + keyword + " Page: " + (page || 1));
});

const blogRoutes = require('./routes/blog_routes');
app.use('/blogs', blogRoutes);

const contactRoutes = require('./routes/contact_routes');
app.use('/contacts', contactRoutes);

const usersRoutes = require('./routes/users_routes');
app.use('/users', usersRoutes);

const reportApiRoutes = require('./routes/reportapi_routes');
app.use('/api/reports', reportApiRoutes);

const authApiRoutes = require('./routes/authapi_routes');
app.use('/api/auth', authApiRoutes);

app.listen(PORT, ()=> console.log('Server running on http://localhost:' + PORT));