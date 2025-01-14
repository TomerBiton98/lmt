const express = require('express');
const path = require('path');
const mysql = require('mysql');
const session = require("express-session");
const app = express();
const PORT = 3000;

// Database connection setup
const dbConn = mysql.createConnection({
    host: "localhost",       // Database host
    port: "8889",            // Database port (default for MAMP)
    user: "root",            // Database username
    password: "root",        // Database password
    database: 'myServer'     // Database name
});

// Middleware setup
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files
app.use(express.json()); // Parse JSON requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data
app.use(session({
    secret: "secret-key", // Key to sign the session ID cookie
    resave: false,        // Avoid resaving session if unmodified
    saveUninitialized: false, // Don't save uninitialized session
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // Session expiry: 1 day
}));

// Serve the homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // Serve index.html
});

// Login endpoint
app.post('/Login', (req, res) => {
    const { username, password } = req.body;

    // Query database to verify login credentials
    const sql = "SELECT id, Name, Username, Password FROM `data` WHERE `Username` = ?";
    dbConn.query(sql, [username], (err, result) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ message: "Database error" });
        }

        if (result.length > 0) {
            const storedPassword = result[0].Password;

            if (password === storedPassword) { // Match plaintext passwords
                req.session.isLoggedIn = true; // Mark session as logged in
                req.session.user = {
                    id: result[0].id,
                    username: result[0].Username,
                    name: result[0].Name,
                };
                console.log("Session data after login:", req.session);
                return res.redirect('/'); // Redirect to the homepage
            } else {
                return res.status(401).json({ success: false, message: "Invalid password" });
            }
        } else {
            return res.status(401).json({ success: false, message: "Invalid username" });
        }
    });
});

// Endpoint to fetch logged-in user details
app.get('/user', (req, res) => {
    if (req.session.isLoggedIn) {
        res.json({ name: req.session.user.name, username: req.session.user.username }); 
    } else {
        res.status(401).json({ message: "Not logged in" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});






