// ==============================
// MODULE IMPORTS AND CONFIGURATION
// ==============================
const express = require('express'); // Express framework for building web applications
const path = require('path');       // Path module for file system paths
const mysql = require('mysql');     // MySQL client for database connection
const session = require("express-session"); // Session management middleware

const app = express();              // Initialize Express application
const PORT = 3000;                  // Define the port number

// ==============================
// DATABASE CONNECTION SETUP
// ==============================
const dbConn = mysql.createConnection({
    host: "localhost",       // Database host
    port: "8889",            // Database port (default for MAMP)
    user: "root",            // Database username
    password: "root",        // Database password
    database: 'myServer'      // Database name
});

// Optional: Consider adding error handling for the database connection
dbConn.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
    } else {
        console.log('Connected to the database');
    }
});

// ==============================
// MIDDLEWARE SETUP
// ==============================
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the 'public' directory
app.use(express.json()); // Parse incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

// Session management setup
app.use(session({
    secret: "secret-key", // Key to sign the session ID cookie
    resave: false,        // Avoid resaving the session if it hasn't been modified
    saveUninitialized: false, // Don't create sessions for unauthenticated users
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // Session expiry: 1 day
}));

// ==============================
// ROUTE: SERVE HOMEPAGE
// ==============================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // Serve the main index.html file
});

// ==============================
// ROUTE: LOGIN ENDPOINT
// ==============================
app.post('/Login', (req, res) => {
    console.log("Received Login Request:", req.body);
    const { username, password } = req.body;

    if (!username || !password) {
        return res.redirect('/login.html?error=missing');
    }

    const sql = "SELECT id, Name, Username, Password FROM `data` WHERE `Username` = ?";
    dbConn.query(sql, [username], (err, result) => {
        if (err) {
            console.error("Database query error:", err);
            return res.redirect('/login.html?error=server');
        }
        if (result.length > 0) {
            if (password === result[0].Password) {
                req.session.isLoggedIn = true;
                req.session.user = { id: result[0].id, username: result[0].Username };
                return res.redirect('/');
            } else {
                return res.redirect('/login.html?error=password');
            }
        } else {
            return res.redirect('/login.html?error=username');
        }
    });
});




// ==============================
// ROUTE: FETCH LOGGED-IN USER DETAILS
// ==============================
app.get('/user', (req, res) => {
    if (req.session.isLoggedIn) {
        res.json({ name: req.session.user.name, username: req.session.user.username }); 
    } else {
        res.status(401).json({ message: "Not logged in" });
    }
});

// ==============================
// START THE SERVER
// ==============================
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});



