let search = document.querySelector(".search");
let suggestions = document.querySelector(".suggestion");
let searchBtn = document.querySelector(".submit");
let themeBtn = document.querySelector(".theme-change");
let themeText = document.querySelector(".theme-text");
let errorMessage = document.querySelector(".error-message");
let loader = document.querySelector(".loader");
let hourlyContainer = document.querySelector(".hourly-container");
let dailyContainer = document.querySelector(".daily-container");
let locationBtn = document.querySelector(".location-btn");
let tempUnitBtn = document.querySelector(".temp-unit");
let speedUnitBtn = document.querySelector(".speed-unit");
let saveCityBtn = document.querySelector(".save-city");
let savedCitiesDiv = document.querySelector(".saved-cities");
let tempUnit = "C";
let speedUnit = "km/h";
let currentCity = "";
let latitude;
let longitude;

themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    if (document.body.classList.contains("dark")) {
        themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        themeText.innerHTML = "Dark";
    }
    else {
        themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        themeText.innerHTML = "Light";
    }
});
search.addEventListener("input", async () => {
    let cityName = search.value.trim();
    if (cityName.length < 2) {
        suggestions.innerHTML = "";
        return;
    }
    let response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=5&language=en&format=json`);
    let data = await response.json();
    suggestions.innerHTML = "";
    if (data.results) {
        data.results.forEach(city => {
        let div = document.createElement("div");
        div.className = "city";
        div.innerHTML =`${city.name}, ${city.country}`;
        div.addEventListener("click", () => {
                search.value = city.name;
                suggestions.innerHTML = "";
            })
        suggestions.appendChild(div);
        });
    }
});
searchBtn.addEventListener("click", async () => {
    let cityName = search.value.trim();
    if (cityName === "") {
        errorMessage.innerHTML = "Please enter a city";
        return;
    }
    errorMessage.innerHTML = "";
    loader.style.display = "block";
    let response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=en&format=json`);
    let data = await response.json();
    if (!data.results) {
        loader.style.display = "none";
        errorMessage.innerHTML= "City not found";
        return;
        }
    latitude = data.results[0].latitude;
    longitude = data.results[0].longitude;
    currentCity =`${data.results[0].name}, ${data.results[0].country}`;
    fetchWeather(latitude, longitude);
});
let currentWeather = document.querySelector(".current-weather");
let humidityCard = document.querySelector(".humidity-card");
let windCard = document.querySelector(".wind-card");
let directionCard = document.querySelector(".direction-card");
let pressureCard = document.querySelector(".pressure-card");
let visibilityCard = document.querySelector(".visibility-card");

