
/**
 * @file auth.js
 * @description Handles user login and JWT token generation using Passport LocalStrategy.
 */
const { Router } = require('express');

const jwtSecret = 'your_jwt_secret';
const jwt = require('jsonwebtoken');
const passport = require('passport');

require('./passport'); // Import Passport strategies

/**
 * @function generateJWTToken
 * @description Generates a JSON Web Token for an authenticated user.
 * @param {Object} user - The user object (should include a Username and other relevant fields).
 * @returns {string} Signed JWT token valid for 7 days.
 */
let generateJWTToken = (user) => {
    return jwt.sign(user, jwtSecret, {
        subject: user.Username,
        expiresIn: '7d',
        algorithm: 'HS256'
    });
}

/**
 * @function
 * @description Defines the /login route for user authentication.
 * On successful login, returns a signed JWT and user info.
 * @param {express.Router} router - Express router to attach the login route to.
 */
module.exports = (router) => {
    /**
     * @route POST /login
     * @desc Login a user and return a JWT token
     * @access Public
     */
    router.post('/login', (req,res) => {
        passport.authenticate ('local', { session: false }, (error, user, info) =>
            {
            if (error || !user) {
                return res.status(400).json({
                    message: 'Something is not right',
                    user: user
                });
            }
            req.login(user, { session: false }, (error) => {
                if (error) {
                    res.send(error);
                }
                let token = generateJWTToken(user.toJSON());
                return res.json({user, token});
            });
        })(req, res);
    });
}