const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


const booksResolved = new Promise((resolve, reject) => {
    setTimeout(() => resolve(books), 2000)
})

public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Unable to register user." });
    if (isValid(username)) return res.status(404).json({ message: "User already exists!" });
    users.push({ username, password });
    return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        const result = await booksResolved
        return res.status(200).json({ books: result })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    try {
        const { isbn } = req.params
        const result = await booksResolved
        if (!result[isbn]) return res.status(404).json({ message: `Book with isbn ${isbn} not found` });
        return res.status(200).json(result[isbn])
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    try {
        const { author } = req.params
        const result = await booksResolved
        const booksByAuthor = Object.values(result).filter(book => book.author === author)
        if (!booksByAuthor.length) return res.status(404).json({ message: `Book details by author ${author} not found` });
        return res.status(200).json({ booksByAuthor });
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    try {
        const { title } = req.params
        const result = await booksResolved
        const booksByTitle = Object.values(result).filter(book => book.title === title)
        if (!booksByTitle.length) return res.status(404).json({ message: `Book details by title ${title} not found` });
        return res.status(200).json({ booksByTitle });
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const { isbn } = req.params
    if (!books[isbn]) return res.status(404).json({ message: `Book with isbn ${isbn} not found` });
    return res.status(200).json(books[isbn].reviews)
});

module.exports.general = public_users;
