const app = {};

app.apiKey = "2e6e8448ce627a7c4abfd88090371fd4";

app.latLong = [];

//inputOfCity stores the value of the typed city in the form
app.inputOfCity = "";
app.possibleCities = [];
app.possibleCitiesId = [];
app.unfilteredCuisinesList = [];
app.cuisinesList = [];
app.restaurantsByCuisine = [];
app.restaurantMarkers = [];

//ask user for geolocation
app.getGeolocation = function() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(success, error, options);
    // Add jQuery for loading icon/overlay
  } else {
    alert(
      "Your browser does not support geolocation. Please enter your city manually."
    );
  }
  var options = {
    // enableHighAccuracy = should the device take extra time or power to return a really accurate result, or should it give you the quick (but less accurate) answer?
    enableHighAccuracy: false,
    // timeout = how long does the device have, in milliseconds to return a result?
    timeout: 5000,
    // maximumAge = maximum age for a possible previously-cached position. 0 = must return the current position, not a prior cached position
    maximumAge: 0
  };
  function success(pos) {
    var latitude = Math.round(pos.coords.latitude * 100) / 100;
    var longitude = Math.round(pos.coords.longitude * 100) / 100;
    // Push lat and long into an array (Leaftlet map requires array)
    app.latLong = [latitude, longitude];
    // Pass user coordinates to leaflet to render map
    app.myMap.panTo(app.latLong);
    // make a marker for user location and add to marker layer
    app.userMarker = L.marker(app.latLong).addTo(app.myMap);
    // Passing app.latLong to the searchForCity function
    app.searchForCity(app.latLong);
  }
  function error(err) {
    if (err.code == 0) {
      // Unknown error
      alert("Unknown error");
    }
    if (err.code == 1) {
      // Access denied by user
      alert(
        "Your settings do not allow Geolocation. Please manually enter your address. Or reset location settings."
      );
    }
    if (err.code == 2) {
      // Position unavailable
      alert("Position unavailable");
    }
    if (err.code == 3) {
      // Timed out
      alert("Timed out");
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
L.tileLayer(
  "https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZXN0ZWxhdGhvbXNvbiIsImEiOiJjajM0djdidnIwMGF4MzJxdTZjOW92MGozIn0.XpuJtCuIx85zUn6Eci0b0w",
  {
    attribution:
      'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18
  }
).addTo(app.myMap);

//create array to store cities returned from getCityByName AJAX request

//get restaurant ID if geolocation is NOT used
//if geolocation is used skip this step
app.getCityByName = function(name) {
  //store updated city into newCity var
  $.ajax({
    url: `https://developers.zomato.com/api/v2.1/cities`,
    method: "GET",
    dataType: "json",
    headers: {
      "user-key": app.apiKey
    },
    data: {
      q: name,
      count: 20
    }
  }).then(function(cityMatch) {
    let cityNameArray = cityMatch.location_suggestions;
    for (var i = 0; i < cityNameArray.length; i++) {
      //push cities into array
      app.possibleCities.push(cityNameArray[i].name);
      app.possibleCitiesId.push(cityNameArray[i].id);
    }
    //append cities to page
    let cityOptions = "";
    for (var i = 0; i < app.possibleCities.length; i++) {
      cityOptions += `<option value="${app.possibleCities[i]}" data-id="${app
        .possibleCitiesId[i]}">${app.possibleCities[i]}</option>`;
    }
    $("#items").append(
      '<option value="choice">Choose City</option>' + cityOptions
    );
    //on click of selected city option from dropdown, get selected city id
    //store selected ID into variable and pass it as argument into next function
    $("#items").on("change", function() {
      if ($(this).find("option:selected").val() === "choice") {
          console.log("Choose a city!");
      } else {
        let optionSelected = $(this).find("option:selected").val();
        let cityIdOfSelected = $(this).find("option:selected").data("id");
        app.searchForCity(cityIdOfSelected); //insert city ID variable in search for city
      }
    });
  });
};
//end of getCityByName AJAX request//

//store city Input on click of find and update each city choice
app.updateCity = function() {
  $("#citySubmit").on("click", function(e) {
    e.preventDefault();
    let inputOfCity = $("#cityInput").val();
    //pass in city input to cities AJAX request
    app.getCityByName(inputOfCity);
    $("#items").find("option").remove();
    //reset dropdown of cuisines to zero if new location is selected
    $("#cuisine").find("option").remove();
    $(".citySelect").addClass("citySelectShow");
    //resets array of possibleCities to zero
    app.possibleCities.length = 0;
    app.possibleCitiesId.length = 0;
  });
};

// looping through the restaurant list array (based on user location) to get the cuisine types found in the restaurant objects

app.getCuisineType = function(restaurantsObject) {
  for (var index in restaurantsObject) {
    let eachRestaurant = restaurantsObject[index].restaurant;
    // "split" makes the cuisine value an array and splits it, removing anything after the comma
    eachRestaurant.cuisines = eachRestaurant.cuisines.split(",")[0];
    let eachCuisineType = eachRestaurant.cuisines;
    app.unfilteredCuisinesList.push(eachCuisineType);
  }
  //delete duplicates in array using onlyUnique function below

  app.uniqueCuisineList = app.unfilteredCuisinesList.filter(function(
    value,
    index,
    self
  ) {
    return self.indexOf(value) === index;
  });

  // then return the cuisine type selected.val() into the search AJAX request
  let cuisineOptions = "";
  for (var i = 0; i < app.uniqueCuisineList.length; i++) {
    cuisineOptions += `<option value="${app.uniqueCuisineList[i]}">${app
      .uniqueCuisineList[i]}</option>`;
  }

  // display cuisineOptions and default choose option in the drop down
  $("#cuisine").append(cuisineOptions);

  $(".food").on("change", function() {
    if ($(this).find("option:selected").val() === "choice") {
      alert("Choose a Cuisine!");
    } else {
      app.cuisineSelected = $(this).val();
      app.cuisineMatch(restaurantsObject);
    }
  });
};

//pass city ID from above and dynamically insert it into new AJAX request
//searches for city by ID and returns radius, count and cuisines nearby
app.searchForCity = function(cityInformation) {
  //.constructor is checking for the type of data of cityInformation (whether it's an array or an integer)
  if (cityInformation.constructor === Array) {
    return $.ajax({
      url: "https://developers.zomato.com/api/v2.1/search",
      method: "GET",
      dataType: "json",
      headers: {
        "user-key": app.apiKey
      },
      data: {
        entity_type: "city",
        lat: `${cityInformation[0]}`, //lat depending on which order it's in array
        lon: `${cityInformation[1]}`, //lon depending on which order it's in array
        radius: 2000,
        count: 1000,
        sort: "rating",
        order: "desc"
      }
    }).then(function(res) {
      app.restaurants = res.restaurants;
      let rest = res.restaurants;
      app.getCuisineType(rest);
    });
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
          radius: 2000,
          count: 1000,
          sort: 'rating',
          order: 'desc'
          }
      })
      .then(function(res){
        app.restaurants = res.restaurants;
        let rest = res.restaurants;
        app.getCuisineType(rest);
      })
  }
};

