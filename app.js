var express = require('express');
var path = require('path');
var Twit = require('twit');
var request = require('request');
// var routes = require('./routes/index');

// maintain a dictionary of imporessions for a flight
var impressions = {}


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
var stream = T.stream('statuses/filter', { track:airlines });

// async function called when a filtered tweet comes in
stream.on('tweet', function(tweet) {

  // call the sentiment-flask api to get the sentiment of the tweet
  request.post('http://localhost:5000/sentiment', {form:{text: tweet['text']}}, function(error, response, body){
    // parse the json response from the server
    var sentiment = JSON.parse(response['body']);
    // add sentiment to the object
    tweet['sentiment'] = sentiment;

    var sentiment_pos = sentiment['pos'];
    var sentiment_neg = sentiment['neg'];

    // console.log(tweet);

    var follower_count = tweet['user']['followers_count']

    // 'tweet' the tweet to the browsers
    // only if the tweet was significant
    if(sentiment_pos > 0.10 || sentiment_neg > 0.10){
      sentiment_final = (sentiment_pos > sentiment_neg) ? sentiment_pos : -sentiment_neg;
      sentiment_impression = sentiment_final * follower_count;
      // console.log('sentiment_impression', sentiment_impression)
      airlines.forEach(function(airline){
        // which company was tweeted?
        if(tweet['text'].indexOf(airline) != -1){
          // update the dictionary
          if(impressions.hasOwnProperty(airline)){
            // if the airline has tweets already
            prev_score = impressions[airline]['avg_sentiment_impression'];
            prev_tweets = impressions[airline]['number_of_tweets'];
            impressions[airline]['avg_sentiment_impression'] = (prev_score * prev_tweets + sentiment_impression)/(prev_tweets + 1);
            impressions[airline]['number_of_tweets'] = impressions[airline]['number_of_tweets'] + 1;
          } else {
            impressions[airline] = {
              number_of_tweets: 1,
              avg_sentiment_impression: sentiment_impression
            }
          }
        }
      });
      io.emit('tweet', tweet);
      io.emit('update_impressions', impressions);
    }
  })
})

http.listen(port);
