const express = require('express'),
      bodyParser = require('body-parser'),
      uuid = require('uuid');

const app = express();
app.use(bodyParser.json());


let topMovies = [
    {
      "Title": "The Shawshank Redemption",
      "Description": "A banker convicted of uxoricide forms a friendship over a quarter century with a hardened convict, while maintaining his innocence and trying to remain hopeful through simple compassion.",
      "Director":
      { "Name" : "Frank Darabont",
        "Biography" : "Frank Árpád Darabont (born Ferenc Árpád Darabont, January 28, 1959)[2] is an American screenwriter, director and producer.He has been nominated for three Academy Awards and a Golden Globe Award."
      },
      "Genre" : {
        "Name" : "Drama",
        "Description" : "In film and television, drama is a category or genre of narrative fiction intended to be more serious than humorous in tone."
      }
    },
    
    {
      "Title": "Pulp Fiction",
      "Description": "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
      "Director": {
        "Name": "Quentin Tarantino",
        "Biography" : "Quentin Jerome Tarantino ( born March 27, 1963) is an American filmmaker, actor, and author. His films are characterized by stylized violence, extended dialogue often featuring much profanity, and references to popular culture."
      },
      "Genre" : {
        "Name" : "Thriller",
        "Description" : "Thriller film, also known as suspense film or suspense thriller, is a broad film genre that involves excitement and suspense in the audience."
      }
    },
    {
      "Title": " Forrest Gump",
      "Description": "The history of the United States from the 1950s to the '70s unfolds from the perspective of an Alabama man with an IQ of 75, who yearns to be reunited with his childhood sweetheart.",
      "Director": {
        "Name": "Robert Zemeckis",
        "Biography" : "Robert Lee Zemeckis (born May 14, 1952)[3] is an American filmmaker known for directing and producing a range of successful and influential movies, often blending cutting-edge visual effects with storytelling."
      },
      "Genre" : {
        "Name" : "Romance",
        "Description" : "Romance films involve romantic love stories recorded in visual media for broadcast in theatres or on television that focus on passion, emotion, and the affectionate romantic involvement of the main characters. Typically their journey through dating, courtship or marriage is featured."
      }

    },
    {
        "Title": "Fight Club",
        "Description": "An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into much more.",
        "Director": {
          "Name": "David Fincher",
          "Biography" : "David Andrew Leo Fincher (born August 28, 1962) is an American film director. His films, of which most are psychological thrillers, have collectively grossed over $2.1 billion worldwide and have received numerous accolades, including three nominations for the Academy Awards for Best Director."
        },
        "Genre" : {
          "Name" : "Drama",
          "Description" : "In  film and television, drama is a category or genre of narrative fiction intended to be more serious than humorous in tone."
        }
      },
      {
        "Title": "Inception",
        "Description": "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.",
        "Director": {
          "Name": "Christopher Nolan",
          "Biography" : "Sir Christopher Edward Nolan (born 30 July 1970) is a British and American filmmaker. Known for his Hollywood blockbusters with complex storytelling, he is considered a leading filmmaker of the 21st century."
        },
        "Genre" : {
          "Name" : "Action",
          "Description" : "The action film is a film genre that predominantly features chase sequences, fights, shootouts, explosions, and stunt work."
        },
      }
  ];

let users =[
  {
    id : 1,
    name : 'Tannaz',
    favoriteMovie : []
  },
  {
    id : 2,
    name : 'Wolfgang',
    favoriteMovie : []
  }
]  

  //List of all movies (READ)
  app.get('/movies', (req,res)=>{
    res.status(200).json(topMovies);
  });
  
  //Return Data about a movie by title (READ)
  app.get('/movies/:title' , (req,res) => {
    const { title } = req.params
    const movie = topMovies.find( movie => movie.Title === title);

    if (movie) {
      res.status(200).json(movie);
    }else{
      res.status(400).send("The movie is not found.")
    }
  });

  //Return data about a genre by name (READ)
  app.get('/movies/genre/:genreName', (req,res) => {
    const { genreName } = req.params;
    const genre = topMovies.find( movie => movie.Genre.Name === genreName).Genre

    if (genre) {
      res.status(200).json(genre);
    }else{
      res.status(400).send("The genre is not found.")
    }
  });

  //Return data about a director by name (READ)
  app.get('/movies/director/:directorName', (req,res) => {
    const { directorName } = req.params;
    const director = topMovies.find( movie => movie.Director.Name === directorName).Director

    if (director) {
      res.status(200).json(director);
    }else{
      res.status(400).send("The director is not found.")
    }
  });

  //Create a user
  app.post('/users', (req,res) => {
    const newUser = req.body;
    if (newUser.name){
      newUser.id = uuid.v4();
      users.push(newUser);
      res.status(201).json(newUser)
    }else{
      res.status(400).send('User should have a name.')
    }
  });

  //Update a user
  app.put('/users/:id', (req,res) => {
    const { id } = req.params;
    const updatedUser = req.body;
    let user = users.find( user => user.id == id);

    if (user) {
      user.name = updatedUser.name
      res.status(200).json(user)
    }else{
      res.status(400).send("There is no user with that id.")
    }
  })
  
  //Add a movie to favorites
  app.post('/users/:id/:movieTitle' , (req,res) => {
    const { id , movieTitle } = req.params;
    let user = users.find( user => user.id == id);

    if (user) {
      user.favoriteMovie.push(movieTitle)
      res.status(200).send( movieTitle + " added successfully.")
    }else {
      res.status(400).send("There is no user with that id.")
     }
  })

  //Delete a movie from favorites
  app.delete('/users/:id/:movieTitle' , (req,res) => {
    const { id , movieTitle } = req.params;
    let user = users.find( user => user.id == id);

    if (user) {
      user.favoriteMovie = user.favoriteMovie.filter( title => title !== movieTitle)
      res.status(200).send( movieTitle + " removed successfully.")
    }else {
      res.status(400).send("There is no user with that id.")
     }
  });

  //Delete a user 
  app.delete('/users/:id' , (req,res) => {
    const { id } = req.params;
    let user = users.find( user => user.id == id);

    if (user) {
      user = users.filter( user => user.id != id)
      res.status(200).send( "user "+ id + " removed successfully.")
    }else {
      res.status(400).send("There is no user with that id.")
     }
  });


  app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
  });