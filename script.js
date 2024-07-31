document.getElementById('add-task-button').addEventListener('click', addTask);
document.getElementById('toggle-theme-button').addEventListener('click', toggleTheme);
window.addEventListener('load', () => {
    loadTasks();
    loadTheme();
    removeOldCompletedTasks();
});

function addTask() {
    const taskInput = document.getElementById('task-input');
    const dueDateInput = document.getElementById('due-date-input');

    const taskText = taskInput.value.trim();
    const taskDueDate = dueDateInput.value;

    if (taskText === '' || taskDueDate === '') {
        alert('Por favor, completa la tarea y la fecha de resolución.');
        return;
    }

    const task = {
        text: taskText,
        createdDate: getLocalDate(),
        dueDate: taskDueDate,
        completed: false,
        completionDate: null
    };

    saveTask(task);
    prependTask(task);

    taskInput.value = '';
    dueDateInput.value = '';
}

function prependTask(task) {
    const taskItem = document.createElement('li');
    taskItem.className = 'task-item';
    if (task.completed) {
        taskItem.classList.add('completed');
    }

    const taskCheckbox = document.createElement('input');
    taskCheckbox.type = 'checkbox';
    taskCheckbox.checked = task.completed;
    taskCheckbox.addEventListener('change', () => toggleTaskCompletion(taskItem, task));

    const taskDetails = document.createElement('div');
    taskDetails.className = 'task-details';

    const taskText = document.createElement('span');
    taskText.className = 'task-text';
    taskText.textContent = task.text;

    const taskDates = document.createElement('div');
    taskDates.className = 'task-dates';

    const createdDateSpan = document.createElement('span');
    createdDateSpan.textContent = `Creada: ${task.createdDate}`;

    const dueDateInput = document.createElement('input');
    dueDateInput.type = 'date';
    dueDateInput.value = task.dueDate;
    dueDateInput.addEventListener('change', (event) => updateTaskDueDate(task, event.target.value));

    taskDates.appendChild(createdDateSpan);
    taskDates.appendChild(dueDateInput);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.innerHTML = '&times;';
    deleteButton.addEventListener('click', () => deleteTask(taskItem, task));

    taskDetails.appendChild(taskText);
    taskDetails.appendChild(taskDates);
    taskItem.appendChild(taskCheckbox);
    taskItem.appendChild(taskDetails);
    taskItem.appendChild(deleteButton);

    const taskList = document.getElementById('task-list');
    taskList.insertBefore(taskItem, taskList.firstChild);
}

function toggleTaskCompletion(taskItem, task) {
    task.completed = !task.completed;
    task.completionDate = task.completed ? getLocalDate() : null;

    const tasks = getTasksFromStorage();
    const index = tasks.findIndex(t => t.text === task.text && t.createdDate === task.createdDate);
    tasks[index] = task;
    saveTasks(tasks);

    if (task.completed) {
        taskItem.classList.add('completed');
        appendToHistory(task);
        taskItem.remove();
    } else {
        taskItem.classList.remove('completed');
        prependTask(task);
    }
}

function deleteTask(taskItem, task) {
    const tasks = getTasksFromStorage();
    const index = tasks.findIndex(t => t.text === task.text && t.createdDate === task.createdDate);
    tasks.splice(index, 1);
    saveTasks(tasks);
    taskItem.remove();
}

function saveTask(task) {
    const tasks = getTasksFromStorage();
    tasks.push(task);
    saveTasks(tasks);
}

function loadTasks() {
    const tasks = getTasksFromStorage();
    tasks.forEach(task => {
        if (task.completed) {
            appendToHistory(task);
        } else {
            prependTask(task);
        }
    });
}

function saveTasks(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function getTasksFromStorage() {
    const tasks = localStorage.getItem('tasks');
    return tasks ? JSON.parse(tasks) : [];
}

function appendToHistory(task) {
    const historyItem = document.createElement('li');
    historyItem.className = 'history-item';

    const taskText = document.createElement('span');
    taskText.textContent = task.text;

    const taskDates = document.createElement('span');
    taskDates.textContent = ` | Creada: ${task.createdDate}, Resolución: ${task.dueDate}, Completada: ${task.completionDate}`;

    const statusIcon = document.createElement('span');
    statusIcon.className = 'history-status';
    if (new Date(task.completionDate) <= new Date(task.dueDate)) {
        statusIcon.textContent = '✔';
        statusIcon.classList.add('completed-on-time');
    } else {
        statusIcon.textContent = '✘';
        statusIcon.classList.add('completed-late');
    }

    historyItem.appendChild(taskText);
    historyItem.appendChild(taskDates);
    historyItem.appendChild(statusIcon);

    const historyList = document.getElementById('history-list');
    historyList.insertBefore(historyItem, historyList.firstChild);
}

function updateTaskDueDate(task, newDueDate) {
    task.dueDate = newDueDate;
    const tasks = getTasksFromStorage();
    const index = tasks.findIndex(t => t.text === task.text && t.createdDate === task.createdDate);
    tasks[index] = task;
    saveTasks(tasks);
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}

function loadTheme() {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
    }
}

function getLocalDate() {
    const date = new Date();
    return date.toISOString().split('T')[0];
}

function removeOldCompletedTasks() {
    const tasks = getTasksFromStorage();
    const now = new Date();
    const updatedTasks = tasks.filter(task => {
        if (!task.completed) return true;

        const completionDate = new Date(task.completionDate);
        const diffTime = Math.abs(now - completionDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays <= 7;
    });

    saveTasks(updatedTasks);

    // Clear and reload the tasks to reflect changes
    document.getElementById('task-list').innerHTML = '';
    document.getElementById('history-list').innerHTML = '';
    loadTasks();
}
