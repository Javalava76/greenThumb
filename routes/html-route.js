// Dependencies
// =============================================================
const express = require('express');

const router = express.Router();
const db = require("../models");

//landing page
router.get('/', (req, res, next) => {
    res.render('index');
});

//registration page
router.get('/registration', (req, res, next) => {
    res.render('registration');
});

//login page
router.get('/login', (req, res, next) => {
    res.render('login');
});

//results page
router.get('/results', (req, res, next) => {
    res.render('results');
});

module.exports = router;



