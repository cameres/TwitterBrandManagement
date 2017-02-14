"use strict"

var express = require('express');
var path = require('path');
var Twit = require('twit');
var request = require('request');
// var routes = require('./routes/index');

// maintain a dictionary of imporessions for a flight
// hard coded, because chart library is difficult
var impressions = {
  '@AlaskaAir': {
    number_of_tweets: 0,
    avg_sentiment_impression: 0
  },
  '@AmericanAir': {
    number_of_tweets: 0,
    avg_sentiment_impression: 0
  },
  '@Allegiant': {
    number_of_tweets: 0,
    avg_sentiment_impression: 0
  },
  '@Delta': {
    number_of_tweets: 0,
    avg_sentiment_impression: 0
  },
  '@FlyFrontier': {
    number_of_tweets: 0,
    avg_sentiment_impression: 0
  },
  '@HawaiianAir': {
    number_of_tweets: 0,
    avg_sentiment_impression: 0
  },
  '@JetBlue': {
    number_of_tweets: 0,
    avg_sentiment_impression: 0
  },
  '@Southwest': {
    number_of_tweets: 0,
    avg_sentiment_impression: 0
  },
  '@SpiritAirlines': {
    number_of_tweets: 0,
    avg_sentiment_impression: 0
  },
  '@SunCountryAir': {
    number_of_tweets: 0,
    avg_sentiment_impression: 0
  },
  '@VirginAmerica': {
    number_of_tweets: 0,
    avg_sentiment_impression: 0
  },
  '@United': {
    number_of_tweets: 0,
    avg_sentiment_impression: 0
  }
}


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

var port = 3000;
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
var credentials = require('./twitter_credentials.json')
// create twitter variable
var T = new Twit(credentials);

var airlines = [
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
  '@United'
];

// all major us airlines
var stream = T.stream('statuses/filter', { track: airlines });

// require airport codes/locations
var airports = require('./airports.json')

// async function called when a filtered tweet comes in
stream.on('tweet', function(tweet) {
  console.log(tweet);
  // call the parse-flask api to get the sentiment of the tweet
  request.post('http://localhost:5000/parse', {form:{text: tweet['text']}}, function(error, response, body){
    debugger;
    var parsed = JSON.parse(response['body']);

    // retrieve both code text and sentiment
    var sentiment = JSON.parse(parsed['sentiment']);

    var sentiment_pos = sentiment['pos'];
    var sentiment_neg = sentiment['neg'];


    var follower_count = tweet['user']['followers_count']

    var codes = parsed['codes'];

    // initialize locations as coordinate list
    var locations = []

    // check airport code candidates w/ airports data
    // add coordinates if a match
    if(codes){
      for(var i in codes){
      var code = codes[i]
      var coords = airports[code]
      if(coords){
        locations.push(coords)
        }
      }
    }

    // add locations and sentiment to existing object
    tweet['airports'] = locations;
    tweet['sentiment'] = sentiment;

    // 'tweet' the tweet to the browsers
    if(sentiment_pos > 0.10 || sentiment_neg > 0.10){
      var sentiment_final = (sentiment_pos > sentiment_neg) ? sentiment_pos : -sentiment_neg;
      var sentiment_impression = sentiment_final * follower_count;
      airlines.forEach(function(airline){
        // which company was tweeted?
        if(tweet['text'].toLowerCase().indexOf(airline.toLowerCase()) != -1){
          // update the dictionary
          var prev_score = impressions[airline]['avg_sentiment_impression'];
          var prev_tweets = impressions[airline]['number_of_tweets'];
          impressions[airline]['avg_sentiment_impression'] = (prev_score * prev_tweets + sentiment_impression)/(prev_tweets + 1);
          impressions[airline]['number_of_tweets'] = impressions[airline]['number_of_tweets'] + 1;
        }
      });
      io.emit('impression', impressions);
      io.emit('tweet', tweet);
    }
  })
})

http.listen(port);
