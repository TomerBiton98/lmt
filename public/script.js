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
// reports dashboard.html
// ===============================
// ===============================
// Report Generation Functions
// ===============================

// 💾 Storage Usage Report
function generateStorageReport() {
    console.log("Generating Storage Report...");
    const folders = JSON.parse(localStorage.getItem('folders')) || {};
    let csvContent = "File Type,Number of Files,Total Size (MB)\n";

    const fileTypeCount = {};
    const fileTypeSize = {};

    Object.values(folders).forEach(files => {
        files.forEach(file => {
            const fileType = file.type.toUpperCase();
            const fileSizeMB = parseFloat(file.size.replace(' MB', ''));

            if (!fileTypeCount[fileType]) {
                fileTypeCount[fileType] = 0;
                fileTypeSize[fileType] = 0;
            }
            fileTypeCount[fileType]++;
            fileTypeSize[fileType] += fileSizeMB;
        });
    });

    Object.keys(fileTypeCount).forEach(type => {
        csvContent += `${type},${fileTypeCount[type]},${fileTypeSize[type].toFixed(2)}\n`;
    });

    downloadCSV(csvContent, "storage_usage_report.csv");
}

// 📄 Versions Uploaded Report
function generateVersionsReport() {
    console.log("Generating Versions Report...");
    const versions = JSON.parse(localStorage.getItem('versions')) || {};
    let csvContent = "Version ID,Notes,Assignee,Upload Date\n";

    Object.values(versions).forEach(version => {
        csvContent += `${version.id},"${version.notes}",${version.assignee},${version.date}\n`;
    });

    downloadCSV(csvContent, "versions_uploaded_report.csv");
}

// 👥 Team Contribution Report
function generateTeamReport() {
    console.log("Generating Team Report...");
    const versions = JSON.parse(localStorage.getItem('versions')) || {};
    let csvContent = "Team Member,Total Versions Uploaded\n";

    const teamContributions = {};

    Object.values(versions).forEach(version => {
        if (!teamContributions[version.assignee]) {
            teamContributions[version.assignee] = 0;
        }
        teamContributions[version.assignee]++;
    });

    Object.keys(teamContributions).forEach(member => {
        csvContent += `${member},${teamContributions[member]}\n`;
    });

    downloadCSV(csvContent, "team_contribution_report.csv");
}

// 📞 Phone Book Report
function generatePhonebookReport() {
    console.log("Generating Phonebook Report...");
    const teamMembers = JSON.parse(localStorage.getItem("teamMembers")) || [];
    let csvContent = "Name,Position,Phone Number\n";

    teamMembers.forEach(member => {
        csvContent += `"${member.name}","${member.position}","${member.phone}"\n`;
    });

    downloadCSV(csvContent, "team_phonebook_report.csv");
}

// ===============================
// Attach Event Listeners on Page Load
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    console.log("Initializing Report Download Buttons...");

    const reportButtons = [
        { id: "download-storage-report", action: generateStorageReport },
        { id: "download-versions-report", action: generateVersionsReport },
        { id: "download-team-report", action: generateTeamReport },
        { id: "download-phonebook-report", action: generatePhonebookReport }
    ];

    reportButtons.forEach(button => {
        const element = document.getElementById(button.id);
        if (element) {
            element.addEventListener("click", button.action);
        } else {
            console.warn(`Button with ID ${button.id} not found.`);
        }
    });
});

