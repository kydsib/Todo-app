let todos = []
const form = document.getElementById('todo-form')
const submitBtn = document.getElementById('submit-btn')
const todoList = document.getElementById('list')
const todoInputField = document.getElementById('todo-description')
const todoErrorMessage = document.getElementById('todo-error')

function getDataFromSessionStorage() {
	let data = JSON.parse(sessionStorage.getItem('Todos'))

	if (data) {
		todos = [...data]
		renderTodoListItems()
	}
}

function generateId() {
	return (
		'_' +
		Math.random()
			.toString()
			.substr(2, 9)
	)
}

function sortDates() {
	todos.sort(function(a, b) {
		if (!a.dueDate) {
			// change to -1 for ascending
			return 1
		}

		if (!b.dueDate) {
			// change to 1 for ascending
			return -1
		}

		return new Date(a.dueDate) - new Date(b.dueDate)
	})
}

function renderTodoListItems() {
	function todoMarkup(item) {
		return `
		<li class="todo-list__item" id="${item.id}">
		<input type="checkbox" name="job-done" ${item.completed ? 'checked' : ''}>
	    <span class="todo ${item.completed ? 'done' : ''}">${item.text}</span>
	    <span class="${item.completed ? 'done hide-due-date' : ''}">
		${item.dueDate ? calculateTimeLeft(item.dueDate) : item.dueDate}</span>
	    <i class="fas fa-trash delete"></i>
		</li>
		`
	}

	const completedTasks = todos.filter(item => item.completed === true)
	const pendingTasks = todos.filter(item => item.completed === false)

	// remove old todos
	todoList.innerHTML = ''

	function printTodosToScreen(todos) {
		todos.map(item =>
			todoList.insertAdjacentHTML('beforeend', todoMarkup(item))
		)
	}
	// separete these in order to put completedTasks under pendingTasks
	printTodosToScreen(pendingTasks)
	printTodosToScreen(completedTasks)
}

function commitTodosToSessionStorage(todo) {
	sessionStorage.setItem('Todos', JSON.stringify(todo))
}

function getValuesFormInput() {
	let data = {}
	// loop trough form elements and get name value pairs
	Object.keys(form.elements).forEach(key => {
		let element = form.elements[key]

		if (element.type !== 'submit') {
			data[element.name] = element.value
		}
	})
	// add aditional id and completed fields
	data.completed = false
	data.id = generateId()
	// removes previous errors before new check
	todoInputField.style.border = ''
	todoErrorMessage.innerHTML = ''
	todoErrorMessage.style.display = 'none'

	// input is not empty or filled with empty spaces
	if (data.text.trim().length === 0) {
		todoInputField.style.border = 'solid #fc8181'
		todoErrorMessage.style.display = 'block'
		todoErrorMessage.innerHTML = 'Field can not be empty!'
	} else if (data.text.length > 160) {
		todoInputField.style.border = 'solid #fc8181'
		todoErrorMessage.style.display = 'block'
		todoErrorMessage.innerHTML = `Task is longer than 160 symbols!`
	} else {
		todos.push(data)
		// Could be adding single item to session storage here
		form.reset()
	}
}

submitBtn.addEventListener('click', event => {
	event.preventDefault()
	getValuesFormInput()
	sortDates()
	renderTodoListItems()
})

function toggleChecked(ev) {
	// check if checkbox was prssed
	if (ev.target.type === 'checkbox') {
		// get id of pressed item
		const id = event.target.parentElement.id

		let newTodos = todos.map(todo =>
			todo.id === id ? { ...todo, completed: !todo.completed } : todo
		)

		todos = [...newTodos]
		renderTodoListItems()
		// could be updating todo in sesion storage here
	}
}
todoList.addEventListener('click', event => {
	toggleChecked(event)
	// handle delete of item
	if (event.target.className === 'fas fa-trash delete') {
		const id = event.target.parentElement.id
		// show popup and delete if ok is pressed
		if (confirm('Delete task?')) {
			todos = todos.filter(todo => todo.id !== id)
			// could be removing deleted value form sesion storage here
			renderTodoListItems()
		}
	}
})

function calculateTimeLeft(deadlineData) {
	let todaysDate = new Date()
	let dueDate = new Date(deadlineData)

	let timeToCompletion
	// Calculate the time in DD-HH:MM
	if (dueDate > todaysDate) {
		let difference = dueDate.getTime() - todaysDate.getTime()

		let days = Math.floor(difference / (1000 * 60 * 60 * 24))

		let hours = Math.floor(
			(difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
		)
		let minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))

		timeToCompletion = `${days > 0 ? days : '0'} d. ${
			hours > 0 ? hours : '0'
		} h ${minutes} min.`
	} else {
		timeToCompletion = `Time is over`
	}

	return timeToCompletion
}

// I'm not using clear interval because it resets after page reloads
let intervalID = window.setInterval(renderTodoListItems, 60000)

window.addEventListener('beforeunload', function() {
	// I chose this  to update session storage because it's simplest and
	// it's seems good enough for this app. I do not have a lot of data,
	// so revrwiting it all don't seem like a problem. Thou it could be in the bigger app or when using Local Storage

	// I could also have used setItem for storing
	// getItem -> update values -> setItem for updating values
	// removeItem to delete item
	commitTodosToSessionStorage(todos)
	// Google Chrome requires returnValue to be set if I need comfirmation window
	// before reload, because I don't I just skip it
	// evt.returnValue = ''

	return null
})

window.onload = function() {
	// get todos on reload
	getDataFromSessionStorage()
}
