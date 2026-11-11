let todoItems = [];

function renderTodo(todo) {
	localStorage.setItem('todoItems', JSON.stringify(todoItems));

	const list = document.querySelector('.todo-card__list');
	const item = document.querySelector(`[data-key='${todo.id}']`);

	if (todo.deleted) {
		if (item) item.remove();
		if (todoItems.length === 0) list.innerHTML = '';
		return
	}

	const isChecked = todo.checked ? 'done' : '';
	const node = document.createElement("li");
	node.setAttribute('class', `todo-item ${isChecked}`);
	node.setAttribute('data-key', todo.id);
	node.innerHTML = `
		<input id="${todo.id}" type="checkbox"/>
		<label for="${todo.id}" class="tick"></label>
		<span>${todo.text}</span>
		<i class='fas fa-times'></i>
		`;
	if (item) {
		list.replaceChild(node, item);
	} else {
		list.append(node);
	}
}

function addTodo(text) {
	const todo = {
		text,
		checked: false,
		id: Date.now(),
	};

	todoItems.push(todo);
	renderTodo(todo);
	addNotificationBadge();
	updateTaskCount();
}

function toggleDone(key) {
	const index = todoItems.findIndex(item => item.id === Number(key));
	todoItems[index].checked = !todoItems[index].checked;
	renderTodo(todoItems[index]);
	addNotificationBadge();
	updateTaskCount();
}

function deleteTodo(key) {
	const index = todoItems.findIndex(item => item.id === Number(key));
	const todo = {
		deleted: true,
		...todoItems[index]
	};
	todoItems = todoItems.filter(item => item.id !== Number(key));
	renderTodo(todo);
	addNotificationBadge();
	updateTaskCount();
}

const form = document.querySelector('.todo-card__form');
form.addEventListener('submit', event => {
	event.preventDefault();
	const input = document.querySelector('.todo-card__form-input');

	const text = input.value.trim();
	if (text !== '') {
		addTodo(text);
		input.value = '';
		input.focus();
	}
});

const list = document.querySelector('.todo-card__list');
list.addEventListener('click', event => {
	const itemKey = event.target.parentElement.dataset.key;
	if (event.target.classList.contains('fas')) {
		deleteTodo(itemKey);
		return;
	}
	toggleDone(itemKey);
});

document.addEventListener('DOMContentLoaded', () => {
	const ref = localStorage.getItem('todoItems');
	if (ref) {
		todoItems = JSON.parse(ref);
		todoItems.forEach(t => {
			renderTodo(t);
		});
	}
	addNotificationBadge();
	updateTaskCount();
});

function addNotificationBadge() {
}

function updateTaskCount() {
	const count = todoItems.filter((item) => !item.checked).length;
	document.getElementById('task-count').textContent = `${count} left`;
}