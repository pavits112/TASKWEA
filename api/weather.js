module.exports = async function handler(request, response) {
	const city = String(request.query.city || '').trim();
	const latitude = Number(request.query.lat);
	const longitude = Number(request.query.lon);
	const selectedLocation = Number.isFinite(latitude) && Number.isFinite(longitude);

	if (!city || city.length > 80) {
		return response.status(400).json({ error: 'Enter a valid city name.' });
	}

	try {
		let location = selectedLocation ? {
			name: city || 'Selected location',
			country: String(request.query.country || ''),
			admin1: String(request.query.state || ''),
			latitude,
			longitude
		} : null;

		if (!location) {
			const locationUrl = new URL('https://geocoding-api.open-meteo.com/v1/search');
			locationUrl.searchParams.set('name', city);
			locationUrl.searchParams.set('count', '1');
			locationUrl.searchParams.set('language', 'en');
			locationUrl.searchParams.set('format', 'json');
			const locationResponse = await fetch(locationUrl);
			const locationData = await locationResponse.json();
			location = locationData.results && locationData.results[0];
		}

		if (!location) {
			return response.status(404).json({ error: 'City not found.' });
		}

		const weatherUrl = new URL('https://api.open-meteo.com/v1/forecast');
		weatherUrl.searchParams.set('latitude', location.latitude);
		weatherUrl.searchParams.set('longitude', location.longitude);
		weatherUrl.searchParams.set('current', 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m');
		weatherUrl.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,weather_code');
		weatherUrl.searchParams.set('forecast_days', '5');
		weatherUrl.searchParams.set('timezone', 'auto');
		const weatherResponse = await fetch(weatherUrl);
		const data = await weatherResponse.json();
		if (!weatherResponse.ok || !data.current) {
			return response.status(502).json({ error: 'Weather service request failed.' });
		}

		const current = data.current;
		response.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
		return response.status(200).json({
			city: location.name,
			country: location.country,
			state: location.admin1 || '',
			description: weatherDescription(current.weather_code),
			icon: weatherIconCode(current.weather_code),
			isNight: Number(current.is_day) === 0,
			tempCelsius: Math.round(current.temperature_2m),
			tempFahrenheit: Math.round((current.temperature_2m * 9) / 5 + 32),
			feelsCelsius: Math.round(current.apparent_temperature),
			feelsFahrenheit: Math.round((current.apparent_temperature * 9) / 5 + 32),
			humidity: current.relative_humidity_2m,
			wind: Math.round(current.wind_speed_10m * 10) / 10
			, forecast: (data.daily?.time || []).map((date, index) => ({
				date,
				max: Math.round(data.daily.temperature_2m_max[index]),
				min: Math.round(data.daily.temperature_2m_min[index]),
				icon: weatherIconCode(data.daily.weather_code[index])
			}))
		});
	} catch (error) {
		return response.status(502).json({ error: 'Weather service is temporarily unavailable.' });
	}
};

function weatherDescription(code) {
	const descriptions = {
		0: 'clear sky',
		1: 'mainly clear',
		2: 'partly cloudy',
		3: 'overcast',
		45: 'foggy',
		48: 'rime fog',
		51: 'light drizzle',
		53: 'drizzle',
		55: 'heavy drizzle',
		61: 'light rain',
		63: 'rain',
		65: 'heavy rain',
		71: 'light snow',
		73: 'snow',
		75: 'heavy snow',
		80: 'rain showers',
		81: 'rain showers',
		82: 'heavy rain showers',
		95: 'thunderstorm',
		96: 'thunderstorm with hail',
		99: 'thunderstorm with hail'
	};
	return descriptions[code] || 'current conditions';
}

function weatherIconCode(code) {
	if ([0, 1].includes(code)) return 800;
	if ([2, 3].includes(code)) return 803;
	if ([45, 48].includes(code)) return 741;
	if ([51, 53, 55, 80, 81, 82].includes(code)) return 500;
	if ([61, 63, 65].includes(code)) return 501;
	if ([71, 73, 75].includes(code)) return 600;
	if ([95, 96, 99].includes(code)) return 200;
	return 801;
}
