const state = {
    user: null,
    currentRoute: '/login', // /login, /onboarding, /dashboard, /log-meal, /social, /pantry
    meals: [
        { id: 1, name: 'Masala Oats', calories: 280, healthScore: 9, mood: 'Energized', portion: 1, time: '8:00 AM' },
        { id: 2, name: 'Palak Paneer with Roti', calories: 450, healthScore: 8, mood: 'Good', portion: 1.5, time: '1:00 PM' },
        { id: 3, name: 'Jalebi', calories: 350, healthScore: 2, mood: 'Terrible', portion: 2, time: '4:00 PM' }
    ],
    pantry: ['Tomatoes', 'Onions', 'Paneer', 'Spinach', 'Oats'],
    streaks: 8, // Over a week streak!
    badges: [
        { title: 'Early Bird', icon: 'fa-sun', color: '' }
    ],
    pendingMeal: null
};

// Check local storage
if (localStorage.getItem('nutrinova_state')) {
    const saved = JSON.parse(localStorage.getItem('nutrinova_state'));
    if(saved.user) {
        state.user = saved.user;
        state.currentRoute = '/dashboard';
        state.meals = saved.meals || state.meals;
        state.streaks = saved.streaks || state.streaks;
        state.badges = saved.badges || state.badges;
        state.pantry = saved.pantry || state.pantry;
    }
}

function saveState() {
    localStorage.setItem('nutrinova_state', JSON.stringify(state));
}

function navigate(route) {
    state.currentRoute = route;
    render();
}

function handleLogin(e) {
    e.preventDefault();
    navigate('/onboarding');
}

function handleOnboardingComplete(e) {
    e.preventDefault();
    state.user = {
        name: document.getElementById('name').value,
        age: document.getElementById('age').value,
        goal: document.getElementById('goal').value,
        medical: document.getElementById('medical').value.toLowerCase(),
    };
    saveState();
    navigate('/dashboard');
}

function logout() {
    state.user = null;
    state.currentRoute = '/login';
    localStorage.removeItem('nutrinova_state');
    render();
}

// Submitting a meal mockup
function handleLogMeal(e) {
    if(e) e.preventDefault();
    let foodName = 'Detected Food';
    if(document.getElementById('foodSearch')) {
        foodName = document.getElementById('foodSearch').value || 'Detected Food';
    }
    
    processMealRecognition(foodName);
}

function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if(file) {
        // Simulate analyzing the image for 1 second
        document.getElementById('uploadSpinner').innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Analyzing Image AI...';
        
        setTimeout(() => {
            // Mock Indian food detection from a photo
            const mockRecognitions = ['Masala Dosa', 'Chole Bhature', 'Paneer Tikka', 'Butter Chicken', 'Vegetable Biryani'];
            const randomFood = mockRecognitions[Math.floor(Math.random() * mockRecognitions.length)];
            processMealRecognition(randomFood);
        }, 1200);
    }
}

function processMealRecognition(foodName) {
    const isUnhealthy = foodName.toLowerCase().includes('donut') || 
                        foodName.toLowerCase().includes('cake') || 
                        foodName.toLowerCase().includes('sugar') || 
                        foodName.toLowerCase().includes('ice cream') ||
                        foodName.toLowerCase().includes('chole bhature') ||
                        foodName.toLowerCase().includes('jalebi');
                        
    // Base calories per 1 serving
    let baseCalories = Math.floor(Math.random() * 400) + 150;
    if(foodName.toLowerCase().includes('dosa')) baseCalories = 250;
    if(foodName.toLowerCase().includes('biryani')) baseCalories = 500;

    state.pendingMeal = {
        id: Date.now(),
        name: foodName,
        baseCalories: baseCalories,
        calories: baseCalories, // current calc
        portion: 1.0,
        healthScore: isUnhealthy ? 3 : 8,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        isUnhealthy
    };
    
    render(); // show modal
}

function updatePortion(val) {
    if(state.pendingMeal) {
        state.pendingMeal.portion = parseFloat(val);
        state.pendingMeal.calories = Math.round(state.pendingMeal.baseCalories * state.pendingMeal.portion);
        render(); // re-render modal with new calories
    }
}

