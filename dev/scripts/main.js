
const app = {};

app.apiKey = '2e6e8448ce627a7c4abfd88090371fd4';

app.latLong = [];

//inputOfCity stores the value of the typed city in the form
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
        var latitude = Math.round(pos.coords.latitude * 100) / 100;
        var longitude = Math.round(pos.coords.longitude * 100) / 100;
        // Push lat and long into an array (Leaftlet map requires array)
        app.latLong = [latitude, longitude];
        // Pass user coordinates to leaflet to render map
        app.myMap.panTo(app.latLong); 
        // make a marker for user location and add to marker layer
        app.marker = L.marker(app.latLong).addTo(app.myMap);
        // Passing app.latLong to the searchForCity function
        app.searchForCity(app.latLong);
        app.getCuisineByCity(app.latLong);
        
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

// create Leaflet map
app.myMap = L.map("mapContainer", {
  center: [43.6482035, -79.397869],
  zoom: 13,
  scrollWheelZoom: false
});

// add tile layers to map
L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZXN0ZWxhdGhvbXNvbiIsImEiOiJjajM0djdidnIwMGF4MzJxdTZjOW92MGozIn0.XpuJtCuIx85zUn6Eci0b0w', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
}).addTo(app.myMap);





//create array to store cities returned from getCityByName AJAX request
const possibleCities = [];
const possibleCitiesId = [];

//get restaurant ID if geolocation is NOT used
//if geolocation is used skip this step
app.getCityByName = function (name){
  //store updated city into newCity var
  $.ajax({
        url: `https://developers.zomato.com/api/v2.1/cities`,
        method: 'GET',
        dataType: 'json',
        headers: {
            'user-key': app.apiKey
        },
        data: {
          q: name,
          count: 20
        }
      })
      .then(function(cityMatch){
        let cityNameArray = cityMatch.location_suggestions;
        for(var i = 0; i < cityNameArray.length; i++) {
          //push cities into array
          possibleCities.push(cityNameArray[i].name);
          // console.log(cityNameArray);
          possibleCitiesId.push(cityNameArray[i].id);
          }
        // console.log(possibleCitiesId);
          //append cities to page
        let cityOptions = '';
        for (var i = 0; i < possibleCities.length; i++){
          cityOptions += `<option value="${possibleCities[i]}" data-id="${possibleCitiesId[i]}">${possibleCities[i]}</option>`;
          }
          $('#items').append('<option value="choice">Choose city</option>' + cityOptions);
          //on click of selected city option from dropdown, get selected city id
          //store selected ID into variable and pass it as argument into next function
          $('select').on('change', function(){
            if ($(this).find('option:selected').val() === "choice"){
              console.log("Choose a city!");
            } else {
                let optionSelected = $(this).find('option:selected').val();
                let cityIdOfSelected = $(this).find('option:selected').data('id');

                app.searchForCity(cityIdOfSelected);//insert city ID variable in search for city

            }
          })
      })
}
//end of getCityByName AJAX request//

//store city Input on click of find and update each city choice
app.updateCity = function () {
  $('#form').on('submit', function(e){
    e.preventDefault();
    app.inputOfCity = $('#cityInput').val();
    //pass in city input to cities AJAX request
    app.getCityByName(app.inputOfCity);
    $('#items').find('option').remove();
    //resets array of possibleCities to zero
    possibleCities.length = 0;
    possibleCitiesId.length = 0;
  })  
};



//get all cuisine types and append to select drop down list



//pass city ID from above and dynamically insert it into new AJAX request
//searches for city by ID and returns radius, count and cuisines nearby
app.searchForCity = function (cityInformation){
  //.constructor is checking for the type of data of cityInformation (whether it's an array or an integer)
  if (cityInformation.constructor === Array) {
    // console.log(cityInformation);
    return $.ajax({
        url: 'https://developers.zomato.com/api/v2.1/search',
        method: 'GET',
        dataType: 'json',
        headers: {
            'user-key': app.apiKey
        },

        data: {
          entity_type: 'city',
          lat: `${cityInformation[0]}`,//lat depending on which order it's in array
          lon: `${cityInformation[1]}`,//lon depending on which order it's in array
          radius: 1000,
          count: 200,
          sort: 'rating',
          order: 'desc'
          }
        }).then(function(res){
          // app.restaurants = res.restaurants;
          app.getCuisineType(res.restaurants);
          // console.log(app.restaurants);
        })
  } else {
//if cityInformation is NOT an array (not lon/lat), insert the city ID 
 return $.ajax({
        url: 'https://developers.zomato.com/api/v2.1/search',
        method: 'GET',
        dataType: 'json',
        headers: {
            'user-key': app.apiKey
        },
        data: {
          entity_type: 'city',
          entity_id: `${cityInformation}`,
          radius: 1000,
          count: 200,
          sort: 'rating',
          order: 'desc'
          }
      }).then(function(res){
        // app.restaurants = res.restaurants;
        app.getCuisineType(res.restaurants);
        // console.log(app.restaurants);
        console.log(res);
      })
  }
};

let cuisinesList = [];

//loop over the Object containing arrays of each restaurant and extract the cuisines into an empty array
$.when(app.searchForCity)
//when the searchForCity AJAX request returns a restaurants Object
  .then(function(restaurantsObject){
    app.getCuisineType = function (restaurantsObject) {
      for (var index in restaurantsObject) {
        let eachRestaurant = restaurantsObject[index].restaurant;
        let eachCuisineType = eachRestaurant.cuisines;
        cuisinesList.push(eachCuisineType);
        }
        //delete duplicates in array using onlyUnique function below
        app.uniqueCuisineList = cuisinesList.filter( app.onlyUnique );
      } 
      //then return the cuisine type selected.val() into the search AJAX request
      // let CuisineDropdown = '';
      //   for (var i = 0; i < app.uniqueCuisineList.length; i++){
      //     cityOptions += `<option value="${}" data-id="${possibleCitiesId[i]}">${possibleCities[i]}</option>`;
      //     }
      //     $('#items').append('<option value="choice">Choose city</option>' + cityOptions);
      //display results on page 
});


//function that will remove duplicate values in an array
app.onlyUnique = function (value, index, self) { 
    return self.indexOf(value) === index;
}


//geolocation event handler
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

