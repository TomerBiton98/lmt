// ===============================
// INITIALIZATION & CORE SETUP
// ===============================
document.addEventListener('DOMContentLoaded', () => {
	console.log("Welcome to the Knowledge Retention Platform!");

	// Section: Gantt Chart and Analytics
	if (typeof initializeCharts === "function") initializeCharts();

	// Section: Project Management
	if (typeof handleProjectManagement === "function") handleProjectManagement();

	// Sidebar hover effect
	if (typeof handleSidebarHover === "function") handleSidebarHover();
});

// ===============================
// CHART VISUALIZATION dashboard.html
// ===============================
function initializeCharts() {
	// Bar Chart for Document Versions
	const versionCtx = document.getElementById('version-chart')?.getContext('2d');
	if (versionCtx) {
		new Chart(versionCtx, {
			type: 'bar',
			data: {
				labels: ['January', 'February', 'March', 'April', 'May'],
				datasets: [{
					label: 'Document submission',
					data: [5, 10, 15, 8, 12],
					backgroundColor: 'rgba(75, 192, 192, 0.6)',
					borderColor: 'rgba(75, 192, 192, 1)',
					borderWidth: 1,
				}]
			},
			options: {
				responsive: true,
				scales: {
					y: {
						beginAtZero: true
					}
				},
			},
		});
	}


	// Doughnut Chart for Team Contributions based on versions uploaded
	const teamCtx = document.getElementById('team-chart')?.getContext('2d');
	if (teamCtx) {
		// Example dynamic data, replace with your actual data fetching logic
		const versionData = [{
				assignee: 'John Doe',
				versions: 10
			},
			{
				assignee: 'Jane Smith',
				versions: 15
			},
			{
				assignee: 'Mike Johnson',
				versions: 5
			},
		];

		const assignees = versionData.map(item => item.assignee);
		const contributions = versionData.map(item => item.versions);

		new Chart(teamCtx, {
			type: 'doughnut',
			data: {
				labels: assignees,
				datasets: [{
					label: 'Team Contributions',
					data: contributions,
					backgroundColor: [
						'rgba(255, 99, 132, 0.6)',
						'rgba(54, 162, 235, 0.6)',
						'rgba(255, 206, 86, 0.6)',
					],
				}]
			},
			options: {
				responsive: true,
				plugins: {
					legend: {
						position: 'top',
					},
				},
			},
		});
	}

	// Gantt Chart for Project Timeline
	const ganttCtx = document.getElementById('gantt-chart')?.getContext('2d');
	if (ganttCtx) {
		new Chart(ganttCtx, {
			type: 'line',
			data: {
				labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
				datasets: [{
					label: 'Project Progress',
					data: [20, 50, 70, 90],
					borderColor: '#36a2eb',
					fill: false,
				}]
			},
			options: {
				responsive: true,
				scales: {
					y: {
						beginAtZero: true
					}
				},
			},
		});
	}
}

