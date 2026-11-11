const weatherForm = document.getElementById('weather-form');
const cityInput = document.getElementById('city');
const suggestions = document.getElementById('city-suggestions');
const weatherCity = document.getElementById('weather-city');
const weatherLocation = document.getElementById('weather-location');
const weatherInfo = document.getElementById('description');
const icon = document.getElementById('icon');
const temp = document.getElementById('temp');
const feelsLike = document.getElementById('feels-like');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');
const refreshButton = document.getElementById('refresh-weather');
const recentCities = document.getElementById('recent-cities');
const forecast = document.getElementById('forecast');
const useLocationButton = document.getElementById('use-location');
const shareWeatherButton = document.getElementById('share-weather');

let currentWeather;
let selectedLocation;
let locationResults = [];
let activeSuggestion = -1;
let suggestionTimer;

weatherForm.addEventListener('submit', (event) => {
	event.preventDefault();
	const city = cityInput.value.trim();
	if (!city) return;
	loadWeather(selectedLocation || { name: city });
});

cityInput.addEventListener('input', () => {
	selectedLocation = null;
	clearTimeout(suggestionTimer);
	suggestionTimer = setTimeout(() => findLocations(cityInput.value.trim()), 220);
});

cityInput.addEventListener('keydown', (event) => {
	if (!suggestions.classList.contains('is-visible')) return;
	if (event.key === 'ArrowDown') {
		event.preventDefault();
		activeSuggestion = Math.min(activeSuggestion + 1, locationResults.length - 1);
		renderSuggestions();
	} else if (event.key === 'ArrowUp') {
		event.preventDefault();
		activeSuggestion = Math.max(activeSuggestion - 1, 0);
		renderSuggestions();
	} else if (event.key === 'Enter' && activeSuggestion >= 0) {
		event.preventDefault();
		selectLocation(locationResults[activeSuggestion]);
	}
});

document.addEventListener('click', (event) => {
	if (!event.target.closest('.autocomplete')) hideSuggestions();
});

refreshButton.addEventListener('click', () => {
	if (selectedLocation || cityInput.value.trim()) loadWeather(selectedLocation || { name: cityInput.value.trim() });
});

