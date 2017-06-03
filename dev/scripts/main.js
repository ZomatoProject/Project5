
const app = {};

app.apiKey = '2e6e8448ce627a7c4abfd88090371fd4';

app.latLong = [];

//inputOfCity stores the value of the typed city in the form
app.inputOfCity = ''; 
app.possibleCities = [];
app.possibleCitiesId = [];
app.unfilteredCuisinesList = [];
app.cuisinesList = [];


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
          app.possibleCities.push(cityNameArray[i].name);
          // console.log(cityNameArray);
          app.possibleCitiesId.push(cityNameArray[i].id);
        }
        // console.log(possibleCitiesId);
          //append cities to page
        let cityOptions = '';
        for (var i = 0; i < app.possibleCities.length; i++){
          cityOptions += `<option value="${app.possibleCities[i]}" data-id="${app.possibleCitiesId[i]}">${app.possibleCities[i]}</option>`;
        }
        $('#items').append('<option value="choice">Choose City</option>' + cityOptions);
        //on click of selected city option from dropdown, get selected city id
        //store selected ID into variable and pass it as argument into next function
        $('#items').on('change', function(){
          if ($(this).find('option:selected').val() === "choice"){
            // console.log("Choose a city!");
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
  $('#citySubmit').on('click', function(e){
    e.preventDefault();
    let inputOfCity = $('#cityInput').val();
    //pass in city input to cities AJAX request
    app.getCityByName(inputOfCity);
    $('#items').find('option').remove();

    let inputOfCuisine = $('#')
    //reset dropdown of cuisines to zero if new location is selected
    $('#cuisine').find('option').remove();
    //resets array of possibleCities to zero
    app.possibleCities.length = 0;
    app.possibleCitiesId.length = 0;
  })  
};




// looping through the restaurant list array (based on user location) to get the cuisine types found in the restaurant objects


app.getCuisineType = function(restaurantsObject) {
  for (var index in restaurantsObject) {
    let eachRestaurant = restaurantsObject[index].restaurant;
    // "split" makes the cuisine value an array and splits it, removing anything after the comma
    eachRestaurant.cuisines = eachRestaurant.cuisines.split(",")[0];
    // console.log(eachRestaurant);
    let eachCuisineType = eachRestaurant.cuisines;
    app.unfilteredCuisinesList.push(eachCuisineType);
  }
  //delete duplicates in array using onlyUnique function below

  app.uniqueCuisineList = app.unfilteredCuisinesList.filter(function (value, index, self) { 
    return self.indexOf(value) === index;
  })
  
  // then return the cuisine type selected.val() into the search AJAX request
  let cuisineOptions = '';
  for (var i = 0; i < app.uniqueCuisineList.length; i++){

    cuisineOptions += `<option value="${app.uniqueCuisineList[i]}">${app.uniqueCuisineList[i]}</option>`;
  };

  // display cuisineOptions and default choose option in the drop down
  $('#cuisine').append('<option value="choice">Choose Cuisine</option>' + cuisineOptions);


  $('.food').on('change', function(){
    if ($(this).find('option:selected').val() === "choice"){
      alert("Choose a Cuisine!");
    } else {
    app.cuisineSelected = $(this).val(); 
    // console.log(app.cuisineSelected);

    app.cuisineMatch(restaurantsObject);

    }
  }
)}; 

//pass city ID from above and dynamically insert it into new AJAX request
//searches for city by ID and returns radius, count and cuisines nearby
app.searchForCity = function (cityInformation){
  //.constructor is checking for the type of data of cityInformation (whether it's an array or an integer)
  // console.log('searcForCity cityInformation is set to ', cityInformation);
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
          radius: 100000,
          count: 1000,
          sort: 'rating',
          order: 'desc'
          }
        }).then(function(res){
          // app.restaurants = res.restaurants;
          let rest = res.restaurants;
          app.getCuisineType(rest);
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
          radius: 100000,
          count: 1000,
          sort: 'rating',
          order: 'desc'
          }
      })
      .then(function(res){
        // app.restaurants = res.restaurants;
        let rest = res.restaurants;
        app.getCuisineType(rest);
        app.getCuisineType(restaurantsObject);
        console.log(app.restaurants);
        console.log(res);
      })
  }
};

app.restaurantsByCuisine = [];

app.cuisineMatch = function (restaurantRes){
  restaurantRes.forEach(function(res){
    if (res.restaurant.cuisines === app.cuisineSelected) {
      app.restaurantsByCuisine.push(res.restaurant)
    }
  })
  //new array with top three results
app.finalThree = app.restaurantsByCuisine.slice(0, 3);
  console.log(app.finalThree);

// create markers for final restaurants 
//   app.finalThree.forEach(function(finalRest){
//   var restMarker = L.marker([finalRest.geometry.location.lat, park.geometry.location.lng], {icon: podApp.leafIcon}, {title: park.name}).bindPopup(park.name);
// });




var marker = L.marker([park.geometry.location.lat, park.geometry.location.lng], {icon: podApp.leafIcon}, {title: park.name}).bindPopup(park.name);
        // lat: park.geometry.location.lat,
        // lng: park.geometry.location.lng
        podApp.parksArray.push(marker);
        marker.addTo(podApp.myMap);

};

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