// ===============================
// CSV Download Utility Function
// ===============================
function downloadCSV(csvContent, filename) {
    console.log(`Downloading ${filename}...`);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


// ===============================
// CHART VISUALIZATION dashboard.html
// ===============================
function initializeCharts() {
    // Load document versions from localStorage
    const versions = JSON.parse(localStorage.getItem('versions')) || {};
    const folders = JSON.parse(localStorage.getItem('folders')) || {};

    // Doughnut Chart for Team Contributions (by number of versions uploaded)
    const teamCtx = document.getElementById('team-chart')?.getContext('2d');
    if (teamCtx) {
        const teamContributions = {};

        Object.values(versions).forEach(version => {
            if (!teamContributions[version.assignee]) {
                teamContributions[version.assignee] = 0;
            }
            teamContributions[version.assignee]++;
        });

        new Chart(teamCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(teamContributions),
                datasets: [{
                    label: 'Team Contributions',
                    data: Object.values(teamContributions),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(153, 102, 255, 0.6)',
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
// File Type & Size Chart (Replaces Gantt Chart)
const fileChartCanvas = document.getElementById('gantt-chart');

if (fileChartCanvas) {
    const fileChartCtx = fileChartCanvas.getContext('2d');
    const folders = JSON.parse(localStorage.getItem('folders')) || {};

    // Count files by type and calculate total size
    const fileTypeCount = {};
    const fileTypeSize = {};
    let totalSize = 0; // ✅ Track total file storage size

    Object.values(folders).forEach(files => {
        files.forEach(file => {
            const fileType = file.type.toUpperCase();
            const fileSizeMB = parseFloat(file.size.replace(' MB', '')); // Convert size to number

            if (!fileTypeCount[fileType]) {
                fileTypeCount[fileType] = 0;
                fileTypeSize[fileType] = 0;
            }
            fileTypeCount[fileType]++;
            fileTypeSize[fileType] += fileSizeMB;
            totalSize += fileSizeMB; // ✅ Sum total size
        });
    });

    // ✅ Ensure previous total size text is removed before adding a new one
    let totalSizeDisplay = document.getElementById("total-size-display");
    if (!totalSizeDisplay) {
        totalSizeDisplay = document.createElement('h3');
        totalSizeDisplay.id = "total-size-display";
        totalSizeDisplay.style.textAlign = "center";
        totalSizeDisplay.style.marginTop = "10px";
        totalSizeDisplay.style.fontSize = "16px"; // ✅ Adjust text size
        fileChartCanvas.parentNode.appendChild(totalSizeDisplay); // ✅ Place directly under the chart
    }

    // ✅ Update total size text
    totalSizeDisplay.innerHTML = `💾 <strong>Total Storage Used:</strong> ${totalSize.toFixed(2)} MB`;

    // ✅ Create and display the chart
    new Chart(fileChartCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(fileTypeCount),
            datasets: [
                {
                    label: 'Number of Files',
                    data: Object.values(fileTypeCount),
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Total Size (MB)',
                    data: Object.values(fileTypeSize),
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'File Count / Size (MB)'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                }
            }
        }
    });
}

}

// Ensure the function runs on page load
document.addEventListener("DOMContentLoaded", initializeCharts);

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
	
			// Dispatch event to update storage display
			document.dispatchEvent(new Event("fileDeleteSuccess"));
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
				size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`, // Convert bytes to MB
				uploaded: new Date().toISOString().split('T')[0],
			};
			folders[currentFolder].push(newFile);
			saveToLocalStorage();
			renderFiles(folders[currentFolder]);
	
			// Dispatch event to update storage display
			document.dispatchEvent(new Event("fileUploadSuccess"));
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
	let versions = JSON.parse(localStorage.getItem('versions')) || {};

	// Ensure versions have a saved status (default to "to-do" if not set)
	Object.keys(versions).forEach(id => {
		if (!versions[id].status) versions[id].status = 'to-do';
	});

	// Save updated versions back to localStorage
	localStorage.setItem('versions', JSON.stringify(versions));

	// Function to create a task card from version data
	function createVersionCard(version) {
		if (!version || !version.id) return null;

		const card = document.createElement('div');
		card.id = `version-${version.id}`;
		card.className = 'kanban-card';
		card.draggable = true;
		card.dataset.status = version.status;

		card.innerHTML = `
            <h3>Version: ${version.id}</h3>
            <p><strong>Notes:</strong> ${version.notes}</p>
            <p><strong>Assignee:</strong> ${version.assignee || 'Unassigned'}</p>
            <p><strong>Uploaded:</strong> ${version.date}</p>
            <p><strong>Status:</strong> ${card.dataset.status}</p>
            <a href="${version.file}" target="_blank">📂 Download</a>
        `;

		// Enable drag events for Kanban functionality
		card.addEventListener('dragstart', handleDragStart);
		card.addEventListener('dragend', handleDragEnd);

		return card;
	}

	// Function to render versions as Kanban tasks
	function renderVersions() {
		Object.values(versions).forEach(version => {
			const column = document.querySelector(`.kanban-column[data-status="${version.status}"]`);
			if (column) {
				const kanbanCardsContainer = column.querySelector('.kanban-cards');
				const versionCard = createVersionCard(version);
				if (kanbanCardsContainer && versionCard) {
					kanbanCardsContainer.appendChild(versionCard);
				}
			}
		});

		// Reattach drag-and-drop event listeners
		updateTaskCounts();
	}

	// Drag-and-drop event handlers
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
		const versionId = e.dataTransfer.getData('text/plain');
		const versionCard = document.getElementById(versionId);
		if (versionCard && this.querySelector('.kanban-cards')) {
			this.querySelector('.kanban-cards').appendChild(versionCard);
			this.classList.remove('dragging-over');

			// Update version status in localStorage
			const newStatus = this.dataset.status;
			const versionKey = versionId.replace('version-', '');
			if (versions[versionKey]) {
				versions[versionKey].status = newStatus;
				localStorage.setItem('versions', JSON.stringify(versions)); // Save updated status
				updateTaskCounts();
			}
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

	// Function to update task counts
	function updateTaskCounts() {
		kanbanColumns.forEach(column => {
			const count = column.querySelectorAll('.kanban-card').length;
			const taskCountElement = column.querySelector('.task-count');
			if (taskCountElement) {
				taskCountElement.textContent = `(${count})`;
			}
		});
	}

	// Initialize Kanban columns with event listeners
	kanbanColumns.forEach(column => {
		column.addEventListener('dragover', handleDragOver);
		column.addEventListener('dragenter', handleDragEnter);
		column.addEventListener('dragleave', handleDragLeave);
		column.addEventListener('drop', handleDrop);
	});

	// Render versions as Kanban tasks on page load
	renderVersions();
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


// ===============================
// setting.html  dark mode
// ===============================
document.addEventListener('DOMContentLoaded', () => {
    // Check if dark mode is enabled in localStorage
    const isDarkMode = localStorage.getItem('darkMode') === 'enabled';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.getElementById('theme-toggle').checked = true;
    }

    // Dark Mode Toggle Event Listener
    document.getElementById('theme-toggle').addEventListener('change', function() {
        if (this.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'enabled');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'disabled');
        }
    });
});
// ===============================
// help.html  search
// ===============================

document.addEventListener("DOMContentLoaded", function() {
    const searchInput = document.getElementById("search-help");
    const faqItems = document.querySelectorAll(".faq");

    searchInput.addEventListener("keyup", function() {
        let filter = searchInput.value.toLowerCase();
        
        faqItems.forEach(item => {
            let question = item.querySelector(".faq-question").textContent.toLowerCase();
            if (question.includes(filter)) {
                item.style.display = "block";
            } else {
                item.style.display = "none";
            }
        });
    });
});


// ===============================
// storage usage index.html  
// ===============================

function updateTotalStorage() {
    console.log("Updating total storage usage...");
    const folders = JSON.parse(localStorage.getItem('folders')) || {};
    let totalSize = 0;

    Object.values(folders).forEach(files => {
        files.forEach(file => {
            let fileSizeMB = parseFloat(file.size.replace(' MB', '')); // Convert to number
            totalSize += fileSizeMB;
        });
    });

    // Update the card display
    const totalStorageElement = document.getElementById("gantt-chart");
    if (totalStorageElement) {
        totalStorageElement.innerHTML = `💾 ${totalSize.toFixed(2)} MB</strong>`;
    } else {
        console.warn("Element with ID 'gantt-chart' not found.");
    }
}

// Ensure the function runs on page load
document.addEventListener("DOMContentLoaded", () => {
    updateTotalStorage();
});

// Update storage when files are added or removed
document.addEventListener("fileUploadSuccess", updateTotalStorage);
document.addEventListener("fileDeleteSuccess", updateTotalStorage);