useLocationButton.addEventListener('click', () => {
	if (!navigator.geolocation) {
		weatherInfo.textContent = 'Location is not supported by this browser.';
		return;
	}
	useLocationButton.textContent = '⌖ Finding location...';
	navigator.geolocation.getCurrentPosition(
		(position) => {
			const { latitude, longitude } = position.coords;
			const location = { name: 'Your location', latitude, longitude, state: '', country: '' };
			selectedLocation = location;
			cityInput.value = '';
			loadWeather(location);
			useLocationButton.textContent = '⌖ Use my location';
		},
		() => {
			weatherInfo.textContent = 'Location permission was not granted.';
			useLocationButton.textContent = '⌖ Use my location';
		},
		{ enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
	);
});

shareWeatherButton.addEventListener('click', async () => {
	if (!currentWeather) return;
	const text = `${currentWeather.city}: ${currentWeather.description}, ${currentWeather.tempCelsius}°C`;
	try {
		await navigator.clipboard.writeText(text);
		shareWeatherButton.textContent = '✓ Copied';
		setTimeout(() => { shareWeatherButton.textContent = '↗ Share weather'; }, 1400);
	} catch (error) {
		weatherInfo.textContent = text;
	}
});

async function findLocations(query) {
	if (query.length < 2) {
		hideSuggestions();
		return;
	}
	try {
		const response = await fetch(`/api/locations?q=${encodeURIComponent(query)}`);
		const data = await response.json();
		locationResults = data.results || [];
		activeSuggestion = -1;
		renderSuggestions();
	} catch (error) {
		hideSuggestions();
	}
}

function renderSuggestions() {
	suggestions.innerHTML = '';
	locationResults.forEach((location, index) => {
		const item = document.createElement('li');
		item.setAttribute('role', 'option');
		item.setAttribute('aria-selected', String(index === activeSuggestion));
		item.innerHTML = `<strong>${escapeHtml(location.name)}</strong><small>${escapeHtml([location.state, location.country].filter(Boolean).join(', '))}</small>`;
		item.addEventListener('mousedown', (event) => {
			event.preventDefault();
			selectLocation(location);
		});
		suggestions.append(item);
	});
	suggestions.classList.toggle('is-visible', locationResults.length > 0);
	cityInput.setAttribute('aria-expanded', String(locationResults.length > 0));
}

function selectLocation(location) {
	selectedLocation = location;
	cityInput.value = location.name;
	hideSuggestions();
	loadWeather(location);
}

function hideSuggestions() {
	suggestions.classList.remove('is-visible');
	suggestions.innerHTML = '';
	cityInput.setAttribute('aria-expanded', 'false');
}

async function loadWeather(location) {
	const params = new URLSearchParams({ city: location.name });
	if (location.latitude && location.longitude) {
		params.set('lat', location.latitude);
		params.set('lon', location.longitude);
		params.set('state', location.state || '');
		params.set('country', location.country || '');
	}
	weatherInfo.textContent = 'Loading weather...';
	weatherCity.textContent = location.name;
	try {
		const response = await fetch(`/api/weather?${params}`);
		const data = await response.json();
		if (!response.ok) throw new Error(data.error || 'Unable to load weather');
		currentWeather = data;
		selectedLocation = { ...location, name: data.city, state: data.state, country: data.country };
		renderWeather();
		saveRecentCity(selectedLocation);
	} catch (error) {
		weatherInfo.textContent = error.message;
		icon.className = '';
		temp.textContent = '--°';
		feelsLike.textContent = '--';
		humidity.textContent = '--';
		wind.textContent = '--';
	}
}

function renderWeather() {
	const unit = localStorage.getItem('temp-unit') || 'celsius';
	const value = unit === 'fahrenheit' ? currentWeather.tempFahrenheit : currentWeather.tempCelsius;
	const feels = unit === 'fahrenheit' ? currentWeather.feelsFahrenheit : currentWeather.feelsCelsius;
	temp.textContent = `${value}°${unit === 'fahrenheit' ? 'F' : 'C'}`;
	feelsLike.textContent = `${feels}°`;
	humidity.textContent = `${currentWeather.humidity}%`;
	wind.textContent = `${currentWeather.wind} m/s`;
	weatherCity.textContent = currentWeather.city;
	weatherLocation.textContent = [currentWeather.state, currentWeather.country].filter(Boolean).join(', ');
	weatherInfo.textContent = currentWeather.description;
	icon.className = `wi wi-owm-${currentWeather.isNight ? 'night' : 'day'}-${currentWeather.icon}`;
	forecast.innerHTML = (currentWeather.forecast || []).map((day, index) => {
		const label = index === 0 ? 'Today' : new Intl.DateTimeFormat([], { weekday: 'short' }).format(new Date(day.date));
		return `<div class="forecast-day"><span>${label}</span><i class="wi wi-owm-day-${day.icon}"></i><b>${day.max}° / ${day.min}°</b></div>`;
	}).join('');
}

temp.addEventListener('click', () => {
	if (!currentWeather) return;
	localStorage.setItem('temp-unit', localStorage.getItem('temp-unit') === 'fahrenheit' ? 'celsius' : 'fahrenheit');
	renderWeather();
});

function saveRecentCity(location) {
	const recent = getRecentCities().filter((item) => item.name.toLowerCase() !== location.name.toLowerCase());
	recent.unshift(location);
	localStorage.setItem('recent-cities', JSON.stringify(recent.slice(0, 5)));
	renderRecentCities();
}

function getRecentCities() {
	try {
		return JSON.parse(localStorage.getItem('recent-cities') || '[]');
	} catch (error) {
		return [];
	}
}

function renderRecentCities() {
	recentCities.innerHTML = '';
	getRecentCities().forEach((location) => {
		const button = document.createElement('button');
		button.type = 'button';
		button.textContent = location.name;
		button.addEventListener('click', () => selectLocation(location));
		recentCities.append(button);
	});
}

function escapeHtml(value) {
	return String(value).replace(/[&<>"']/g, (character) => ({
		'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
	}[character]));
}

renderRecentCities();
const savedCity = getRecentCities()[0];
if (savedCity) {
	cityInput.value = savedCity.name;
	loadWeather(savedCity);
}
