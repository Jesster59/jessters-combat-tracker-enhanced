/**
 * Jesster's Combat Tracker
 * Help Module
 * Version 2.3.1
 * 
 * This module provides help documentation, tooltips, and guidance for users.
 * It includes information about features, keyboard shortcuts, and how to use
 * various aspects of the combat tracker.
 */

/**
 * Help topics organized by category
 */
export const helpTopics = {
  gettingStarted: [
    {
      id: 'overview',
      title: 'Overview',
      content: `
        <p>Jesster's Combat Tracker (JCT) is a tool designed to help Dungeon Masters manage combat encounters in tabletop role-playing games like D&D 5e. It provides an intuitive interface for tracking initiative, hit points, conditions, and more.</p>
        <p>This help guide will walk you through the basic features and how to use them effectively.</p>
      `
    },
    {
      id: 'quickstart',
      title: 'Quick Start Guide',
      content: `
        <p>To get started with JCT:</p>
        <ol>
          <li>Add players to the tracker using the "Add Player" button</li>
          <li>Add monsters using the "Add Monster" button</li>
          <li>Click "Roll Initiative" to determine turn order</li>
          <li>Use "Start Combat" to begin tracking turns</li>
          <li>Use "Next Turn" to advance through the initiative order</li>
        </ol>
        <p>That's it for the basics! Explore the other sections of this help guide to learn about more advanced features.</p>
      `
    },
    {
      id: 'ui-overview',
      title: 'User Interface Overview',
      content: `
        <p>The JCT interface is divided into several key areas:</p>
        <ul>
          <li><strong>Initiative Tracker:</strong> The main panel showing all combatants in initiative order</li>
          <li><strong>Combat Controls:</strong> Buttons for managing the flow of combat (next turn, previous turn, etc.)</li>
          <li><strong>Combatant Management:</strong> Tools for adding, editing, and removing combatants</li>
          <li><strong>Status Panel:</strong> Shows the current round, active combatant, and other important information</li>
          <li><strong>Dice Roller:</strong> A built-in dice roller for making quick rolls during combat</li>
          <li><strong>Settings:</strong> Customize the application to suit your preferences</li>
        </ul>
      `
    }
  ],
  
  combatManagement: [
    {
      id: 'initiative-tracking',
      title: 'Initiative Tracking',
      content: `
        <p>The initiative tracker is the core of JCT. Here's how to use it:</p>
        <ol>
          <li>Add combatants (players and monsters) to the tracker</li>
          <li>Set initiative values manually or use the "Roll Initiative" button to roll for all combatants</li>
          <li>Combatants will be sorted automatically by initiative value (highest first)</li>
          <li>The active combatant is highlighted</li>
          <li>Use "Next Turn" to advance to the next combatant in the order</li>
          <li>Use "Previous Turn" if you need to go back</li>
        </ol>
        <p>You can reorder combatants manually by dragging and dropping them in the list if needed.</p>
      `
    },
    {
      id: 'hp-tracking',
      title: 'Hit Point Tracking',
      content: `
        <p>JCT makes it easy to track hit points during combat:</p>
        <ul>
          <li>Each combatant's current and maximum HP are displayed in the tracker</li>
          <li>Click on a combatant's HP to open the damage/healing dialog</li>
          <li>Enter a positive number to apply damage</li>
          <li>Enter a negative number to apply healing</li>
          <li>The HP bar will change color based on the combatant's remaining health percentage</li>
          <li>Temporary HP is tracked separately and is used up before regular HP</li>
        </ul>
        <p>You can also apply damage to multiple combatants at once using the "Apply Area Effect" button.</p>
      `
    },
    {
      id: 'conditions',
      title: 'Condition Management',
      content: `
        <p>Tracking conditions like Poisoned, Stunned, etc. is simple with JCT:</p>
        <ul>
          <li>Click the "Conditions" button on a combatant's card to open the conditions dialog</li>
          <li>Select conditions from the list to apply them</li>
          <li>Optionally set a duration (in rounds) for the condition</li>
          <li>Conditions with durations will automatically expire when their time is up</li>
          <li>Condition icons appear on the combatant's card for quick reference</li>
          <li>Hover over a condition icon to see details and remaining duration</li>
        </ul>
        <p>JCT includes all standard conditions from the 5e SRD, plus you can create custom conditions in the settings.</p>
      `
    },
    {
      id: 'rounds-turns',
      title: 'Rounds and Turns',
      content: `
        <p>JCT automatically tracks combat rounds and turns:</p>
        <ul>
          <li>A round represents one complete cycle through the initiative order</li>
          <li>Each combatant gets one turn per round</li>
          <li>The current round number is displayed in the status panel</li>
          <li>When the last combatant in the order takes their turn, a new round begins</li>
          <li>Effects with durations measured in rounds are automatically tracked</li>
        </ul>
        <p>You can manually adjust the round number if needed using the round controls in the status panel.</p>
      `
    },
    {
      id: 'combat-log',
      title: 'Combat Log',
      content: `
        <p>The combat log keeps a record of everything that happens during an encounter:</p>
        <ul>
          <li>Damage dealt and received</li>
          <li>Healing applied</li>
          <li>Conditions applied or removed</li>
          <li>Round changes</li>
          <li>Dice rolls</li>
          <li>Custom notes you add</li>
        </ul>
        <p>The log can be exported at the end of combat for your records or to share with players.</p>
      `
    }
  ],
  
  combatants: [
    {
      id: 'adding-players',
      title: 'Adding Players',
      content: `
        <p>To add player characters to the tracker:</p>
        <ol>
          <li>Click the "Add Player" button</li>
          <li>Enter the character's name, HP, AC, and other details</li>
          <li>Optionally enter ability scores and other stats</li>
          <li>Click "Save" to add the character to the tracker</li>
        </ol>
        <p>Player characters you add can be saved to your player roster for quick access in future encounters.</p>
        <p>You can also import characters directly from D&D Beyond if you have the URL to their character sheet.</p>
      `
    },
    {
      id: 'adding-monsters',
      title: 'Adding Monsters',
      content: `
        <p>To add monsters to the tracker:</p>
        <ol>
          <li>Click the "Add Monster" button</li>
          <li>Search for a monster by name in the database</li>
          <li>Or enter custom monster details manually</li>
          <li>Set the quantity if adding multiple of the same monster</li>
          <li>Click "Add" to add the monster(s) to the tracker</li>
        </ol>
        <p>JCT includes monsters from the 5e SRD. You can also create and save custom monsters.</p>
        <p>When adding multiple of the same monster, JCT will automatically number them and roll separate initiative for each one if desired.</p>
      `
    },
    {
      id: 'editing-combatants',
      title: 'Editing Combatants',
      content: `
        <p>To edit a combatant's details:</p>
        <ol>
          <li>Click the "Edit" button (pencil icon) on the combatant's card</li>
          <li>Modify any details as needed</li>
          <li>Click "Save" to apply the changes</li>
        </ol>
        <p>You can edit most properties of a combatant, including name, HP, AC, initiative, and more.</p>
        <p>For quick edits, you can also:</p>
        <ul>
          <li>Click on HP to adjust health</li>
          <li>Click on AC to change armor class</li>
          <li>Click on initiative to re-roll or manually set</li>
        </ul>
      `
    },
    {
      id: 'removing-combatants',
      title: 'Removing Combatants',
      content: `
        <p>To remove a combatant from the tracker:</p>
        <ol>
          <li>Click the "Remove" button (X icon) on the combatant's card</li>
          <li>Confirm the removal when prompted</li>
        </ol>
        <p>Alternatively, you can mark a combatant as "defeated" without removing them:</p>
        <ol>
          <li>Reduce their HP to 0</li>
          <li>They will be automatically marked as defeated</li>
          <li>Defeated combatants can be skipped in the initiative order</li>
        </ol>
        <p>You can configure whether defeated combatants are skipped automatically in the settings.</p>
      `
    },
    {
      id: 'monster-stat-blocks',
      title: 'Monster Stat Blocks',
      content: `
        <p>JCT provides quick access to monster stat blocks:</p>
        <ul>
          <li>Click the "Stats" button on a monster's card to view their full stat block</li>
          <li>The stat block includes all standard 5e monster information:</li>
          <ul>
            <li>Ability scores</li>
            <li>Skills and saving throws</li>
            <li>Resistances, immunities, and vulnerabilities</li>
            <li>Special traits</li>
            <li>Actions and reactions</li>
            <li>Legendary actions (if any)</li>
          </ul>
          <li>You can click on attacks in the stat block to roll them directly</li>
        </ul>
        <p>Monster stat blocks can be printed or exported for reference.</p>
      `
    }
  ],
  
  features: [
    {
      id: 'dice-roller',
      title: 'Dice Roller',
      content: `
        <p>The built-in dice roller allows you to make quick rolls during combat:</p>
        <ul>
          <li>Enter a dice formula (e.g., "2d6+3") in the dice input field</li>
          <li>Click "Roll" or press Enter to roll the dice</li>
          <li>Results are displayed with a breakdown of each die</li>
          <li>Recent rolls are saved in the roll history</li>
          <li>You can save favorite rolls for quick access</li>
        </ul>
        <p>The dice roller supports standard dice notation:</p>
        <ul>
          <li>NdX: Roll N dice with X sides (e.g., 3d6)</li>
          <li>+/-: Add or subtract modifiers (e.g., 1d20+5)</li>
          <li>kh/kl: Keep highest/lowest dice (e.g., 4d6kh3)</li>
          <li>r: Reroll certain values (e.g., 2d6r1)</li>
          <li>Multiple dice sets (e.g., 1d20+5 + 1d4)</li>
        </ul>
      `
    },
    {
      id: 'encounter-builder',
      title: 'Encounter Builder',
      content: `
        <p>The encounter builder helps you create balanced combat encounters:</p>
        <ol>
          <li>Enter your party's size and average level</li>
          <li>Select the desired difficulty (Easy, Medium, Hard, Deadly)</li>
          <li>Add monsters manually or use the random generator</li>
          <li>The builder will calculate XP thresholds and encounter difficulty</li>
          <li>Adjust monsters as needed to achieve the desired challenge</li>
          <li>Click "Create Encounter" to add all monsters to the tracker</li>
        </ol>
        <p>You can save encounters for future use and load them with a single click.</p>
        <p>The encounter builder uses the standard 5e encounter building guidelines for calculating difficulty.</p>
      `
    },
    {
      id: 'initiative-options',
      title: 'Initiative Options',
      content: `
        <p>JCT offers several options for handling initiative:</p>
        <ul>
          <li><strong>Individual Initiative:</strong> Each combatant rolls separately (standard 5e rules)</li>
          <li><strong>Group Initiative:</strong> All combatants of the same type share an initiative count</li>
          <li><strong>Side Initiative:</strong> Players roll as a group, monsters roll as a group</li>
          <li><strong>Popcorn Initiative:</strong> The current actor chooses who goes next</li>
        </ul>
        <p>Additional initiative options in settings:</p>
        <ul>
          <li>Automatically add Dexterity modifier</li>
          <li>Reroll ties or keep them</li>
          <li>Skip defeated combatants</li>
          <li>Use passive initiative (10 + modifier)</li>
        </ul>
      `
    },
    {
      id: 'custom-conditions',
      title: 'Custom Conditions',
      content: `
        <p>In addition to the standard 5e conditions, you can create custom conditions:</p>
        <ol>
          <li>Go to Settings > Conditions</li>
          <li>Click "Add Custom Condition"</li>
          <li>Enter a name, description, and optional icon</li>
          <li>Set default duration if applicable</li>
          <li>Click "Save" to add the condition</li>
        </ol>
        <p>Custom conditions work just like standard ones and can be applied to any combatant.</p>
        <p>Examples of useful custom conditions:</p>
        <ul>
          <li>Spell effects (e.g., "Blessed", "Hexed")</li>
          <li>Environmental effects (e.g., "Difficult Terrain", "Obscured")</li>
          <li>Custom status effects for your campaign</li>
        </ul>
      `
    },
    {
      id: 'combat-timer',
      title: 'Combat Timer',
      content: `
        <p>The combat timer helps keep turns moving at a good pace:</p>
        <ul>
          <li>Enable the timer in Settings > General</li>
          <li>Set your preferred time limit per turn (default is 60 seconds)</li>
          <li>The timer starts automatically when a new turn begins</li>
          <li>A visual indicator shows remaining time</li>
          <li>An optional audio alert plays when time is running low</li>
          <li>The timer can be paused or reset as needed</li>
        </ul>
        <p>The timer is a helpful tool for keeping combat flowing, especially in larger groups.</p>
      `
    },
    {
      id: 'concentration-tracking',
      title: 'Concentration Tracking',
      content: `
        <p>JCT helps you track concentration for spellcasters:</p>
        <ul>
          <li>When a concentration spell is cast, the caster is marked as concentrating</li>
          <li>Only one concentration spell can be active per character</li>
          <li>When a concentrating character takes damage, a reminder appears to make a Constitution saving throw</li>
          <li>The DC is calculated automatically (10 or half the damage taken, whichever is higher)</li>
          <li>If concentration is broken, the spell effect can be removed with one click</li>
        </ul>
        <p>Concentration tracking helps ensure you're following the rules correctly for this important spellcasting mechanic.</p>
      `
    }
  ],
  
  advanced: [
    {
      id: 'keyboard-shortcuts',
      title: 'Keyboard Shortcuts',
      content: `
        <p>JCT supports the following keyboard shortcuts:</p>
        <table class="shortcuts-table">
          <tr>
            <th>Shortcut</th>
            <th>Action</th>
          </tr>
          <tr>
            <td><kbd>Space</kbd></td>
            <td>Next Turn</td>
          </tr>
          <tr>
            <td><kbd>Shift</kbd> + <kbd>Space</kbd></td>
            <td>Previous Turn</td>
          </tr>
          <tr>
            <td><kbd>Ctrl</kbd> + <kbd>P</kbd></td>
            <td>Add Player</td>
          </tr>
          <tr>
            <td><kbd>Ctrl</kbd> + <kbd>M</kbd></td>
            <td>Add Monster</td>
          </tr>
          <tr>
            <td><kbd>Ctrl</kbd> + <kbd>I</kbd></td>
            <td>Roll Initiative</td>
          </tr>
          <tr>
            <td><kbd>Ctrl</kbd> + <kbd>R</kbd></td>
            <td>Roll Dice</td>
          </tr>
          <tr>
            <td><kbd>Ctrl</kbd> + <kbd>S</kbd></td>
            <td>Save Encounter</td>
          </tr>
          <tr>
            <td><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>C</kbd></td>
            <td>Clear Combat</td>
          </tr>
          <tr>
            <td><kbd>F1</kbd></td>
            <td>Open Help</td>
          </tr>
        </table>
        <p>You can customize these shortcuts in Settings > Keyboard Shortcuts.</p>
      `
    },
    {
      id: 'importing-exporting',
      title: 'Importing and Exporting',
      content: `
        <p>JCT allows you to import and export data in various formats:</p>
        <h4>Export Options:</h4>
        <ul>
          <li><strong>JSON:</strong> Full data backup that can be re-imported</li>
          <li><strong>HTML:</strong> Formatted output for viewing in browsers</li>
          <li><strong>PDF:</strong> Printer-friendly format for reference</li>
          <li><strong>CSV:</strong> Spreadsheet format for data analysis</li>
          <li><strong>Markdown:</strong> Text format for notes and documentation</li>
          <li><strong>VTT Formats:</strong> Export to Foundry VTT, Roll20, or Fantasy Grounds</li>
        </ul>
        <h4>Import Sources:</h4>
        <ul>
          <li><strong>JSON:</strong> Previously exported JCT data</li>
          <li><strong>D&D Beyond:</strong> Import characters and monsters</li>
          <li><strong>CSV:</strong> Import combatant lists</li>
        </ul>
        <p>Regular backups are recommended to prevent data loss.</p>
      `
    },
    {
      id: 'custom-themes',
      title: 'Custom Themes',
      content: `
        <p>JCT allows you to customize the visual appearance with themes:</p>
        <ol>
          <li>Go to Settings > Appearance</li>
          <li>Select from the built-in themes or create your own</li>
          <li>Customize colors, fonts, and other visual elements</li>
          <li>Save your theme for future use</li>
        </ol>
        <p>Built-in themes include:</p>
        <ul>
          <li>Default (clean, modern interface)</li>
          <li>Dark Mode (easier on the eyes in low light)</li>
          <li>Fantasy (parchment and medieval styling)</li>
          <li>High Contrast (for accessibility)</li>
          <li>Sepia (warm, eye-friendly colors)</li>
        </ul>
        <p>Custom themes can be exported and shared with other JCT users.</p>
      `
    },
    {
      id: 'data-storage',
      title: 'Data Storage and Privacy',
      content: `
        <p>JCT respects your privacy and data security:</p>
        <ul>
          <li>All data is stored locally in your browser's storage</li>
          <li>No data is sent to any server unless you explicitly export it</li>
          <li>You can clear all stored data at any time from Settings > Data Management</li>
          <li>Regular backups are recommended as browser storage can be cleared</li>
        </ul>
        <p>Data stored includes:</p>
        <ul>
          <li>Combatant information</li>
          <li>Saved encounters</li>
          <li>Custom monsters and conditions</li>
          <li>Application settings</li>
          <li>Dice roll history</li>
        </ul>
        <p>You can export a complete backup of all your data from Settings > Data Management.</p>
      `
    },
    {
      id: 'api-integration',
      title: 'API Integration',
      content: `
        <p>Advanced users can integrate JCT with other tools using the API:</p>
        <ul>
          <li>Access JCT data programmatically</li>
          <li>Create custom scripts and extensions</li>
          <li>Integrate with virtual tabletops</li>
          <li>Build custom import/export tools</li>
        </ul>
        <p>API documentation is available for developers at <a href="https://github.com/jesster/combat-tracker/api" target="_blank">github.com/jesster/combat-tracker/api</a>.</p>
        <p>Example integrations include:</p>
        <ul>
          <li>Discord bots for remote play</li>
          <li>Custom data importers</li>
          <li>Automated encounter generators</li>
          <li>Campaign management tools</li>
        </ul>
      `
    }
  ],
  
  troubleshooting: [
    {
      id: 'common-issues',
      title: 'Common Issues',
      content: `
        <p>Solutions to frequently encountered problems:</p>
        <h4>Data Not Saving</h4>
        <ul>
          <li>Ensure you're not in private/incognito browsing mode</li>
          <li>Check that your browser allows local storage</li>
          <li>Make sure you have sufficient storage space</li>
          <li>Try clearing browser cache if issues persist</li>
        </ul>
        <h4>Performance Issues</h4>
        <ul>
          <li>Reduce the number of active combatants</li>
          <li>Clear old combat history</li>
          <li>Disable animations in Settings > Performance</li>
          <li>Use compact mode for large encounters</li>
        </ul>
        <h4>Display Problems</h4>
        <ul>
          <li>Try a different theme</li>
          <li>Adjust zoom level in your browser</li>
          <li>Check for browser compatibility issues</li>
          <li>Ensure your browser is up to date</li>
        </ul>
      `
    },
    {
      id: 'data-recovery',
      title: 'Data Recovery',
      content: `
        <p>If you experience data loss, try these recovery methods:</p>
        <ol>
          <li>Check for automatic backups in Settings > Data Management</li>
          <li>Import from your most recent manual backup</li>
          <li>Check browser storage for partial data recovery</li>
          <li>Contact support with your issue details</li>
        </ol>
        <p>To prevent data loss in the future:</p>
        <ul>
          <li>Export regular backups</li>
          <li>Enable automatic backups in settings</li>
          <li>Use cloud storage for your backup files</li>
          <li>Consider using the companion app for additional backup options</li>
        </ul>
      `
    },
    {
      id: 'browser-compatibility',
      title: 'Browser Compatibility',
      content: `
        <p>JCT works best with these browsers:</p>
        <ul>
          <li>Google Chrome (recommended)</li>
          <li>Mozilla Firefox</li>
          <li>Microsoft Edge</li>
          <li>Safari (14+)</li>
          <li>Opera</li>
        </ul>
        <p>Known browser-specific issues:</p>
        <ul>
          <li><strong>Safari:</strong> Limited local storage in private browsing</li>
          <li><strong>Firefox:</strong> PDF export may require additional permissions</li>
          <li><strong>Internet Explorer:</strong> Not supported</li>
          <li><strong>Mobile browsers:</strong> Limited functionality on small screens</li>
        </ul>
        <p>For the best experience, use the latest version of Chrome or Firefox on a desktop or laptop computer.</p>
      `
    },
    {
      id: 'contact-support',
      title: 'Contact Support',
      content: `
        <p>If you need additional help, you can reach out through these channels:</p>
        <ul>
          <li><strong>Email:</strong> <a href="mailto:support@jessterscombattracker.com">support@jessterscombattracker.com</a></li>
          <li><strong>Discord:</strong> Join our <a href="https://discord.gg/jessterscombattracker" target="_blank">community server</a></li>
          <li><strong>GitHub:</strong> <a href="https://github.com/jesster/combat-tracker/issues" target="_blank">Submit an issue</a></li>
          <li><strong>Reddit:</strong> <a href="https://reddit.com/r/jessterscombattracker" target="_blank">r/jessterscombattracker</a></li>
        </ul>
        <p>When reporting an issue, please include:</p>
        <ul>
          <li>Your browser and version</li>
          <li>Your operating system</li>
          <li>Steps to reproduce the problem</li>
          <li>Screenshots if applicable</li>
          <li>Any error messages you received</li>
        </ul>
      `
    }
  ]
};

