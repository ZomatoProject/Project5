const app = {};

app.apiKey = '2e6e8448ce627a7c4abfd88090371fd4';



//get location details from User
//store details in variable

//call location details in AJAX request and store results
app.getRestaurantCuisines = function (){
  $.ajax({
        url: 'https://developers.zomato.com/api/v2.1/cuisines?city_id=280',
        method: 'GET',
        dataType: 'json',
        // city_id: 280,
        headers: {
            'user-key': app.apiKey
        }
      }).then(function(res){
        console.log(res);
      })
};

app.getRestaurantCuisines();

//use location results from AJAX request in cuisine AJAX call


//dynamically create cuisine dropdown menu from results based on AJAX call

//

//



// // get cuisine type
// app.getLocationDetails = function () {
//   $.ajax({
//         url: 'https://developers.zomato.com/api/v2.1/cuisines',
//         method: 'GET',
//         dataType: 'json',
//         headers: {
//             'user-key': app.apiKey
//         }
//       }); 
//   }

// //get category
// app.getRestaurantCategory = function (){
//   $.ajax({
//         url: 'https://developers.zomato.com/api/v2.1/categories',
//         method: 'GET',
//         dataType: 'json',
//         headers: {
//             'user-key': app.apiKey
//         }
//       });
//   }
// // get cuisine type
// app.getRestaurantSearch = function (){
//   $.ajax({
//         url: 'https://developers.zomato.com/api/v2.1/search',
//         method: 'GET',
//         dataType: 'json',
//         headers: {
//             'user-key': app.apiKey
//         }
//       });
//   }
// //get cities
// app.getRestaurantCity = function (){
//   $.ajax({
//         url: 'https://developers.zomato.com/api/v2.1/cities',
//         method: 'GET',
//         dataType: 'json',
//         headers: {
//             'user-key': app.apiKey
//         }
//       });
//   }
//   //when each returns
// $.when(app.getRestaurantCategory() , app.getRestaurantSearch(), app.getRestaurantCity()) 
//   .then(function (category, search, city) {




//     // merge all three from separate calls into new single object (easier to work with)
// })
      



// //initialize application
// app.init = function(){

// };


// //run the whole app on page load
// $(function() {
//     app.init();
// });
 