function finishLoggingMeal(mood) {
    if(state.pendingMeal) {
        state.pendingMeal.mood = mood;
        state.meals.unshift(state.pendingMeal);
        
        // Gamification logic
        if (!state.pendingMeal.isUnhealthy) {
            state.streaks++;
        } else if (state.pendingMeal.isUnhealthy && state.streaks < 7) {
            state.streaks = 0; // Reset streak
        } else if (state.pendingMeal.isUnhealthy && state.streaks >= 7) {
            state.streaks = 0; // Claimed cheat meal
        }

        state.pendingMeal = null;
        saveState();
        navigate('/dashboard');
    }
}

function closeAlert() {
    state.pendingMeal = null;
    render();
}

// Pantry Functionality
function handleAddPantry(e) {
    e.preventDefault();
    const item = document.getElementById('pantryInput').value;
    if(item && !state.pantry.includes(item)) {
        state.pantry.push(item);
        document.getElementById('pantryInput').value = '';
        saveState();
        render();
    }
}

function removePantryItem(index) {
    state.pantry.splice(index, 1);
    saveState();
    render();
}

// Generators / Analyzers 
function generateMilestones() {
    let milestoneHtml = '';
    
    if(state.streaks >= 30) {
        milestoneHtml += `<div class="badge animate-fade-in"><div class="badge-icon gold"><i class="fa-solid fa-crown"></i></div><span class="badge-title">1 Month Elite</span></div>`;
    }
    if(state.streaks >= 7) {
        milestoneHtml += `<div class="badge animate-fade-in"><div class="badge-icon"><i class="fa-solid fa-fire"></i></div><span class="badge-title">1 Week Steak</span></div>`;
    }
    
    return milestoneHtml;
}

function getMoodCorrelations() {
    // Analyze meals and map moods
    let greatFoods = [];
    let terribleFoods = [];
    
    state.meals.forEach(m => {
        if(m.mood === 'Energized' || m.mood === 'Good') {
            if(!greatFoods.includes(m.name)) greatFoods.push(m.name);
        }
        if(m.mood === 'Terrible' || m.mood === 'Sluggish') {
            if(!terribleFoods.includes(m.name)) terribleFoods.push(m.name);
        }
    });

    return { great: greatFoods.slice(0,3), terrible: terribleFoods.slice(0,3) };
}


// UI Renderers
function renderLogin() {
    return `
        <div class="auth-container animate-fade-in glass-panel">
            <div class="text-center mb-6" style="margin-bottom: 2rem;">
                <h1 style="color: var(--accent-green); font-size: 2.5rem;"><i class="fa-solid fa-leaf"></i> NutriNova</h1>
                <p>Your smart companion for a healthier life.</p>
            </div>
            <form onsubmit="handleLogin(event)">
                <div class="input-group">
                    <label class="input-label">Email Address</label>
                    <input type="email" class="input-control" required placeholder="you@example.com">
                </div>
                <div class="input-group">
                    <label class="input-label">Password</label>
                    <input type="password" class="input-control" required placeholder="••••••••" value="password">
                </div>
                <button type="submit" class="btn btn-primary w-full mt-4">Sign In</button>
            </form>
        </div>
    `;
}

function renderOnboarding() {
    return `
        <div class="auth-container animate-fade-in glass-panel">
            <div class="text-center" style="margin-bottom: 2rem;">
                <h2>Personalize Your Journey</h2>
                <p>Tell us about yourself so we can tailor our AI recommendations.</p>
            </div>
            <form onsubmit="handleOnboardingComplete(event)">
                <div class="input-group">
                    <label class="input-label">Full Name</label>
                    <input id="name" type="text" class="input-control" required placeholder="Jane Doe" value="Vanya">
                </div>
                <div class="flex gap-4">
                    <div class="input-group w-full">
                        <label class="input-label">Age</label>
                        <input id="age" type="number" class="input-control" required placeholder="28" value="25">
                    </div>
                    <div class="input-group w-full">
                        <label class="input-label">Weight (kg)</label>
                        <input id="weight" type="number" class="input-control" required placeholder="65" value="70">
                    </div>
                </div>
                <div class="input-group">
                    <label class="input-label">Primary Goal</label>
                    <select id="goal" class="input-control" required>
                        <option value="lose">Weight Loss</option>
                        <option value="maintain">Maintain Weight</option>
                        <option value="gain">Muscle Gain</option>
                    </select>
                </div>
                <div class="input-group">
                    <label class="input-label">Medical History / Conditions</label>
                    <textarea id="medical" class="input-control" rows="3" placeholder="E.g., PCOS, PCOD, Diabetes, Lactose Intolerant..."></textarea>
                    <p style="font-size: 0.8rem; margin-top: 5px; color: var(--text-secondary);">Type "PCOS" or "PCOD" to activate hormonal/insulin health alerts for carbs & sugars.</p>
                </div>
                <button type="submit" class="btn btn-primary w-full mt-4">Start My Journey <i class="fa-solid fa-arrow-right"></i></button>
            </form>
        </div>
    `;
}

