// Route coordinates
const WILMETTE_HARBOR = [42.081325, -87.687434]; // Wilmette Harbor, IL (updated starting point)
const WAYPOINT = [45.839441, -85.76882]; // Waypoint to keep route on water
const MACKINAC_ISLAND = [45.84026, -84.614846]; // Mackinac Island, MI (updated coordinates)

// Calculate great circle distance (water distance) using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Calculate one-way distance: Start → Waypoint → Mackinac Island
const DISTANCE_START_TO_WAYPOINT = calculateDistance(
    WILMETTE_HARBOR[0], WILMETTE_HARBOR[1],
    WAYPOINT[0], WAYPOINT[1]
);
const DISTANCE_WAYPOINT_TO_MACKINAC = calculateDistance(
    WAYPOINT[0], WAYPOINT[1],
    MACKINAC_ISLAND[0], MACKINAC_ISLAND[1]
);
const TOTAL_DISTANCE_KM = Math.round(DISTANCE_START_TO_WAYPOINT + DISTANCE_WAYPOINT_TO_MACKINAC);

// Weekly average needed for 1 year (52 weeks)
const WEEKLY_AVG_1_YEAR = (TOTAL_DISTANCE_KM / 52).toFixed(2);

// Initialize map
let map;
let routeLine;
let currentPositionMarker;
let boatIcon;

// Initialize data
let rowingData = loadData();
let editingIndex = -1; // Track which session is being edited (-1 means not editing)

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    initializeForm();
    updateDisplay();
    setDefaultDate();
});

function initializeMap() {
    // Create map centered to show both start and finish points
    // Center point between start and finish, with zoom to show both
    const centerLat = (WILMETTE_HARBOR[0] + MACKINAC_ISLAND[0]) / 2;
    const centerLon = (WILMETTE_HARBOR[1] + MACKINAC_ISLAND[1]) / 2;
    map = L.map('map').setView([centerLat, centerLon], 6.5);
    
    // Add OpenStreetMap tiles with correct URL format and fallback
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        subdomains: ['a', 'b', 'c']
    }).addTo(map);
    
    // Add error handling for map tiles
    map.on('tileerror', function(error, tile) {
        console.log('Tile loading error, trying alternative provider');
    });

    // Create custom boat icon
    boatIcon = L.divIcon({
        className: 'boat-marker',
        html: '<div style="font-size: 30px;">🚣</div>',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });

    // Draw the route
    drawRoute();
    
    // Update current position
    updateCurrentPosition();
}

function drawRoute() {
    // Create route line from Wilmette → Waypoint → Mackinac (one-way journey)
    const routeToMackinac = [WILMETTE_HARBOR, WAYPOINT, MACKINAC_ISLAND];
    
    // Draw route to Mackinac Island
    L.polyline(routeToMackinac, {
        color: '#2196f3',
        weight: 4,
        opacity: 0.6,
        dashArray: '10, 5'
    }).addTo(map).bindPopup('Route to Mackinac Island');
    
    // Add start marker
    L.marker(WILMETTE_HARBOR, {
        icon: L.divIcon({
            className: 'start-marker',
            html: '<div style="background: #4caf50; color: white; padding: 8px 12px; border-radius: 20px; font-weight: bold; box-shadow: 0 2px 10px rgba(0,0,0,0.3);">🏁 Start</div>',
            iconSize: [100, 40],
            iconAnchor: [50, 20]
        })
    }).addTo(map).bindPopup('Wilmette Harbor - Starting Point');
    
    // Add destination marker
    L.marker(MACKINAC_ISLAND, {
        icon: L.divIcon({
            className: 'destination-marker',
            html: '<div style="background: #ff9800; color: white; padding: 8px 12px; border-radius: 20px; font-weight: bold; box-shadow: 0 2px 10px rgba(0,0,0,0.3);">🏁 Finish</div>',
            iconSize: [100, 40],
            iconAnchor: [50, 20]
        })
    }).addTo(map).bindPopup('Mackinac Island - Finish Line');
}

