const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
mongoose.connect(process.env.CONNECTION_URI, {useNewUrlParser: true, useUndefiedTopology: true});
const Models = require('./models.js');
const { error } = require('console');

const Movies = Models.Movie;
const Users = Models.User;

  app.get('/', (req,res) => {
    res.status(200).send('Welcome to my Circle of movies')
  });
  //List of all movies (READ)-
  app.get('/movies', passport.authenticate('jwt', {session: false}), async (req,res) => {
     await Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(error);
      res.status(500).send( "Error: " + error);
    })
  });

  //List of all users (READ)--
  /*app.get('/users', async (req,res) => {
    await Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send( 'Error: ' + error);
      });
   });*/
  
  //Return Data about a movie by title (READ)-
  app.get('/movies/:Title' ,passport.authenticate('jwt', {session: false}), async(req,res) =>{
    await Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.status(201).json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send( "Error: " + err);
    })
  });
 

  //Return data about a genre by name (READ)
  app.get('/genre/:name', passport.authenticate('jwt', {session: false}), async (req,res) => {
    await Movies.findOne({'Genre.Name': req.params.name})
      .then((movie) => {
        res.json(movie.Genre);
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send( 'Error: ' + error);
      });
   });

  //Return data about a director by name (READ)
  app.get('/director/:name', passport.authenticate('jwt', {session: false}), async(req,res) => {
    await Movies.findOne({ 'Director.Name': req.params.name})
    .then((movie) => {
        res.status(201).json(movie.Director)
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send( 'Error: ' + error);
      });
    });
      

  //Create a user-
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

  //Update a user-
  app.put('/users/:Username', passport.authenticate('jwt', { session: false}), async (req,res) => {
    if(req.user.Username !== req.params.Username){
      return res.status(400).send('Permission denied');
    }
    await Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
      {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }
    },
    {new: true})
    .then((updatedUSer) => {
    res.json(updatedUSer);
    })
    .catch((error) =>{ 
      console.error(error);
      res.status(500).send('Error: ' + error);
    })
  });
  
  //Add a movie to favorites-
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

  //Delete a movie from favorites-
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

  //Delete a user -
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
