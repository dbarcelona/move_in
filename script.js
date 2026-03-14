// This array stores all our tasks
// In JavaScript, arrays are lists that hold multiple items
let tasks = [];
let floorPlanDrawn = false; // Track if floor plan has been drawn

// Load saved data when the page loads
// localStorage is browser storage that persists even after closing the page
window.onload = function() {
    loadTasks();
    renderTasks();
    // Draw floor plan since Space Planner is default tab
    drawFloorPlan();
    loadFurniture();
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
        // Draw floor plan if not already drawn
        if (!floorPlanDrawn) {
            drawFloorPlan();
            loadFurniture();
        }
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

let draggedElement = null;
let offsetX = 0;
let offsetY = 0;

// Draw the floor plan based on 1 Lakeside Dr #804
function drawFloorPlan() {
    const plan = document.getElementById('room-canvas');

    // Prevent double-drawing
    if (floorPlanDrawn) return;

    // Clear any existing content
    plan.innerHTML = '';

    // Living Room / Dining Area (open concept) - Corner unit
    const livingRoom = document.createElement('div');
    livingRoom.className = 'room';
    livingRoom.style.left = '0px';
    livingRoom.style.top = '0px';
    livingRoom.style.width = '500px';
    livingRoom.style.height = '400px';
    livingRoom.innerHTML = '<div class="room-label">LIVING / DINING ROOM</div>';
    plan.appendChild(livingRoom);

    // Windows on two walls (corner unit)
    const window1 = document.createElement('div');
    window1.className = 'window';
    window1.style.left = '0px';
    window1.style.top = '50px';
    window1.style.width = '10px';
    window1.style.height = '300px';
    plan.appendChild(window1);

    const window2 = document.createElement('div');
    window2.className = 'window';
    window2.style.left = '50px';
    window2.style.top = '390px';
    window2.style.width = '400px';
    window2.style.height = '10px';
    plan.appendChild(window2);

    // Kitchen
    const kitchen = document.createElement('div');
    kitchen.className = 'room';
    kitchen.style.left = '500px';
    kitchen.style.top = '0px';
    kitchen.style.width = '250px';
    kitchen.style.height = '200px';
    kitchen.innerHTML = '<div class="room-label">KITCHEN</div>';
    plan.appendChild(kitchen);

    // Entry Hallway
    const entry = document.createElement('div');
    entry.className = 'room';
    entry.style.left = '500px';
    entry.style.top = '200px';
    entry.style.width = '250px';
    entry.style.height = '100px';
    entry.innerHTML = '<div class="room-label">ENTRY</div>';
    plan.appendChild(entry);

    // Entry Door
    const door1 = document.createElement('div');
    door1.className = 'door';
    door1.style.left = '745px';
    door1.style.top = '240px';
    door1.style.width = '5px';
    door1.style.height = '40px';
    plan.appendChild(door1);

    // Bathroom
    const bathroom = document.createElement('div');
    bathroom.className = 'room';
    bathroom.style.left = '500px';
    bathroom.style.top = '300px';
    bathroom.style.width = '150px';
    bathroom.style.height = '150px';
    bathroom.innerHTML = '<div class="room-label">BATHROOM</div>';
    plan.appendChild(bathroom);

    // Bedroom
    const bedroom = document.createElement('div');
    bedroom.className = 'room';
    bedroom.style.left = '0px';
    bedroom.style.top = '400px';
    bedroom.style.width = '500px';
    bedroom.style.height = '250px';
    bedroom.innerHTML = '<div class="room-label">BEDROOM</div>';
    plan.appendChild(bedroom);

    // Bedroom window
    const window3 = document.createElement('div');
    window3.className = 'window';
    window3.style.left = '150px';
    window3.style.top = '640px';
    window3.style.width = '200px';
    window3.style.height = '10px';
    plan.appendChild(window3);

    // Closet
    const closet = document.createElement('div');
    closet.className = 'room';
    closet.style.left = '650px';
    closet.style.top = '300px';
    closet.style.width = '100px';
    closet.style.height = '150px';
    closet.style.background = '#e0e0e0';
    closet.innerHTML = '<div class="room-label">CLOSET</div>';
    plan.appendChild(closet);

    // Add measurement grid markers (every 5ft ≈ 60px)
    const gridSize = 60; // pixels per 5ft
    const maxWidth = 750;
    const maxHeight = 650;

    // Horizontal measurement markers
    for (let x = gridSize; x < maxWidth; x += gridSize) {
        const marker = document.createElement('div');
        marker.className = 'grid-marker-vertical';
        marker.style.left = x + 'px';
        marker.textContent = Math.round(x / 12) + 'ft'; // Approximate feet (60px ≈ 5ft)
        plan.appendChild(marker);
    }

    // Vertical measurement markers
    for (let y = gridSize; y < maxHeight; y += gridSize) {
        const marker = document.createElement('div');
        marker.className = 'grid-marker-horizontal';
        marker.style.top = y + 'px';
        marker.textContent = Math.round(y / 12) + 'ft';
        plan.appendChild(marker);
    }

    // Mark floor plan as drawn
    floorPlanDrawn = true;
}

// Function to add furniture with specified dimensions
function addFurniture(type, width, height) {
    const plan = document.getElementById('room-canvas');
    const furniture = document.createElement('div');
    furniture.className = 'furniture-item';
    furniture.textContent = getFurnitureLabel(type);
    furniture.style.width = width + 'px';
    furniture.style.height = height + 'px';

    // Random starting position
    furniture.style.left = (Math.random() * (plan.offsetWidth - width)) + 'px';
    furniture.style.top = (Math.random() * (plan.offsetHeight - height)) + 'px';

    // Make it draggable
    furniture.addEventListener('mousedown', startDrag);

    // Double-click to remove
    furniture.addEventListener('dblclick', function() {
        this.remove();
        saveFurniture();
    });

    plan.appendChild(furniture);
    saveFurniture();
}

// Get furniture label with icon
function getFurnitureLabel(type) {
    const labels = {
        'bed': '🛏️ Bed',
        'sofa': '🛋️ Sofa',
        'loveseat': '🪑 Loveseat',
        'table': '🍽️ Table',
        'desk': '🖥️ Desk',
        'chair': '💺 Chair',
        'tv': '📺 TV',
        'bookshelf': '📚 Shelf',
        'nightstand': '🛏️ Stand',
        'dresser': '👔 Dresser'
    };
    return labels[type] || '📦 Item';
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

    // Apartment boundaries (exterior walls only - no room restrictions)
    // Can place any furniture anywhere inside the apartment
    const apartmentBounds = {
        left: 0,
        top: 0,
        right: 750,  // Right wall of apartment
        bottom: 650  // Bottom wall of apartment
    };

    // Keep furniture inside apartment walls (can't go outside)
    newX = Math.max(apartmentBounds.left, Math.min(newX, apartmentBounds.right - draggedElement.offsetWidth));
    newY = Math.max(apartmentBounds.top, Math.min(newY, apartmentBounds.bottom - draggedElement.offsetHeight));

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

// Clear all furniture from room (keeps floor plan)
function clearRoom() {
    if (confirm('Remove all furniture? The floor plan will remain.')) {
        const items = document.querySelectorAll('.furniture-item');
        items.forEach(item => item.remove());
        saveFurniture();
    }
}

// Save furniture positions to localStorage
function saveFurniture() {
    const items = document.querySelectorAll('.furniture-item');
    const data = [];

    items.forEach(item => {
        data.push({
            text: item.textContent,
            left: item.style.left,
            top: item.style.top,
            width: item.style.width,
            height: item.style.height
        });
    });

    localStorage.setItem('lakesideFurniture', JSON.stringify(data));
}

// Load furniture from localStorage
function loadFurniture() {
    const saved = localStorage.getItem('lakesideFurniture');
    if (saved) {
        const data = JSON.parse(saved);
        const plan = document.getElementById('room-canvas');

        data.forEach(item => {
            const furniture = document.createElement('div');
            furniture.className = 'furniture-item';
            furniture.textContent = item.text;
            furniture.style.left = item.left;
            furniture.style.top = item.top;
            furniture.style.width = item.width;
            furniture.style.height = item.height;
            furniture.addEventListener('mousedown', startDrag);
            furniture.addEventListener('dblclick', function() {
                this.remove();
                saveFurniture();
            });
            plan.appendChild(furniture);
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