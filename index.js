const express = require('express'),
      morgan = require('morgan'),
      fs = require('fs'),
      path = require('path');

const app = express();

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

app.use(morgan('combined', {stream: accessLogStream}));

let topMovies = [
    {
      title: '1. The Shawshank Redemption',
      director: 'Frank Darabont'
    },
    {
      title: '2. The Intouchables',
      director: 'Olivier Nakache and Éric Toledano'
    },
    {
      title: '3. pulp Fiction',
      director: 'Quentin Tarantino'
    },
    {
      title: '4. Forrest Gump',
      director: 'Robert Zemeckis'
    },
    {
        title: '5. Fight Club',
        director: 'David Fincher'
    },
      {
        title: '6. Inception',
        director: 'Christopher Nolan'
      },
    
      {
        title: '7. Goodfellas',
        director: 'Martin Scorsese'
      },
      {
        title: '8. Interstellar',
        director: 'Christopher Nolan'
      },
      {
        title: '9. The Departed',
        director: 'Martin Scorsese'
      },
      {
        title: '10. Léon: The Professional',
        director: 'Luc Besson'
      },
      {
        title: '11. Inglourious Basterds',
        director: 'Quentin Tarantino'
      },
      {
        title: '12. Good Will Hunting',
        director: 'Gus Van Sant'
      },
      {
        title: '13. Reservoir Dogs',
        director: 'Quentin Tarantino'
      }
  ];

  //app.use('/documentation', express.static(path.join(__dirname, 'public')));
  
  app.get('/documentation', (req, res) => {
    res.sendFile(__dirname + '/public/Documentation.html')
  });


  app.get('/', (req, res) => {
    res.send('Welcome to my Movie Journal!')
  });
  app.get('/movies', (req, res) => {
    res.json(topMovies);
  });
  
  app.use((err, req, res, next) =>{
    console.log(err.stack);
    res.status(500).send('You can not reach the website at the moment');
  });

  app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
  });