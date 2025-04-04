/**
 * @file passport.js
 * @description This file defines Passport strategies for user authentication using LocalStrategy and JWT.
 */
const passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    Models = require('./models'),
    passportJWT = require('passport-jwt');

    let Users = Models.User,
        JWTStrategy = passportJWT.Strategy,
        ExtractJWT = passportJWT.ExtractJwt;

    /**
     * @description Passport Local Strategy for authenticating users using a username and password.
     * This strategy is typically used during login.
     *
     * @param {string} usernameField - The field containing the username (from request body)
     * @param {string} passwordField - The field containing the password (from request body)
     * @param {Function} callback - Callback to handle user authentication result
     */
    passport.use(
        new LocalStrategy(
            {
                usernameField: 'Username',
                passwordField: 'Password',
            },
            async (username, password, callback) => {
                console.log( `${username} ${password}`);
                await Users.findOne({ Username: username})
                .then((user) => {
                    if (!user) {
                        console.log('incorrect username');
                        return callback(null, false, {
                            message: 'Incorrect username or password',
                        });
                    }
                    if (!user.validatePassword(password)) {
                        console.log('incorrect password');
                        return callback(null, false, { message: 'Incorrect password'});
                    }
                    console.log('finished');
                    return callback (null, user);
                })
                .catch ((error) => {
                    if (error) {
                    console.error(error);
                    return callback(error);
                    }
                })
            }
        )
    );

    /**
     * @description Passport JWT Strategy for authenticating users based on a JWT token.
     * This strategy is used for protected routes where a valid token must be provided.
     *
     * @param {Function} jwtFromRequest - Function to extract JWT token from request
     * @param {string} secretOrKey - Secret key used to verify the JWT
     * @param {Function} callback - Callback to handle user retrieval and authentication result
     */
    passport.use(new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: 'your_jwt_secret'
    }, async (jwtPayload, callback) => {
        return await Users.findById(jwtPayload._id)
        .then((user) => {
            return callback(null, user);
        })
        .catch((error) => {
            return callback(error)
        });
    }));