// ===============================
// UI COMPONENTS
// ===============================
function handleSidebarHover() {
	const sidebar = document.querySelector('.sidebar');

	if (sidebar) {
		sidebar.addEventListener('mouseenter', () => {
			sidebar.classList.add('expanded');
		});

		sidebar.addEventListener('mouseleave', () => {
			sidebar.classList.remove('expanded');
		});
	}

	document.addEventListener('DOMContentLoaded', () => {
		const sidebar = document.querySelector('.sidebar');
		const toggleSidebar = document.createElement('div');
		toggleSidebar.classList.add('toggle-sidebar');
		toggleSidebar.innerHTML = '&#9776;'; // Hamburger icon
		document.body.appendChild(toggleSidebar);

		const overlay = document.createElement('div');
		overlay.classList.add('sidebar-overlay');
		document.body.appendChild(overlay);

		// Toggle sidebar and overlay visibility
		const toggleMenu = () => {
			sidebar.classList.toggle('active');
			overlay.classList.toggle('active');
			document.body.classList.toggle('no-scroll');
		};

		toggleSidebar.addEventListener('click', toggleMenu);
		overlay.addEventListener('click', toggleMenu);
	});
}
// ===============================
// index.html folder section
// ===============================
document.addEventListener('DOMContentLoaded', () => {
	let folders = JSON.parse(localStorage.getItem('folders')) || {};
	const folderList = document.getElementById('folder-list');
	const fileList = document.getElementById('file-list');
	const createFolderBtn = document.getElementById('create-folder');
	const backToFolders = document.getElementById('back-to-folders');
	const fileUpload = document.getElementById('file-upload');
	const fileSearch = document.getElementById('file-search');
	const fileTypeFilter = document.getElementById('file-type-filter');
	const folderCountElement = document.getElementById('folder-count');

	// Function to update folder count
	const updateFolderCount = () => {
		const uniqueFoldersCount = Object.keys(folders).length;
		folderCountElement.textContent = uniqueFoldersCount;
	};

	let currentFolder = null;

	const saveToLocalStorage = () => {
		localStorage.setItem('folders', JSON.stringify(folders));
	};

	const renderFolders = () => {
		folderList.innerHTML = '';
		Object.keys(folders).forEach((folderName) => {
			const folderItem = document.createElement('li');
			folderItem.classList.add('folder-item');
			folderItem.innerHTML = `
                <div class="folder-details">
                    <img src="images/folder.svg" alt="Folder Icon" class="folder-icon">
                    <span class="folder-name">${folderName}</span>
                </div>
                <div class="folder-actions">
                    <button class="btn delete-folder-btn">Delete</button>
                    <button class="btn share-folder-btn">Share</button>
                </div>
            `;
			folderItem.querySelector('.delete-folder-btn').addEventListener('click', () => deleteFolder(folderName));
			folderItem.querySelector('.share-folder-btn').addEventListener('click', () => shareFolder(folderName));
			folderItem.querySelector('.folder-details').addEventListener('click', () => openFolder(folderName));
			folderList.appendChild(folderItem);
		});
		// Update folder count every time folders are rendered
		updateFolderCount();
	};

	const deleteFolder = (folderName) => {
		if (confirm(`Are you sure you want to delete the folder: ${folderName}?`)) {
			delete folders[folderName];
			saveToLocalStorage();
			renderFolders();
		}
	};

	const shareFolder = (folderName) => {
		const folderData = JSON.stringify(folders[folderName], null, 2);
		const encodedData = encodeURIComponent(folderData);
		const url = `https://wa.me/?text=Check out the folder: ${folderName}\nFiles:\n${folderData}`;
		window.open(url, '_blank');
	};

	const openFolder = (folderName) => {
		currentFolder = folderName;
		document.getElementById('folder-view').style.display = 'none';
		document.getElementById('file-view').style.display = 'block';
		renderFiles(folders[folderName]);
	};

	const backToFolderView = () => {
		currentFolder = null;
		document.getElementById('folder-view').style.display = 'block';
		document.getElementById('file-view').style.display = 'none';
	};

	const renderFiles = (files) => {
		fileList.innerHTML = '';
		if (!files || files.length === 0) {
			fileList.innerHTML = '<li class="no-files">No files found.</li>';
			return;
		}
		files.forEach((file, index) => {
			const fileItem = document.createElement('li');
			fileItem.classList.add('file-item');
			fileItem.innerHTML = `
                <div class="file-details">
                    <span class="file-name">${file.name}</span>
                    <span class="file-type">${file.type.toUpperCase()}</span>
                    <span class="file-size">${file.size}</span>
                    <span class="file-date">${file.uploaded}</span>
                </div>
                <div class="file-actions">
                    <button class="btn preview-btn">Preview</button>
                    <button class="btn delete-btn">Delete</button>
                    <button class="btn share-btn">Share</button>
                </div>
            `;

			fileItem.querySelector('.preview-btn').addEventListener('click', () => previewFile(file));
			fileItem.querySelector('.delete-btn').addEventListener('click', () => deleteFile(index));
			fileItem.querySelector('.share-btn').addEventListener('click', () => shareFile(file));

			fileList.appendChild(fileItem);
		});
	};

	const previewFile = (file) => {
		alert(`Previewing file: ${file.name}`);
	};

	const deleteFile = (index) => {
		if (confirm('Are you sure you want to delete this file?')) {
			folders[currentFolder].splice(index, 1);
			saveToLocalStorage();
			renderFiles(folders[currentFolder]);
		}
	};

	const shareFile = (file) => {
		const fileData = encodeURIComponent(JSON.stringify(file));
		const url = `https://wa.me/?text=Check out this file: ${file.name}\nDetails:\n${fileData}`;
		window.open(url, '_blank');
	};

	const uploadFile = (event) => {
		const file = event.target.files[0];
		if (file && currentFolder) {
			const fileType = file.name.split('.').pop();
			const newFile = {
				name: file.name,
				type: fileType,
				size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
				uploaded: new Date().toISOString().split('T')[0],
			};
			folders[currentFolder].push(newFile);
			saveToLocalStorage();
			renderFiles(folders[currentFolder]);
		}
	};

	const createFolder = () => {
		const folderName = prompt('Enter folder name:');
		if (folderName && !folders[folderName]) {
			folders[folderName] = [];
			saveToLocalStorage();
			renderFolders();
		} else {
			alert('Folder already exists or invalid name.');
		}
		// Update folder count after creating a folder
		updateFolderCount();
	};

	// Add event listeners
	fileUpload.addEventListener('change', uploadFile);
	createFolderBtn.addEventListener('click', createFolder);
	backToFolders.addEventListener('click', backToFolderView);

	// Initial rendering
	renderFolders();
});


