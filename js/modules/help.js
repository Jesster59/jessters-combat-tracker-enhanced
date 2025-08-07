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
                    <li>Add heroes and monsters to the combat using the "Add Hero" and "Add Monster" buttons</li>
                    <li>Click "Roll Initiative" to determine the turn order</li>
                    <li>Click "Start Combat" to begin the encounter</li>
                    <li>Use "Next Turn" to advance through the initiative order</li>
                </ol>
                <p>You can also open a Player View window to share with your players during the game.</p>
            `,
            'combat-basics': `
                <h3 class="text-xl font-semibold text-primary-300 mb-4">Combat Basics</h3>
                <p class="mb-4">Combat in Jesster's Combat Tracker follows these steps:</p>
                <ol class="list-decimal list-inside space-y-2 mb-4">
                    <li><strong>Setup:</strong> Add all participants (heroes and monsters) to the tracker</li>
                    <li><strong>Initiative:</strong> Roll initiative to determine turn order</li>
                    <li><strong>Start Combat:</strong> Begin the encounter with the "Start Combat" button</li>
                    <li><strong>Turns:</strong> Each participant takes their turn in initiative order</li>
                    <li><strong>Next Turn:</strong> Advance to the next participant with the "Next Turn" button</li>
                    <li><strong>Rounds:</strong> After all participants have taken their turn, a new round begins</li>
                    <li><strong>End Combat:</strong> End the encounter with the "End Combat" button</li>
                </ol>
                <p class="mb-4">During combat, you can:</p>
                <ul class="list-disc list-inside space-y-2">
                    <li>Apply damage or healing to creatures</li>
                    <li>Add or remove conditions</li>
                    <li>Roll dice for attacks, saves, and checks</li>
                    <li>Track action economy (actions, bonus actions, reactions)</li>
                </ul>
            `,
            'creatures': `
                <h3 class="text-xl font-semibold text-primary-300 mb-4">Managing Creatures</h3>
                <p class="mb-4">Creatures in the tracker can be either heroes (player characters) or monsters (NPCs and enemies).</p>
                
                <h4 class="text-lg font-semibold text-gray-300 mb-2">Adding Heroes</h4>
                <p class="mb-4">You can add heroes in several ways:</p>
                <ul class="list-disc list-inside space-y-2 mb-4">
                    <li>Click "Add Hero" and select from saved characters</li>
                    <li>Click "Add Hero" and create a new quick hero</li>
                    <li>Import characters from D&D Beyond</li>
                </ul>
                
                <h4 class="text-lg font-semibold text-gray-300 mb-2">Adding Monsters</h4>
                <p class="mb-4">You can add monsters in several ways:</p>
                <ul class="list-disc list-inside space-y-2 mb-4">
                    <li>Click "Add Monster" and search the Open5e SRD</li>
                    <li>Click "Add Monster" and select from your saved monsters</li>
                    <li>Click "Add Monster" and create a new quick monster</li>
                    <li>Use the Monster Search panel to find and add monsters</li>
                </ul>
                
                <h4 class="text-lg font-semibold text-gray-300 mb-2">Managing Creatures in Combat</h4>
                <p class="mb-4">For each creature, you can:</p>
                <ul class="list-disc list-inside space-y-2">
                    <li>Apply damage with the "Damage" button</li>
                    <li>Apply healing with the "Heal" button</li>
                    <li>Remove from combat with the "Remove" button</li>
                    <li>Add or remove conditions</li>
                    <li>Track concentration on spells</li>
                    <li>Track action economy (actions, bonus actions, reactions)</li>
                </ul>
            `,
            'initiative': `
                <h3 class="text-xl font-semibold text-primary-300 mb-4">Initiative Tracking</h3>
                <p class="mb-4">Initiative determines the order in which creatures take their turns in combat.</p>
                
                <h4 class="text-lg font-semibold text-gray-300 mb-2">Rolling Initiative</h4>
                <p class="mb-4">Click the "Roll Initiative" button to roll initiative for all creatures in the tracker. Each creature rolls 1d20 and adds their initiative modifier.</p>
                
                <h4 class="text-lg font-semibold text-gray-300 mb-2">Initiative Order</h4>
                <p class="mb-4">Creatures are sorted by their initiative roll from highest to lowest. In case of a tie, creatures are sorted by their Dexterity score, and then alphabetically by name.</p>
                
                <h4 class="text-lg font-semibold text-gray-300 mb-2">Turn Management</h4>
                <p class="mb-4">Once combat has started, the current turn is highlighted in the initiative order. Click "Next Turn" to advance to the next creature in the order.</p>
                
                <h4 class="text-lg font-semibold text-gray-300 mb-2">Rounds</h4>
                <p class="mb-4">A round is complete when all creatures have taken their turn. The tracker automatically increments the round counter and resets action economy for all creatures.</p>
                
                <h4 class="text-lg font-semibold text-gray-300 mb-2">Group Initiative (Optional)</h4>
                <p class="mb-4">If enabled in Settings, creatures of the same type (e.g., all goblins) will share the same initiative roll.</p>
            `,
            'conditions': `
                <h3 class="text-xl font-semibold text-primary-300 mb-4">Conditions</h3>
                <p class="mb-4">Conditions represent various effects that can alter a creature's capabilities in combat.</p>
                
                <h4 class="text-lg font-semibold text-gray-300 mb-2">Standard Conditions</h4>
                <p class="mb-4">The tracker supports all standard D&D 5e conditions:</p>
                <ul class="list-disc list-inside space-y-2 mb-4">
                    <li>Blinded</li>
                    <li>Charmed</li>
                    <li>Deafened</li>
                    <li>Frightened</li>
                    <li>Grappled</li>
                    <li>Incapacitated</li>
                    <li>Invisible</li>
                    <li>Paralyzed</li>
                    <li>Petrified</li>
                    <li>Poisoned</li>
                    <li>Prone</li>
                    <li>Restrained</li>
                    <li>Stunned</li>
                    <li>Unconscious</li>
                    <li>Exhaustion (levels 1-6)</li>
                </ul>
                
                <h4 class="text-lg font-semibold text-gray-300 mb-2">Adding Conditions</h4>
                <p class="mb-4">To add a condition to a creature, click on the creature and select "Add Condition" from the context menu. You can specify a duration in rounds for the condition.</p>
                
                <h4 class="text-lg font-semibold text-gray-300 mb-2">Removing Conditions</h4>
                <p class="mb-4">To remove a condition, click on the condition tag on the creature card or use the "Manage Conditions" option from the context menu.</p>
                
                <h4 class="text-lg font-semibold text-gray-300 mb-2">Condition Duration</h4>
                <p class="mb-4">If a condition has a duration in rounds, it will automatically count down each round. When the duration reaches 0, you'll be prompted to remove the condition.</p>
            `,
            'dice': `
                <h3 class="text-xl font-semibold text-primary-300 mb-4">Dice Rolling</h3>
                <p class="mb-4">The tracker includes a built-in dice roller for all your dice rolling needs.</p>
                
                <h4 class="text-lg font-semibold text-gray-300 mb-2">Quick Dice</h4>
                <p class="mb-4">Use the Quick Dice panel to roll common dice types (d4, d6, d8, d10, d12, d20) with a single click.</p>
                
                <h4 class="text-lg font-semibold text-gray-300 mb-2">Custom Dice</h4>
                <p class="mb-4">Enter custom dice notation in the input field and click "Roll" to roll more complex combinations.</p>
                <p class="mb-4">Supported notation:</p>
                <ul class="list-disc list-inside space-y-2 mb-4">
                    <li><code>NdX</code>: Roll N dice with X sides (e.g., 2d6)</li>
                    <li><code>NdX+M</code>: Roll N dice with X sides and add modifier M (e.g., 2d6+3)</li>
                    <li><code>NdX-M</code>: Roll N dice with X sides and subtract modifier M (e.g., 2d6-1)</li>
                    <li>Multiple dice can be combined (e.g., 1d20+2d4+5)</li>
                </ul>
                
                <h4 class="text-lg font-semibold text-gray-300 mb-2">Advantage and Disadvantage</h4>
                <p class="mb-4">For d20 rolls, you can roll with advantage or disadvantage by using the context menu or keyboard shortcuts.</p>
                
                <h4 class="text-lg font-semibold text-gray-300 mb-2">Dice History</h4>
                <p class="mb-4">The tracker keeps a history of your recent dice rolls, which you can view in the Dice panel.</p>
            `,
            'player-view': `
                <h3 class="text-xl font-semibold text-primary-300 mb-4">Player View</h3>
                <p class="mb-4">The Player View is a separate window that you can share with your players to show them the current combat state.</p>
                
                <h4 class="text-lg font-semibold text-gray-300 mb-2">Opening the Player View</h4>
                <p class="mb-4">Click the "Open Player View" button to open the Player View in a new window. You can then share this window with your players via screen sharing or by moving it to a secondary monitor.</p>
                
                <h4 class="text-lg font-semibold text-gray-300 mb-2">HP Display Options</h4>
                <p class="mb-4">You can choose how to display HP in the Player View:</p>
                <ul class="list-disc list-inside space-y-2 mb-4">
                    <li><strong>Descriptive:</strong> Shows HP status as descriptive terms (Healthy, Injured, Bloodied, Critical)</li>
                    <li><strong>Exact:</strong> Shows exact HP values for heroes, but not for monsters</li>
                    <li><strong>Hidden:</strong> Hides HP values for all creatures</li>
                </ul>
                
                <h4 class="text-lg font-semibold text-gray-300 mb-2">Themes</h4>
                <p class="mb-4">You can choose from several themes for the Player View:</p>
                <ul class="list-disc list-inside space-y-2 mb-4">
                    <li>Default</li>
                    <li>Dungeon</li>
                    <li>Forest</li>
                    <li>Castle</li>
                    <li>Tavern</li>
                    <li>Custom (URL)</li>
                </ul>
                
                <h4 class="text-lg font-semibold text-gray-300 mb-2">Auto-Refresh</h4>
                <p class="mb-4">The Player View automatically refreshes every few seconds to show the latest combat state. You can adjust the refresh rate in Settings.</p>
            `,
            'monsters': `
                <h3 class="text-xl font-semibold text-primary-300 mb-4">Monster Search</h3>
                <p class="mb-4">The Monster Search feature allows you to search for monsters from the Open5e SRD database.</p>
                
                <h4 class="text-lg font-semibold text-gray-300 mb-2">Searching for Monsters</h4>
                <p class="mb-4">Enter a search term in the Monster Search input field and click "Search" to find monsters matching your query.</p>
                
                <h4 class="text-lg font-semibold text-gray-300 mb-2">Viewing Monster Details</h4>
                <p class="mb-4">Click on a monster in the search results to view its full statblock, including abilities, actions, and special features.</p>
                
                <h4 class="text-lg font-semibold text-gray-300 mb-2">Adding Monsters to Combat</h4>
                <p class="mb-4">From the monster statblock, you can add the monster to the current combat. You can specify the quantity if you want to add multiple copies of the same monster.</p>
                
                <h4 class="text-lg font-semibold text-gray-300 mb-2">Saving Monsters</h4>
                <p class="mb-4">You can save monsters to your collection for quick access later. Saved monsters appear in the "Your Monster Collection" section when adding monsters.</p>
            `,
            'characters': `
                <h3 class="text-xl font-semibold text-primary-300 mb-4">Character Management</h3>
                <p class="mb-4">The Character Management feature allows you to create, edit, and store character data for your players.</p>
                
                <h4 class="text-lg font-semibold text-gray-300 mb-2">Opening Character Management</h4>
                <p class="mb-4">Click the "Manage Characters" button to open the Character Management modal.</p>
                
                <h4 class="text-lg font-semibold text-gray-300 mb-2">Creating Characters</h4>
                <p class="mb-4">Fill out the character form with the character's details and click "Save Character" to create a new character.</p>
                
                <h4 class="text-lg font-semibold text-gray-300 mb-2">Editing Characters</h4>
                <p class="mb-4">Click the "Edit" button next to a character in the list to load their data into the form for editing.</p>
                
                <h4 class="text-lg font-semibold text-gray-300 mb-2">Deleting Characters</h4>
                <p class="mb-4">Click the "Del" button next to a character in the list to delete them from your collection.</p>
                
                <h4 class="text-lg font-semibold text-gray-300 mb-2">Adding Characters to Combat</h4>
                <p class="mb-4">Click the "Add" button next to a character in the list to add them to the current combat.</p>
            `,
            'dndbeyond': `
                <h3 class="text-xl font-semibold text-primary-300 mb-4">D&D Beyond Integration</h3>
                <p class="mb-4">The tracker can import character data from D&D Beyond to save you time and effort.</p>
                
                <h4 class="text-lg font-semibold text-gray-300 mb-2">Importing from D&D Beyond</h4>
                <p class="mb-4">To import a character from D&D Beyond:</p>
                <ol class="list-decimal list-inside space-y-2 mb-4">
                    <li>Click the "Import from D&D Beyond" button</li>
                    <li>Open your character sheet on D&D Beyond in another tab</li>
                    <li>Open the browser's developer tools (Ctrl+Shift+I or Cmd+Option+I)</li>
                    <li>Go to the Console tab</li>
                    <li>Paste the provided code snippet and press Enter</li>
                    <li>Copy the JSON output that appears</li>
                    <li>Paste it into the import field in the tracker</li>
                    <li>Click "Import Character"</li>
                </ol>
                
                <h4 class="text-lg font-semibold text-gray-300 mb-2">Imported Data</h4>
                <p class="mb-4">The following data is imported from D&D Beyond:</p>
                <ul class="list-disc list-inside space-y-2 mb-4">
                    <li>Character name</li>
                    <li>HP, AC, and initiative bonus</li>
                    <li>Ability scores and modifiers</li>
                    <li>Saving throw proficiencies</li>
                    <li>Passive Perception</li>
                    <li>Spell save DC (if applicable)</li>
                    <li>Class, level, race, and background</li>
                </ul>
                
                <h4 class="text-lg font-semibold text-gray-300 mb-2">Limitations</h4>
                <p class="mb-4">The D&D Beyond import has some limitations:</p>
                <ul class="list-disc list-inside space-y-2">
                    <li>It only imports basic character data, not spells or items</li>
                    <li>It requires manual copy-pasting of data</li>
                    <li>It may not work if D&D Beyond changes their website structure</li>
                </ul>
            `,
            'encounters': `
                <h3 class="text-xl font-semibold text-primary-300 mb-4">Saving Encounters</h3>
                <p class="mb-4">You can save and load encounters to reuse them in future sessions.</p>
                
                <h4 class="text-lg font-semibold text-gray-300 mb-2">Saving an Encounter</h4>
                <p class="mb-4">To save the current encounter:</p>
                <ol class="list-decimal list-inside space-y-2 mb-4">
                    <li>Add all heroes and monsters to the tracker</li>
                    <li>Click the "Save Encounter" button</li>
                    <li>Enter a name and optional description for the encounter</li>
                    <li>Click "Save Encounter" in the modal</li>
                </ol>
                
                <h4 class="text-lg font-semibold text-gray-300 mb-2">Loading an Encounter</h4>
                <p class="mb-4">To load a saved encounter:</p>
                <ol class="list-decimal list-inside space-y-2 mb-4">
                    <li>Click the "Load Encounter" button</li>
                    <li>Select the encounter from the list</li>
                    <li>Click "Load" next to the encounter</li>
                </ol>
                <p class="mb-4">Note that loading an encounter will replace all current combatants.</p>
                
                <h4 class="text-lg font-semibold text-gray-300 mb-2">Deleting an Encounter</h4>
                <p class="mb-4">To delete a saved encounter:</p>
                <ol class="list-decimal list-inside space-y-2 mb-4">
                    <li>Click the "Load Encounter" button</li>
                    <li>Click "Del" next to the encounter you want to delete</li>
                    <li>Confirm the deletion</li>
                </ol>
            `,
            'keyboard': `
                <h3 class="text-xl font-semibold text-primary-300 mb-4">Keyboard Shortcuts</h3>
                <p class="mb-4">The tracker supports keyboard shortcuts for common actions to speed up your workflow.</p>
                
                <h4 class="text-lg font-semibold text-gray-300 mb-2">Available Shortcuts</h4>
                <table class="w-full mb-4">
                    <thead>
                        <tr class="text-left border-b border-gray-700">
                            <th class="pb-2 text-primary-300">Key</th>
                            <th class="pb-2 text-primary-300">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="border-b border-gray-800">
                            <td class="py-2"><span class="keyboard-shortcut">n</span></td>
                            <td class="py-2">Next Turn</td>
                        </tr>
                        <tr class="border-b border-gray-800">
                            <td class="py-2"><span class="keyboard-shortcut">r</span></td>
                            <td class="py-2">Roll Initiative</td>
                        </tr>
                        <tr class="border-b border-gray-800">
                            <td class="py-2"><span class="keyboard-shortcut">s</span></td>
                            <td class="py-2">Start/End Combat</td>
                        </tr>
                        <tr class="border-b border-gray-800">
                            <td class="py-2"><span class="keyboard-shortcut">h</span></td>
                            <td class="py-2">Add Hero</td>
                        </tr>
                        <tr class="border-b border-gray-800">
                            <td class="py-2"><span class="keyboard-shortcut">m</span></td>
                            <td class="py-2">Add Monster</td>
                        </tr>
                        <tr class="border-b border-gray-800">
                            <td class="py-2"><span class="keyboard-shortcut">p</span></td>
                            <td class="py-2">Toggle Player View</td>
                        </tr>
                        <tr class="border-b border-gray-800">
                            <td class="py-2"><span class="keyboard-shortcut">d</span></td>
                            <td class="py-2">Roll d20</td>
                        </tr>
                        <tr class="border-b border-gray-800">
                            <td class="py-2"><span class="keyboard-shortcut">?</span></td>
                            <td class="py-2">Show Keyboard Shortcuts</td>
                        </tr>
                        <tr class="border-b border-gray-800">
                            <td class="py-2"><span class="keyboard-shortcut">Esc</span></td>
                            <td class="py-2">Close Modal</td>
                        </tr>
                    </tbody>
                </table>
                
                <h4 class="text-lg font-semibold text-gray-300 mb-2">Enabling/Disabling Shortcuts</h4>
                <p class="mb-4">You can enable or disable keyboard shortcuts in the Settings modal.</p>
                
                <h4 class="text-lg font-semibold text-gray-300 mb-2">Limitations</h4>
                <p class="mb-4">Keyboard shortcuts are disabled when typing in input fields or text areas.</p>
            `,
            'settings': `
                <h3 class="text-xl font-semibold text-primary-300 mb-4">Settings</h3>
                <p class="mb-4">The Settings modal allows you to customize the tracker to your preferences.</p>
                
                <h4 class="text-lg font-semibold text-gray-300 mb-2">Opening Settings</h4>
                <p class="mb-4">Click the "Settings" button at the bottom of the page to open the Settings modal.</p>
                
                <h4 class="text-lg font-semibold text-gray-300 mb-2">General Settings</h4>
                <ul class="list-disc list-inside space-y-2 mb-4">
                    <li><strong>Theme:</strong> Choose between Dark and Light themes</li>
                    <li><strong>Critical Hit Rule:</strong> Choose between Perkins Rule (Max + Roll) and RAW (Double Dice)</li>
                    <li><strong>Initiative Rule:</strong> Choose between Standard (Individual) and Group (By Type)</li>
                    <li><strong>Auto-roll Monster HP:</strong> Automatically roll HP for monsters based on their hit dice</li>
                    <li><strong>Auto-roll Initiative:</strong> Automatically roll initiative when starting combat</li>
                    <li><strong>Confirm on Delete:</strong> Show confirmation dialog when deleting items</li>
                </ul>
                
                <h4 class="text-lg font-semibold text-gray-300 mb-2">Display Settings</h4>
                <ul class="list-disc list-inside space-y-2 mb-4">
                    <li><strong>Show Dice Rolls:</strong> Show dice roll results in the combat log</li>
                    <li><strong>Show Condition Descriptions:</strong> Show condition descriptions when hovering over conditions</li>
                    <li><strong>Player View Refresh Rate:</strong> How often the Player View refreshes (in seconds)</li>
                </ul>
                
                <h4 class="text-lg font-semibold text-gray-300 mb-2">Auto-Save Settings</h4>
                <ul class="list-disc list-inside space-y-2 mb-4">
                    <li><strong>Enable Auto-Save:</strong> Automatically save the combat state periodically</li>
                    <li><strong>Auto-Save Interval:</strong> How often to auto-save (in minutes)</li>
                </ul>
                
                <h4 class="text-lg font-semibold text-gray-300 mb-2">Controls Settings</h4>
                <ul class="list-disc list-inside space-y-2 mb-4">
                    <li><strong>Enable Keyboard Shortcuts:</strong> Enable or disable keyboard shortcuts</li>
                </ul>
                
                <h4 class="text-lg font-semibold text-gray-300 mb-2">Audio Settings</h4>
                <ul class="list-disc list-inside space-y-2 mb-4">
                    <li><strong>Enable Sound Effects:</strong> Enable or disable sound effects</li>
                    <li><strong>Sound Volume:</strong> Adjust the volume of sound effects</li>
                    <li><strong>Enable Background Music:</strong> Enable or disable background music</li>
                    <li><strong>Music Volume:</strong> Adjust the volume of background music</li>
                </ul>
                
                <h4 class="text-lg font-semibold text-gray-300 mb-2">Resetting Settings</h4>
                <p class="mb-4">Click the "Reset to Defaults" button to reset all settings to their default values.</p>
            `
        };
        
        // Set the content for the selected topic
        container.innerHTML = topics[topic] || topics['getting-started'];
        
        // Scroll to top
        container.scrollTop = 0;
    }
    
    /**
     * Start the tutorial
     */
    startTutorial() {
        // Define tutorial steps
        const steps = [
            {
                element: '#add-hero-btn',
                title: 'Adding Heroes',
                content: 'Click here to add player characters to the combat.',
                position: 'bottom'
            },
            {
                element: '#add-monster-btn',
                title: 'Adding Monsters',
                content: 'Click here to add enemies and NPCs to the combat.',
                position: 'bottom'
            },
            {
                element: '#roll-initiative-btn',
                title: 'Rolling Initiative',
                content: 'Once you\'ve added creatures, click here to roll initiative and determine turn order.',
                position: 'left'
            },
            {
                element: '#start-combat-btn',
                title: 'Starting Combat',
                content: 'Click here to start the combat encounter.',
                position: 'bottom'
            },
            {
                element: '#next-turn-btn',
                title: 'Next Turn',
                content: 'During combat, click here to advance to the next creature\'s turn.',
                position: 'left'
            },
            {
                element: '#player-view-btn',
                title: 'Player View',
                content: 'Click here to open a separate window that you can share with your players.',
                position: 'right'
            },
            {
                element: '#dice-results',
                title: 'Dice Rolling',
                content: 'Use the dice buttons to roll dice. Results will appear here.',
                position: 'right'
            },
            {
                element: '#combat-log',
                title: 'Combat Log',
                content: 'All actions and events are recorded here for reference.',
                position: 'top'
            },
            {
                element: '#settings-btn',
                title: 'Settings',
                content: 'Click here to customize the tracker to your preferences.',
                position: 'top'
            },
            {
                element: '#help-btn',
                title: 'Help',
                content: 'If you need assistance, click here to access the help documentation.',
                position: 'top'
            }
        ];
        
        // Show a simple alert for now
        this.app.showAlert('Tutorial feature coming soon! Check the Help documentation for guidance.');
        
        // In a real implementation, we would use a library like Shepherd.js to create a step-by-step tutorial
    }
}
