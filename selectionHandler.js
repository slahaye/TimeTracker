// Gestionnaire de sélection multiple
let selectedTasks = new Set();

// Formater le temps en heures:minutes:secondes
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Créer un élément de tâche
function createTimeEntryElement(entry) {
    const entryElement = document.createElement('div');
    entryElement.className = 'task-entry';
    entryElement.draggable = true;
    entryElement.dataset.id = entry.id;

    const mainContent = document.createElement('div');
    mainContent.className = 'main-content';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = selectedTasks.has(entry.id);
    checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
            selectedTasks.add(entry.id);
        } else {
            selectedTasks.delete(entry.id);
        }
        updateSelectionUI();
    });

    const taskName = document.createElement('span');
    taskName.className = 'task-name';
    taskName.textContent = entry.taskName;

    const duration = document.createElement('span');
    duration.className = 'task-duration';
    duration.textContent = formatTime(entry.duration);

    mainContent.appendChild(checkbox);
    mainContent.appendChild(taskName);
    mainContent.appendChild(duration);

    entryElement.appendChild(mainContent);
    return entryElement;
}

// Fonction pour charger et mettre à jour la liste des tâches
async function loadTimeEntries() {
    try {
        const entries = await window.ipcRenderer.invoke('get-time-entries');
        const timeEntriesDiv = document.getElementById('timeEntries');
        const syncedTasksContainer = document.getElementById('syncedTasks');
        
        timeEntriesDiv.innerHTML = '';
        syncedTasksContainer.innerHTML = '';

        entries.forEach(entry => {
            const taskElement = createTimeEntryElement(entry);
            if (entry.synced) {
                syncedTasksContainer.appendChild(taskElement);
            } else {
                timeEntriesDiv.appendChild(taskElement);
            }
        });
    } catch (error) {
        console.error('Erreur lors du chargement des tâches:', error);
    }
}

// Met à jour l'interface de sélection
function updateSelectionUI() {
    const selectionBar = document.getElementById('selectionBar');
    const selectionCount = document.querySelector('.selection-count');
    
    selectionCount.textContent = `${selectedTasks.size} tâche(s) sélectionnée(s)`;
    
    if (selectedTasks.size > 0) {
        selectionBar.classList.add('active');
    } else {
        selectionBar.classList.remove('active');
    }
}

// Gestion des actions sur la sélection
function initializeSelectionActions() {
    document.querySelector('.delete-selected').addEventListener('click', async () => {
        if (confirm('Voulez-vous vraiment supprimer les tâches sélectionnées ?')) {
            try {
                // Envoyer la liste des IDs à supprimer au processus principal
                await window.ipcRenderer.invoke('delete-multiple-time-entries', Array.from(selectedTasks));
                deselectAllTasks();
                // Mettre à jour la liste
                loadTimeEntries();
            } catch (error) {
                console.error('Erreur lors de la suppression des tâches:', error);
                alert('Une erreur est survenue lors de la suppression des tâches');
            }
        }
    });

    document.querySelector('.deselect-all').addEventListener('click', () => {
        deselectAllTasks();
    });

    document.querySelector('.sync-selected').addEventListener('click', async () => {
        try {
            const selectedEntries = await window.ipcRenderer.invoke('get-time-entries');
            const entriesToSync = selectedEntries.filter(entry => selectedTasks.has(entry.id));
            await window.ipcRenderer.invoke('sync-to-sheets', entriesToSync);
            deselectAllTasks();
        } catch (error) {
            console.error('Erreur lors de la synchronisation:', error);
            alert('Une erreur est survenue lors de la synchronisation');
        }
    });
}

// Désélectionne toutes les tâches
function deselectAllTasks() {
    selectedTasks.clear();
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    document.querySelectorAll('.task-entry').forEach(entry => {
        entry.classList.remove('selected');
    });
    updateSelectionUI();
}

// Initialiser le système de sélection
function initializeSelectionSystem() {
    initializeSelectionActions();
}

