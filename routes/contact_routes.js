const express = require('express');
const router = express.Router();
const contacts = [
    {id: 1, name: 'Khairul Adnan', phone: '017665536'},
    {id: 2, name: 'Yong Foo Kim', phone: '032918383'},
    {id: 1, name: 'Raja Muthu', phone: '0123772824'},
];

router.get('/', (req, res) => {
    res.render('contact_pages/contacts', {
        title: 'My Contacts',
        content: 'Manage and view my contacts',
        contacts
    });
});

router.get('/details/:id', (req, res) => {
    const contact = contacts.find(c => c.id == req.params.id);
    if(!contact){
        return res.status(404).send('Contact not found');
    }
    res.render('contact_pages/contact_details', {
        title: 'Contact Details',
        content: 'View contact details',
        contact
    });
});

router.get('/add', (req, res)=> renderFormPage(res));

router.post('/add', (req, res)=>{
    const {name, phone } = req.body;
    
    const newContact = {
        id: contacts.length+1,
        name,
        phone
    }
    contacts.push(newContact);
    res.redirect('/contacts')
})


function renderFormPage(res, error = null){
    res.render('contact_pages/contact_form', {
        title: 'Add New Contact',
        content: 'Fill in details for new contact',
        error,
        formAction: '/contacts/add'
    });
}

module.exports = router;