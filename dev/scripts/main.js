
const app = {};

app.apiKey = '2e6e8448ce627a7c4abfd88090371fd4';

app.latLong = [];


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


//get restaurant ID if geolocation is NOT used
//if geolocation is used skip this step
app.getCityId = function (){
  $.ajax({
        url: 'https://developers.zomato.com/api/v2.1/cities',
        method: 'GET',
        dataType: 'json',
        headers: {
            'user-key': app.apiKey
        }
      })
};


//once you have City ID, call AJAX request for cuisines
app.getRestaurantCuisine = function (){
  $.ajax({
        url: 'https://developers.zomato.com/api/v2.1/cuisines',
        method: 'GET',
        dataType: 'json',
        headers: {
            'user-key': app.apiKey
        }
      })
};

//use cuisine in search endpoint
app.getRefinedRestaurants = function (){
  $.ajax({
        url: 'https://developers.zomato.com/api/v2.1/search',
        method: 'GET',
        dataType: 'json',
        headers: {
            'user-key': app.apiKey
        }
      })
};






app.events = function(){
    $(".locator").on("click", function(){
    app.getGeolocation();
    });
};



app.init = function (){
    app.events();

};

$(function(){
    app.init();
});