app.cuisineMatch = function(restaurantRes) {
  restaurantRes.forEach(function(res) {
    if (res.restaurant.cuisines === app.cuisineSelected) {
      app.restaurantsByCuisine.push(res.restaurant);

      app.finalThree = app.restaurantsByCuisine.slice(0, 3);
    }
  });
  //new array with top three results
  app.displayFinalThree(app.finalThree);

  // Create custom icon for restaurants
  app.restaurantIcon = L.icon({
    iconUrl: "public/assets/fork.svg",
    iconSize: [100, 100], // dimensions of the icon
    iconAnchor: [15, -5], // point of the icon which will correspond to marker's location
    popupAnchor: [0, 14] // point from which the popup should open relative to the anchor
  });

  // create markers for top three results
  app.finalThree.forEach(function(finalRest) {
    var restMarker = L.marker(
      [finalRest.location.latitude, finalRest.location.longitude],
      { icon: app.restaurantIcon },
      { title: finalRest.name }
    ).bindPopup(finalRest.name);

    app.restaurantMarkers.push(restMarker);
    restMarker.addTo(app.myMap);
  });
  var boundGroup = L.featureGroup(app.restaurantMarkers);
  app.myMap.fitBounds(boundGroup.getBounds());

 ///old placement of app.restaurantIcon
};

 
//append to the restaurantContainer in APP (.forEACH)
app.displayFinalThree = function(finalThree) {
  app.finalThree.forEach(function(finalThree) {
      $('restaurantItem').remove();
      const restaurantItem = $('<li>').addClass('restaurantItem');
     
      const restName = $('<p class="restaurantName">').text(finalThree.name);
      const restRating = $('<p class="restaurantRating">').text(`Rating: ${finalThree.user_rating.aggregate_rating}`);
      const restPrice = $('<p class="restaurantPrice">').text(finalThree.currency);
      const restReview = $('<a class="restaurantReview">Review More</a>').attr("href",finalThree.url).attr("target", "_blank");
      const restPic = $('<img>').attr('src', finalThree.featured_image);
   
      restaurantItem.append(restName, restRating, restPrice, restReview, restPic);
      $('#restaurantContainer').append(restaurantItem);
   });
  };



//geolocation event handler
app.events = function() {
  $(".locator").on("click", function() {
    app.getGeolocation();
  });
};

app.init = function() {
  app.events();
  app.updateCity();
};

$(function() {
  app.init();
});
