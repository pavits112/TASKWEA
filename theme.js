const themeButton = document.getElementById('switch_theme');

function setTheme(theme) {
	document.body.setAttribute('theme', theme);
	themeButton.textContent = theme === 'dark' ? '☀' : '☾';
	themeButton.setAttribute('aria-label', theme === 'dark' ? 'Use light theme' : 'Use dark theme');
	localStorage.setItem('theme', theme);
}

setTheme(localStorage.getItem('theme') || 'dark');
themeButton.addEventListener('click', () => {
	setTheme(document.body.getAttribute('theme') === 'dark' ? 'light' : 'dark');
});