// Tutorial by http://youtube.com/CodeExplained
// api key : 0092e5d587dca9b05d41fd95d61bb842

// SELECT ELEMENTS 
const iconElement = document.querySelector(".weather-icon");
const tempElement = document.querySelector(".temperature-value p");
const descElement = document.querySelector(".temperature-description p");
const locationElement = document.querySelector(".location p");
const notificationElement = document.querySelector(".notification");
const windElement = document.querySelector(".wind-description p");


//Weather object
const weather={};

weather.temperature={
    unit :"celsius"
}
//
const Kelvin =273;
//API Key
const key = "0092e5d587dca9b05d41fd95d61bb842";

// change browser to always accept
if('geolocation'in navigator)
{
    navigator.geolocation.getCurrentPosition(setPosition, showError);
}
else
{
    notificationElement.style.display="block";
    notificationElement.innerHTML=`<p>Browser doesn't Support Geolocation</p>`
}

//Function: setPosition
function setPosition(position)
{
    let latitude = position.coords.latitude;
    let longitude= position.coords.longitude;

    getWeather(latitude,longitude);
}
//Show error when there is an issue with Geolocation services
function showError(error)
{
    notificationElement.style.display= "block";
    notificationElement.innerHTML = `<p> ${error.message} </p>`;
}

//getWeather Function
//This will call the API Provider
function getWeather(latitude,longitude)
{
    let api= `http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${key}`;//this works

    console.log(api);//to view if api is working
    fetch(api)//To grab data from api
    .then(function(response){
        let data= response.json();
        return data;
    })
    .then(function(data){
        weather.temperature.value = Math.floor(data.list[0].main.temp - Kelvin);
        weather.description= data.list[0].weather[0].description;
        weather.iconId = data.list[0].weather[0].icon;
        weather.wind = data.list[0].wind.speed;
        weather.city =data.city.name;
        weather.country= data.city.country;

      
        
 
     })
    .then(function(){
         displayWeather();
         window.setInterval("displayWeather()",60*60*1000);
     })
   

}
//Display the weather to the UI
function displayWeather(){
    iconElement.innerHTML= `<img src="icons/${weather.iconId}.png"/>`;
    tempElement.innerHTML= `${weather.temperature.value}°<span>c</span>`;
    descElement.innerHTML= weather.description;
    windElement.innerHTML= `${weather.wind}<span> kts</span>`;
    locationElement.innerHTML= `${weather.city}, ${weather.country}`;

  
    
}
//C to F conversion
function celsiusToFahrenheit(temperature){
    return (temperature* 9/5)+32;
}
tempElement.addEventListener("click",function(){
    if (weather.temperature.value === undefined)return;

    if (weather.temperature.unit =="celsius"){
        let fahrenheit = celsiusToFahrenheit(weather.temperature.value);
        fahrenheit= Math.floor(fahrenheit);

        tempElement.innerHTML = `${fahrenheit}°<span>F</span>`;
        weather.temperature.unit = "fahrenheit";
    }
    else{
        tempElement.innerHTML = `${weather.temperature.value}°<span>C</span>`;
        weather.temperature.unit = "celsius"
    }
});


//getting days