// ===============================
// dashboard.html "Document Versions Overview" section
// ===============================
document.addEventListener("DOMContentLoaded", () => {
	// Retrieve stored projects from localStorage or initialize as an empty array
	const projects = JSON.parse(localStorage.getItem("projects")) || [];

	// DOM elements
	const addProjectButton = document.getElementById("add-project");
	const projectList = document.getElementById("project-list");
	const searchProject = document.getElementById("search-project");
	const filterProjects = document.getElementById("filter-projects");

	// Function to render projects dynamically
	const renderProjects = () => {
		projectList.innerHTML = ""; // Clear existing project list

		// Filter projects based on search input and filter criteria
		const filteredProjects = projects.filter((project) => {
			const matchesSearch = project.name.toLowerCase().includes(searchProject.value.toLowerCase());
			switch (filterProjects.value) {
				case "completed":
					return project.status === "completed" && matchesSearch;
				case "ongoing":
					return project.status === "ongoing" && matchesSearch;
				case "overdue":
					return project.status === "overdue" && matchesSearch;
				default:
					return matchesSearch;
			}
		});

		// Create project cards dynamically
		filteredProjects.forEach((project) => {
			const projectCard = document.createElement("div");
			projectCard.classList.add("project-card");
			projectCard.innerHTML = `
                <h2>${project.name}</h2>
                <p>${project.description}</p>
                <p>Deadline: ${project.deadline}</p>
                <p>Status: <strong>${project.status}</strong></p>
                <div class="project-actions">
                    <button class="delete-btn" onclick="deleteProject('${project.id}')">Delete</button>
                    <button class="mark-complete-btn" onclick="markProjectComplete('${project.id}')">Mark as Complete</button>
                </div>
            `;
			projectList.appendChild(projectCard);
		});

		if (filteredProjects.length === 0) {
			projectList.innerHTML = `<p class="no-projects">No projects found matching your criteria.</p>`;
		}
	};

	// Function to add a new project
	const addProject = () => {
		const name = document.getElementById("project-name").value.trim();
		const deadline = document.getElementById("project-deadline").value;
		const description = document.getElementById("project-description").value.trim();

		// Validate input fields
		if (!name || !deadline || !description) {
			alert("Please fill out all fields.");
			return;
		}

		// Create a new project object
		const newProject = {
			id: Date.now().toString(), // Unique ID based on timestamp
			name,
			deadline,
			description,
			status: "ongoing", // Default status for new projects
		};

		// Add the new project to the projects array and save to localStorage
		projects.push(newProject);
		localStorage.setItem("projects", JSON.stringify(projects));

		// Re-render projects and reset input fields
		renderProjects();
		clearFields();
	};

	// Function to clear input fields after adding a project
	const clearFields = () => {
		document.getElementById("project-name").value = "";
		document.getElementById("project-deadline").value = "";
		document.getElementById("project-description").value = "";
	};

	// Function to delete a project by ID
	const deleteProject = (id) => {
		const index = projects.findIndex((project) => project.id === id);
		if (index > -1) {
			if (confirm("Are you sure you want to delete this project?")) {
				projects.splice(index, 1);
				localStorage.setItem("projects", JSON.stringify(projects));
				renderProjects();
			}
		}
	};

	// Function to mark a project as complete
	const markProjectComplete = (id) => {
		const project = projects.find((project) => project.id === id);
		if (project) {
			project.status = "completed";
			localStorage.setItem("projects", JSON.stringify(projects));
			renderProjects();
		}
	};

	// Attach global functions for dynamically created buttons
	window.deleteProject = deleteProject;
	window.markProjectComplete = markProjectComplete;

	// Event listeners for adding, searching, and filtering projects
	if (addProjectButton) addProjectButton.addEventListener("click", addProject);
	if (searchProject) searchProject.addEventListener("input", renderProjects);
	if (filterProjects) filterProjects.addEventListener("change", renderProjects);

	// Initial render of projects
	renderProjects();
});
// ===============================
// VERSION CONTROL SYSTEM index.html
// ===============================
document.addEventListener('DOMContentLoaded', () => {
	const versions = JSON.parse(localStorage.getItem('versions')) || {};
	const folderBank = JSON.parse(localStorage.getItem('folders')) || {}; // Load folder names from localStorage
	const versionList = document.getElementById('version-control-list');
	const submitVersionBtn = document.getElementById('submit-version-btn');
	const versionNotes = document.getElementById('version-notes');
	const versionFile = document.getElementById('version-file');
	const assigneeSelect = document.getElementById('assignee-select');
	const Versioncount = document.getElementById('Version-count');

	// Populate assignee dropdown with folder names
	const populateAssigneeDropdown = () => {
		assigneeSelect.innerHTML = '<option value="">Select Assignee</option>';
		Object.keys(folderBank).forEach(folderName => {
			const option = document.createElement('option');
			option.value = folderName;
			option.textContent = folderName;
			assigneeSelect.appendChild(option);
		});
	};

	// Function to calculate the next version ID
	const getNextVersionId = () => {
		if (Object.keys(versions).length === 0) {
			return '0.1'; // Start at 0.1 if no versions exist
		}

		// Find the highest version ID and increment by 0.1
		const versionNumbers = Object.keys(versions).map((id) => parseFloat(id.split('-')[1]));
		const nextVersion = Math.max(...versionNumbers) + 0.1;
		return nextVersion.toFixed(1); // Ensure one decimal point
	};

	// Function to update the "Versions count" count
	const updateVersioncount = () => {
		const uniqueVersionsCount = Object.keys(versions).length;
		Versioncount.textContent = uniqueVersionsCount;
	};

	// Function to render versions (latest version on top)
	const renderVersions = () => {
		versionList.innerHTML = '';

		// Sort versions by ID in descending order (latest first)
		const sortedVersions = Object.entries(versions).sort(([idA], [idB]) => {
			return parseInt(idB.replace(/\D/g, '')) - parseInt(idA.replace(/\D/g, ''));
		});

		// Render each version
		for (const [versionId, version] of sortedVersions) {
			const versionItem = document.createElement('div');
			versionItem.className = 'version-item';
			versionItem.innerHTML = `
            <p><strong>Version:</strong> ${version.id}</p>
            <p><strong>Notes:</strong> ${version.notes}</p>
            <p><strong>Assignee:</strong> ${version.assignee || 'Unassigned'}</p>
            <p><strong>Uploaded:</strong> ${version.date}</p>
            <a id="Download-Version" href="${version.file}" target="_blank">Download File</a>
            <button id="Delete-Version" onclick="deleteVersion('${versionId}')">Delete</button>
        `;
			versionList.appendChild(versionItem);
		}

		// Update document count after rendering versions
		updateVersioncount();
	};
	// Add version
	submitVersionBtn.addEventListener('click', () => {
		const file = versionFile.files[0];
		const notes = versionNotes.value.trim();
		const assignee = assigneeSelect.value;

		if (!file || !notes) {
			alert('Please add both file and notes.');
			return;
		}

		if (!assignee) {
			alert('Please select an assignee.');
			return;
		}

		const versionId = `version-${getNextVersionId()}`;
		const newVersion = {
			id: versionId.split('-')[1], // Extract the numerical version ID
			notes,
			assignee,
			date: new Date().toLocaleString(),
			file: URL.createObjectURL(file),
		};

		versions[versionId] = newVersion;
		localStorage.setItem('versions', JSON.stringify(versions));
		renderVersions();
		alert('Version added successfully.');
		versionNotes.value = '';
		versionFile.value = '';
		assigneeSelect.value = ''; // Reset the assignee dropdown
	});


	// Delete version
	window.deleteVersion = (id) => {
		if (confirm(`Are you sure you want to delete ${id}?`)) {
			delete versions[id];
			localStorage.setItem('versions', JSON.stringify(versions));
			renderVersions();
			alert(`${id} has been deleted.`);
		}
	};

	populateAssigneeDropdown(); // Populate dropdown on load
	renderVersions(); // Initial render of versions
});

