const express = require('express')
const router = express.Router();
const db = require('./db')
const bcrypt = require('bcrypt');



// Route to render the login form
router.get('/login', (req, res) => {
    res.render('authForm', { formTitle: 'Connexion', isRegister: false });
});


// Route to render the registration form
router.get('/register', (req, res) => {
    res.render('authForm', { formTitle: 'Inscription', isRegister: true });
});



// Registration POST route
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {

        //hash the password securely using bcrypt.
        const hashedPassword = await bcrypt.hash(password, 10); // 10 is the number of salt rounds

        const insertUser = db.prepare('INSERT INTO users (username,email, password) VALUES (?,?, ?)');
        insertUser.run(username, email, hashedPassword, (err) => {
            if (err) {
                console.error('Error inserting user:', err.message);
                res.send('Error registering user.');
            } else {
                console.log('User registered successfully:', username);
                req.session.user = username;
                res.redirect('/user/login');
            }
        });

        insertUser.finalize();

    } catch (error) {
        console.log(`Error: ${error}`);
        req.flash('error_msg', {
            message: 'Error getting auth URL',
            debug: JSON.stringify(error, Object.getOwnPropertyNames(error))
        });
        res.redirect('/accueil');
    }
});



// Login POST route
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    try {

        const getUser = db.prepare('SELECT * FROM users WHERE username = ?');
        getUser.get(username, async (err, row) => {
            if (err) {
                console.error('Error getting user:', err.message);
                res.send('Error logging in.');
            } else {
                if (row && await bcrypt.compare(password, row.password)) {
                    console.log('User logged in:', username);
                    req.session.user = username;
                    // Save the user's Id in their session
                    req.session.userId = row.id;

                    // Add the user to user storage
                    req.app.locals.users[req.session.userId] = {
                        displayName: row.username,
                        email: row.email,
                        provider: 'user'
                    };
                    res.redirect('/accueil');
                } else {
                    res.send('Invalid username or password.');
                }
            }
        });

    } catch (error) {

        console.log(`Error: ${error}`);
        req.flash('error_msg', {
            message: 'Error getting auth URL',
            debug: JSON.stringify(error, Object.getOwnPropertyNames(error))
        });
        res.redirect('/');

    }
});

module.exports = router;