function updateCurrentPosition() {
    const totalDistance = calculateTotalDistance();
    const progress = Math.min(1, totalDistance / TOTAL_DISTANCE_KM); // Cap at 100%
    
    // Remove existing marker
    if (currentPositionMarker) {
        map.removeLayer(currentPositionMarker);
    }
    
    // Calculate current position along the route
    // Route: Start → Waypoint → Mackinac Island (one-way journey)
    let currentPosition;
    
    // Check if we're on first segment (Start → Waypoint) or second (Waypoint → Mackinac)
    const segment1Ratio = DISTANCE_START_TO_WAYPOINT / TOTAL_DISTANCE_KM;
    
    if (progress <= segment1Ratio) {
        // On Start → Waypoint segment
        const segmentProgress = progress / segment1Ratio;
        currentPosition = [
            WILMETTE_HARBOR[0] + (WAYPOINT[0] - WILMETTE_HARBOR[0]) * segmentProgress,
            WILMETTE_HARBOR[1] + (WAYPOINT[1] - WILMETTE_HARBOR[1]) * segmentProgress
        ];
    } else {
        // On Waypoint → Mackinac segment
        const segmentProgress = (progress - segment1Ratio) / (1 - segment1Ratio);
        currentPosition = [
            WAYPOINT[0] + (MACKINAC_ISLAND[0] - WAYPOINT[0]) * segmentProgress,
            WAYPOINT[1] + (MACKINAC_ISLAND[1] - WAYPOINT[1]) * segmentProgress
        ];
    }
    
    // Add current position marker
    currentPositionMarker = L.marker(currentPosition, { icon: boatIcon })
        .addTo(map)
        .bindPopup(`You are here! ${totalDistance.toFixed(2)} km rowed`);
    
    // Only center on current position if user hasn't manually moved the map
    // On initial load, keep the view showing both start and finish
    if (totalDistance === 0) {
        // On initial load, ensure both points are visible
        const bounds = L.latLngBounds([WILMETTE_HARBOR, MACKINAC_ISLAND]);
        map.fitBounds(bounds, { padding: [50, 50] });
    }
}

// Parse MM:SS format to total minutes
function parseTimeToMinutes(timeString) {
    const parts = timeString.split(':');
    if (parts.length !== 2) {
        throw new Error('Invalid time format. Use MM:SS (e.g., 15:33)');
    }
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    
    if (isNaN(minutes) || isNaN(seconds) || seconds >= 60) {
        throw new Error('Invalid time format. Use MM:SS (e.g., 15:33)');
    }
    
    return minutes + (seconds / 60);
}