/**
 * Tooltips for UI elements
 */
export const tooltips = {
  // Main controls
  'next-turn-button': 'Advance to the next combatant in the initiative order',
  'previous-turn-button': 'Go back to the previous combatant',
  'roll-initiative-button': 'Roll initiative for all combatants',
  'sort-initiative-button': 'Sort combatants by initiative value',
  'clear-combat-button': 'Remove all combatants from the tracker',
  'save-encounter-button': 'Save the current encounter for future use',
  
  // Combatant controls
  'add-player-button': 'Add a player character to the tracker',
  'add-monster-button': 'Add a monster to the tracker',
  'edit-combatant-button': 'Edit this combatant\'s details',
  'remove-combatant-button': 'Remove this combatant from the tracker',
  'hp-control': 'Click to adjust hit points',
  'ac-control': 'Click to change armor class',
  'initiative-control': 'Click to roll or set initiative',
  'conditions-button': 'Manage conditions affecting this combatant',
  
  // Dice roller
  'dice-input': 'Enter a dice formula (e.g., 2d6+3)',
  'roll-button': 'Roll the dice',
  'clear-rolls-button': 'Clear roll history',
  'save-roll-button': 'Save this roll as a favorite',
  
  // Settings
  'settings-button': 'Open application settings',
  'theme-selector': 'Change the visual theme',
  'export-button': 'Export data in various formats',
  'import-button': 'Import data from file or URL',
  
  // Misc
  'help-button': 'Open the help documentation',
  'round-counter': 'Current combat round',
  'search-input': 'Search for monsters, spells, or other content',
  'filter-button': 'Filter the current view',
  'compact-mode-toggle': 'Toggle compact display mode'
};

