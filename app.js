const greeting = document.getElementById('greeting');
const hour = new Date().getHours();
const greetingText = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
greeting.textContent = `${greetingText}. What are you working on?`;

const clock = document.getElementById('clock');
const date = document.getElementById('date');
const timeFormatter = new Intl.DateTimeFormat([], { hour: '2-digit', minute: '2-digit' });
const dateFormatter = new Intl.DateTimeFormat([], { weekday: 'short', month: 'short', day: 'numeric' });
const focusTime = document.getElementById('focus-time');
const focusToggle = document.getElementById('focus-toggle');
const notes = document.getElementById('notes');
const noteCount = document.getElementById('note-count');
const noteState = document.getElementById('note-state');
const clearNotes = document.getElementById('clear-notes');
const commandPalette = document.getElementById('command-palette');
const commandInput = document.getElementById('command-input');
const streakCount = document.getElementById('streak-count');
const streakCheck = document.getElementById('streak-check');
let focusSeconds = 25 * 60;
let focusInterval;

function updateNotes() {
	noteCount.textContent = `${notes.value.length} / 1200`;
	localStorage.setItem('dashboard-notes', notes.value);
	noteState.textContent = 'Saved locally';
}
notes.value = localStorage.getItem('dashboard-notes') || '';
updateNotes();
notes.addEventListener('input', () => {
	noteState.textContent = 'Saving...';
	clearTimeout(window.noteSaveTimer);
	window.noteSaveTimer = setTimeout(updateNotes, 250);
});
clearNotes.addEventListener('click', () => { notes.value = ''; updateNotes(); });

function updateStreak() {
	const today = new Date().toISOString().slice(0, 10);
	const state = JSON.parse(localStorage.getItem('dashboard-streak') || '{"count":0,"last":""}');
	if (state.last !== today) {
		const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
		state.count = state.last === yesterday ? state.count + 1 : 1;
		state.last = today;
		localStorage.setItem('dashboard-streak', JSON.stringify(state));
	}
	streakCount.textContent = state.count;
}
updateStreak();
streakCheck.addEventListener('click', updateStreak);

fetch('/api/github?username=pavits112').then((response) => response.json()).then((profile) => {
	if (profile.error) return;
	document.getElementById('github-avatar').src = profile.avatar;
	document.getElementById('github-name').textContent = profile.name;
	document.getElementById('github-bio').textContent = profile.bio;
	document.getElementById('github-repos').textContent = profile.repos;
	document.getElementById('github-followers').textContent = profile.followers;
	document.getElementById('github-following').textContent = profile.following;
}).catch(() => {});

function openCommandPalette() {
	commandPalette.hidden = false;
	commandInput.value = '';
	commandInput.focus();
}
function closeCommandPalette() { commandPalette.hidden = true; }
document.querySelectorAll('[data-close-command]').forEach((element) => element.addEventListener('click', closeCommandPalette));
document.querySelectorAll('[data-command]').forEach((button) => button.addEventListener('click', () => {
	closeCommandPalette();
	const targets = { weather: 'city', tasks: 'todo', notes: 'notes' };
	if (targets[button.dataset.command]) document.getElementById(targets[button.dataset.command]).focus();
	if (button.dataset.command === 'theme') document.getElementById('switch_theme').click();
}));

function updateClock() {
	const now = new Date();
	clock.textContent = timeFormatter.format(now);
	date.textContent = dateFormatter.format(now);
}

updateClock();
setInterval(updateClock, 30000);

function updateButtonGradient() {
	const currentHour = new Date().getHours();
	const gradients = currentHour < 6
		? ['linear-gradient(135deg, #164e63, #0f766e)', 'linear-gradient(135deg, #0f766e, #155e75)']
		: currentHour < 12
			? ['linear-gradient(135deg, #0f9f9a, #d97706)', 'linear-gradient(135deg, #0f766e, #ca8a04)']
			: currentHour < 18
				? ['linear-gradient(135deg, #0891b2, #0f9f9a)', 'linear-gradient(135deg, #0284c7, #0d9488)']
				: ['linear-gradient(135deg, #0f766e, #c2410c)', 'linear-gradient(135deg, #115e59, #b45309)'];
	document.documentElement.style.setProperty('--button-gradient', gradients[Math.floor(Date.now() / 45000) % gradients.length]);
}

function renderFocusTime() {
	const minutes = String(Math.floor(focusSeconds / 60)).padStart(2, '0');
	const seconds = String(focusSeconds % 60).padStart(2, '0');
	focusTime.textContent = `${minutes}:${seconds}`;
}

focusToggle.addEventListener('click', () => {
	if (focusInterval) {
		clearInterval(focusInterval);
		focusInterval = undefined;
		focusToggle.textContent = 'Resume focus';
		return;
	}
	focusToggle.textContent = 'Pause';
	focusInterval = setInterval(() => {
		focusSeconds -= 1;
		renderFocusTime();
		if (focusSeconds <= 0) {
			clearInterval(focusInterval);
			focusInterval = undefined;
			focusToggle.textContent = 'Start again';
			focusSeconds = 25 * 60;
		}
	}, 1000);
});

renderFocusTime();
updateButtonGradient();
setInterval(updateButtonGradient, 45000);

document.addEventListener('keydown', (event) => {
	if (event.target.matches('input, textarea')) return;
	if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
		event.preventDefault();
		openCommandPalette();
	}
	if (event.key === 'Escape') closeCommandPalette();
	if (event.key === '/') {
		event.preventDefault();
		document.getElementById('searchbox').focus();
	}
	if (event.key.toLowerCase() === 'w') document.getElementById('city').focus();
	if (event.key.toLowerCase() === 't') document.getElementById('todo').focus();
});
