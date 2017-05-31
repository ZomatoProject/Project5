
const app = {};

app.apiKey = '2e6e8448ce627a7c4abfd88090371fd4';

app.latLong = [];

app.inputOfCity = ''; 

//ask user for geolocation
app.getGeolocation = function(){
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(success, error, options);
        // Add jQuery for loading icon/overlay
    } else {
        alert('Your browser does not support geolocation. Please enter your city manually.')
    }
    var options = {
    // enableHighAccuracy = should the device take extra time or power to return a really accurate result, or should it give you the quick (but less accurate) answer?  
    enableHighAccuracy: false, 
    // timeout = how long does the device have, in milliseconds to return a result?
    timeout: 5000,  
    // maximumAge = maximum age for a possible previously-cached position. 0 = must return the current position, not a prior cached position
    maximumAge: 0 
    };
    function success(pos){
        var latitude = pos.coords.latitude;
        var longitude = pos.coords.longitude;
        // Push lat and long into an array (Leaftlet map requires array)
        app.latLong = [latitude, longitude];
        console.log(latLong);
        // Add jQuery for hiding loading icon/overlay
    
        // Pass user coordinates to Leaflet to render map

        // Make a marker for user location and add to marker layer
        
        // Bring in Zomato results for top 3 restos

        // Add top three restos to DOM

    }
    function error(err){
        if (err.code == 0) {
            // Unknown error
            alert('Unknown error');
        }
        if (err.code == 1) {
            // Access denied by user
            alert('Your settings do not allow Geolocation. Please manually enter your address. Or reset location settings.');
        }
        if (err.code == 2) {
            // Position unavailable
            alert('Position unavailable');
        }
        if (err.code == 3) {
            // Timed out
            alert('Timed out');
        }
    }  
};

//store city Input on click of find and update each city choice
app.updateCity = function () {
  $('#form').on('submit', function(e){
    e.preventDefault();
    inputOfCity = $('#cityInput').val();
    //pass in city input to cities AJAX request
    app.getCityByName(inputOfCity);
  })  
};

//get restaurant ID if geolocation is NOT used
//if geolocation is used skip this step
app.getCityByName = function (name){
  //store updated city into newCity var
  return $.ajax({
        url: 'https://developers.zomato.com/api/v2.1/cities',
        method: 'GET',
        dataType: 'json',
        headers: {
            'user-key': app.apiKey
        }, 
        q: name
      })
      .then(function(cityMatch){
      console.log(cityMatch);
    })
  }




// //searches for city by ID and returns radius, count and cuisines nearby
// app.searchForCity = function (cityInformation){
//   if (cityInformation.constructor === Array) {
//     return $.ajax({
//       ...
//     })
//   } else {

//   }
//  return $.ajax({
//         url: 'https://developers.zomato.com/api/v2.1/search',
//         method: 'GET',
//         dataType: 'json',
//         headers: {
//             'user-key': app.apiKey
//         },
//         entity_type: 'city',
//         entity_id: ,
//         radius: 1000,
//         count: 20,
//       })
// };





app.events = function(){
    $(".locator").on("click", function(){
    app.getGeolocation();
    });
};


app.init = function (){
    app.events();
    app.updateCity();
};

$(function(){
    app.init();
});

