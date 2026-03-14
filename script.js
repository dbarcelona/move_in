// This array stores all our tasks
// In JavaScript, arrays are lists that hold multiple items
let tasks = [];

// Load saved data when the page loads
// localStorage is browser storage that persists even after closing the page
window.onload = function() {
    loadTasks();
    loadFurniture();
    renderTasks();
};

// Function to switch between tabs (To-Do List and Space Planner)
function showTab(tabName) {
    // Hide all tab content
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active class from all buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });

    // Show the selected tab
    if (tabName === 'todo') {
        document.getElementById('todo-section').classList.add('active');
        document.querySelectorAll('.tab-button')[0].classList.add('active');
    } else {
        document.getElementById('planner-section').classList.add('active');
        document.querySelectorAll('.tab-button')[1].classList.add('active');
    }
}

// ==================== TO-DO LIST FUNCTIONS ====================

// Function to add a new task
function addTask() {
    // Get values from the input fields
    const taskInput = document.getElementById('task-input');
    const categorySelect = document.getElementById('category-select');
    const dueDateInput = document.getElementById('due-date-input');

    // Validation: make sure task isn't empty
    if (taskInput.value.trim() === '') {
        alert('Please enter a task!');
        return;
    }

    // Create a task object
    // Objects in JavaScript are like containers that hold related information
    const task = {
        id: Date.now(), // Unique ID using current timestamp
        text: taskInput.value,
        category: categorySelect.value,
        dueDate: dueDateInput.value,
        completed: false
    };

    // Add the new task to our tasks array
    tasks.push(task);

    // Save to browser storage
    saveTasks();

    // Update the display
    renderTasks();

    // Clear the input fields
    taskInput.value = '';
    dueDateInput.value = '';
}

// Function to delete a task
function deleteTask(id) {
    // Filter out the task with the matching ID
    // This creates a new array without the deleted task
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

// Function to toggle task completion
function toggleTask(id) {
    // Find the task and flip its completed status
    const task = tasks.find(task => task.id === id);
    if (task) {
        task.completed = !task.completed; // ! means "opposite of"
    }
    saveTasks();
    renderTasks();
}

// Function to filter tasks by category
function filterTasks() {
    renderTasks();
}

// Function to display tasks on the page
function renderTasks() {
    const tasksList = document.getElementById('tasks-list');
    const filterCategory = document.getElementById('filter-category').value;

    // Clear the current list
    tasksList.innerHTML = '';

    // Filter tasks based on selected category
    let filteredTasks = tasks;
    if (filterCategory !== 'All') {
        filteredTasks = tasks.filter(task => task.category === filterCategory);
    }

    // Sort tasks: incomplete first, then by due date
    filteredTasks.sort((a, b) => {
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        if (a.dueDate && b.dueDate) {
            return new Date(a.dueDate) - new Date(b.dueDate);
        }
        return 0;
    });

    // Create HTML for each task
    filteredTasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item' + (task.completed ? ' completed' : '');

        // Format the due date nicely
        let dueDateText = '';
        if (task.dueDate) {
            const date = new Date(task.dueDate);
            dueDateText = `📅 Due: ${date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            })}`;
        }

        // Build the HTML structure for this task
        taskElement.innerHTML = `
            <input type="checkbox"
                   class="task-checkbox"
                   ${task.completed ? 'checked' : ''}
                   onchange="toggleTask(${task.id})">
            <div class="task-content">
                <div class="task-text">${task.text}</div>
                <div class="task-meta">
                    <span class="task-category">${task.category}</span>
                    ${dueDateText ? `<span class="task-due">${dueDateText}</span>` : ''}
                </div>
            </div>
            <button class="task-delete" onclick="deleteTask(${task.id})">Delete</button>
        `;

        tasksList.appendChild(taskElement);
    });

    // Show message if no tasks
    if (filteredTasks.length === 0) {
        tasksList.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No tasks yet. Add one above!</p>';
    }
}

