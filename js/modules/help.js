/**
 * Help Manager for Jesster's Combat Tracker
 * Provides help documentation and tutorials
 */
class HelpManager {
    constructor(app) {
        this.app = app;
        console.log("Help Manager initialized");
    }
    
    /**
     * Initialize the help manager
     */
    async init() {
        // Nothing to initialize
    }
    
    /**
     * Open the help modal
     */
    openHelpModal() {
        const modal = this.app.ui.createModal({
            title: 'Help & Documentation',
            content: `
                <div class="space-y-6">
                    <div class="flex space-x-4">
                        <div class="w-64 bg-gray-700 p-4 rounded">
                            <h3 class="text-lg font-semibold text-primary-300 mb-4">Topics</h3>
                            <ul class="space-y-2">
                                <li><a href="#getting-started" class="help-link text-gray-300 hover:text-white">Getting Started</a></li>
                                <li><a href="#combat-basics" class="help-link text-gray-300 hover:text-white">Combat Basics</a></li>
                                <li><a href="#creatures" class="help-link text-gray-300 hover:text-white">Managing Creatures</a></li>
                                <li><a href="#initiative" class="help-link text-gray-300 hover:text-white">Initiative Tracking</a></li>
                                <li><a href="#conditions" class="help-link text-gray-300 hover:text-white">Conditions</a></li>
                                <li><a href="#dice" class="help-link text-gray-300 hover:text-white">Dice Rolling</a></li>
                                <li><a href="#player-view" class="help-link text-gray-300 hover:text-white">Player View</a></li>
                                <li><a href="#monsters" class="help-link text-gray-300 hover:text-white">Monster Search</a></li>
                                <li><a href="#characters" class="help-link text-gray-300 hover:text-white">Character Management</a></li>
                                <li><a href="#dndbeyond" class="help-link text-gray-300 hover:text-white">D&D Beyond Integration</a></li>
                                <li><a href="#encounters" class="help-link text-gray-300 hover:text-white">Saving Encounters</a></li>
                                <li><a href="#keyboard" class="help-link text-gray-300 hover:text-white">Keyboard Shortcuts</a></li>
                                <li><a href="#settings" class="help-link text-gray-300 hover:text-white">Settings</a></li>
                            </ul>
                        </div>
                        
                        <div class="flex-1 bg-gray-700 p-4 rounded max-h-[60vh] overflow-y-auto">
                            <div id="help-content">
                                <div id="getting-started" class="help-section">
                                    <h3 class="text-xl font-semibold text-primary-300 mb-4">Getting Started</h3>
                                    <p class="mb-4">Welcome to Jesster's Combat Tracker! This tool helps you manage combat encounters for tabletop role-playing games like Dungeons & Dragons.</p>
                                    <p class="mb-4">To get started:</p>
                                    <ol class="list-decimal list-inside space-y-2 mb-4">
                                        <li>Add heroes and monsters to the combat using the "Add Hero" and "Add Monster" buttons</li>
                                        <li>Click "Roll Initiative" to determine the turn order</li>
                                        <li>Click "Start Combat" to begin the encounter</li>
                                        <li>Use "Next Turn" to advance through the initiative order</li>
                                    </ol>
                                    <p>You can also open a Player View window to share with your players during the game.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex justify-between">
                        <button id="help-tutorial-btn" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                            Start Tutorial
                        </button>
                        <button id="help-close-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Close
                        </button>
                    </div>
                </div>
            `,
            width: 'max-w-5xl'
        });
        
        // Add event listeners
        const helpLinks = modal.querySelectorAll('.help-link');
        const helpContent = modal.querySelector('#help-content');
        const closeBtn = modal.querySelector('#help-close-btn');
        const tutorialBtn = modal.querySelector('#help-tutorial-btn');
        
        // Load help content when clicking on links
        helpLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const topic = link.getAttribute('href').substring(1);
                this.loadHelpTopic(helpContent, topic);
                
                // Update active link
                helpLinks.forEach(l => l.classList.remove('text-white', 'font-semibold'));
                link.classList.add('text-white', 'font-semibold');
            });
        });
        
        closeBtn.addEventListener('click', () => {
            this.app.ui.closeModal(modal);
        });
        
        tutorialBtn.addEventListener('click', () => {
            this.app.ui.closeModal(modal);
            this.startTutorial();
        });
    }
    
    /**
     * Load a help topic
     * @param {HTMLElement} container - The container element
     * @param {string} topic - The topic to load
     */
    loadHelpTopic(container, topic) {
        // Define help content for each topic
        const topics = {
            'getting-started': `
                <h3 class="text-xl font-semibold text-primary-300 mb-4">Getting Started</h3>
                <p class="mb-4">Welcome to Jesster's Combat Tracker! This tool helps you manage combat encounters for tabletop role-playing games like Dungeons & Dragons.</p>
                <p class="mb-4">To get started:</p>
                <ol class="list-decimal list-inside space-y-2 mb-4">
                    
