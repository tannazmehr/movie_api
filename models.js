const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

let movieSchema = mongoose.Schema({
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

let userSchema = mongoose.Schema({
    Username: {type: String, required: true},
    Password: {type: String, required: true},
    Email: {type: String, required: true},
    Birthday: Date,
    FavoriteMovies : [{type: mongoose.Schema.Types.String, ref: 'Movie'}]
});

userSchema.statics.hashPassword = (password) => {
    return bcryptjs.hashSync(password, 10);
};
userSchema.methods.validatePassword = function(password) {
    return bcryptjs.compareSync(password, this.Password);
};

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;