/**
 * Keyboard shortcuts reference
 */
export const keyboardShortcuts = {
  'Space': 'Next Turn',
  'Shift+Space': 'Previous Turn',
  'Ctrl+P': 'Add Player',
  'Ctrl+M': 'Add Monster',
  'Ctrl+I': 'Roll Initiative',
  'Ctrl+R': 'Roll Dice',
  'Ctrl+S': 'Save Encounter',
  'Ctrl+Shift+C': 'Clear Combat',
  'F1': 'Open Help'
};

/**
 * Get a help topic by ID
 * @param {string} topicId - The ID of the help topic to retrieve
 * @returns {Object|null} The help topic or null if not found
 */
export function getHelpTopic(topicId) {
  for (const category in helpTopics) {
    const topic = helpTopics[category].find(t => t.id === topicId);
    if (topic) {
      return topic;
    }
  }
  return null;
}

/**
 * Get a tooltip for a UI element
 * @param {string} elementId - The ID of the UI element
 * @returns {string} The tooltip text or an empty string if not found
 */
export function getTooltip(elementId) {
  return tooltips[elementId] || '';
}

/**
 * Get all help topics in a flat array
 * @returns {Array} All help topics
 */
export function getAllHelpTopics() {
  const allTopics = [];
  for (const category in helpTopics) {
    allTopics.push(...helpTopics[category]);
  }
  return allTopics;
}

