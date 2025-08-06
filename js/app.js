// Simplified app.js for testing
console.log("App.js loading...");

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, starting initialization");
    
    // Find the app container
    const appContainer = document.getElementById('app-container');
    console.log("App container found:", appContainer);
    
    if (!appContainer) {
        console.error("FATAL ERROR: Could not find #app-container");
        return;
    }
    
    // Render the UI
    console.log("Rendering UI...");
    appContainer.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Combat Timeline -->
            <div class="md:col-span-2 bg-gray-800 p-4 rounded-lg">
                <h2 class="text-xl font-semibold mb-2">Combat Timeline</h2>
                <div id="combat-timeline" class="combat-timeline">
                    <span>Timeline will appear here</span>
                </div>
            </div>
            
            <!-- Heroes Column -->
            <div id="heroes-column" class="bg-gray-800 p-4 rounded-lg shadow-lg border-2 border-transparent">
                <h2 class="text-2xl font-semibold mb-4 text-center text-blue-400">Heroes</h2>
                <div id="heroes-list" class="overflow-y-auto tracker-column space-y-3 pr-2">
                    <p class="text-center text-gray-400">No heroes added yet</p>
                </div>
                <div class="mt-4">
                    <button id="add-hero-btn" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300">Add Hero</button>
                </div>
            </div>
            
            <!-- Monsters Column -->
            <div id="monsters-column" class="bg-gray-800 p-4 rounded-lg shadow-lg border-2 border-transparent">
                <h2 class="text-2xl font-semibold mb-4 text-center text-red-400">Monsters</h2>
                <div id="monsters-list" class="overflow-y-auto tracker-column space-y-3 pr-2">
                    <p class="text-center text-gray-400">No monsters added yet</p>
                </div>
                <div class="mt-4">
                    <button id="add-monster-btn" class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300">Add Monster</button>
                </div>
            </div>
            
            <!-- Combat Controls -->
            <div class="md:col-span-2 flex flex-wrap justify-center gap-4">
                <button id="roll-all-btn" class="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300">Roll All Initiative</button>
                <button id="start-combat-btn" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300" disabled>Start Combat</button>
                <button id="end-turn-btn" class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300" disabled>End Turn</button>
                <button id="reset-combat-btn" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300">Reset Combat</button>
                <button id="end-combat-btn" class="bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300">End Combat</button>
            </div>
            
            <!-- Combat Log -->
            <div class="md:col-span-2">
                <h2 class="text-xl font-bold text-gray-100 mb-2">Combat Log</h2>
                <div id="combat-log-container" class="border border-gray-700 p-2 rounded-lg h-48 overflow-y-auto">
                    <p class="text-sm text-gray-400">Combat log will appear here</p>
                </div>
            </div>
        </div>
    `;
    
    // Check if elements were created
    console.log("Checking if elements were created:");
    const elementsToCheck = [
        'combat-log-container', 'roll-all-btn', 'start-combat-btn', 
        'end-turn-btn', 'reset-combat-btn', 'end-combat-btn',
        'heroes-list', 'monsters-list', 'add-hero-btn', 'add-monster-btn'
    ];
    
    elementsToCheck.forEach(id => {
        const element = document.getElementById(id);
        console.log(`Element #${id} found:`, !!element);
    });
    
    // Add event listener to test button
    const addHeroBtn = document.getElementById('add-hero-btn');
    if (addHeroBtn) {
        addHeroBtn.addEventListener('click', () => {
            alert('Add Hero button clicked!');
        });
    }
    
    console.log("Initialization complete");
});
