module.exports = async function handler(request, response) {
	const query = String(request.query.q || '').trim();

	if (query.length < 2 || query.length > 80) {
		return response.status(200).json({ results: [] });
	}

	try {
		const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
		url.searchParams.set('name', query);
		url.searchParams.set('count', '8');
		url.searchParams.set('language', 'en');
		url.searchParams.set('format', 'json');
		const upstream = await fetch(url);
		const data = await upstream.json();
		const results = (data.results || []).map((location) => ({
			id: location.id,
			name: location.name,
			state: location.admin1 || '',
			country: location.country || '',
			countryCode: location.country_code || '',
			latitude: location.latitude,
			longitude: location.longitude
		}));

		response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
		return response.status(200).json({ results });
	} catch (error) {
		return response.status(502).json({ error: 'Location search is temporarily unavailable.' });
	}
};