/**
 * Search help topics for a query
 * @param {string} query - The search query
 * @returns {Array} Matching help topics
 */
export function searchHelpTopics(query) {
  if (!query || query.trim() === '') {
    return [];
  }
  
  const normalizedQuery = query.toLowerCase().trim();
  const results = [];
  
  for (const category in helpTopics) {
    helpTopics[category].forEach(topic => {
      if (
        topic.title.toLowerCase().includes(normalizedQuery) ||
        topic.content.toLowerCase().includes(normalizedQuery)
      ) {
        results.push(topic);
      }
    });
  }
  
  return results;
}

/**
 * Generate a quick reference guide
 * @returns {string} HTML content for the quick reference guide
 */
export function generateQuickReference() {
  let html = `
    <div class="quick-reference">
      <h2>Quick Reference Guide</h2>
      
            <h3>Combat Flow</h3>
      <ol>
        <li>Add combatants (players and monsters)</li>
        <li>Roll initiative (Ctrl+I or click "Roll Initiative")</li>
        <li>Start combat (highest initiative goes first)</li>
        <li>On each turn:
          <ul>
            <li>Apply start-of-turn effects</li>
            <li>Take actions, bonus actions, reactions</li>
            <li>Move</li>
            <li>Apply end-of-turn effects</li>
          </ul>
        </li>
        <li>Advance to next turn (Space or click "Next Turn")</li>
        <li>Repeat until combat ends</li>
      </ol>
      
      <h3>Keyboard Shortcuts</h3>
      <table class="shortcuts-table">
        <tr>
          <th>Shortcut</th>
          <th>Action</th>
        </tr>
  `;
  
  // Add keyboard shortcuts to the table
  for (const [key, action] of Object.entries(keyboardShortcuts)) {
    html += `
      <tr>
        <td><kbd>${key}</kbd></td>
        <td>${action}</td>
      </tr>
    `;
  }
  
  html += `
      </table>
      
      <h3>Condition Reference</h3>
      <table class="conditions-table">
        <tr>
          <th>Condition</th>
          <th>Effect Summary</th>
        </tr>
        <tr>
          <td>Blinded</td>
          <td>Fails checks requiring sight, disadvantage on attacks, attacks against have advantage</td>
        </tr>
        <tr>
          <td>Charmed</td>
          <td>Can't attack charmer, charmer has advantage on social checks</td>
        </tr>
        <tr>
          <td>Deafened</td>
          <td>Fails checks requiring hearing</td>
        </tr>
        <tr>
          <td>Frightened</td>
          <td>Disadvantage on checks while source in sight, can't move closer to source</td>
        </tr>
        <tr>
          <td>Grappled</td>
          <td>Speed is 0, ends if grappler is incapacitated</td>
        </tr>
        <tr>
          <td>Incapacitated</td>
          <td>Can't take actions or reactions</td>
        </tr>
        <tr>
          <td>Invisible</td>
          <td>Can't be seen, advantage on attacks, attacks against have disadvantage</td>
        </tr>
        <tr>
          <td>Paralyzed</td>
          <td>Incapacitated, can't move/speak, auto-fail STR/DEX saves, attacks have advantage, auto-crit if within 5ft</td>
        </tr>
        <tr>
          <td>Petrified</td>
          <td>Transformed to stone, incapacitated, damage resistance, doesn't age</td>
        </tr>
        <tr>
          <td>Poisoned</td>
          <td>Disadvantage on attack rolls and ability checks</td>
        </tr>
        <tr>
          <td>Prone</td>
          <td>Can only crawl, disadvantage on attacks, melee attacks against have advantage</td>
        </tr>
        <tr>
          <td>Restrained</td>
          <td>Speed is 0, disadvantage on attacks, attacks against have advantage, disadvantage on DEX saves</td>
        </tr>
        <tr>
          <td>Stunned</td>
          <td>Incapacitated, can't move, auto-fail STR/DEX saves, attacks against have advantage</td>
        </tr>
        <tr>
          <td>Unconscious</td>
          <td>Incapacitated, can't move/speak, drops items, falls prone, auto-fail STR/DEX saves, attacks have advantage, auto-crit if within 5ft</td>
        </tr>
      </table>
    </div>
  `;
  
  return html;
}