// Exposer les fonctions utiles
window.selectionHandler = {
    deselectAllTasks,
    initializeSelectionSystem
};

// Fonction pour charger et mettre à jour la liste des tâches
async function loadTimeEntries() {
    try {
        const entries = await window.ipcRenderer.invoke('get-time-entries');
        const timeEntriesDiv = document.getElementById('timeEntries');
        const syncedTasksContainer = document.getElementById('syncedTasks');
        
        timeEntriesDiv.innerHTML = '';
        syncedTasksContainer.innerHTML = '';

        entries.forEach(entry => {
            const taskElement = createTimeEntryElement(entry);
            if (entry.synced) {
                syncedTasksContainer.appendChild(taskElement);
            } else {
                timeEntriesDiv.appendChild(taskElement);
            }
        });
    } catch (error) {
        console.error('Erreur lors du chargement des tâches:', error);
    }
}

// Créer un élément de tâche
function createTimeEntryElement(entry) {
    const entryElement = document.createElement('div');
    entryElement.className = 'task-entry';
    entryElement.draggable = true;
    entryElement.dataset.id = entry.id;

    const mainContent = document.createElement('div');
    mainContent.className = 'main-content';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = selectedTasks.has(entry.id);
    checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
            selectedTasks.add(entry.id);
        } else {
            selectedTasks.delete(entry.id);
        }
        updateSelectionUI();
    });

    const taskName = document.createElement('span');
    taskName.className = 'task-name';
    taskName.textContent = entry.taskName;

    const duration = document.createElement('span');
    duration.className = 'task-duration';
    duration.textContent = formatTime(entry.duration);

    mainContent.appendChild(checkbox);
    mainContent.appendChild(taskName);
    mainContent.appendChild(duration);

    entryElement.appendChild(mainContent);
    return entryElement;
}

// Met à jour l'interface de sélection
function updateSelectionUI() {
    const selectionBar = document.getElementById('selectionBar');
    const selectionCount = document.querySelector('.selection-count');
    
    selectionCount.textContent = `${selectedTasks.size} tâche(s) sélectionnée(s)`;
    
    if (selectedTasks.size > 0) {
        selectionBar.classList.add('active');
    } else {
        selectionBar.classList.remove('active');
    }
}

// Gestion des actions sur la sélection
function initializeSelectionActions() {
    document.querySelector('.delete-selected').addEventListener('click', async () => {
        if (confirm('Voulez-vous vraiment supprimer les tâches sélectionnées ?')) {
            try {
                // Envoyer la liste des IDs à supprimer au processus principal
                await window.ipcRenderer.invoke('delete-multiple-time-entries', Array.from(selectedTasks));
                deselectAllTasks();
                // Mettre à jour la liste en utilisant la fonction existante
                loadTimeEntries();
            } catch (error) {
                console.error('Erreur lors de la suppression des tâches:', error);
                alert('Une erreur est survenue lors de la suppression des tâches');
            }
        }
    });

    document.querySelector('.deselect-all').addEventListener('click', () => {
        deselectAllTasks();
    });

    document.querySelector('.sync-selected').addEventListener('click', async () => {
        try {
            const selectedEntries = await window.ipcRenderer.invoke('get-time-entries');
            const entriesToSync = selectedEntries.filter(entry => selectedTasks.has(entry.id));
            await window.ipcRenderer.invoke('sync-to-sheets', entriesToSync);
            deselectAllTasks();
        } catch (error) {
            console.error('Erreur lors de la synchronisation:', error);
            alert('Une erreur est survenue lors de la synchronisation');
        }
    });
}

// Désélectionne toutes les tâches
function deselectAllTasks() {
    selectedTasks.clear();
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    document.querySelectorAll('.task-item').forEach(task => {
        task.classList.remove('selected');
    });
    updateSelectionUI();
}

// Initialiser le système de sélection
function initializeSelectionSystem() {
    initializeSelectionActions();
}

// Exposer les fonctions utiles
window.selectionHandler = {
    deselectAllTasks,
    initializeSelectionSystem
};