function renderNavbar() {
    if (!state.user) return '';
    return `
        <nav class="navbar animate-fade-in">
            <div class="nav-brand" onclick="navigate('/dashboard')">
                <i class="fa-solid fa-leaf"></i> NutriNova
            </div>
            <div class="nav-links">
                <a class="nav-link ${state.currentRoute === '/dashboard' ? 'active' : ''}" onclick="navigate('/dashboard')"><i class="fa-solid fa-chart-line"></i> Dashboard</a>
                <a class="nav-link ${state.currentRoute === '/pantry' ? 'active' : ''}" onclick="navigate('/pantry')"><i class="fa-solid fa-box-open"></i> Pantry</a>
                <a class="nav-link ${state.currentRoute === '/log-meal' ? 'active' : ''}" onclick="navigate('/log-meal')"><i class="fa-solid fa-camera"></i> Log Meal</a>
                <a class="nav-link ${state.currentRoute === '/social' ? 'active' : ''}" onclick="navigate('/social')"><i class="fa-solid fa-users"></i> Social</a>
                <a class="nav-link" onclick="logout()" title="Logout"><i class="fa-solid fa-sign-out-alt"></i></a>
            </div>
            <div class="user-avatar">${state.user.name.charAt(0).toUpperCase()}</div>
        </nav>
    `;
}