/**
 * Show a contextual help tooltip for a UI element
 * @param {HTMLElement} element - The element to show help for
 * @returns {HTMLElement} The created tooltip element
 */
export function showTooltip(element) {
  // Remove any existing tooltips
  hideAllTooltips();
  
  // Get the tooltip text
  const elementId = element.id || '';
  const tooltipText = getTooltip(elementId);
  
  if (!tooltipText) {
    return null;
  }
  
  // Create tooltip element
  const tooltip = document.createElement('div');
  tooltip.className = 'jct-tooltip';
  tooltip.textContent = tooltipText;
  
  // Position the tooltip
  const rect = element.getBoundingClientRect();
  tooltip.style.top = `${rect.bottom + 5}px`;
  tooltip.style.left = `${rect.left + (rect.width / 2)}px`;
  tooltip.style.transform = 'translateX(-50%)';
  
  // Add to document
  document.body.appendChild(tooltip);
  
  // Add a class to fade it in
  setTimeout(() => {
    tooltip.classList.add('visible');
  }, 10);
  
  return tooltip;
}

/**
 * Hide all tooltips
 */
export function hideAllTooltips() {
  const tooltips = document.querySelectorAll('.jct-tooltip');
  tooltips.forEach(tooltip => {
    tooltip.classList.remove('visible');
    setTimeout(() => {
      tooltip.remove();
    }, 200); // Match transition duration
  });
}

