var express = require('express');
var path = require('path');
var Twit = require('twit');
var request = require('request');
// var routes = require('./routes/index');

// maintain a dictionary of the + and - imporessions for a flight
// var impressions = {
//   // ie:
//   "@delta": {
//     "+" : 100,
//     "-" : 100
//   }
// }


var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
  res.render('index', { title: 'Twitter Sentiment Analysis' });
})

app.get('/about', function(req, res){
  res.render('about', { title: 'About' });
})

// app.use('/', routes);
port = 3000;
app.set('port', port);

// create socket.io connections w/ server
var http = require('http').Server(app);
var io = require('socket.io')(http);


io.on('connection', function(socket){
  socket.on('tweet_clicked', function(data) {
    // if a tweet been clicked
    // tell all other browsers
    // to remove the tweet from
    io.emit('remove_tweet', data);
  });
});

// must have credentials for api
credentials = require('./twitter_credentials.json')
// create twitter variable
var T = new Twit(credentials);


// all major us airlines
var stream = T.stream('statuses/filter', { track:[
  '@AlaskaAir',
  '@AmericanAir',
  '@Allegiant',
  '@Delta',
  '@FlyFrontier',
  '@HawaiianAir',
  '@JetBlue',
  '@Southwest',
  '@SpiritAirlines',
  '@SunCountryAir',
  '@VirginAmerica',
  '@United']
})

// require airport codes/locations
var airports = require('./airports.json')

// async function called when a filtered tweet comes in
stream.on('tweet', function(tweet) {

  // call the parse-flask api to get the sentiment of the tweet
  request.post('http://localhost:5000/parse', {form:{text: tweet['text']}}, function(error, response, body){
    // parse the json response from the server
    var parsed = JSON.parse(response['body']);

    // retrieve both code text and sentiment
    var sentiment = JSON.parse(parsed['sentiment']);
    var codes = parsed['codes'];


    // initialize locations as coordinate list
    var locations = []

    // check airport code candidates w/ airports data
    // add coords if a match
    if(codes){
        for(i in codes){
        code = codes[i]
        var coords = airports[code]
        if(coords){
            locations.push(coords)
            }
        }
    }

    // add locations and sentiment to existing object
    tweet['airports'] = locations
    tweet['sentiment'] = sentiment;
    console.log(tweet['airports'])

    // 'tweet' the tweet to the browsers
    // only if the tweet was significant
    if(sentiment['pos'] > 0.10 || sentiment['neg'] > 0.10){
      io.emit('tweet', tweet);
    }
  })
})

http.listen(port);