// ===============================
// VERSION CONTROL SYSTEM dashboard.html
// ===============================
document.addEventListener('DOMContentLoaded', () => {
	const versionsOverviewList = document.getElementById('versions-overview-list');
	const versions = JSON.parse(localStorage.getItem('versions')) || {};

	for (const [versionId, version] of Object.entries(versions)) {
		const versionOverview = document.createElement('div');
		versionOverview.className = 'overview-item';
		versionOverview.innerHTML = `
            <p><strong>Version:</strong> ${version.id}</p>
            <p><strong>notes:</strong> ${version.notes}</p>
            <p><strong>Assignee:</strong> ${version.assignee || 'Not Assigned'}</p>
            <p><strong>Uploaded:</strong> ${version.date}</p>
            <button id="Delete-Version" onclick="deleteVersion('${versionId}')">Delete</button>
        `;
		versionsOverviewList.appendChild(versionOverview);
	}

	// Delete version
	window.deleteVersion = (id) => {
		if (confirm(`Are you sure you want to delete ${id}?`)) {
			delete versions[id];
			localStorage.setItem('versions', JSON.stringify(versions));
			renderVersions();
			alert(`${id} has been deleted.`);
		}
	};

});

// ===============================
// KANBAN BOARD
// ===============================
// Kanban Board Initialization
document.addEventListener('DOMContentLoaded', () => {
	const kanbanColumns = document.querySelectorAll('.kanban-column');
	const assigneeSelect = document.getElementById('assignee-select');
	let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

	// Check if kanban columns exist before initializing
	if (kanbanColumns.length === 0) {
		console.warn('No Kanban columns found on the page.');
		return;
	}
	const populateAssigneeDropdown = () => {
		assigneeSelect.innerHTML = '<option value="">Select Assignee</option>';
		Object.keys(folderBank).forEach(folderName => {
			const option = document.createElement('option');
			option.value = folderName;
			option.textContent = folderName;
			assigneeSelect.appendChild(option);
		});
	};

	// Initialize the Kanban board
	renderTasks();

	// Drag-and-drop event listeners for columns
	kanbanColumns.forEach(column => {
		column.addEventListener('dragover', handleDragOver);
		column.addEventListener('dragenter', handleDragEnter);
		column.addEventListener('dragleave', handleDragLeave);
		column.addEventListener('drop', handleDrop);
	});

	// Task form handling
	const taskForm = document.getElementById('task-form');
	if (taskForm) {
		taskForm.addEventListener('submit', handleTaskFormSubmit);
	} else {
		console.warn('Task form not found on the page.');
	}

	// Event Handlers
	function handleDragOver(e) {
		e.preventDefault();
	}

	function handleDragEnter(e) {
		e.preventDefault();
		this.classList.add('dragging-over');
	}

	function handleDragLeave() {
		this.classList.remove('dragging-over');
	}

	function handleDrop(e) {
		e.preventDefault();
		const taskId = e.dataTransfer.getData('text/plain');
		const taskElement = document.getElementById(taskId);
		if (taskElement && this.querySelector('.kanban-cards')) {
			this.querySelector('.kanban-cards').appendChild(taskElement);
			this.classList.remove('dragging-over');

			// Update task status
			const newStatus = this.dataset.status;
			updateTaskStatus(taskId, newStatus);
		}
	}

	function handleDragStart(e) {
		e.dataTransfer.setData('text/plain', this.id);
		setTimeout(() => {
			this.style.display = 'none';
		}, 0);
	}

	function handleDragEnd() {
		this.style.display = 'block';
	}

	function handleTaskFormSubmit(e) {
		e.preventDefault();

		// Get task data from form inputs
		const taskTitle = document.getElementById('task-title')?.value.trim();
		const taskDetails = document.getElementById('task-details')?.value.trim();
		const taskPriority = document.getElementById('task-priority')?.value;
		const taskAssignee = document.getElementById('task-assignee')?.value;
		const taskFile = document.getElementById('task-file')?.files[0];

		if (!taskTitle || !taskDetails) {
			alert('Please fill out all fields.');
			return;
		}

		// Create a new task object
		const newTask = {
			id: `task-${Date.now()}`,
			name: taskTitle,
			description: taskDetails,
			priority: taskPriority,
			assignee: taskAssignee,
			file: taskFile ? taskFile.name : 'No file attached',
			status: 'to-do'
		};

		// Add task to localStorage and update the UI
		tasks.push(newTask);
		localStorage.setItem('tasks', JSON.stringify(tasks));

		const taskCard = createTaskCard(newTask);
		const todoColumn = document.getElementById('todo-column');
		if (todoColumn && taskCard) {
			todoColumn.appendChild(taskCard);
		} else {
			console.warn('To-Do column not found.');
		}

		// Reset form and update task counts
		if (taskForm) {
			taskForm.reset();
		}
		updateTaskCounts();
	}

	// Helper Functions
	function createTaskCard(task) {
		if (!task || !task.id) return null; // Ensure task object is valid

		const card = document.createElement('div');
		card.id = task.id;
		card.className = 'kanban-card';
		card.draggable = true;
		card.innerHTML = `
            <h3>${task.name}</h3>
            <p>${task.description}</p>
            <div class="task-metadata">
                <p>Priority: ${task.priority}</p>
                <p>Assignee: ${task.assignee}</p>
                <p>File: <a href="#" onclick="alert('File download feature coming soon!')">${task.file}</a></p>
            </div>
        `;

		// Add drag event listeners to the card
		card.addEventListener('dragstart', handleDragStart);
		card.addEventListener('dragend', handleDragEnd);

		return card; // Ensure the function returns a valid Node
	}

	function updateTaskStatus(taskId, newStatus) {
		const task = tasks.find(t => t.id === taskId);
		if (task) {
			task.status = newStatus;
			localStorage.setItem('tasks', JSON.stringify(tasks));
			updateTaskCounts();
		}
	}

	function updateTaskCounts() {
		kanbanColumns.forEach(column => {
			const count = column.querySelectorAll('.kanban-card').length;
			const taskCountElement = column.querySelector('.task-count');
			if (taskCountElement) {
				taskCountElement.textContent = `(${count})`;
			}
		});
	}

	function renderTasks() {
		tasks.forEach(task => {
			const column = document.getElementById(`${task.status}-column`);
			if (column) {
				const taskCard = createTaskCard(task);
				if (taskCard) {
					const kanbanCardsContainer = column.querySelector('.kanban-cards');
					if (kanbanCardsContainer) {
						kanbanCardsContainer.appendChild(taskCard);
					} else {
						console.warn('Kanban cards container not found in column:', column);
					}
				}
			}
		});

		// After rendering, re-attach drag-and-drop event listeners
		const kanbanCards = document.querySelectorAll('.kanban-card');
		kanbanCards.forEach(card => {
			card.addEventListener('dragstart', handleDragStart);
			card.addEventListener('dragend', handleDragEnd);
		});

		updateTaskCounts();
	}

	// Add styles for drag-over effect
	const styleElement = document.createElement('style');
	styleElement.textContent = `
        .kanban-column.dragging-over {
            background-color: #f4f4f4;
            transition: background-color 0.3s ease;
        }
    `;
	document.head.appendChild(styleElement);
});


