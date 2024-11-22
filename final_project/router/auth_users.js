const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
    return users.some((user) => user.username === username);
}

const authenticatedUser = (username, password) => { //returns boolean
    return users.some((user) => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Error logging in" });
    if (!authenticatedUser(username, password)) return res.status(208).json({ message: "Invalid Login. Check username and password" });
    const accessToken = jwt.sign({ username }, 'access', { expiresIn: 60 * 60 });
    req.session.authorization = { accessToken, username };
    return res.status(200).send("User successfully logged in");
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params
    const { review } = req.query;
    const { username } = req.user
    if (!books[isbn]) return res.status(404).json({ message: `Book with isbn ${isbn} not found` });
    books[isbn].reviews[username] = review;
    return res.status(200).json({
        message: `Review ${review} added/updated successfully`,
        books,
    });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params
    const { username } = req.user
    delete books[isbn].reviews[username];
    return res.status(200).json({
        message: `Review with isbn ${isbn} deleted successfully`,
        books,
    });
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
