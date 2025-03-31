const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const cors = require('cors');
app.use(cors());
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');
const { check, validationResult } = require('express-validator');
const uuid = require('uuid');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const mongoose = require('mongoose');
//mongoose.connect('mongodb://127.0.0.1:27017/movieDB');
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const Models = require('./models.js');
const { error } = require('console');

const Movies = Models.Movie;
const Users = Models.User;

  /**
   * @route GET /
   * @desc Welcome message
   * @access Public
   */
  app.get('/', (req,res) => {
    res.status(200).send('Welcome to my Circle of movies')
  });

  /**
   * @route GET /movies
   * @desc Get all movies
   * @access Protected (JWT)
   */
  app.get('/movies',
    passport.authenticate('jwt', { session: false }),
    async (req,res) => {
     await Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(error);
      res.status(500).send( "Error: " + error);
    })
  });
  
  /**
   * @route GET /movies/:Title
   * @desc Get a movie by title
   * @access Protected (JWT)
   */
  app.get('/movies/:Title' , 
    passport.authenticate('jwt', { session: false }),
    async(req,res) =>{
    await Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.status(201).json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send( "Error: " + err);
    })
  });
 

  /**
   * @route GET /genre/:name
   * @desc Get genre details by name
   * @access Protected (JWT)
   */
  app.get('/genre/:name', 
    passport.authenticate('jwt', { session: false }),
    async (req,res) => {
    await Movies.findOne({'Genre.Name': req.params.name})
      .then((movie) => {
        res.json(movie.Genre);
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send( 'Error: ' + error);
      });
   });

  /**
   * @route GET /director/:name
   * @desc Get director details by name
   * @access Protected (JWT)
   */
  app.get('/director/:name', 
    passport.authenticate('jwt', { session: false }),
    async(req,res) => {
    await Movies.findOne({ 'Director.Name': req.params.name})
    .then((movie) => {
        res.status(201).json(movie.Director)
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send( 'Error: ' + error);
      });
    });
      

  /**
   * @route POST /users
   * @desc Register a new user
   * @access Public
   */
  app.post('/users',
    [
      check('Username', 'Username is required').isLength({min: 5}),
      check('Username', 'Username only can contain letters and numbers.').isAlphanumeric(),
      check('Password', 'Password is required.').not().isEmpty(),
      check('Email', 'Email is not valid.').isEmail()
    ], async (req,res) => {
      let errors = validationResult(req);
      if (!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array()});
      }
     let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({ Username: req.body.Username})
    .then((user) => {
      if (user) {
       return res.status(400).send(req.body.Username + 'already exists');
      }else{
        Users
          .create({
           Username: req.body.Username,
           Password: hashedPassword,
           Email: req.body.Email,
           Birthday: req.body.Birthday
          })
          .then((user) => {res.status(201).json(user)})
      .catch((error) => {
        console.error(error);
        res.status(500).send ( 'Error: ' + error);
      })
    }
  })
   .catch((error) => {
    console.error(error);
    res.status(500).send('Error: ' + error);
   });
});


  /**
   * @route PUT /users/:Username
   * @desc Update user info
   * @access Protected (JWT)
   */
  app.put(
    '/users/:Username',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
      try {
        if (req.user.Username !== req.params.Username) {
          return res.status(403).send('Permission denied');
        }
        const { Username, Password, Email, Birthday } = req.body;
        const updateFields = {};
  
        if (Username) {
          if (Username.length < 5) {
            return res.status(400).send('Username must be at least 3 characters long');
          }
          updateFields.Username = Username;
        }
  
        if (Password) {
          if (Password.length < 6) {
            return res.status(400).send('Password must be at least 6 characters long');
          }
          let hashedPassword = Users.hashPassword(req.body.Password);
          updateFields.Password = hashedPassword;
        }
  
        if (Email) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(Email)) {
            return res.status(400).send('Invalid email format');
          }
          updateFields.Email = Email;
        }
  
        if (Birthday) {
          const birthdayRegex = /^\d{4}-\d{2}-\d{2}$/; // Format: YYYY-MM-DD
          if (!birthdayRegex.test(Birthday)) {
            return res.status(400).send('Invalid birthday format. Use YYYY-MM-DD');
          }
          updateFields.Birthday = Birthday;
        }
  
        if (Object.keys(updateFields).length === 0) {
          return res.status(400).send('No valid fields to update');
        }
  
        const updatedUser = await Users.findOneAndUpdate(
          { Username: req.params.Username },
          { $set: updateFields },
          { new: true }
        );
  
        if (!updatedUser) {
          return res.status(404).send('User not found');
        }
  
        res.json(updatedUser);
      } catch (error) {
        console.error(error);
        res.status(500).send('Error: ' + error);
      }
    }
  );
  
  /**
   * @route POST /users/:Username/movies/:movieID
   * @desc Add a movie to user's favorites
   * @access Protected (JWT)
   */
  app.post('/users/:Username/movies/:movieID' , passport.authenticate('jwt', {session: false}), async (req,res) => {
    if(req.user.Username !== req.params.Username){
      return res.status(400).send('Permission denied');
    }
    await Users.findOneAndUpdate({ Username: req.params.Username }, {
      $push:{ FavoriteMovies: req.params.movieID}
    },
    {new: true})
    .then((updatedUSer) => {
      res.json(updatedUSer);
    })
    .catch((error) =>{
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
  });

  /**
   * @route DELETE /users/:Username/movies/:movieID
   * @desc Remove a movie from user's favorites
   * @access Protected (JWT)
   */
  app.delete('/users/:Username/movies/:movieID' , passport.authenticate('jwt', {session: false}), async (req,res) => {
    if(req.user.Username !== req.params.Username){
      return res.status(400).send('Permission denied');
    }
    await Users.findOneAndUpdate({ Username: req.params.Username}, {$pull: { FavoriteMovies: req.params.movieID}
    }, {new: true})
    .then((updatedUSer) => {
      res.json(updatedUSer);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error)
    })
  });

  /**
   * @route DELETE /users/:Username
   * @desc Delete a user by username
   * @access Protected (JWT)
   */
  app.delete('/users/:Username' ,passport.authenticate('jwt', {session: false}), async (req,res) => {
    if(req.user.Username !== req.params.Username){
      return res.status(400).send('Permission denied');
    }
    await Users.findOneAndDelete({ Username: req.params.Username }).
    then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + 'was not found.');
      } else {
        res.status(200).send(req.params.Username + 'was deleted.');
      }
    })
    .catch((error) =>{
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
  });
  const port = process.env.PORT || 8080
  app.listen(port, '0.0.0.0' ,() => {
    console.log('Your app is listening on port ' + port);
  });