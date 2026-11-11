const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('searchbox');

searchForm.addEventListener('submit', (event) => {
	event.preventDefault();
	const query = searchInput.value.trim();
	if (!query) return;
	search(query);
	searchInput.value = '';
});

function search(query) {
	const prefix = query.slice(0, 2).toLowerCase();
	const value = encodeURIComponent(prefix.startsWith('-') ? query.slice(3).trim() : query);
	const urls = {
		'-d': `https://duckduckgo.com/?q=${value}`,
		'-y': `https://www.youtube.com/results?search_query=${value}`,
		'-w': `https://en.wikipedia.org/w/index.php?search=${value}`,
		'-r': `https://www.reddit.com/search/?q=${value}`,
		'-h': `https://wallhaven.cc/search?q=${value}`
	};
	window.open(urls[prefix] || `https://www.google.com/search?q=${value}`, '_blank', 'noopener,noreferrer');
}