async function fetchWeather(lat, lon) {

    try {
       let response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,pressure_msl,wind_speed_10m,wind_direction_10m,weather_code&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`);
       let data = await response.json();
        loader.style.display = "none";
        showCurrentWeather(data);
        showWeatherDetails(data);
        showHourlyForecast(data);
        showDailyForecast(data);
    }
    catch(error){
        loader.style.display = "none";
        errorMessage.innerText = "Unable to fetch weather";
        console.log(error);
    }
}
function getWeatherCondition(code) {
    if (code === 0) {
        return "Clear Sky";
    }
    else if (code <= 3) {
        return "Partly Cloudy";
    }
    else if (code <= 67) {
        return "Rainy";
    }
    else if (code <= 77) {
        return "Snow";
    }
    else {
        return "Thunderstorm";
    }
}
function getWeatherIcon(code) {
    if (code === 0) {
        return '<i class="fa-solid fa-sun"></i>';
    }
    else if (code <= 3) {
        return '<i class="fa-solid fa-cloud-sun"></i>';
    }
    else if (code <= 67) {
        return '<i class="fa-solid fa-cloud-rain"></i>';
    }
    else if (code <= 77) {
        return '<i class="fa-solid fa-snowflake"></i>';
    }
    else {
        return '<i class="fa-solid fa-bolt"></i>';
    }
}
tempUnitBtn.addEventListener("click",()=>{
    if(tempUnit==="C"){
        tempUnit="F";
    }
    else{
        tempUnit="C";
    }
    fetchWeather(latitude,longitude);
});

speedUnitBtn.addEventListener("click", () => {

    if (speedUnit === "km/h") {
        speedUnit = "mph";
    }
    else {
        speedUnit = "km/h";
    }
    fetchWeather(latitude,longitude);
});

locationBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
            loader.style.display = "block";
            let response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en` );
            let data = await response.json();
            currentCity = `${data.city}, ${data.countryName}`;
            fetchWeather(latitude, longitude);
        });
    } 
    else {
        errorMessage.innerHTML = "Geolocation not supported";
    }
});
function showCurrentWeather(data) {
    let temperature = data.current.temperature_2m;
    let feelsLike = data.current.apparent_temperature;
    if(tempUnit === "F"){
    temperature = (temperature * 9/5) + 32;
    feelsLike = (feelsLike * 9/5) + 32;
}
    let condition = getWeatherCondition(data.current.weather_code);
    let icon = getWeatherIcon(data.current.weather_code);
    let sunrise = data.daily.sunrise[0].slice(11, 16);
    let sunset = data.daily.sunset[0].slice(11, 16);
    currentWeather.innerHTML = `
        ${icon}
        <h1>${currentCity}</h1>
        <h2>${temperature.toFixed(1)}°${tempUnit}</h2>
        <h3>${condition}</h3>
        <p>Feels Like : ${feelsLike.toFixed(1)}°${tempUnit}</p>
        <p>🌅 Sunrise : ${sunrise}</p>
        <p>🌇 Sunset : ${sunset}</p>
    `;
}
function showWeatherDetails(data) {
    let speed = data.current.wind_speed_10m;

if(speedUnit==="mph"){
    speed = speed * 0.621371;
}
    humidityCard.innerHTML = `
        <i class="fa-solid fa-droplet"></i>
        <h3>Humidity</h3>
        <h2>${data.current.relative_humidity_2m}%</h2>

    `;
    windCard.innerHTML=`
    <i class="fa-solid fa-wind"></i>
    <h3>Wind Speed</h3>
    <h2>${speed.toFixed(1)} ${speedUnit}</h2>
    `;
    directionCard.innerHTML = `
        <i class="fa-solid fa-compass"></i>
        <h3>Direction</h3>
        <h2>${data.current.wind_direction_10m}°</h2>
    `;
    pressureCard.innerHTML = `
        <i class="fa-solid fa-gauge-high"></i>
        <h3>Pressure</h3>
        <h2>${data.current.pressure_msl} hPa</h2>
    `;
    visibilityCard.innerHTML = 
        `<i class="fa-solid fa-eye"></i>
        <h3>Visibility</h3>
        <h2>Good</h2>
    `;
}
function showHourlyForecast(data) {
    hourlyContainer.innerHTML = "";
    for (let i = 0; i < 24; i++) {
        let time = data.hourly.time[i].slice(11, 16);
        let temperature = data.hourly.temperature_2m[i];
        if (tempUnit === "F") {
            temperature = (temperature * 9 / 5) + 32;
        }
        let code = data.hourly.weather_code[i];
        let card = document.createElement("div");
        card.className = "hour-card";
        card.innerHTML = `
            <h3>${time}</h3>
            ${getWeatherIcon(code)}
            <h2>${temperature.toFixed(1)}°${tempUnit}</h2>
        `;
        hourlyContainer.appendChild(card);
    }
}

function showDailyForecast(data) {
    dailyContainer.innerHTML = "";
    for (let i = 0; i < 7; i++) {
        let maxTemp = data.daily.temperature_2m_max[i];
        let minTemp = data.daily.temperature_2m_min[i];
        if (tempUnit === "F") {
            maxTemp = (maxTemp * 9 / 5) + 32;
            minTemp = (minTemp * 9 / 5) + 32;
        }
        let date = new Date(data.daily.time[i]);
        let card = document.createElement("div");
        card.className = "day-card";
        card.innerHTML = `
            <h3>${date.toLocaleDateString("en-US", { weekday: "short" })}</h3>
            ${getWeatherIcon(data.daily.weather_code[i])}
            <p>${getWeatherCondition(data.daily.weather_code[i])}</p>
            <p>Max : ${maxTemp.toFixed(1)}°${tempUnit}</p>
            <p>Min : ${minTemp.toFixed(1)}°${tempUnit}</p>
        `;
        dailyContainer.appendChild(card);
    }
}
saveCityBtn.addEventListener("click", () => {
    if (currentCity === "") {
        return;
    }
    let cities = JSON.parse(localStorage.getItem("cities")) || [];
    if (!cities.includes(currentCity)) {
        cities.push(currentCity);
        localStorage.setItem("cities", JSON.stringify(cities));
        showSavedCities();
    }
});
function showSavedCities() {
    savedCitiesDiv.innerHTML = "";
    let cities = JSON.parse(localStorage.getItem("cities")) || [];
    cities.forEach(city => {
        let div = document.createElement("div");
        div.className = "saved-city";
        div.innerHTML = `
            <span>${city}</span>
            <button class="delete-btn">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        div.querySelector("span").addEventListener("click", () => {
            search.value = city.split(",")[0];
            searchBtn.click();
        });
        div.querySelector(".delete-btn").addEventListener("click", () => {
            deleteCity(city);
        });
        savedCitiesDiv.appendChild(div);
    });
}
function deleteCity(cityName) {
    let cities = JSON.parse(localStorage.getItem("cities")) || [];
    cities = cities.filter(city => city !== cityName);
    localStorage.setItem("cities", JSON.stringify(cities));
    showSavedCities();
}
