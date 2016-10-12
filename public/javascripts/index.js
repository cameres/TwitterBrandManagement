"use strict"

var socket = io.connect('http://localhost:3000');
socket.on('tweet', function (data) {
  // get the data from the server
  var tweet_id = data['id_str'];
  var tweet_text = data['text']
  var user_name = data['user']['screen_name'];
  var sentiment = data['sentiment'];
  var coordinates = data['airports'];
  // link is required to successfully embed on page
  var link = 'https://twitter.com/' + user_name + '/status/' + tweet_id;

  // embed tweets in the correct column
  if(sentiment['pos'] > sentiment['neg']){
    $('#left').prepend('<div class="tweet" id="'+tweet_id+'"><blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">'+
    '<a href="https://twitter.com/' + user_name + '/status/' + tweet_id + '"></a>'+
    '</blockquote></div>');
  } else {
    $('#right').prepend('<div class="tweet" id="'+tweet_id+'"><blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">'+
    '<a href="https://twitter.com/' + user_name + '/status/' + tweet_id + '"></a>' + '</blockquote></div>');
  }

  // if tweet has coordinates, add marker to map
  // determine color by sentiment scores
  if(coordinates.length > 0){
    var c = 'green';
    if(sentiment['pos'] < sentiment['neg']){
      c = 'red';
    }

    // add circle for each airport
    for(var i in coordinates){
      var circle = L.circle(coordinates[i], {
        color: c,
        fillColor: c,
        fillOpacity: 0.5,
        radius: 500
        }).addTo(mymap);
      }
    }
  // update embedded tweets on page
  twttr.widgets.load()
});


socket.on('remove_tweet', function(data){
  // remove the tweet with this id
  $('#' + data.id).fadeOut(1000, function() { $(this).remove(); });
});

// creating the map for the browser
var center = [39.8282, -98.5795];

var mymap = L.map('mapid').setView(center, 4);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
	maxZoom: 15,
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
		'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
		'Imagery © <a href="http://mapbox.com">Mapbox</a>',
	id: 'mapbox.streets'
}).addTo(mymap);

function initialData(){
  // generate an array of random data

  var data = [],
  time = (new Date()).getTime(),
  i;

  for (i = -999; i <= 0; i += 1) {
    data.push([time + i * 1000,0]);
  }
  return data;
}

Highcharts.setOptions({
  global: {
    useUTC: false
  }
});

// Create the chart
$('#container').highcharts('StockChart', {
  chart: {
    events: {
      load: function () {
        var chart = this;
        function update_chart(chart, data){
          var x = (new Date()).getTime()

          var i = 0;

          for (var property in data) {
            if(data.hasOwnProperty(property)) {
              var series = chart.series[i];
              var y = data[property]['avg_sentiment_impression'];
              series.addPoint([x, y]);
              // increment index
              i = i + 1;
            }
          }
        }

        // bind the chart, so callback has reference
        socket.on('impression', update_chart.bind(null, this))
      }
    }
  },

  rangeSelector: {
    buttons: [{
      count: 1,
      type: 'minute',
      text: '1M'
    }, {
      count: 5,
      type: 'minute',
      text: '5M'
    }, {
      type: 'all',
      text: 'All'
    }],
    inputEnabled: false,
    selected: 0
  },

  title: {
    text: 'Average Sentiment Impressions'
  },

  exporting: {
    enabled: false
  },
  series:[
  {
    name: '@AlaskaAir',
    data: initialData()
  },
  {
    name: '@AmericanAir',
    data: initialData()
  },
  {
    name: '@Allegiant',
    data: initialData()
  },
  {
    name: '@Delta',
    data: initialData()
  },
  {
    name: '@FlyFrontier',
    data: initialData()
  },
  {
    name: '@HawaiianAir',
    data: initialData()
  },
  {
    name: '@JetBlue',
    data: initialData()
  },
  {
    name: '@Southwest',
    data: initialData()
  },
  {
    name: '@SpiritAirlines',
    data: initialData()
  },
  {
    name: '@SunCountryAir',
    data: initialData()
  },
  {
    name: '@VirginAmerica',
    data: initialData()
  },
  {
    name: '@United',
    data: initialData()
  }]
});

// middleware for detecting a clicked tweet
$(document).on('click', '.tweet' , function() {
  // get the id of the tweet
  socket.emit('tweet_clicked', {id: this.id});
});
