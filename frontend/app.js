const API_BASE = "http://localhost:5001/api";
let currentActiveTab = 'sidequest';

document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    document.getElementById('taskForm').addEventListener('submit', handleFormSubmit);
});

// --- UI Logic ---
function showTab(tabName) {
    currentActiveTab = tabName;
    
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${tabName}`).classList.add('active');

    // Toggle Level Bar: Only for Sidequests
    const levelBar = document.getElementById('level-container');
    levelBar.classList.toggle('hidden', tabName !== 'sidequest');

    updateDashboardLabels(tabName);
    fetchData();
}

function updateDashboardLabels(tabName) {
    const l1 = document.getElementById('stat-label-1');
    const l2 = document.getElementById('stat-label-2');
    const ct = document.getElementById('category-title');

    if (tabName === 'sidequest') {
        l1.innerText = "Total XP"; l2.innerText = "Quests Done"; ct.innerText = "Category Split";
    } else if (tabName === 'academic') {
        l1.innerText = "Pending"; l2.innerText = "Completed"; ct.innerText = "Subject Split";
    } else {
        l1.innerText = "Active Orgs"; l2.innerText = "Completed Tasks"; ct.innerText = "Org Split";
    }
}

// --- Data & Stats ---
async function fetchData() {
    try {
        const endpoint = currentActiveTab === 'extra' ? 'extracurriculars' : `${currentActiveTab}s`;
        
        const [listRes, statsRes] = await Promise.all([
            fetch(`${API_BASE}/${endpoint}`),
            fetch(`${API_BASE}/${endpoint}/stats`)
        ]);

        const listData = await listRes.json();
        const statsData = await statsRes.json();

        renderCards(listData);
        updateDashboardUI(statsData);
    } catch (err) { console.error("Fetch error:", err); }
}

function updateDashboardUI(stats) {
    const val1 = document.getElementById('totalXP');
    const val2 = document.getElementById('completedCount');
    const list = document.getElementById('category-list');

    if (currentActiveTab === 'sidequest') {
        // Alignment Fix: Use the same 'statusOverview' logic as the other tabs
        const doneStats = stats.statusOverview?.find(s => s._id === 'Done');
        
        val1.innerText = stats.totalXP || 0;
        val2.innerText = doneStats ? doneStats.total : 0; // Benchmarked to match Academics
        
        updateLevelSystem(stats.totalXP || 0);

        // Benchmarked Category Split
        if (stats.avgPoints && stats.avgPoints.length > 0) {
            list.innerHTML = stats.avgPoints.map(s => `
                <div class="flex justify-between items-center py-1">
                    <span class="capitalize">${s._id}:</span>
                    <span class="font-bold">${s.count}</span>
                </div>
            `).join('');
        } else {
            list.innerHTML = '<p class="text-slate-400 text-center">No quests done yet</p>';
        }

    } else if (currentActiveTab === 'academic') {
        val1.innerText = stats.statusOverview?.find(s => s._id === 'To Do')?.total || 0;
        val2.innerText = stats.statusOverview?.find(s => s._id === 'Done')?.total || 0;
        list.innerHTML = stats.subjectDist?.map(s => `<div class="flex justify-between"><span>${s._id}:</span><b>${s.count}</b></div>`).join('') || '';
    } else {
        val1.innerText = stats.activeOrgs || 0;
        val2.innerText = stats.statusOverview?.find(s => s._id === 'Done')?.total || 0;
        list.innerHTML = stats.orgStats?.map(s => `<div class="flex justify-between"><span>${s._id}:</span><b>${s.count}</b></div>`).join('') || '';
    }
}

function updateLevelSystem(xp) {
    const level = Math.floor(xp / 100) + 1;
    const progress = xp % 100;
    document.getElementById('playerLevel').innerText = `Level ${level}`;
    document.getElementById('xpToNext').innerText = `${progress} / 100 XP`;
    document.getElementById('levelBar').style.width = `${progress}%`;
}

// --- CRUD Operations ---
function renderCards(items) {
    const container = document.getElementById('card-container');
    container.innerHTML = '';

    items.forEach(item => {
        // FIX 1: Handle "undefined" by checking for 'subject' specifically
        const title = item.subject || item.title || item.taskName || "Untitled";
        const sub = item.category || item.subject || item.organization;
        const isDone = item.status === 'Done';
        
        // FIX 2: Format the date to MM/DD/YYYY
        const dateDisplay = item.deadline ? formatDate(item.deadline) : '';

        container.innerHTML += `
            <div class="task-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isDone ? 'opacity-50' : ''}">
                <div>
                    <div class="flex gap-2 mb-2">
                        <span class="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded">${sub}</span>
                        <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded">${item.status}</span>
                    </div>
                    <h3 class="text-xl font-bold text-slate-800 ${isDone ? 'line-through' : ''}">${title}</h3>
                    <div class="flex flex-col gap-1 mt-1">
                        ${dateDisplay ? `<p class="text-[11px] font-semibold text-rose-500">📅 ${dateDisplay}</p>` : ''}
                        <p class="text-xs text-slate-400">${item.notes || ''}</p>
                    </div>
                </div>
                <div class="flex gap-2 w-full md:w-auto">
                    <button onclick="toggleStatus('${item._id}', '${item.status}')" class="action-btn btn-done flex-1">${isDone ? '🔄' : '✅ Done'}</button>
                    <button onclick='editItem(${JSON.stringify(item)})' class="action-btn btn-edit">✏️</button>
                    <button onclick="deleteItem('${item._id}')" class="action-btn btn-delete">🗑️</button>
                </div>
            </div>`;
    });
}

// Helper function for MM/DD/YYYY formatting
function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    // Returns MM/DD/YYYY
    return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
    });
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('editItemId').value;
    const endpoint = currentActiveTab === 'extra' ? '/extracurriculars' : `/${currentActiveTab}s`;
    
    let payload = {};
    if (currentActiveTab === 'sidequest') {
        const diff = parseInt(document.getElementById('taskDifficulty').value) || 1;
        payload = { 
            title: document.getElementById('questTitle').value, 
            category: document.getElementById('taskCategory').value, 
            difficulty: diff,
            points: diff * 10 // Calculate points based on difficulty
        };
    } else if (currentActiveTab === 'academic') {
        payload = { subject: document.getElementById('acadSubject').value, deadline: document.getElementById('acadDeadline').value, notes: document.getElementById('acadNote').value };
    } else {
        payload = { organization: document.getElementById('extraOrg').value, taskName: document.getElementById('extraTask').value, deadline: document.getElementById('extraDeadline').value, notes: document.getElementById('extraNote').value };
    }

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE}${endpoint}/${id}` : `${API_BASE}${endpoint}`;

    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    closeModal(); fetchData();
}