// Format minutes to MM:SS
function formatMinutesToTime(totalMinutes) {
    const minutes = Math.floor(totalMinutes);
    const seconds = Math.round((totalMinutes - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Parse date string (YYYY-MM-DD) to Date object in local timezone (avoiding UTC conversion)
function parseLocalDate(dateString) {
    const parts = dateString.split('-');
    if (parts.length !== 3) return new Date(dateString);
    // Create date in local timezone: year, month (0-indexed), day
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
}

// Format date for display (avoiding timezone issues)
function formatDateForDisplay(dateString) {
    const date = parseLocalDate(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function initializeForm() {
    const form = document.getElementById('logForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const date = document.getElementById('date').value;
        const distance = parseFloat(document.getElementById('distance').value);
        const timeString = document.getElementById('time').value.trim();
        
        // Parse time from MM:SS format
        let time;
        try {
            time = parseTimeToMinutes(timeString);
        } catch (error) {
            showNotification(error.message + ' ❌', 4000);
            return;
        }
        
        const session = {
            date: date,
            distance: distance,
            time: time,
            timeDisplay: timeString, // Store original format for display
            speed: distance / (time / 60) // km/h
        };
        
        if (editingIndex >= 0 && editingIndex < rowingData.length) {
            // Update the session being edited
            rowingData[editingIndex] = session;
            editingIndex = -1; // Clear edit mode
            showNotification('Session updated successfully! ✏️', 3000);
        } else {
            // Check if entry for this date already exists (for new entries)
            const existingIndex = rowingData.findIndex(entry => entry.date === date);
            
            if (existingIndex >= 0) {
                // Update existing entry by date
                rowingData[existingIndex] = session;
                showNotification('Session updated successfully! ✏️', 3000);
            } else {
                // Add new entry
                rowingData.push(session);
                showNotification('Session logged successfully! 🎉', 3000);
            }
        }
        
        // Sort by date (using string comparison since dates are in YYYY-MM-DD format)
        rowingData.sort((a, b) => a.date.localeCompare(b.date));
        
        // Save data
        saveData();
        
        // Update display
        updateDisplay();
        
        // Reset form and set defaults
        form.reset();
        setDefaultDate();
        // Re-set defaults after reset
        document.getElementById('distance').value = '3.00';
        document.getElementById('time').value = '15:00';
        
        // Restore button to original state
        const submitButton = document.querySelector('#logForm button[type="submit"]');
        if (submitButton.dataset.originalText) {
            submitButton.textContent = submitButton.dataset.originalText;
            submitButton.style.background = '';
            delete submitButton.dataset.originalText;
        }
        
        // Clear edit mode
        editingIndex = -1;
    });
    
    // Export button
    document.getElementById('exportBtn').addEventListener('click', exportData);
    
    // Import button
    document.getElementById('importBtn').addEventListener('click', function() {
        document.getElementById('importFile').click();
    });
    
    document.getElementById('importFile').addEventListener('change', importData);
    
    // Clear data button
    document.getElementById('clearBtn').addEventListener('click', clearAllData);
}

function setDefaultDate() {
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    
    // Set default distance and time
    const distanceInput = document.getElementById('distance');
    const timeInput = document.getElementById('time');
    if (distanceInput && !distanceInput.value) {
        distanceInput.value = '3.00';
    }
    if (timeInput && !timeInput.value) {
        timeInput.value = '15:00';
    }
}

function calculateTotalDistance() {
    return rowingData.reduce((sum, entry) => sum + entry.distance, 0);
}

function calculateTotalTime() {
    return rowingData.reduce((sum, entry) => sum + entry.time, 0);
}

function calculateAverageSpeed() {
    const totalDistance = calculateTotalDistance();
    const totalTime = calculateTotalTime();
    if (totalTime === 0) return 0;
    return totalDistance / (totalTime / 60); // km/h
}

function calculateDailyAverage() {
    if (rowingData.length === 0) return 0;
    const totalDistance = calculateTotalDistance();
    const days = rowingData.length;
    return totalDistance / days;
}

function updateDisplay() {
    const totalDistance = calculateTotalDistance();
    const totalTime = calculateTotalTime();
    const avgSpeed = calculateAverageSpeed();
    const dailyAverage = calculateDailyAverage();
    const progress = (totalDistance / TOTAL_DISTANCE_KM) * 100;
    const remainingDistance = Math.max(0, TOTAL_DISTANCE_KM - totalDistance);
    
    // Update stats
    document.getElementById('totalDistance').textContent = totalDistance.toFixed(2) + ' km';
    document.getElementById('totalTime').textContent = formatTime(totalTime);
    document.getElementById('avgSpeed').textContent = avgSpeed.toFixed(2) + ' km/h';
    document.getElementById('daysActive').textContent = rowingData.length;
    document.getElementById('dailyAverage').textContent = dailyAverage.toFixed(2) + ' km';
    document.getElementById('remainingDistance').textContent = remainingDistance.toFixed(2) + ' km';
    document.getElementById('weeklyAvg1Year').textContent = WEEKLY_AVG_1_YEAR + ' km';
    
    // Update progress bar
    document.getElementById('distanceProgress').style.width = Math.min(100, progress) + '%';
    document.getElementById('distanceProgressText').textContent = progress.toFixed(1) + '% Complete';
    
    // Update map
    updateCurrentPosition();
    
    // Update recent sessions
    updateRecentSessions();
    
    // Update milestones
    updateMilestones(totalDistance);
}

function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    if (hours > 0) {
        return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
}

function updateRecentSessions() {
    const list = document.getElementById('recentSessionsList');
    
    if (rowingData.length === 0) {
        list.innerHTML = '<p class="empty-state">No sessions logged yet. Start rowing!</p>';
        return;
    }
    
    // Show last 10 sessions (most recent first)
    const recentSessions = [...rowingData].reverse().slice(0, 10);
    
    list.innerHTML = recentSessions.map((session, index) => {
        // Use local date parsing to avoid timezone issues
        const dateStr = formatDateForDisplay(session.date);
        // Use stored timeDisplay format if available, otherwise format from minutes
        const timeDisplay = session.timeDisplay || formatMinutesToTime(session.time);
        // Find original index in rowingData (since we reversed)
        const originalIndex = rowingData.length - 1 - index;
        return `
            <div class="session-item" data-index="${originalIndex}">
                <div class="session-header">
                    <div class="session-date">${dateStr}</div>
                    <div class="session-actions">
                        <button class="btn-edit" onclick="editSession(${originalIndex})" title="Edit session">✏️</button>
                        <button class="btn-delete" onclick="deleteSession(${originalIndex})" title="Delete session">🗑️</button>
                    </div>
                </div>
                <div class="session-details">
                    <span>${session.distance.toFixed(2)} km</span>
                    <span>${timeDisplay}</span>
                    <span>${session.speed.toFixed(2)} km/h</span>
                </div>
            </div>
        `;
    }).join('');
}

function updateMilestones(totalDistance) {
    const milestones = [
        { label: 'Start', distance: 0, emoji: '🏁' },
        { label: '10%', distance: TOTAL_DISTANCE_KM * 0.1, emoji: '🎯' },
        { label: '25%', distance: TOTAL_DISTANCE_KM * 0.25, emoji: '⭐' },
        { label: '50%', distance: TOTAL_DISTANCE_KM * 0.5, emoji: '🏝️' },
        { label: '75%', distance: TOTAL_DISTANCE_KM * 0.75, emoji: '🔥' },
        { label: '90%', distance: TOTAL_DISTANCE_KM * 0.9, emoji: '💪' },
        { label: 'Complete', distance: TOTAL_DISTANCE_KM, emoji: '🏆' }
    ];
    
    const grid = document.getElementById('milestonesGrid');
    grid.innerHTML = milestones.map(milestone => {
        const completed = totalDistance >= milestone.distance;
        return `
            <div class="milestone-item ${completed ? 'completed' : ''}">
                <div class="milestone-label">${milestone.emoji} ${milestone.label}</div>
                <div class="milestone-value">${milestone.distance.toFixed(0)} km</div>
            </div>
        `;
    }).join('');
}

function saveData() {
    localStorage.setItem('rowingData', JSON.stringify(rowingData));
    // Auto-backup to file system (downloads folder)
    autoBackup();
}

function autoBackup() {
    // Only backup if there's data and it's been a while since last backup
    if (rowingData.length === 0) return;
    
    const lastBackup = localStorage.getItem('lastBackupDate');
    const today = new Date().toISOString().split('T')[0];
    
    // Backup once per day automatically (silently in background)
    if (lastBackup !== today) {
        // Store backup data in a way that can be accessed later
        const backupData = {
            date: today,
            data: rowingData,
            totalDistance: calculateTotalDistance(),
            totalSessions: rowingData.length
        };
        
        const dataStr = JSON.stringify(backupData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        // Use a filename that's easy to identify and organize
        link.download = `rowing-backup-${today}.json`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        localStorage.setItem('lastBackupDate', today);
        
        // Show notification with instructions
        setTimeout(() => {
            showNotification('📦 Daily backup saved automatically!', 2500);
        }, 1000);
    }
}

function loadData() {
    const saved = localStorage.getItem('rowingData');
    if (saved) {
        return JSON.parse(saved);
    }
    return [];
}

function clearAllData() {
    if (rowingData.length === 0) {
        showNotification('No data to clear!', 2000);
        return;
    }
    
    const confirmClear = confirm(
        `Are you sure you want to delete ALL ${rowingData.length} rowing sessions?\n\n` +
        `This action cannot be undone!\n\n` +
        `Click OK to delete, or Cancel to keep your data.`
    );
    
    if (confirmClear) {
        rowingData = [];
        saveData();
        updateDisplay();
        showNotification('All data cleared successfully! 🗑️', 3000);
    }
}

// Edit a session - pre-fill the form with existing data
function editSession(index) {
    if (index < 0 || index >= rowingData.length) {
        showNotification('Session not found!', 2000);
        return;
    }
    
    const session = rowingData[index];
    
    // Set editing mode
    editingIndex = index;
    
    // Pre-fill the form
    document.getElementById('date').value = session.date;
    document.getElementById('distance').value = session.distance.toFixed(2);
    document.getElementById('time').value = session.timeDisplay || formatMinutesToTime(session.time);
    
    // Change button text to indicate editing mode
    const submitButton = document.querySelector('#logForm button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Update Session';
    submitButton.style.background = 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)';
    
    // Store original button text to restore later
    submitButton.dataset.originalText = originalText;
    
    // Scroll to form
    document.querySelector('.log-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Highlight the form briefly
    const form = document.getElementById('logForm');
    form.style.transition = 'background-color 0.3s';
    form.style.backgroundColor = '#e3f2fd';
    setTimeout(() => {
        form.style.backgroundColor = '';
    }, 1000);
    
    showNotification('Editing session... Update values and click "Update Session" to save changes.', 4000);
}

// Delete a session
function deleteSession(index) {
    if (index < 0 || index >= rowingData.length) {
        showNotification('Session not found!', 2000);
        return;
    }
    
    const session = rowingData[index];
    const dateStr = formatDateForDisplay(session.date);
    
    const confirmDelete = confirm(
        `Delete session from ${dateStr}?\n\n` +
        `Distance: ${session.distance.toFixed(2)} km\n` +
        `Time: ${session.timeDisplay || formatMinutesToTime(session.time)}\n\n` +
        `This cannot be undone!`
    );
    
    if (confirmDelete) {
        rowingData.splice(index, 1);
        saveData();
        updateDisplay();
        showNotification('Session deleted successfully! 🗑️', 3000);
    }
}

// Make functions globally available for onclick handlers
window.editSession = editSession;
window.deleteSession = deleteSession;

function exportData() {
    if (rowingData.length === 0) {
        showNotification('No data to export yet! Start logging sessions first.', 3000);
        return;
    }
    
    const dataStr = JSON.stringify(rowingData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `rowing-data-${today}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotification('Data exported successfully! Check your Downloads folder. 💾', 4000);
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // Handle both formats: direct array or backup object
            let dataToImport = Array.isArray(importedData) ? importedData : importedData.data;
            
            if (Array.isArray(dataToImport) && dataToImport.length > 0) {
                // Ask user if they want to replace or merge
                const shouldReplace = confirm(
                    `Found ${dataToImport.length} sessions in backup file.\n\n` +
                    `Click OK to REPLACE all current data with backup.\n` +
                    `Click Cancel to MERGE (keeps both current and backup data).`
                );
                
                if (shouldReplace) {
                    // Replace all data
                    rowingData = dataToImport;
                } else {
                    // Merge with existing data, avoiding duplicates
                    const existingDates = new Set(rowingData.map(entry => entry.date));
                    dataToImport.forEach(entry => {
                        if (!existingDates.has(entry.date)) {
                            rowingData.push(entry);
                        }
                    });
                }
                
                // Sort by date
                rowingData.sort((a, b) => a.date.localeCompare(b.date));
                saveData();
                updateDisplay();
                showNotification(`Data imported successfully! ${rowingData.length} total sessions. 📥`, 4000);
            } else {
                showNotification('Invalid data format or empty file! ❌');
            }
        } catch (error) {
            showNotification('Error importing data! Please check the file format. ❌');
            console.error(error);
        }
    };
    reader.readAsText(file);
    // Reset file input
    event.target.value = '';
}

function showNotification(message, duration = 3000) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #2196f3 0%, #4caf50 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after specified duration
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, duration);
}

// Add CSS animations for notification
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