/**
 * Initialize tooltips for all elements with data-tooltip attributes
 */
export function initializeTooltips() {
  const elements = document.querySelectorAll('[data-tooltip]');
  
  elements.forEach(element => {
    element.addEventListener('mouseenter', () => {
      showTooltip(element);
    });
    
    element.addEventListener('mouseleave', () => {
      hideAllTooltips();
    });
    
    element.addEventListener('focus', () => {
      showTooltip(element);
    });
    
    element.addEventListener('blur', () => {
      hideAllTooltips();
    });
  });
}

/**
 * Show the help panel with a specific topic
 * @param {string} topicId - The ID of the topic to show
 * @returns {HTMLElement} The created help panel element
 */
export function showHelpPanel(topicId = 'overview') {
  // Remove any existing help panel
  const existingPanel = document.getElementById('jct-help-panel');
  if (existingPanel) {
    existingPanel.remove();
  }
  
  // Get the topic
  const topic = getHelpTopic(topicId) || helpTopics.gettingStarted[0];
  
  // Create the help panel
  const panel = document.createElement('div');
  panel.id = 'jct-help-panel';
  panel.className = 'jct-help-panel';
  
  // Create the panel content
  panel.innerHTML = `
    <div class="jct-help-header">
      <h2>Help & Documentation</h2>
      <button class="jct-help-close" aria-label="Close help panel">×</button>
    </div>
    <div class="jct-help-content">
      <div class="jct-help-sidebar">
        <div class="jct-help-search">
          <input type="text" placeholder="Search help topics..." id="jct-help-search">
        </div>
        <nav class="jct-help-nav">
  `;
  
  // Add categories and topics to the sidebar
  for (const [category, topics] of Object.entries(helpTopics)) {
    const categoryName = category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    
    panel.querySelector('.jct-help-nav').innerHTML += `
      <div class="jct-help-category">
        <h3>${categoryName}</h3>
        <ul>
          ${topics.map(t => `
            <li>
              <a href="#" data-topic-id="${t.id}" class="${t.id === topicId ? 'active' : ''}">
                ${t.title}
              </a>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }
  
  // Close the sidebar and add the topic content
  panel.querySelector('.jct-help-content').innerHTML += `
        </nav>
      </div>
      <div class="jct-help-topic">
        <h1>${topic.title}</h1>
        <div class="jct-help-topic-content">
          ${topic.content}
        </div>
      </div>
    </div>
  `;
  
  // Add to document
  document.body.appendChild(panel);
  
  // Add event listeners
  panel.querySelector('.jct-help-close').addEventListener('click', () => {
    panel.classList.add('closing');
    setTimeout(() => {
      panel.remove();
    }, 300); // Match transition duration
  });
  
  // Topic navigation
  panel.querySelectorAll('.jct-help-nav a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const topicId = link.getAttribute('data-topic-id');
      showHelpTopic(topicId, panel);
      
      // Update active state
      panel.querySelectorAll('.jct-help-nav a').forEach(a => {
        a.classList.remove('active');
      });
      link.classList.add('active');
    });
  });
  
  // Search functionality
  const searchInput = panel.querySelector('#jct-help-search');
  searchInput.addEventListener('input', () => {
    const query = searchInput.value;
    if (query.length >= 2) {
      showSearchResults(query, panel);
    } else {
      // Reset navigation when search is cleared
      panel.querySelector('.jct-help-nav').style.display = 'block';
      panel.querySelector('.jct-help-search-results')?.remove();
    }
  });
  
  // Add a class to fade it in
  setTimeout(() => {
    panel.classList.add('visible');
  }, 10);
  
  return panel;
}

/**
 * Show a specific help topic in the panel
 * @param {string} topicId - The ID of the topic to show
 * @param {HTMLElement} panel - The help panel element
 */
export function showHelpTopic(topicId, panel) {
  const topic = getHelpTopic(topicId);
  if (!topic || !panel) return;
  
  const topicContainer = panel.querySelector('.jct-help-topic');
  topicContainer.innerHTML = `
    <h1>${topic.title}</h1>
    <div class="jct-help-topic-content">
      ${topic.content}
    </div>
  `;
  
  // Scroll to top of topic
  topicContainer.scrollTop = 0;
}