// Save tasks to browser storage
function saveTasks() {
    // JSON.stringify converts JavaScript objects to text for storage
    localStorage.setItem('movingTasks', JSON.stringify(tasks));
}

// Load tasks from browser storage
function loadTasks() {
    const saved = localStorage.getItem('movingTasks');
    if (saved) {
        // JSON.parse converts text back to JavaScript objects
        tasks = JSON.parse(saved);
    }
}

// ==================== SPACE PLANNER FUNCTIONS ====================

let furnitureItems = [];
let draggedElement = null;
let offsetX = 0;
let offsetY = 0;

// Function to add furniture to the room
function addFurniture(type) {
    const canvas = document.getElementById('room-canvas');

    // Create a new furniture element
    const furniture = document.createElement('div');
    furniture.className = 'furniture-item';
    furniture.textContent = getFurnitureIcon(type);

    // Random starting position
    furniture.style.left = Math.random() * 400 + 'px';
    furniture.style.top = Math.random() * 300 + 'px';

    // Make it draggable
    furniture.addEventListener('mousedown', startDrag);

    canvas.appendChild(furniture);

    // Save furniture position
    saveFurnitureState();
}

// Get icon for furniture type
function getFurnitureIcon(type) {
    const icons = {
        'bed': '🛏️ Bed',
        'sofa': '🛋️ Sofa',
        'table': '🪑 Table',
        'desk': '🖥️ Desk',
        'shelf': '📚 Shelf'
    };
    return icons[type] || '📦 Item';
}

// Start dragging furniture
function startDrag(e) {
    draggedElement = e.target;

    // Calculate offset so furniture doesn't jump
    const rect = draggedElement.getBoundingClientRect();
    const canvasRect = document.getElementById('room-canvas').getBoundingClientRect();

    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    // Add event listeners for dragging
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
}

// Drag the furniture
function drag(e) {
    if (!draggedElement) return;

    const canvas = document.getElementById('room-canvas');
    const canvasRect = canvas.getBoundingClientRect();

    // Calculate new position
    let newX = e.clientX - canvasRect.left - offsetX;
    let newY = e.clientY - canvasRect.top - offsetY;

    // Keep furniture inside the canvas
    newX = Math.max(0, Math.min(newX, canvasRect.width - draggedElement.offsetWidth));
    newY = Math.max(0, Math.min(newY, canvasRect.height - draggedElement.offsetHeight));

    draggedElement.style.left = newX + 'px';
    draggedElement.style.top = newY + 'px';
}

// Stop dragging
function stopDrag() {
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDrag);

    if (draggedElement) {
        saveFurnitureState();
        draggedElement = null;
    }
}

// Clear all furniture from room
function clearRoom() {
    if (confirm('Are you sure you want to clear the room?')) {
        document.getElementById('room-canvas').innerHTML = '';
        saveFurnitureState();
    }
}

// Save furniture positions to localStorage
function saveFurnitureState() {
    const canvas = document.getElementById('room-canvas');
    const items = canvas.querySelectorAll('.furniture-item');
    const furnitureData = [];

    items.forEach(item => {
        furnitureData.push({
            text: item.textContent,
            left: item.style.left,
            top: item.style.top
        });
    });

    localStorage.setItem('furnitureLayout', JSON.stringify(furnitureData));
}

// Load furniture from localStorage
function loadFurniture() {
    const saved = localStorage.getItem('furnitureLayout');
    if (saved) {
        const furnitureData = JSON.parse(saved);
        const canvas = document.getElementById('room-canvas');

        furnitureData.forEach(item => {
            const furniture = document.createElement('div');
            furniture.className = 'furniture-item';
            furniture.textContent = item.text;
            furniture.style.left = item.left;
            furniture.style.top = item.top;
            furniture.addEventListener('mousedown', startDrag);
            canvas.appendChild(furniture);
        });
    }
}

// Allow Enter key to add tasks
document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.getElementById('task-input');
    if (taskInput) {
        taskInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addTask();
            }
        });
    }
});