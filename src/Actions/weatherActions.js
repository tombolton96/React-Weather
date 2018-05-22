import * as types from './weatherActionTypes';
import { SEARCHING } from './searchingActionTypes';

const key = process.env.REACT_APP_API_KEY;

function url(lat, lon) {
    return `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&APPID=${key}`;
};

function searchUrl(city, country) {
    return country ? `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&units=metric&APPID=${key}`
        : `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&APPID=${key}`;
};

function forecastUrl(lat, lon) {
    return `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&APPID=${key}`;
};

function searchForecastUrl(city, country) {
    return country ? `https://api.openweathermap.org/data/2.5/forecast?q=${city},${country}&units=metric&APPID=${key}`
        : `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&APPID=${key}`; 
};

export function receiveWeather(data) {

    const weather = data ? {
        id: data.weather[0].id,
        description: data.weather[0].description,
        temperature: Math.round(data.main.temp*10)/10,
        icon: data.weather[0].icon,
        date: data.dt,
        city: data.name,
        country: data.sys.country,
        sunrise: data.sys.sunrise,
        sunset: data.sys.sunset
    } : {id:800};
    return {type: types.RECEIVE_WEATHER, weather};
}

export function receiveForecast(data) {
    const forecast = data.list.map(p => {
        return {
            date: p.dt,
            datestring: p.dt_txt,
            temperature: Math.round(p.main.temp*10)/10,
            description: p.weather[0].description,
            icon: p.weather[0].icon
        };
    });
    return {type: types.RECEIVE_FORECAST, forecast};
}

export function fetchWeather() {
    return dispatch => {
        const location = navigator.geolocation;
        location.getCurrentPosition(position => {
            
            fetch(url(position.coords.latitude, position.coords.longitude))
                .then(response => response.json())
                .then(json => dispatch(receiveWeather(json)))
                .catch(error => console.log(error));

            fetch(forecastUrl(position.coords.latitude, position.coords.longitude))
                .then(response => response.json())
                .then(json => dispatch(receiveForecast(json)))
                .catch(error => console.log(error));

        }, error => {
             console.log(error);
             dispatch(receiveWeather());
        });
    };
}

export function search(city, country) {
    return dispatch => {

        dispatch(searching(true));

        fetch(searchUrl(city, country))
            .then(response => response.json())
            .then(json => dispatch(receiveWeather(json)))
            .catch(error => console.log(error));

        fetch(searchForecastUrl(city, country))
            .then(response => response.json())
            .then(json => dispatch(receiveForecast(json)))
            .then(() => dispatch(searching(false)))
            .catch(error => console.log(error));
    };
}

export function searching(bool) {
    return {type: SEARCHING, searching:bool};
}