/**
 * Show search results in the help panel
 * @param {string} query - The search query
 * @param {HTMLElement} panel - The help panel element
 */
export function showSearchResults(query, panel) {
  const results = searchHelpTopics(query);
  
  // Remove any existing results
  panel.querySelector('.jct-help-search-results')?.remove();
  
  // Create results container
  const resultsContainer = document.createElement('div');
  resultsContainer.className = 'jct-help-search-results';
  
  if (results.length === 0) {
    resultsContainer.innerHTML = `
      <p class="jct-help-no-results">No results found for "${query}"</p>
    `;
  } else {
    resultsContainer.innerHTML = `
      <h3>Search Results</h3>
      <ul>
        ${results.map(topic => `
          <li>
            <a href="#" data-topic-id="${topic.id}">
              ${topic.title}
            </a>
          </li>
        `).join('')}
      </ul>
    `;
  }
  
  // Hide the regular navigation
  panel.querySelector('.jct-help-nav').style.display = 'none';
  
  // Add results to panel
  panel.querySelector('.jct-help-sidebar').appendChild(resultsContainer);
  
  // Add event listeners to result links
  resultsContainer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const topicId = link.getAttribute('data-topic-id');
      showHelpTopic(topicId, panel);
    });
  });
}

/**
 * Show a quick help overlay for a specific feature
 * @param {string} featureId - The ID of the feature to show help for
 * @returns {HTMLElement} The created overlay element
 */
export function showFeatureHelp(featureId) {
  // Remove any existing overlays
  const existingOverlay = document.getElementById('jct-feature-help');
  if (existingOverlay) {
    existingOverlay.remove();
  }
  
  // Get the feature element
  const featureElement = document.getElementById(featureId);
  if (!featureElement) return null;
  
  // Get help content for this feature
  const helpContent = getFeatureHelpContent(featureId);
  if (!helpContent) return null;
  
  // Create the overlay
  const overlay = document.createElement('div');
  overlay.id = 'jct-feature-help';
  overlay.className = 'jct-feature-help';
  
  // Position near the feature
  const rect = featureElement.getBoundingClientRect();
  overlay.style.top = `${rect.bottom + 10}px`;
  overlay.style.left = `${rect.left + (rect.width / 2)}px`;
  overlay.style.transform = 'translateX(-50%)';
  
  // Add content
  overlay.innerHTML = `
    <div class="jct-feature-help-content">
      <h3>${helpContent.title}</h3>
      <div>${helpContent.content}</div>
      <div class="jct-feature-help-actions">
        <button class="jct-feature-help-close">Got it</button>
        <a href="#" class="jct-feature-help-more">Learn more</a>
      </div>
    </div>
    <div class="jct-feature-help-arrow"></div>
  `;
  
  // Add to document
  document.body.appendChild(overlay);
  
  // Add event listeners
  overlay.querySelector('.jct-feature-help-close').addEventListener('click', () => {
    overlay.classList.add('closing');
    setTimeout(() => {
      overlay.remove();
    }, 300); // Match transition duration
  });
  
  overlay.querySelector('.jct-feature-help-more').addEventListener('click', (e) => {
    e.preventDefault();
    overlay.remove();
    showHelpPanel(helpContent.topicId);
  });
  
  // Add a class to fade it in
  setTimeout(() => {
    overlay.classList.add('visible');
  }, 10);
  
  return overlay;
}

/**
 * Get help content for a specific feature
 * @param {string} featureId - The ID of the feature
 * @returns {Object|null} The help content or null if not found
 */
function getFeatureHelpContent(featureId) {
  const featureHelp = {
    'initiative-tracker': {
      title: 'Initiative Tracker',
      content: 'This is the main panel where combatants are displayed in initiative order. The active combatant is highlighted.',
      topicId: 'initiative-tracking'
    },
    'combat-controls': {
      title: 'Combat Controls',
      content: 'Use these buttons to control the flow of combat. Start combat, advance turns, and end combat when the encounter is over.',
      topicId: 'rounds-turns'
    },
    'dice-roller': {
      title: 'Dice Roller',
      content: 'Roll dice quickly during combat. Enter a formula like "2d6+3" and click Roll or press Enter.',
      topicId: 'dice-roller'
    },
    'hp-tracker': {
      title: 'Hit Point Tracker',
      content: 'Click on a combatant\'s HP to apply damage or healing. The bar shows current HP as a percentage of maximum.',
      topicId: 'hp-tracking'
    },
    'conditions-panel': {
      title: 'Conditions Panel',
      content: 'Apply and manage conditions affecting combatants. Conditions with durations will automatically expire after the specified number of rounds.',
      topicId: 'conditions'
    }
  };
  
  return featureHelp[featureId] || null;
}

/**
 * Show a welcome tour for new users
 * @returns {Object} The tour controller
 */