function renderDashboard() {
    const totalCals = state.meals.reduce((sum, m) => sum + m.calories, 0);
    const cheatMealUnlocked = state.streaks >= 7;
    const moodBoard = getMoodCorrelations();
    const milestones = generateMilestones();
    
    let mealList = state.meals.map(m => `
        <div class="meal-item">
            <div class="flex items-center">
                <div class="meal-icon"><i class="fa-solid fa-utensils"></i></div>
                <div>
                    <h4>${m.name} <span style="font-size: 0.8rem; color: var(--text-secondary);">x${m.portion}</span></h4>
                    <p style="font-size: 0.8rem; margin-top:2px; color: var(--text-secondary);">${m.calories} kcal • Mood: ${m.mood || 'N/A'}</p>
                </div>
            </div>
            <div style="text-align: right; font-size: 0.9rem; color: var(--text-secondary);">
                ${m.time}
            </div>
        </div>
    `).join('');

    return `
        <div class="container animate-fade-in">
            <div class="flex justify-between items-center mb-6" style="margin-bottom: 2rem;">
                <div>
                    <h1 style="font-size: 2rem;">Welcome back, ${state.user.name}!</h1>
                    <p>Here's your nutritional summary for today.</p>
                </div>
            </div>

            <div class="dashboard-grid">
                <!-- Main Stats -->
                <div class="glass-panel">
                    <h3>Today's Nutrition</h3>
                    <div class="stat-card mt-6">
                        <div class="stat-icon green"><i class="fa-solid fa-fire"></i></div>
                        <div class="w-full">
                            <div class="flex justify-between">
                                <span>Calories Consumed</span>
                                <strong>${totalCals} / 2200</strong>
                            </div>
                            <div class="progress-bar"><div class="progress-fill" style="width: ${Math.min((totalCals/2200)*100, 100)}%"></div></div>
                        </div>
                    </div>
                </div>

                <!-- Gamification: Streaks & Bootcamp -->
                <div class="glass-panel">
                    <h3>Your Streaks</h3>
                    <div class="flex items-center gap-4 mt-4">
                        <div class="stat-icon orange" style="font-size: 2rem;"><i class="fa-solid fa-fire-flame-curved"></i></div>
                        <div>
                            <h2 style="margin:0; font-size: 1.8rem;">${state.streaks} Days</h2>
                            <p style="font-size: 0.9rem; color: var(--text-secondary);">Healthy eating streak!</p>
                        </div>
                    </div>
                    
                    ${cheatMealUnlocked ? `
                        <div class="mt-4 p-4" style="background: var(--accent-purple-glow); border-radius: 12px; border: 1px solid var(--accent-purple);">
                            <h4 style="color: var(--accent-purple);"><i class="fa-solid fa-gift"></i> Cheat Meal Unlocked!</h4>
                            <p style="font-size: 0.8rem; margin-top: 5px; color: var(--text-secondary);">You've hit a milestone. Enjoy a treat today without resetting your streak.</p>
                        </div>
                    ` : `
                        <div class="mt-4">
                            <p style="font-size: 0.8rem; color: var(--text-secondary);">${7 - state.streaks} more days to unlock a Cheat Meal!</p>
                            <div class="progress-bar"><div class="progress-fill" style="width: ${(state.streaks/7)*100}%; background: var(--accent-purple);"></div></div>
                        </div>
                    `}
                </div>

                <!-- Gamification: Badges & Milestones -->
                <div class="glass-panel">
                    <h3>Milestones & Badges</h3>
                    <div class="badge-container mt-4">
                        ${milestones}
                        ${state.badges.map(b => `
                            <div class="badge animate-fade-in" style="animation-duration: 0.8s;">
                                <div class="badge-icon"><i class="fa-solid ${b.icon}"></i></div>
                                <span class="badge-title">${b.title}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Mood Analytics Board -->
                <div class="glass-panel">
                    <h3>Your Mood Board <i class="fa-solid fa-brain" style="color: var(--accent-purple);"></i></h3>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 5px; margin-bottom: 1rem;">AI correlation between your meals and biometrics.</p>
                    
                    <div>
                        <strong style="font-size: 0.9rem;">Foods fueling you up:</strong><br/>
                        ${moodBoard.great.length > 0 ? moodBoard.great.map(f => `<span class="mood-tag great"><i class="fa-solid fa-bolt"></i> ${f}</span>`).join('') : '<span style="font-size: 0.8rem; color: var(--text-secondary);">Log more meals to see insights.</span>'}
                    </div>
                    
                    <div style="margin-top: 1rem;">
                        <strong style="font-size: 0.9rem;">Foods draining you:</strong><br/>
                        ${moodBoard.terrible.length > 0 ? moodBoard.terrible.map(f => `<span class="mood-tag bad"><i class="fa-solid fa-battery-empty"></i> ${f}</span>`).join('') : '<span style="font-size: 0.8rem; color: var(--text-secondary);">Doing great! Nothing draining.</span>'}
                    </div>
                </div>
            </div>

            <div class="glass-panel mt-8">
                <div class="flex justify-between items-center" style="margin-bottom: 1.5rem;">
                    <h3>Recent Meals</h3>
                    <button class="btn btn-primary" onclick="navigate('/log-meal')"><i class="fa-solid fa-plus"></i></button>
                </div>
                ${mealList || '<p class="text-center" style="padding: 2rem;">No meals logged today yet.</p>'}
            </div>
        </div>
    `;
}

function renderPantry() {
    let mockRecipes = '';
    if(state.pantry.includes('Paneer') && state.pantry.includes('Tomatoes')) {
        mockRecipes += `
            <div class="recipe-card">
                <div class="flex justify-between">
                    <h4>Paneer Tikka Masala <span class="badge-title" style="color: var(--accent-green);">(95% Match)</span></h4>
                    <i class="fa-solid fa-fire" style="color: var(--accent-orange);"></i>
                </div>
                <p style="font-size: 0.85rem; margin-top: 6px;">Uses your: Paneer, Tomatoes, Onions.</p>
            </div>
        `;
    }
    if(state.pantry.includes('Oats')) {
        mockRecipes += `
            <div class="recipe-card">
                <div class="flex justify-between">
                    <h4>Masala Oats <span class="badge-title" style="color: var(--accent-green);">(100% Match)</span></h4>
                    <i class="fa-solid fa-leaf" style="color: var(--accent-green);"></i>
                </div>
                <p style="font-size: 0.85rem; margin-top: 6px;">Super healthy breakfast using: Oats, Tomatoes, Onions.</p>
            </div>
        `;
    }

    return `
        <div class="container animate-fade-in" style="max-width: 900px;">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h2>Virtual Pantry Tracker</h2>
                    <p>Track your ingredients and get smart Indian & Global meal suggestions.</p>
                </div>
            </div>

            <div class="dashboard-grid" style="grid-template-columns: 1fr 1fr;">
                <div class="glass-panel">
                    <h3>Your Ingredients</h3>
                    <form onsubmit="handleAddPantry(event)" class="mt-4 flex gap-2">
                        <input id="pantryInput" type="text" class="input-control" placeholder="E.g., Dal, Paneer, Rice..." required>
                        <button type="submit" class="btn btn-primary"><i class="fa-solid fa-plus"></i> Add</button>
                    </form>

                    <div class="mt-6">
                        ${state.pantry.length === 0 ? '<p>Your pantry is empty.</p>' : ''}
                        ${state.pantry.map((item, index) => `
                            <span class="pantry-tag">
                                ${item} <button onclick="removePantryItem(${index})"><i class="fa-solid fa-xmark"></i></button>
                            </span>
                        `).join('')}
                    </div>
                </div>

                <div class="glass-panel">
                    <h3>Smart Recipe Generator</h3>
                    <p style="font-size: 0.85rem; margin-top: 4px; margin-bottom: 1rem; color: var(--text-secondary);">AI is suggesting meals based on your ${state.pantry.length} pantry items.</p>
                    
                    ${mockRecipes || '<p>Add ingredients like Paneer, Tomatoes, or Oats to see magic recipes emerge!</p>'}
                </div>
            </div>
        </div>
    `;
}

function renderLogMeal() {
    return `
        <div class="container animate-fade-in" style="max-width: 800px;">
            <div class="glass-panel">
                <div class="flex justify-between items-center" style="margin-bottom: 2rem;">
                    <h2>Record a Meal</h2>
                    <button class="btn btn-secondary" onclick="navigate('/dashboard')">Back</button>
                </div>

                <div class="upload-zone">
                    <input type="file" id="fileUpload" class="upload-input-real" accept="image/*" capture="environment" onchange="handlePhotoUpload(event)">
                    <div id="uploadSpinner">
                        <i class="fa-solid fa-camera"></i>
                        <h3>Smart Photo Recognition</h3>
                        <p style="margin-top: 10px; color: var(--text-secondary);">Tap to open camera or upload file.<br/>(Will recognize Indian & Global Cuisines)</p>
                    </div>
                </div>

                <div class="text-center" style="margin: 2rem 0; color: var(--text-secondary);">OR</div>

                <form onsubmit="handleLogMeal(event)">
                    <div class="input-group">
                        <label class="input-label">Search Food Database</label>
                        <div class="flex gap-2">
                            <input id="foodSearch" type="text" class="input-control" placeholder="E.g., Masala Dosa, Cake, Chole Bhature..." required>
                            <button type="submit" class="btn btn-primary"><i class="fa-solid fa-magnifying-glass"></i></button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `;
}

function renderSocial() {
    return `
        <div class="container animate-fade-in">
            <h1 style="margin-bottom: 2rem;">Community & Challenges</h1>
            <div class="dashboard-grid">
                <div class="glass-panel">
                    <h3>Active Group Challenges</h3>
                    <div class="meal-item mt-4" style="border-left: 4px solid var(--accent-purple);">
                        <div class="flex items-center">
                            <div class="meal-icon"><i class="fa-solid fa-trophy" style="color: var(--accent-orange);"></i></div>
                            <div>
                                <h4>30 Days No Processed Sugar</h4>
                                <p style="font-size: 0.8rem; margin-top:2px; color: var(--text-secondary);">1,240 participants</p>
                            </div>
                        </div>
                        <button class="btn btn-secondary text-sm">Joined</button>
                    </div>
                </div>
                <div class="glass-panel">
                    <h3>Friend Leaderboard</h3>
                    <div class="flex justify-between items-center p-3" style="background: rgba(255,255,255,0.05); border-radius: 8px; margin-top: 1rem;">
                        <div class="flex items-center gap-2">
                            <strong style="color: var(--accent-orange);">1</strong>
                            <div class="user-avatar" style="width: 30px; height: 30px; font-size: 0.8rem;">S</div>
                            <span>Sarah M.</span>
                        </div>
                        <span style="color: var(--accent-green);"><i class="fa-solid fa-fire"></i> 14 Days</span>
                    </div>
                    <div class="flex justify-between items-center p-3" style="background: rgba(139, 92, 246, 0.2); border-radius: 8px; margin-top: 0.5rem; border: 1px solid var(--accent-purple);">
                        <div class="flex items-center gap-2">
                            <strong>2</strong>
                            <div class="user-avatar" style="width: 30px; height: 30px; font-size: 0.8rem;">${state.user.name.charAt(0)}</div>
                            <span>You</span>
                        </div>
                        <span style="color: var(--accent-green);"><i class="fa-solid fa-fire"></i> ${state.streaks} Days</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderModal() {
    if (!state.pendingMeal) return '';
    
    const m = state.pendingMeal;
    const isPCOS = state.user.medical.includes('pcod') || state.user.medical.includes('pcos');
    const isDiabetic = state.user.medical.includes('diabet');
    
    let warningHtml = '';
    
    // PCOS logic: strictly monitor refined carbs and sugar due to insulin resistance
    if (m.isUnhealthy && isPCOS) {
        warningHtml = `
            <div class="medical-alert">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <div>
                    <strong>PCOS/PCOD Alert ⚠️</strong>
                    <p style="font-size: 0.9rem; margin-top: 4px; color: var(--text-secondary);">This food contains highly refined carbohydrates or sugar. For optimal PCOS management, avoiding insulin spikes is critical.</p>
                    <p style="font-size: 0.9rem; margin-top: 8px;"><strong>Cyster Alternative:</strong> Swap for complex carbs like Ragi, Millet, or add more protein/fiber to blunt the spike.</p>
                </div>
            </div>
        `;
    } else if (m.isUnhealthy && isDiabetic) {
        warningHtml = `
            <div class="medical-alert">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <div>
                    <strong>Medical Warning (Diabetes)</strong>
                    <p style="font-size: 0.9rem; margin-top: 4px; color: var(--text-secondary);">This food has a high glycemic index. Consuming this may cause a sharp blood sugar spike.</p>
                </div>
            </div>
        `;
    } else if (m.isUnhealthy && state.streaks < 7) {
        warningHtml = `
            <div class="medical-alert" style="background: rgba(245, 158, 11, 0.1); border-left-color: var(--accent-orange);">
                <i class="fa-solid fa-circle-exclamation" style="color: var(--accent-orange);"></i>
                <div>
                    <strong style="color: var(--accent-orange);">Streak Warning</strong>
                    <p style="font-size: 0.9rem; margin-top: 4px; color: var(--text-secondary);">This breaks your healthy streak! Cheat meals unlock at 7 days.</p>
                </div>
            </div>
        `;
    }

    return `
        <div class="modal-overlay animate-fade-in" style="animation-duration: 0.2s;">
            <div class="modal-content glass-panel" style="animation: fadeIn 0.4s ease-out forwards; transform: translateY(20px);">
                <h2>Food Detected <i class="fa-solid fa-check-circle" style="color: var(--accent-green);"></i></h2>
                
                <div style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 12px; margin-top: 1rem;">
                    <h3>${m.name}</h3>
                    
                    <div class="flex justify-between items-center mt-4">
                        <div class="input-group" style="margin-bottom: 0;">
                            <label class="input-label" style="font-size: 0.8rem;">Est. Portion Size</label>
                            <input type="number" step="0.5" min="0.5" value="${m.portion}" class="input-control" style="width: 100px; padding: 8px;" onchange="updatePortion(this.value)">
                        </div>
                        <strong style="color: var(--accent-green); font-size: 1.5rem;">${m.calories} <span style="font-size: 0.8rem;">kcal</span></strong>
                    </div>
                </div>

                ${warningHtml}

                <div class="mt-6 text-center">
                    <h3>How did this make you feel? (Or how do you feel right now?)</h3>
                    <div class="mood-options">
                        <button class="mood-btn" onclick="finishLoggingMeal('Terrible')" title="Terrible">🤢</button>
                        <button class="mood-btn" onclick="finishLoggingMeal('Sluggish')" title="Sluggish">😴</button>
                        <button class="mood-btn" onclick="finishLoggingMeal('Okay')" title="Okay">😐</button>
                        <button class="mood-btn" onclick="finishLoggingMeal('Good')" title="Good">🙂</button>
                        <button class="mood-btn" onclick="finishLoggingMeal('Energized')" title="Energized">😎</button>
                    </div>
                </div>
                
                <button class="btn btn-secondary w-full" onclick="closeAlert()">Cancel Entry</button>
            </div>
        </div>
    `;
}

function render() {
    const app = document.getElementById('app');
    let content = '';

    switch(state.currentRoute) {
        case '/login': content = renderLogin(); break;
        case '/onboarding': content = renderOnboarding(); break;
        case '/dashboard': content = renderDashboard(); break;
        case '/log-meal': content = renderLogMeal(); break;
        case '/social': content = renderSocial(); break;
        case '/pantry': content = renderPantry(); break;
        default: content = renderLogin();
    }

    app.innerHTML = renderNavbar() + content + renderModal();
}

// Initial render
window.addEventListener('DOMContentLoaded', render);
