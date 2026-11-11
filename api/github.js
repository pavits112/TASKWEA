module.exports = async function handler(request, response) {
	const username = String(request.query.username || 'pavits112').trim();
	if (!/^[a-zA-Z0-9-]{1,39}$/.test(username)) return response.status(400).json({ error: 'Invalid username.' });

	try {
		const upstream = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
			headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'taskwea-dashboard' }
		});
		const data = await upstream.json();
		if (!upstream.ok) return response.status(upstream.status).json({ error: 'GitHub profile unavailable.' });
		response.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');
		return response.status(200).json({
			name: data.name || data.login,
			login: data.login,
			avatar: data.avatar_url,
			bio: data.bio || 'Building useful things.',
			repos: data.public_repos,
			followers: data.followers,
			following: data.following
		});
	} catch (error) {
		return response.status(502).json({ error: 'GitHub service unavailable.' });
	}
};