export function startWelcomeTour() {
  const tourSteps = [
    {
      element: '#initiative-tracker',
      title: 'Initiative Tracker',
      content: 'This is where combatants are displayed in initiative order. The active combatant is highlighted.',
      position: 'right'
    },
    {
      element: '#combat-controls',
      title: 'Combat Controls',
      content: 'Use these buttons to control the flow of combat.',
      position: 'bottom'
    },
    {
      element: '#add-combatant-buttons',
      title: 'Add Combatants',
      content: 'Add players and monsters to the tracker here.',
      position: 'bottom'
    },
    {
      element: '#dice-roller',
      title: 'Dice Roller',
      content: 'Quickly roll dice during combat.',
      position: 'left'
    },
    {
      element: '#settings-button',
      title: 'Settings',
      content: 'Customize the application to suit your preferences.',
      position: 'left'
    },
    {
      element: '#help-button',
      title: 'Help',
      content: 'Access the help documentation anytime by clicking here.',
      position: 'left'
    }
  ];
  
  // Create tour controller
  const tour = {
    currentStep: 0,
    steps: tourSteps,
    overlay: null,
    tooltip: null,
    
    start() {
      this.createOverlay();
      this.showStep(0);
      return this;
    },
    
    createOverlay() {
      // Remove any existing overlay
      document.getElementById('jct-tour-overlay')?.remove();
      
      // Create new overlay
      this.overlay = document.createElement('div');
      this.overlay.id = 'jct-tour-overlay';
      this.overlay.className = 'jct-tour-overlay';
      document.body.appendChild(this.overlay);
    },
    
    showStep(stepIndex) {
      if (stepIndex < 0 || stepIndex >= this.steps.length) {
        this.end();
        return;
      }
      
      this.currentStep = stepIndex;
      const step = this.steps[stepIndex];
      
      // Find the target element
      const target = document.querySelector(step.element);
      if (!target) {
        console.warn(`Tour target not found: ${step.element}`);
        this.next();
        return;
      }
      
      // Highlight the target
      this.highlightElement(target);
      
      // Show tooltip
      this.showTooltip(target, step);
    },
    
    highlightElement(element) {
      const rect = element.getBoundingClientRect();
      
      // Update overlay cutout
      this.overlay.style.setProperty('--highlight-top', `${rect.top}px`);
      this.overlay.style.setProperty('--highlight-left', `${rect.left}px`);
      this.overlay.style.setProperty('--highlight-width', `${rect.width}px`);
      this.overlay.style.setProperty('--highlight-height', `${rect.height}px`);
      
      // Scroll element into view if needed
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    },
    
    showTooltip(element, step) {
      // Remove any existing tooltip
      document.getElementById('jct-tour-tooltip')?.remove();
      
      // Create new tooltip
      this.tooltip = document.createElement('div');
      this.tooltip.id = 'jct-tour-tooltip';
      this.tooltip.className = `jct-tour-tooltip jct-tour-position-${step.position}`;
      
      // Add content
      this.tooltip.innerHTML = `
        <h3>${step.title}</h3>
        <div>${step.content}</div>
        <div class="jct-tour-actions">
          <button class="jct-tour-skip">Skip Tour</button>
          <div class="jct-tour-navigation">
            ${this.currentStep > 0 ? '<button class="jct-tour-prev">Previous</button>' : ''}
            <button class="jct-tour-next">${this.currentStep < this.steps.length - 1 ? 'Next' : 'Finish'}</button>
          </div>
        </div>
      `;
      
      // Position the tooltip
      const rect = element.getBoundingClientRect();
      let top, left;
      
      switch (step.position) {
        case 'top':
          top = rect.top - 10;
          left = rect.left + rect.width / 2;
          this.tooltip.style.transform = 'translate(-50%, -100%)';
          break;
        case 'bottom':
          top = rect.bottom + 10;
          left = rect.left + rect.width / 2;
          this.tooltip.style.transform = 'translateX(-50%)';
          break;
        case 'left':
          top = rect.top + rect.height / 2;
          left = rect.left - 10;
          this.tooltip.style.transform = 'translate(-100%, -50%)';
          break;
        case 'right':
          top = rect.top + rect.height / 2;
          left = rect.right + 10;
          this.tooltip.style.transform = 'translateY(-50%)';
          break;
        default:
          top = rect.bottom + 10;
          left = rect.left + rect.width / 2;
          this.tooltip.style.transform = 'translateX(-50%)';
      }
      
      this.tooltip.style.top = `${top}px`;
      this.tooltip.style.left = `${left}px`;
      
      // Add to document
      document.body.appendChild(this.tooltip);
      
      // Add event listeners
      this.tooltip.querySelector('.jct-tour-skip').addEventListener('click', () => {
        this.end();
      });
      
      if (this.currentStep > 0) {
        this.tooltip.querySelector('.jct-tour-prev').addEventListener('click', () => {
          this.prev();
        });
      }
      
      this.tooltip.querySelector('.jct-tour-next').addEventListener('click', () => {
        this.next();
      });
      
      // Add a class to fade it in
      setTimeout(() => {
        this.tooltip.classList.add('visible');
      }, 10);
    },
    
    next() {
      this.showStep(this.currentStep + 1);
    },
    
    prev() {
      this.showStep(this.currentStep - 1);
    },
    
    end() {
      // Remove overlay and tooltip
      this.overlay?.remove();
      this.tooltip?.remove();
      
      // Mark tour as completed in local storage
      localStorage.setItem('jct_tour_completed', 'true');
      
      // Show a final message
      this.showCompletionMessage();
    },
    
    showCompletionMessage() {
      const message = document.createElement('div');
      message.className = 'jct-tour-completion';
      message.innerHTML = `
        <div class="jct-tour-completion-content">
          <h2>Tour Completed!</h2>
          <p>You're now ready to use Jesster's Combat Tracker. If you need help at any time, click the Help button.</p>
          <button class="jct-tour-completion-close">Got it</button>
        </div>
      `;
      
      document.body.appendChild(message);
      
      message.querySelector('.jct-tour-completion-close').addEventListener('click', () => {
        message.classList.add('closing');
        setTimeout(() => {
          message.remove();
        }, 300);
      });
      
      setTimeout(() => {
        message.classList.add('visible');
      }, 10);
    }
  };
  
  return tour.start();
}

/**
 * Check if the welcome tour should be shown
 * @returns {boolean} True if the tour should be shown
 */
export function shouldShowWelcomeTour() {
  return !localStorage.getItem('jct_tour_completed');
}

// Export the main help functions
export default {
  showHelpPanel,
  showTooltip,
  hideAllTooltips,
  initializeTooltips,
  showFeatureHelp,
  startWelcomeTour,
  shouldShowWelcomeTour,
  generateQuickReference,
  getHelpTopic,
  searchHelpTopics,
  getAllHelpTopics
};