// ===============================
// setting.html 
// ===============================

document.addEventListener('DOMContentLoaded', () => {
    // Load saved profile picture from localStorage
    const savedProfilePic = localStorage.getItem('profilePic');
    if (savedProfilePic) {
        document.getElementById('profile-pic-preview').src = savedProfilePic;
        updateProfilePicOnPages(savedProfilePic);
    }

    // Load theme preference
    const isDarkMode = localStorage.getItem('darkMode') === 'enabled';
    document.getElementById('theme-toggle').checked = isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);

    // Load username and email if saved
    document.getElementById('username').value = localStorage.getItem('username') || '';
    document.getElementById('email').value = localStorage.getItem('email') || '';

    // Profile Picture Upload
    document.getElementById('profile-pic-upload').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function() {
                document.getElementById('profile-pic-preview').src = reader.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Save Profile Picture
    document.getElementById('save-profile-pic').addEventListener('click', () => {
        const profilePicSrc = document.getElementById('profile-pic-preview').src;
        localStorage.setItem('profilePic', profilePicSrc);
        updateProfilePicOnPages(profilePicSrc);
        alert('Profile picture updated successfully!');
    });

    // Save Profile Information
    document.getElementById('save-profile').addEventListener('click', () => {
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        localStorage.setItem('username', username);
        localStorage.setItem('email', email);
        alert('Profile updated successfully!');
    });

    // Dark Mode Toggle
    document.getElementById('theme-toggle').addEventListener('change', function() {
        if (this.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'enabled');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'disabled');
        }
    });

    // Logout
    document.getElementById('logout').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'login.html';
    });

    // Delete Account
    document.getElementById('delete-account').addEventListener('click', () => {
        if (confirm('Are you sure you want to delete your account?')) {
            localStorage.clear();
            window.location.href = 'login.html';
        }
    });

    // Function to update profile picture on all pages
    function updateProfilePicOnPages(newProfilePic) {
        document.querySelectorAll('.user-profile img').forEach(img => {
            img.src = newProfilePic;
        });
    }
});


document.addEventListener('DOMContentLoaded', () => {
    // Load saved profile picture from localStorage
    const savedProfilePic = localStorage.getItem('profilePic');
    if (savedProfilePic) {
        document.querySelectorAll('.user-profile img').forEach(img => {
            img.src = savedProfilePic;
        });
    }

    // Profile Picture Upload
    document.getElementById('profile-pic-upload').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function() {
                const newProfilePic = reader.result;
                document.getElementById('profile-pic-preview').src = newProfilePic;

                // Update profile picture across all pages
                document.querySelectorAll('.user-profile img').forEach(img => {
                    img.src = newProfilePic;
                });

                // Save to LocalStorage
                localStorage.setItem('profilePic', newProfilePic);
            };
            reader.readAsDataURL(file);
        }
    });

    // Save Profile Picture
    document.getElementById('save-profile-pic').addEventListener('click', () => {
        const profilePicSrc = document.getElementById('profile-pic-preview').src;
        localStorage.setItem('profilePic', profilePicSrc);
        alert('Profile picture updated successfully!');
    });
});
