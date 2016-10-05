var socket = io.connect('http://localhost:3000');
socket.on('tweet', function (data) {
  // get the data from the server
  var tweet_id = data['id_str'];
  var tweet_text = data['text']
  var user_name = data['user']['screen_name'];
  var sentiment = data['sentiment'];
  // link is required to successfully embed on page
  var link = 'https://twitter.com/' + user_name + '/status/' + tweet_id;

  // if sentiments pass a particular threshold
  // embed them on the page
  if(sentiment['pos'] > sentiment['neg']){
    $('#left').prepend('<div class="tweet" id="'+tweet_id+'"><blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">'+
      '<a href="https://twitter.com/' + user_name + '/status/' + tweet_id + '"></a>'+
    '</blockquote></div>');
  } else {
    $('#right').prepend('<div class="tweet" id="'+tweet_id+'"><blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">'+
      '<a href="https://twitter.com/' + user_name + '/status/' + tweet_id + '"></a>'+
    '</blockquote></div>');
  }
  // creating a random point
  function getRandomInRange(from, to, fixed) {
    return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
  }
  // the two different circles
  var circle = L.circle([51.508, -0.11], {
    color: 'red',
    fillColor: 'red',
    fillOpacity: 0.5,
    radius: 500
  });
  circle.on('mouseover', function (e) {
    this.openPopup();
  });
  circle.on('mouseout', function (e) {
    this.closePopup();
  });
  circle.bindPopup(data["text"]);
  circle.addTo(mymap)


  var circle = L.circle([51.508, -0.11], {
    color: 'green',
    fillColor: 'green',
    fillOpacity: 0.5,
    radius: 500
  }).addTo(mymap).bindPopup("I am a circle.");;

  // add the tweet
  if(data['place']){
    // var coordinates = data['place']['bounding_box']['coordinates'];
    // print(data['place']);
    // var lat = data['place']['bounding_box']['coordinates'][0][0][0];
    // var lng = data['place']['bounding_box']['coordinates'][0][0][1];
    // var coordinate = [lat, lng];
    //
    // L.marker(coordinate).addTo(mymap)
    //
    //
    // // var myLatLng = {lat: lat, lng: lng};
    // //
    // // // marker
    // //
    // // var marker = new google.maps.Marker({
    // //   position: myLatLng,
    // //   map: map,
    // //   title: user_name
    // // });
    // // L.marker([39.8282, -98.5795], {color: 'red'}).addTo(mymap).bindPopup("<b>Hello world!</b><br />I am a popup.").openPopup();
    // var polygon = L.polygon([ coordinates]).addTo(mymap);
  }

  // call widget load to format tweet
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

// middleware for detecting a clicked tweet
$(document).on('click', '.tweet' , function() {
  // get the id of the tweet
  socket.emit('tweet_clicked', {id: this.id});
});
