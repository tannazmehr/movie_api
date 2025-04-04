
/**
 * @file models.js
 * @description Defines the Mongoose schemas and models for Movies and Users, including password hashing and validation methods.
 */
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

/**
 * @typedef Genre
 * @property {string} Name - Name of the genre
 * @property {string} Description - Description of the genre
 */

/**
 * @typedef Director
 * @property {string} Name - Name of the director
 * @property {string} Biography - Biography of the director
 */

/**
 * @typedef Movie
 * @property {string} _id - Unique ID for the movie
 * @property {string} Title - Title of the movie
 * @property {string} Description - Description of the movie
 * @property {Genre} Genre - Genre information
 * @property {Director} Director - Director information
 * @property {Array<string>} Actors - List of actors
 * @property {string} ImagePath - URL/path to movie image
 * @property {boolean} Featured - Whether the movie is featured
 */
let movieSchema = mongoose.Schema({
    _id: {type: String, required: true},
    Title: {type: String, required: true},
    Description: {type: String , required: true},
    Genre: {
        Name: {type: String},
        Description: {type: String}
    },
    Director: {
        Name: {type: String},
        Biography: {type: String}
    },
    Actors: [String],
    ImagePath: String,
    Featured: Boolean
});

/**
 * @typedef User
 * @property {string} Username - Unique username
 * @property {string} Password - Hashed password
 * @property {string} Email - User's email
 * @property {Date} Birthday - User's birthday
 * @property {Array<string>} FavoriteMovies - List of favorite movie IDs
 */
let userSchema = mongoose.Schema({
    Username: {type: String, required: true},
    Password: {type: String, required: true},
    Email: {type: String, required: true},
    Birthday: Date,
    FavoriteMovies : [{type: mongoose.Schema.Types.String, ref: 'Movie'}]
});


/**
 * @function hashPassword
 * @description Hashes a plain text password using bcryptjs.
 * @param {string} password - The plain text password to hash
 * @returns {string} The hashed password
 */
userSchema.statics.hashPassword = (password) => {
    return bcryptjs.hashSync(password, 10);
};

/**
 * @function validatePassword
 * @description Compares a plain text password with the hashed password stored in the database.
 * @param {string} password - The plain text password to validate
 * @returns {boolean} True if the passwords match, false otherwise
 */
userSchema.methods.validatePassword = function(password) {
    return bcryptjs.compareSync(password, this.Password);
};

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

/**
 * @exports Movie - Mongoose model for Movie
 * @exports User - Mongoose model for User
 */
module.exports.Movie = Movie;
module.exports.User = User;