async function toggleStatus(id, currentStatus) {
    const newStatus = currentStatus === 'Done' ? 'To Do' : 'Done';
    const endpoint = currentActiveTab === 'extra' ? 'extracurriculars' : `${currentActiveTab}s`;
    await fetch(`${API_BASE}/${endpoint}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
    fetchData();
}

async function deleteItem(id) {
    if (!confirm("Delete this item?")) return;
    const endpoint = currentActiveTab === 'extra' ? 'extracurriculars' : `${currentActiveTab}s`;
    await fetch(`${API_BASE}/${endpoint}/${id}`, { method: 'DELETE' });
    fetchData();
}

function openModal() {
    document.getElementById('addModal').classList.remove('hidden');
    
    // Check if we are adding new or editing
    const editId = document.getElementById('editItemId').value;
    if (!editId) {
        document.getElementById('taskForm').reset();
        document.getElementById('modalTitle').innerText = "New Entry";
    }

    // Toggle field visibility based on tab
    document.getElementById('sidequestFields').classList.toggle('hidden', currentActiveTab !== 'sidequest');
    document.getElementById('academicFields').classList.toggle('hidden', currentActiveTab !== 'academic');
    document.getElementById('extraFields').classList.toggle('hidden', currentActiveTab !== 'extra');
}

function closeModal() { 
    document.getElementById('addModal').classList.add('hidden'); 
    document.getElementById('taskForm').reset(); 
    document.getElementById('editItemId').value = ''; // CRITICAL: Reset the edit ID
}

function editItem(item) {
    // 1. Set the ID first
    document.getElementById('editItemId').value = item._id;
    
    // 2. Open modal and update title
    openModal();
    document.getElementById('modalTitle').innerText = "Edit Entry";

    // 3. Populate data based on active tab
    if (currentActiveTab === 'sidequest') {
        document.getElementById('questTitle').value = item.title || "";
        document.getElementById('taskCategory').value = item.category || "wellness";
        document.getElementById('taskDifficulty').value = item.difficulty || "";
    } else if (currentActiveTab === 'academic') {
        document.getElementById('acadSubject').value = item.subject || "";
        if (item.deadline) {
            document.getElementById('acadDeadline').value = item.deadline.split('T')[0];
        }
        document.getElementById('acadNote').value = item.notes || "";
    } else if (currentActiveTab === 'extra') {
        document.getElementById('extraOrg').value = item.organization || "";
        document.getElementById('extraTask').value = item.taskName || "";
        if (item.deadline) {
            document.getElementById('extraDeadline').value = item.deadline.split('T')[0];
        }
        document.getElementById('extraNote').value = item.notes || "";
    }
}