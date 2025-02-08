// ===============================
// INITIALIZATION & CORE SETUP
// ===============================
document.addEventListener('DOMContentLoaded', () => {
	console.log("Welcome to the Knowledge Retention Platform!");

	// Section: Gantt Chart and Analytics
	if (typeof initializeCharts === "function") initializeCharts();


	// Sidebar hover effect
	if (typeof handleSidebarHover === "function") handleSidebarHover();
});

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
// KANBAN BOARD (Review Process for Versions)
// ===============================
document.addEventListener('DOMContentLoaded', () => {
    const kanbanColumns = document.querySelectorAll('.kanban-column');
    let versions = JSON.parse(localStorage.getItem('versions')) || {};
    console.log("🔍 Initial load versions:", versions);

    // Define valid statuses exactly as they appear in HTML
    const VALID_STATUSES = {
        'Cancel': 'Cancel',
        'New': 'New',
        'to-review': 'to-review',
        'Approved': 'Approved'
    };

    // Ensure all versions have a saved status
    Object.keys(versions).forEach(id => {
        if (!versions[id].status) {
            versions[id].status = 'New';
        }
        // Normalize any existing status to match our valid statuses
        versions[id].status = VALID_STATUSES[versions[id].status] || 'New';
    });

    // Save updated versions back to localStorage
    localStorage.setItem('versions', JSON.stringify(versions));

    // Function to create a version card
    function createVersionCard(version, versionKey) {
        console.log("🎴 Creating card for version:", version, "with key:", versionKey);
        if (!version || !version.id) {
            console.warn("⚠️ Invalid version data:", version);
            return null;
        }

        const card = document.createElement('div');
        card.id = `version-${versionKey}`;
        card.className = 'kanban-card';
        card.draggable = true;
        card.dataset.versionKey = versionKey;

        // Add emoji based on status
        const statusEmoji = {
            'Cancel': '❌',
            'New': '🆕',
            'to-review': '🔁',
            'Approved': '✅'
        }[version.status] || '📋';

        card.innerHTML = `
            <h3>Version: ${version.id}</h3>
            <p><strong>Notes:</strong> ${version.notes || 'No notes'}</p>
            <p><strong>Project:</strong> ${version.assignee || 'Unassigned'}</p>
            <p class="status-indicator">Status: ${version.status} ${statusEmoji}</p>
            <a href="${version.file || '#'}" target="_blank">📂 Download</a>
        `;

        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);

        // Add delete button if in Cancel column
        if (version.status === 'Cancel') {
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('delete-btn');
            deleteButton.addEventListener('click', () => deleteVersion(versionKey));
            card.appendChild(deleteButton);
        }

        return card;
    }

    // Function to render versions in Kanban board
    function renderVersions() {
        console.log("🎯 Rendering versions:", versions);
        
        // Clear all columns
        kanbanColumns.forEach(column => {
            const cardsContainer = column.querySelector('.kanban-cards');
            if (cardsContainer) {
                cardsContainer.innerHTML = "";
            }
        });

        // Populate board with saved versions
        Object.entries(versions).forEach(([versionKey, version]) => {
            const column = document.querySelector(`.kanban-column[data-status="${version.status}"]`);
            if (column) {
                const kanbanCardsContainer = column.querySelector('.kanban-cards');
                const versionCard = createVersionCard(version, versionKey);
                if (kanbanCardsContainer && versionCard) {
                    kanbanCardsContainer.appendChild(versionCard);
                    console.log(`✅ Added card ${versionKey} to ${version.status} column`);
                }
            } else {
                console.warn(`⚠️ No column found for status: ${version.status}`);
            }
        });

        updateTaskCounts();
    }

    function handleDrop(e) {
        e.preventDefault();
        const versionKey = e.dataTransfer.getData('text/plain').replace('version-', '');
        const newStatus = this.dataset.status; // Use exact status from column
        
        console.log(`🔄 Moving card ${versionKey} to ${newStatus}`);

        if (versions[versionKey]) {
            versions[versionKey].status = newStatus;
            localStorage.setItem('versions', JSON.stringify(versions));
            console.log("💾 Updated versions in localStorage:", versions);
            renderVersions();
        } else {
            console.warn(`⚠️ Version not found in storage:`, versionKey);
        }
    }

    function handleDragStart(e) {
        e.dataTransfer.setData('text/plain', this.id);
        this.classList.add('dragging');
    }

    function handleDragEnd(e) {
        this.classList.remove('dragging');
        kanbanColumns.forEach(column => {
            column.classList.remove('dragging-over');
        });
    }

    function handleDragOver(e) {
        e.preventDefault();
        this.classList.add('dragging-over');
    }

    function handleDragLeave(e) {
        this.classList.remove('dragging-over');
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

    function deleteVersion(versionKey) {
        if (confirm(`Are you sure you want to delete this version?`)) {
            console.log(`🗑️ Deleting version ${versionKey}`);
            delete versions[versionKey];
            localStorage.setItem('versions', JSON.stringify(versions));
            renderVersions();
        }
    }

    // Initialize Kanban columns with event listeners
    kanbanColumns.forEach(column => {
        column.addEventListener('dragover', handleDragOver);
        column.addEventListener('dragleave', handleDragLeave);
        column.addEventListener('drop', handleDrop);
    });

    // Initial render
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

