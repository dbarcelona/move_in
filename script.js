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

// Backup: Use DOMContentLoaded as well
document.addEventListener('DOMContentLoaded', function() {
    // Short delay to ensure DOM is fully ready
    setTimeout(function() {
        if (!floorPlanDrawn) {
            drawFloorPlan();
            loadFurniture();
        }
    }, 100);
});

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

// Draw the floor plan - uses custom layout from Floor Plan Creator
function drawFloorPlan() {
    const plan = document.getElementById('room-canvas');

    // Check if element exists
    if (!plan) return;

    // Prevent double-drawing
    if (floorPlanDrawn) return;

    // Clear any existing content
    plan.innerHTML = '';

    // Try to load custom floor plan first
    const customPlan = localStorage.getItem('customFloorPlan');
    if (customPlan) {
        drawCustomFloorPlan(plan, customPlan);
        floorPlanDrawn = true;
        return;
    }

    // Fallback to default layout if no custom plan
    drawDefaultFloorPlan(plan);
}

// Draw custom floor plan from Floor Plan Creator
function drawCustomFloorPlan(plan, customPlanJSON) {
    const rooms = JSON.parse(customPlanJSON);

    rooms.forEach(roomData => {
        const room = document.createElement('div');
        room.className = 'room';
        room.style.left = roomData.left;
        room.style.top = roomData.top;
        room.style.width = roomData.width;
        room.style.height = roomData.height;

        const label = document.createElement('div');
        label.className = 'room-label';
        label.textContent = roomData.label;
        room.appendChild(label);

        plan.appendChild(room);
    });
}

// Default floor plan (fallback)
function drawDefaultFloorPlan(plan) {

    // Add buffer margin (20px from edges)
    const margin = 20;

    // Entry area - bottom left when you walk in
    const entry = document.createElement('div');
    entry.className = 'room';
    entry.style.left = margin + 'px';
    entry.style.top = (500 + margin) + 'px';
    entry.style.width = '150px';
    entry.style.height = '100px';
    entry.innerHTML = '<div class="room-label">ENTRY</div>';
    plan.appendChild(entry);

    // Entry Door (on bottom wall)
    const entryDoor = document.createElement('div');
    entryDoor.className = 'door';
    entryDoor.style.left = (margin + 60) + 'px';
    entryDoor.style.top = (595 + margin) + 'px';
    entryDoor.style.width = '40px';
    entryDoor.style.height = '5px';
    plan.appendChild(entryDoor);

    // Kitchen - to the RIGHT of entry (U-shaped)
    const kitchen = document.createElement('div');
    kitchen.className = 'room';
    kitchen.style.left = (190 + margin) + 'px';
    kitchen.style.top = (400 + margin) + 'px';
    kitchen.style.width = '200px';
    kitchen.style.height = '200px';
    kitchen.innerHTML = '<div class="room-label">KITCHEN (U-shaped)</div>';
    plan.appendChild(kitchen);

    // Living/Dining Room - in FRONT of kitchen (right side of U, corner unit)
    const livingRoom = document.createElement('div');
    livingRoom.className = 'room';
    livingRoom.style.left = (190 + margin) + 'px';
    livingRoom.style.top = margin + 'px';
    livingRoom.style.width = '380px';
    livingRoom.style.height = '380px';
    livingRoom.innerHTML = '<div class="room-label">LIVING / DINING ROOM</div>';
    plan.appendChild(livingRoom);

    // Corner unit windows (top and right walls)
    const windowTop = document.createElement('div');
    windowTop.className = 'window';
    windowTop.style.left = (240 + margin) + 'px';
    windowTop.style.top = margin + 'px';
    windowTop.style.width = '280px';
    windowTop.style.height = '10px';
    plan.appendChild(windowTop);

    const windowRight = document.createElement('div');
    windowRight.className = 'window';
    windowRight.style.left = (560 + margin) + 'px';
    windowRight.style.top = (50 + margin) + 'px';
    windowRight.style.width = '10px';
    windowRight.style.height = '280px';
    plan.appendChild(windowRight);

    // Hallway area - walk forward from entry, doorway to left
    const hallway = document.createElement('div');
    hallway.className = 'room';
    hallway.style.left = margin + 'px';
    hallway.style.top = (380 + margin) + 'px';
    hallway.style.width = '170px';
    hallway.style.height = '100px';
    hallway.style.background = '#f0f0f0';
    hallway.innerHTML = '<div class="room-label">HALLWAY</div>';
    plan.appendChild(hallway);

    // Bedroom - straight ahead through hallway doorway
    const bedroom = document.createElement('div');
    bedroom.className = 'room';
    bedroom.style.left = margin + 'px';
    bedroom.style.top = margin + 'px';
    bedroom.style.width = '170px';
    bedroom.style.height = '260px';
    bedroom.innerHTML = '<div class="room-label">BEDROOM</div>';
    plan.appendChild(bedroom);

    // Bedroom door
    const bedroomDoor = document.createElement('div');
    bedroomDoor.className = 'door';
    bedroomDoor.style.left = (80 + margin) + 'px';
    bedroomDoor.style.top = (255 + margin) + 'px';
    bedroomDoor.style.width = '5px';
    bedroomDoor.style.height = '40px';
    plan.appendChild(bedroomDoor);

    // Bedroom window
    const bedroomWindow = document.createElement('div');
    bedroomWindow.className = 'window';
    bedroomWindow.style.left = (40 + margin) + 'px';
    bedroomWindow.style.top = margin + 'px';
    bedroomWindow.style.width = '100px';
    bedroomWindow.style.height = '10px';
    plan.appendChild(bedroomWindow);

    // Bathroom - to the LEFT of bedroom door (in hallway area)
    const bathroom = document.createElement('div');
    bathroom.className = 'room';
    bathroom.style.left = margin + 'px';
    bathroom.style.top = (280 + margin) + 'px';
    bathroom.style.width = '80px';
    bathroom.style.height = '80px';
    bathroom.innerHTML = '<div class="room-label">BATH</div>';
    plan.appendChild(bathroom);

    // Bathroom door
    const bathroomDoor = document.createElement('div');
    bathroomDoor.className = 'door';
    bathroomDoor.style.left = (35 + margin) + 'px';
    bathroomDoor.style.top = (355 + margin) + 'px';
    bathroomDoor.style.width = '5px';
    bathroomDoor.style.height = '30px';
    plan.appendChild(bathroomDoor);

    // Laundry - to the LEFT of bathroom door
    const laundry = document.createElement('div');
    laundry.className = 'room';
    laundry.style.left = (100 + margin) + 'px';
    laundry.style.top = (280 + margin) + 'px';
    laundry.style.width = '70px';
    laundry.style.height = '80px';
    laundry.style.background = '#e8e8e8';
    laundry.innerHTML = '<div class="room-label">LAUNDRY</div>';
    plan.appendChild(laundry);

    // Laundry door
    const laundryDoor = document.createElement('div');
    laundryDoor.className = 'door';
    laundryDoor.style.left = (115 + margin) + 'px';
    laundryDoor.style.top = (355 + margin) + 'px';
    laundryDoor.style.width = '5px';
    laundryDoor.style.height = '30px';
    plan.appendChild(laundryDoor);

    // Add measurement grid markers (every 5ft ≈ 60px)
    const gridSize = 60; // pixels per 5ft
    const maxWidth = 590;
    const maxHeight = 620;

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
// End of drawDefaultFloorPlan

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
        right: canvasRect.width,
        bottom: canvasRect.height
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