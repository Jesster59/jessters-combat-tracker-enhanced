/**
 * Jesster's Combat Tracker
 * Export Module
 * Version 2.3.1
 * 
 * This module handles exporting data from the combat tracker in various formats,
 * including JSON, HTML, PDF, CSV, and more.
 */

/**
 * Export formats supported by the application
 */
export const ExportFormat = {
  JSON: 'json',
  HTML: 'html',
  PDF: 'pdf',
  CSV: 'csv',
  MARKDOWN: 'markdown',
  FOUNDRY_VTT: 'foundryvtt',
  ROLL20: 'roll20',
  FANTASY_GROUNDS: 'fantasygrounds',
  IMAGE: 'image'
};

/**
 * Export an encounter to a file
 * @param {Object} encounter - The encounter to export
 * @param {string} format - The export format (from ExportFormat)
 * @param {Object} options - Additional export options
 * @returns {Promise<boolean>} A promise that resolves to true if export was successful
 */
export async function exportEncounter(encounter, format = ExportFormat.JSON, options = {}) {
  try {
    switch (format) {
      case ExportFormat.JSON:
        return exportEncounterToJSON(encounter, options);
      case ExportFormat.HTML:
        return exportEncounterToHTML(encounter, options);
      case ExportFormat.PDF:
        return exportEncounterToPDF(encounter, options);
      case ExportFormat.CSV:
        return exportEncounterToCSV(encounter, options);
      case ExportFormat.MARKDOWN:
        return exportEncounterToMarkdown(encounter, options);
      case ExportFormat.FOUNDRY_VTT:
        return exportEncounterToFoundryVTT(encounter, options);
      case ExportFormat.ROLL20:
        return exportEncounterToRoll20(encounter, options);
      case ExportFormat.FANTASY_GROUNDS:
        return exportEncounterToFantasyGrounds(encounter, options);
      case ExportFormat.IMAGE:
        return exportEncounterToImage(encounter, options);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  } catch (error) {
    console.error('Error exporting encounter:', error);
    return false;
  }
}

/**
 * Export a character to a file
 * @param {Object} character - The character to export
 * @param {string} format - The export format (from ExportFormat)
 * @param {Object} options - Additional export options
 * @returns {Promise<boolean>} A promise that resolves to true if export was successful
 */
export async function exportCharacter(character, format = ExportFormat.JSON, options = {}) {
  try {
    switch (format) {
      case ExportFormat.JSON:
        return exportCharacterToJSON(character, options);
      case ExportFormat.HTML:
        return exportCharacterToHTML(character, options);
      case ExportFormat.PDF:
        return exportCharacterToPDF(character, options);
      case ExportFormat.MARKDOWN:
        return exportCharacterToMarkdown(character, options);
      case ExportFormat.FOUNDRY_VTT:
        return exportCharacterToFoundryVTT(character, options);
      case ExportFormat.ROLL20:
        return exportCharacterToRoll20(character, options);
      case ExportFormat.FANTASY_GROUNDS:
        return exportCharacterToFantasyGrounds(character, options);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  } catch (error) {
    console.error('Error exporting character:', error);
    return false;
  }
}

/**
 * Export a monster to a file
 * @param {Object} monster - The monster to export
 * @param {string} format - The export format (from ExportFormat)
 * @param {Object} options - Additional export options
 * @returns {Promise<boolean>} A promise that resolves to true if export was successful
 */
export async function exportMonster(monster, format = ExportFormat.JSON, options = {}) {
  try {
    switch (format) {
      case ExportFormat.JSON:
        return exportMonsterToJSON(monster, options);
      case ExportFormat.HTML:
        return exportMonsterToHTML(monster, options);
      case ExportFormat.PDF:
        return exportMonsterToPDF(monster, options);
      case ExportFormat.MARKDOWN:
        return exportMonsterToMarkdown(monster, options);
      case ExportFormat.FOUNDRY_VTT:
        return exportMonsterToFoundryVTT(monster, options);
      case ExportFormat.ROLL20:
        return exportMonsterToRoll20(monster, options);
      case ExportFormat.FANTASY_GROUNDS:
        return exportMonsterToFantasyGrounds(monster, options);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  } catch (error) {
    console.error('Error exporting monster:', error);
    return false;
  }
}

/**
 * Export combat history to a file
 * @param {Array} history - The combat history to export
 * @param {string} format - The export format (from ExportFormat)
 * @param {Object} options - Additional export options
 * @returns {Promise<boolean>} A promise that resolves to true if export was successful
 */
export async function exportCombatHistory(history, format = ExportFormat.JSON, options = {}) {
  try {
    switch (format) {
      case ExportFormat.JSON:
        return exportCombatHistoryToJSON(history, options);
      case ExportFormat.HTML:
        return exportCombatHistoryToHTML(history, options);
      case ExportFormat.PDF:
        return exportCombatHistoryToPDF(history, options);
      case ExportFormat.CSV:
        return exportCombatHistoryToCSV(history, options);
      case ExportFormat.MARKDOWN:
        return exportCombatHistoryToMarkdown(history, options);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  } catch (error) {
    console.error('Error exporting combat history:', error);
    return false;
  }
}

/**
 * Export an encounter to JSON format
 * @param {Object} encounter - The encounter to export
 * @param {Object} options - Additional export options
 * @returns {boolean} True if export was successful
 */
function exportEncounterToJSON(encounter, options = {}) {
  try {
    // Create a copy of the encounter with any necessary transformations
    const encounterData = {
      ...encounter,
      exportDate: new Date().toISOString(),
      exportVersion: '2.3.1'
    };
    
    // Convert to JSON string with pretty formatting
    const jsonString = JSON.stringify(encounterData, null, 2);
    
    // Create a download link
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(jsonString)}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', `${encounter.name || 'encounter'}.json`);
    
    // Trigger the download
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    return true;
  } catch (error) {
    console.error('Error exporting encounter to JSON:', error);
    return false;
  }
}

/**
 * Export an encounter to HTML format
 * @param {Object} encounter - The encounter to export
 * @param {Object} options - Additional export options
 * @returns {boolean} True if export was successful
 */
function exportEncounterToHTML(encounter, options = {}) {
  try {
    // Create HTML content
    let html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${encounter.name || 'Encounter'}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1, h2, h3 {
            color: #444;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #f2f2f2;
          }
          .monster {
            background-color: #ffeeee;
          }
          .player {
            background-color: #eeffee;
          }
          .npc {
            background-color: #eeeeff;
          }
          .stat-block {
            border: 1px solid #ddd;
            padding: 10px;
            margin-bottom: 20px;
            background-color: #f9f9f9;
          }
          .conditions {
            color: #c00;
          }
        </style>
      </head>
      <body>
        <h1>${encounter.name || 'Encounter'}</h1>
        <p><strong>Description:</strong> ${encounter.description || 'No description provided.'}</p>
        
        <h2>Combatants</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Initiative</th>
              <th>HP</th>
              <th>AC</th>
              <th>Type</th>
              <th>Conditions</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    // Add combatants to the table
    if (encounter.combatants && encounter.combatants.length > 0) {
      // Sort by initiative if available
      const sortedCombatants = [...encounter.combatants].sort((a, b) => 
        (b.initiative || 0) - (a.initiative || 0)
      );
      
      sortedCombatants.forEach(combatant => {
        const conditions = combatant.conditions && combatant.conditions.length > 0 ?
          combatant.conditions.map(c => c.name || c).join(', ') : '';
        
        html += `
          <tr class="${combatant.type}">
            <td>${combatant.name}</td>
            <td>${combatant.initiative || '—'}</td>
            <td>${combatant.hp}/${combatant.maxHp}</td>
            <td>${combatant.ac}</td>
            <td>${combatant.type}</td>
            <td class="conditions">${conditions}</td>
          </tr>
        `;
      });
    } else {
      html += `
        <tr>
          <td colspan="6">No combatants in this encounter.</td>
        </tr>
      `;
    }
    
    html += `
          </tbody>
        </table>
    `;
    
    // Add monster stat blocks if requested
    if (options.includeStatBlocks && encounter.combatants) {
      const monsters = encounter.combatants.filter(c => c.type === 'monster');
      
      if (monsters.length > 0) {
        html += `<h2>Monster Stat Blocks</h2>`;
        
        monsters.forEach(monster => {
          html += `
            <div class="stat-block">
              <h3>${monster.name}</h3>
              <p><strong>AC:</strong> ${monster.ac}</p>
              <p><strong>HP:</strong> ${monster.hp}/${monster.maxHp}</p>
              <p><strong>Speed:</strong> ${monster.speed || '30 ft.'}</p>
              
              <h4>Abilities</h4>
              <p>
                <strong>STR:</strong> ${monster.abilities?.str || '—'} 
                <strong>DEX:</strong> ${monster.abilities?.dex || '—'} 
                <strong>CON:</strong> ${monster.abilities?.con || '—'} 
                <strong>INT:</strong> ${monster.abilities?.int || '—'} 
                <strong>WIS:</strong> ${monster.abilities?.wis || '—'} 
                <strong>CHA:</strong> ${monster.abilities?.cha || '—'}
              </p>
          `;
          
          // Add actions if available
          if (monster.actions && monster.actions.length > 0) {
            html += `<h4>Actions</h4>`;
            monster.actions.forEach(action => {
              html += `
                <p><strong>${action.name}.</strong> ${action.description || ''}</p>
              `;
            });
          }
          
          html += `</div>`;
        });
      }
    }
    
    // Add notes if available
    if (encounter.notes) {
      html += `
        <h2>Notes</h2>
        <div>${encounter.notes}</div>
      `;
    }
    
    // Add export metadata
    html += `
        <hr>
        <p><small>Exported from Jesster's Combat Tracker on ${new Date().toLocaleString()}</small></p>
      </body>
      </html>
    `;
    
    // Create a download link
    const dataStr = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', `${encounter.name || 'encounter'}.html`);
    
    // Trigger the download
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    return true;
  } catch (error) {
    console.error('Error exporting encounter to HTML:', error);
    return false;
  }
}

/**
 * Export an encounter to PDF format
 * @param {Object} encounter - The encounter to export
 * @param {Object} options - Additional export options
 * @returns {Promise<boolean>} A promise that resolves to true if export was successful
 */
async function exportEncounterToPDF(encounter, options = {}) {
  try {
    // Check if jsPDF is available
    if (typeof window.jsPDF === 'undefined') {
      // Load jsPDF dynamically if not available
      await loadJsPDF();
    }
    
    // Create a new PDF document
    const doc = new window.jsPDF({
      orientation: options.orientation || 'portrait',
      unit: 'mm',
      format: options.format || 'a4'
    });
    
    // Add title
    doc.setFontSize(20);
    doc.text(encounter.name || 'Encounter', 20, 20);
    
    // Add description
    doc.setFontSize(12);
    doc.text(`Description: ${encounter.description || 'No description provided.'}`, 20, 30);
    
    // Add combatants table
    doc.setFontSize(16);
    doc.text('Combatants', 20, 45);
    
    // Define table columns
    const columns = [
      { header: 'Name', dataKey: 'name' },
      { header: 'Init', dataKey: 'initiative' },
      { header: 'HP', dataKey: 'hp' },
      { header: 'AC', dataKey: 'ac' },
      { header: 'Type', dataKey: 'type' }
    ];
    
    // Prepare table data
    const tableData = [];
    
    if (encounter.combatants && encounter.combatants.length > 0) {
      // Sort by initiative if available
      const sortedCombatants = [...encounter.combatants].sort((a, b) => 
        (b.initiative || 0) - (a.initiative || 0)
      );
      
      sortedCombatants.forEach(combatant => {
        tableData.push({
          name: combatant.name,
          initiative: combatant.initiative || '—',
          hp: `${combatant.hp}/${combatant.maxHp}`,
          ac: combatant.ac,
          type: combatant.type
        });
      });
    }
    
    // Add table to PDF
    doc.autoTable({
      startY: 50,
      head: [columns.map(col => col.header)],
      body: tableData.map(row => columns.map(col => row[col.dataKey])),
      theme: 'striped',
      headStyles: { fillColor: [66, 66, 66] },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });
    
    // Add monster stat blocks if requested
    if (options.includeStatBlocks && encounter.combatants) {
      const monsters = encounter.combatants.filter(c => c.type === 'monster');
      
      if (monsters.length > 0) {
        doc.addPage();
        doc.setFontSize(16);
        doc.text('Monster Stat Blocks', 20, 20);
        
        let yPosition = 30;
        
        monsters.forEach(monster => {
          // Check if we need a new page
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFontSize(14);
          doc.text(monster.name, 20, yPosition);
          yPosition += 10;
          
          doc.setFontSize(10);
          doc.text(`AC: ${monster.ac}   HP: ${monster.hp}/${monster.maxHp}   Speed: ${monster.speed || '30 ft.'}`, 20, yPosition);
          yPosition += 10;
          
          // Add abilities
          if (monster.abilities) {
            const abilities = `STR: ${monster.abilities.str || '—'}   DEX: ${monster.abilities.dex || '—'}   CON: ${monster.abilities.con || '—'}   INT: ${monster.abilities.int || '—'}   WIS: ${monster.abilities.wis || '—'}   CHA: ${monster.abilities.cha || '—'}`;
            doc.text(abilities, 20, yPosition);
            yPosition += 10;
          }
          
          // Add actions if available
          if (monster.actions && monster.actions.length > 0) {
            doc.setFontSize(12);
            doc.text('Actions', 20, yPosition);
            yPosition += 5;
            
            doc.setFontSize(10);
            monster.actions.forEach(action => {
              const actionText = `${action.name}: ${action.description || ''}`;
              
              // Handle text wrapping
              const textLines = doc.splitTextToSize(actionText, 170);
              doc.text(textLines, 20, yPosition);
              yPosition += 5 * textLines.length;
            });
          }
          
          yPosition += 15; // Add space between monsters
        });
      }
    }
    
    // Add notes if available
    if (encounter.notes) {
      doc.addPage();
      doc.setFontSize(16);
      doc.text('Notes', 20, 20);
      
      doc.setFontSize(10);
      const noteLines = doc.splitTextToSize(encounter.notes, 170);
      doc.text(noteLines, 20, 30);
    }
    
    // Add export metadata
    doc.setFontSize(8);
    doc.text(`Exported from Jesster's Combat Tracker on ${new Date().toLocaleString()}`, 20, 285);
    
    // Save the PDF
    doc.save(`${encounter.name || 'encounter'}.pdf`);
    
    return true;
  } catch (error) {
    console.error('Error exporting encounter to PDF:', error);
    return false;
  }
}

/**
 * Export an encounter to CSV format
 * @param {Object} encounter - The encounter to export
 * @param {Object} options - Additional export options
 * @returns {boolean} True if export was successful
 */
function exportEncounterToCSV(encounter, options = {}) {
  try {
    // Prepare CSV header
    let csv = 'Name,Initiative,HP,Max HP,AC,Type,Conditions\n';
    
    // Add combatants to CSV
    if (encounter.combatants && encounter.combatants.length > 0) {
      // Sort by initiative if available
      const sortedCombatants = [...encounter.combatants].sort((a, b) => 
        (b.initiative || 0) - (a.initiative || 0)
      );
      
      sortedCombatants.forEach(combatant => {
        const conditions = combatant.conditions && combatant.conditions.length > 0 ?
          combatant.conditions.map(c => c.name || c).join('; ') : '';
        
        // Escape fields that might contain commas
        const escapeCsv = (field) => {
          if (field === null || field === undefined) return '';
          const str = String(field);
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        };
        
        csv += `${escapeCsv(combatant.name)},`;
        csv += `${escapeCsv(combatant.initiative || '')},`;
        csv += `${escapeCsv(combatant.hp)},`;
        csv += `${escapeCsv(combatant.maxHp)},`;
        csv += `${escapeCsv(combatant.ac)},`;
        csv += `${escapeCsv(combatant.type)},`;
        csv += `${escapeCsv(conditions)}\n`;
      });
    }
    
    // Create a download link
    const dataStr = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', `${encounter.name || 'encounter'}.csv`);
    
    // Trigger the download
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    return true;
  } catch (error) {
    console.error('Error exporting encounter to CSV:', error);
    return false;
  }
}

/**
 * Export an encounter to Markdown format
 * @param {Object} encounter - The encounter to export
 * @param {Object} options - Additional export options
 * @returns {boolean} True if export was successful
 */
function exportEncounterToMarkdown(encounter, options = {}) {
  try {
    // Create Markdown content
    let markdown = `# ${encounter.name || 'Encounter'}\n\n`;
    markdown += `**Description:** ${encounter.description || 'No description provided.'}\n\n`;
    
    markdown += `## Combatants\n\n`;
    markdown += `| Name | Initiative | HP | AC | Type | Conditions |\n`;
    markdown += `| ---- | ---------- | -- | -- | ---- | ---------- |\n`;
    
    // Add combatants to the table
    if (encounter.combatants && encounter.combatants.length > 0) {
      // Sort by initiative if available
      const sortedCombatants = [...encounter.combatants].sort((a, b) => 
        (b.initiative || 0) - (a.initiative || 0)
      );
      
      sortedCombatants.forEach(combatant => {
        const conditions = combatant.conditions && combatant.conditions.length > 0 ?
          combatant.conditions.map(c => c.name || c).join(', ') : '';
        
        markdown += `| ${combatant.name} | ${combatant.initiative || '—'} | ${combatant.hp}/${combatant.maxHp} | ${combatant.ac} | ${combatant.type} | ${conditions} |\n`;
      });
    } else {
      markdown += `| No combatants in this encounter. | | | | | |\n`;
    }
    
    markdown += `\n`;
    
    // Add monster stat blocks if requested
    if (options.includeStatBlocks && encounter.combatants) {
      const monsters = encounter.combatants.filter(c => c.type === 'monster');
      
      if (monsters.length > 0) {
        markdown += `## Monster Stat Blocks\n\n`;
        
        monsters.forEach(monster => {
          markdown += `### ${monster.name}\n\n`;
          markdown += `**AC:** ${monster.ac}  \n`;
          markdown += `**HP:** ${monster.hp}/${monster.maxHp}  \n`;
          markdown += `**Speed:** ${monster.speed || '30 ft.'}  \n\n`;
          
          // Add abilities
          markdown += `**Abilities:**  \n`;
          if (monster.abilities) {
            markdown += `STR: ${monster.abilities.str || '—'}, `;
            markdown += `DEX: ${monster.abilities.dex || '—'}, `;
            markdown += `CON: ${monster.abilities.con || '—'}, `;
            markdown += `INT: ${monster.abilities.int || '—'}, `;
            markdown += `WIS: ${monster.abilities.wis || '—'}, `;
            markdown += `CHA: ${monster.abilities.cha || '—'}  \n\n`;
          }
          
          // Add actions if available
          if (monster.actions && monster.actions.length > 0) {
            markdown += `**Actions:**  \n`;
            monster.actions.forEach(action => {
              markdown += `*${action.name}.* ${action.description || ''}  \n\n`;
            });
          }
          
          markdown += `\n`;
        });
      }
    }
    
    // Add notes if available
    if (encounter.notes) {
      markdown += `## Notes\n\n${encounter.notes}\n\n`;
    }
    
    // Add export metadata
    markdown += `---\n`;
    markdown += `*Exported from Jesster's Combat Tracker on ${new Date().toLocaleString()}*\n`;
    
    // Create a download link
    const dataStr = `data:text/markdown;charset=utf-8,${encodeURIComponent(markdown)}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', `${encounter.name || 'encounter'}.md`);
    
    // Trigger the download
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    return true;
  } catch (error) {
    console.error('Error exporting encounter to Markdown:', error);
    return false;
  }
}

/**
 * Export an encounter to Foundry VTT format
 * @param {Object} encounter - The encounter to export
 * @param {Object} options - Additional export options
 * @returns {boolean} True if export was successful
 */
function exportEncounterToFoundryVTT(encounter, options = {}) {
  try {
    // Create Foundry VTT compatible JSON structure
    const foundryData = {
      name: encounter.name || 'Imported Encounter',
      folder: null,
      type: 'encounter',
      flags: {
        importSource: 'jct',
        importVersion: '2.3.1'
      },
      combatants: []
    };
    
    // Convert combatants to Foundry format
    if (encounter.combatants && encounter.combatants.length > 0) {
      encounter.combatants.forEach(combatant => {
        const foundryActor = {
          name: combatant.name,
          type: combatant.type === 'player' ? 'character' : 'npc',
          img: combatant.portrait || getDefaultPortrait(combatant.type),
          data: {
            attributes: {
              hp: {
                value: combatant.hp,
                max: combatant.maxHp
              },
              ac: {
                value: combatant.ac
              }
            },
            details: {
              type: {
                value: combatant.type
              }
            }
          },
          token: {
            name: combatant.name,
            displayName: 50, // HOVER
            actorLink: combatant.type === 'player',
            disposition: getFoundryDisposition(combatant.type)
          }
        };
        
        // Add ability scores if available
        if (combatant.abilities) {
          foundryActor.data.abilities = {
            str: { value: combatant.abilities.str || 10 },
            dex: { value: combatant.abilities.dex || 10 },
            con: { value: combatant.abilities.con || 10 },
            int: { value: combatant.abilities.int || 10 },
            wis: { value: combatant.abilities.wis || 10 },
            cha: { value: combatant.abilities.cha || 10 }
          };
        }
        
        foundryData.combatants.push({
          actorData: foundryActor,
          initiative: combatant.initiative || null,
          visible: true,
          defeated: combatant.hp <= 0
        });
      });
    }
    
    // Add encounter notes if available
    if (encounter.notes) {
      foundryData.notes = encounter.notes;
    }
    
    // Convert to JSON string with pretty formatting
    const jsonString = JSON.stringify(foundryData, null, 2);
    
    // Create a download link
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(jsonString)}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', `${encounter.name || 'encounter'}-foundry.json`);
    
    // Trigger the download
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    return true;
  } catch (error) {
    console.error('Error exporting encounter to Foundry VTT:', error);
    return false;
  }
}

/**
 * Export an encounter to Roll20 format
 * @param {Object} encounter - The encounter to export
 * @param {Object} options - Additional export options
 * @returns {boolean} True if export was successful
 */
function exportEncounterToRoll20(encounter, options = {}) {
  try {
    // Create Roll20 compatible JSON structure
    const roll20Data = {
      name: encounter.name || 'Imported Encounter',
      folder: 'Imported',
      characters: []
    };
    
        // Convert combatants to Roll20 format
    if (encounter.combatants && encounter.combatants.length > 0) {
      encounter.combatants.forEach(combatant => {
        const roll20Character = {
          name: combatant.name,
          bio: '',
          avatar: combatant.portrait || '',
          attributes: {
            hp: combatant.hp,
            max_hp: combatant.maxHp,
            ac: combatant.ac,
            initiative_bonus: calculateInitiativeBonus(combatant),
            type: combatant.type
          }
        };
        
        // Add ability scores if available
        if (combatant.abilities) {
          roll20Character.attributes.strength = combatant.abilities.str || 10;
          roll20Character.attributes.dexterity = combatant.abilities.dex || 10;
          roll20Character.attributes.constitution = combatant.abilities.con || 10;
          roll20Character.attributes.intelligence = combatant.abilities.int || 10;
          roll20Character.attributes.wisdom = combatant.abilities.wis || 10;
          roll20Character.attributes.charisma = combatant.abilities.cha || 10;
        }
        
        // Add conditions as notes
        if (combatant.conditions && combatant.conditions.length > 0) {
          const conditions = combatant.conditions.map(c => c.name || c).join(', ');
          roll20Character.bio += `\nConditions: ${conditions}`;
        }
        
        roll20Data.characters.push(roll20Character);
      });
    }
    
    // Add encounter notes if available
    if (encounter.notes) {
      roll20Data.notes = encounter.notes;
    }
    
    // Convert to JSON string with pretty formatting
    const jsonString = JSON.stringify(roll20Data, null, 2);
    
    // Create a download link
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(jsonString)}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', `${encounter.name || 'encounter'}-roll20.json`);
    
    // Trigger the download
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    return true;
  } catch (error) {
    console.error('Error exporting encounter to Roll20:', error);
    return false;
  }
}

/**
 * Export an encounter to Fantasy Grounds format
 * @param {Object} encounter - The encounter to export
 * @param {Object} options - Additional export options
 * @returns {boolean} True if export was successful
 */
function exportEncounterToFantasyGrounds(encounter, options = {}) {
  try {
    // Create Fantasy Grounds compatible XML structure
    let xml = '<?xml version="1.0" encoding="iso-8859-1"?>\n';
    xml += '<root version="3.3" release="8|CoreRPG:3">\n';
    xml += '  <encounter>\n';
    xml += `    <name type="string">${escapeXml(encounter.name || 'Imported Encounter')}</name>\n`;
    xml += '    <combatants>\n';
    
    // Convert combatants to Fantasy Grounds format
    if (encounter.combatants && encounter.combatants.length > 0) {
      encounter.combatants.forEach((combatant, index) => {
        xml += '      <combatant>\n';
        xml += `        <name type="string">${escapeXml(combatant.name)}</name>\n`;
        xml += `        <nonid_name type="string">${escapeXml(combatant.name)}</nonid_name>\n`;
        xml += `        <token type="token">tokens/medium/${combatant.type === 'player' ? 'pc' : 'npc'}_token.png</token>\n`;
        xml += `        <type type="string">${escapeXml(combatant.type)}</type>\n`;
        xml += `        <hp type="number">${combatant.hp}</hp>\n`;
        xml += `        <hptotal type="number">${combatant.maxHp}</hptotal>\n`;
        xml += `        <ac type="number">${combatant.ac}</ac>\n`;
        xml += `        <initiative type="number">${combatant.initiative || 0}</initiative>\n`;
        
        // Add ability scores if available
        if (combatant.abilities) {
          xml += '        <abilities>\n';
          xml += `          <strength type="number">${combatant.abilities.str || 10}</strength>\n`;
          xml += `          <dexterity type="number">${combatant.abilities.dex || 10}</dexterity>\n`;
          xml += `          <constitution type="number">${combatant.abilities.con || 10}</constitution>\n`;
          xml += `          <intelligence type="number">${combatant.abilities.int || 10}</intelligence>\n`;
          xml += `          <wisdom type="number">${combatant.abilities.wis || 10}</wisdom>\n`;
          xml += `          <charisma type="number">${combatant.abilities.cha || 10}</charisma>\n`;
          xml += '        </abilities>\n';
        }
        
        // Add conditions
        if (combatant.conditions && combatant.conditions.length > 0) {
          xml += '        <effects>\n';
          combatant.conditions.forEach((condition, condIndex) => {
            const condName = condition.name || condition;
            xml += `          <effect${condIndex + 1}>\n`;
            xml += `            <label type="string">${escapeXml(condName)}</label>\n`;
            xml += '          </effect${condIndex + 1}>\n';
          });
          xml += '        </effects>\n';
        }
        
        xml += '      </combatant>\n';
      });
    }
    
    xml += '    </combatants>\n';
    
    // Add encounter notes if available
    if (encounter.notes) {
      xml += `    <notes type="formattedtext">${escapeXml(encounter.notes)}</notes>\n`;
    }
    
    xml += '  </encounter>\n';
    xml += '</root>';
    
    // Create a download link
    const dataStr = `data:text/xml;charset=utf-8,${encodeURIComponent(xml)}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', `${encounter.name || 'encounter'}-fg.xml`);
    
    // Trigger the download
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    return true;
  } catch (error) {
    console.error('Error exporting encounter to Fantasy Grounds:', error);
    return false;
  }
}

/**
 * Export an encounter as an image
 * @param {Object} encounter - The encounter to export
 * @param {Object} options - Additional export options
 * @returns {Promise<boolean>} A promise that resolves to true if export was successful
 */
async function exportEncounterToImage(encounter, options = {}) {
  try {
    // Check if html2canvas is available
    if (typeof window.html2canvas === 'undefined') {
      // Load html2canvas dynamically if not available
      await loadHtml2Canvas();
    }
    
    // Create a temporary container to render the encounter
    const container = document.createElement('div');
    container.style.width = '800px';
    container.style.padding = '20px';
    container.style.backgroundColor = 'white';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    
    // Add encounter content
    container.innerHTML = `
      <h1 style="color: #444; margin-bottom: 10px;">${encounter.name || 'Encounter'}</h1>
      <p style="margin-bottom: 20px;"><strong>Description:</strong> ${encounter.description || 'No description provided.'}</p>
      
      <h2 style="color: #444; margin-bottom: 10px;">Combatants</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr>
            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd; background-color: #f2f2f2;">Name</th>
            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd; background-color: #f2f2f2;">Initiative</th>
            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd; background-color: #f2f2f2;">HP</th>
            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd; background-color: #f2f2f2;">AC</th>
            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd; background-color: #f2f2f2;">Type</th>
            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd; background-color: #f2f2f2;">Conditions</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    // Add combatants to the table
    if (encounter.combatants && encounter.combatants.length > 0) {
      // Sort by initiative if available
      const sortedCombatants = [...encounter.combatants].sort((a, b) => 
        (b.initiative || 0) - (a.initiative || 0)
      );
      
      sortedCombatants.forEach((combatant, index) => {
        const conditions = combatant.conditions && combatant.conditions.length > 0 ?
          combatant.conditions.map(c => c.name || c).join(', ') : '';
        
        const bgColor = index % 2 === 0 ? '#f9f9f9' : 'white';
        const typeColor = combatant.type === 'player' ? '#eeffee' : 
                          combatant.type === 'monster' ? '#ffeeee' : '#eeeeff';
        
        container.innerHTML += `
          <tr style="background-color: ${bgColor};">
            <td style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">${combatant.name}</td>
            <td style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">${combatant.initiative || '—'}</td>
            <td style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">${combatant.hp}/${combatant.maxHp}</td>
            <td style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">${combatant.ac}</td>
            <td style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd; background-color: ${typeColor};">${combatant.type}</td>
            <td style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd; color: #c00;">${conditions}</td>
          </tr>
        `;
      });
    } else {
      container.innerHTML += `
        <tr>
          <td colspan="6" style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">No combatants in this encounter.</td>
        </tr>
      `;
    }
    
    container.innerHTML += `
        </tbody>
      </table>
      
      <div style="font-size: 12px; color: #666; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px;">
        Exported from Jesster's Combat Tracker on ${new Date().toLocaleString()}
      </div>
    `;
    
    // Add container to the document
    document.body.appendChild(container);
    
    // Use html2canvas to create an image
    const canvas = await window.html2canvas(container, {
      backgroundColor: 'white',
      scale: 2, // Higher resolution
      logging: false
    });
    
    // Remove the temporary container
    document.body.removeChild(container);
    
    // Convert canvas to image and download
    const imgData = canvas.toDataURL('image/png');
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', imgData);
    downloadAnchorNode.setAttribute('download', `${encounter.name || 'encounter'}.png`);
    
    // Trigger the download
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    return true;
  } catch (error) {
    console.error('Error exporting encounter to image:', error);
    return false;
  }
}

/**
 * Export a character to JSON format
 * @param {Object} character - The character to export
 * @param {Object} options - Additional export options
 * @returns {boolean} True if export was successful
 */
function exportCharacterToJSON(character, options = {}) {
  try {
    // Create a copy of the character with any necessary transformations
    const characterData = {
      ...character,
      exportDate: new Date().toISOString(),
      exportVersion: '2.3.1'
    };
    
    // Convert to JSON string with pretty formatting
    const jsonString = JSON.stringify(characterData, null, 2);
    
    // Create a download link
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(jsonString)}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', `${character.name || 'character'}.json`);
    
    // Trigger the download
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    return true;
  } catch (error) {
    console.error('Error exporting character to JSON:', error);
    return false;
  }
}

/**
 * Export a character to HTML format
 * @param {Object} character - The character to export
 * @param {Object} options - Additional export options
 * @returns {boolean} True if export was successful
 */
function exportCharacterToHTML(character, options = {}) {
  try {
    // Create HTML content
    let html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${character.name || 'Character'}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1, h2, h3 {
            color: #444;
          }
          .character-sheet {
            border: 1px solid #ddd;
            padding: 20px;
            margin-bottom: 20px;
            background-color: #f9f9f9;
          }
          .character-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          .character-portrait {
            width: 150px;
            height: 150px;
            background-color: #eee;
            border: 1px solid #ddd;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .character-portrait img {
            max-width: 100%;
            max-height: 100%;
          }
          .character-basics {
            flex-grow: 1;
            padding-left: 20px;
          }
          .ability-scores {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          .ability-score {
            text-align: center;
            width: 16%;
            padding: 10px 0;
            border: 1px solid #ddd;
            background-color: #fff;
          }
          .ability-name {
            font-weight: bold;
          }
          .ability-value {
            font-size: 24px;
            font-weight: bold;
          }
          .ability-modifier {
            font-size: 16px;
          }
          .combat-stats {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          .combat-stat {
            text-align: center;
            width: 30%;
            padding: 10px 0;
            border: 1px solid #ddd;
            background-color: #fff;
          }
          .stat-name {
            font-weight: bold;
          }
          .stat-value {
            font-size: 24px;
            font-weight: bold;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #f2f2f2;
          }
          .conditions {
            color: #c00;
          }
        </style>
      </head>
      <body>
        <div class="character-sheet">
          <div class="character-header">
            <div class="character-portrait">
              ${character.portrait ? `<img src="${character.portrait}" alt="${character.name}">` : 'No Portrait'}
            </div>
            <div class="character-basics">
              <h1>${character.name || 'Unknown Character'}</h1>
              <p>
                ${character.race || ''} ${character.class || ''}
                ${character.level ? `Level ${character.level}` : ''}
              </p>
            </div>
          </div>
          
          <div class="ability-scores">
    `;
    
    // Add ability scores
    const abilities = character.abilities || {};
    const abilityNames = {
      str: 'Strength',
      dex: 'Dexterity',
      con: 'Constitution',
      int: 'Intelligence',
      wis: 'Wisdom',
      cha: 'Charisma'
    };
    
    Object.entries(abilityNames).forEach(([key, name]) => {
      const score = abilities[key] || 10;
      const modifier = Math.floor((score - 10) / 2);
      const modifierText = modifier >= 0 ? `+${modifier}` : modifier;
      
      html += `
        <div class="ability-score">
          <div class="ability-name">${name}</div>
          <div class="ability-value">${score}</div>
          <div class="ability-modifier">${modifierText}</div>
        </div>
      `;
    });
    
    html += `
          </div>
          
          <div class="combat-stats">
            <div class="combat-stat">
              <div class="stat-name">Hit Points</div>
              <div class="stat-value">${character.hp || 0}/${character.maxHp || 0}</div>
            </div>
            <div class="combat-stat">
              <div class="stat-name">Armor Class</div>
              <div class="stat-value">${character.ac || 10}</div>
            </div>
            <div class="combat-stat">
              <div class="stat-name">Initiative</div>
              <div class="stat-value">${character.initiative !== undefined ? character.initiative : '—'}</div>
            </div>
          </div>
    `;
    
    // Add saving throws if available
    if (character.savingThrows) {
      html += `
        <h2>Saving Throws</h2>
        <table>
          <thead>
            <tr>
              <th>Ability</th>
              <th>Modifier</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      Object.entries(character.savingThrows).forEach(([ability, modifier]) => {
        const modifierText = modifier >= 0 ? `+${modifier}` : modifier;
        html += `
          <tr>
            <td>${abilityNames[ability] || ability}</td>
            <td>${modifierText}</td>
          </tr>
        `;
      });
      
      html += `
          </tbody>
        </table>
      `;
    }
    
    // Add skills if available
    if (character.skills && Object.keys(character.skills).length > 0) {
      html += `
        <h2>Skills</h2>
        <table>
          <thead>
            <tr>
              <th>Skill</th>
              <th>Modifier</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      Object.entries(character.skills).forEach(([skill, modifier]) => {
        const modifierText = modifier >= 0 ? `+${modifier}` : modifier;
        html += `
          <tr>
            <td>${skill.charAt(0).toUpperCase() + skill.slice(1)}</td>
            <td>${modifierText}</td>
          </tr>
        `;
      });
      
      html += `
          </tbody>
        </table>
      `;
    }
    
    // Add conditions if any
    if (character.conditions && character.conditions.length > 0) {
      const conditions = character.conditions.map(c => c.name || c).join(', ');
      html += `
        <h2>Conditions</h2>
        <p class="conditions">${conditions}</p>
      `;
    }
    
    // Add notes if available
    if (character.notes) {
      html += `
        <h2>Notes</h2>
        <div>${character.notes}</div>
      `;
    }
    
    html += `
        </div>
        
        <div style="font-size: 12px; color: #666; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px;">
          Exported from Jesster's Combat Tracker on ${new Date().toLocaleString()}
        </div>
      </body>
      </html>
    `;
    
    // Create a download link
    const dataStr = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', `${character.name || 'character'}.html`);
    
    // Trigger the download
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    return true;
  } catch (error) {
    console.error('Error exporting character to HTML:', error);
    return false;
  }
}

/**
 * Export a character to PDF format
 * @param {Object} character - The character to export
 * @param {Object} options - Additional export options
 * @returns {Promise<boolean>} A promise that resolves to true if export was successful
 */
async function exportCharacterToPDF(character, options = {}) {
  try {
    // Check if jsPDF is available
    if (typeof window.jsPDF === 'undefined') {
      // Load jsPDF dynamically if not available
      await loadJsPDF();
    }
    
    // Create a new PDF document
    const doc = new window.jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Add title
    doc.setFontSize(24);
    doc.text(character.name || 'Character', 20, 20);
    
    // Add basic info
    doc.setFontSize(12);
    const basicInfo = [];
    if (character.race) basicInfo.push(character.race);
    if (character.class) basicInfo.push(character.class);
    if (character.level) basicInfo.push(`Level ${character.level}`);
    
    if (basicInfo.length > 0) {
      doc.text(basicInfo.join(' '), 20, 30);
    }
    
    // Add ability scores
    doc.setFontSize(14);
    doc.text('Ability Scores', 20, 45);
    
    const abilities = character.abilities || {};
    const abilityNames = {
      str: 'Strength',
      dex: 'Dexterity',
      con: 'Constitution',
      int: 'Intelligence',
      wis: 'Wisdom',
      cha: 'Charisma'
    };
    
    let yPos = 55;
    Object.entries(abilityNames).forEach(([key, name], index) => {
      const score = abilities[key] || 10;
      const modifier = Math.floor((score - 10) / 2);
      const modifierText = modifier >= 0 ? `+${modifier}` : modifier;
      
      const xPos = 20 + (index % 3) * 60;
      const currentYPos = yPos + Math.floor(index / 3) * 20;
      
      doc.setFontSize(12);
      doc.text(name, xPos, currentYPos);
      doc.setFontSize(16);
      doc.text(`${score} (${modifierText})`, xPos, currentYPos + 8);
    });
    
    // Add combat stats
    yPos = 100;
    doc.setFontSize(14);
    doc.text('Combat Stats', 20, yPos);
    
    doc.setFontSize(12);
    doc.text(`HP: ${character.hp || 0}/${character.maxHp || 0}`, 20, yPos + 10);
    doc.text(`AC: ${character.ac || 10}`, 80, yPos + 10);
    doc.text(`Initiative: ${character.initiative !== undefined ? character.initiative : '—'}`, 140, yPos + 10);
    
    // Add saving throws if available
    if (character.savingThrows) {
      yPos += 25;
      doc.setFontSize(14);
      doc.text('Saving Throws', 20, yPos);
      
      doc.setFontSize(12);
      let savingThrowsText = '';
      Object.entries(character.savingThrows).forEach(([ability, modifier]) => {
        const modifierText = modifier >= 0 ? `+${modifier}` : modifier;
        savingThrowsText += `${abilityNames[ability] || ability}: ${modifierText}   `;
      });
      
      doc.text(savingThrowsText, 20, yPos + 10);
    }
    
    // Add skills if available
    if (character.skills && Object.keys(character.skills).length > 0) {
      yPos += 25;
      doc.setFontSize(14);
      doc.text('Skills', 20, yPos);
      
      doc.setFontSize(10);
      let skillsText = '';
      let skillCount = 0;
      
      Object.entries(character.skills).forEach(([skill, modifier]) => {
        const modifierText = modifier >= 0 ? `+${modifier}` : modifier;
        skillsText += `${skill.charAt(0).toUpperCase() + skill.slice(1)}: ${modifierText}   `;
        skillCount++;
        
        // Start a new line every 3 skills
        if (skillCount % 3 === 0) {
          doc.text(skillsText, 20, yPos + 10 + Math.floor(skillCount / 3) * 6);
          skillsText = '';
        }
      });
      
      // Add any remaining skills
      if (skillsText) {
        doc.text(skillsText, 20, yPos + 10 + Math.ceil(skillCount / 3) * 6);
      }
    }
    
    // Add conditions if any
    if (character.conditions && character.conditions.length > 0) {
      yPos += 40;
      doc.setFontSize(14);
      doc.text('Conditions', 20, yPos);
      
      const conditions = character.conditions.map(c => c.name || c).join(', ');
      doc.setFontSize(12);
      doc.setTextColor(200, 0, 0); // Red text for conditions
      doc.text(conditions, 20, yPos + 10);
      doc.setTextColor(0, 0, 0); // Reset text color
    }
    
    // Add notes if available
    if (character.notes) {
      yPos += 25;
      doc.setFontSize(14);
      doc.text('Notes', 20, yPos);
      
      doc.setFontSize(10);
      const noteLines = doc.splitTextToSize(character.notes, 170);
      doc.text(noteLines, 20, yPos + 10);
    }
    
    // Add export metadata
    doc.setFontSize(8);
    doc.text(`Exported from Jesster's Combat Tracker on ${new Date().toLocaleString()}`, 20, 285);
    
    // Save the PDF
    doc.save(`${character.name || 'character'}.pdf`);
    
    return true;
  } catch (error) {
    console.error('Error exporting character to PDF:', error);
    return false;
  }
}

/**
 * Export a character to Markdown format
 * @param {Object} character - The character to export
 * @param {Object} options - Additional export options
 * @returns {boolean} True if export was successful
 */
function exportCharacterToMarkdown(character, options = {}) {
  try {
    // Create Markdown content
    let markdown = `# ${character.name || 'Character'}\n\n`;
    
    // Add basic info
    const basicInfo = [];
    if (character.race) basicInfo.push(character.race);
    if (character.class) basicInfo.push(character.class);
    if (character.level) basicInfo.push(`Level ${character.level}`);
    
    if (basicInfo.length > 0) {
      markdown += `${basicInfo.join(' ')}\n\n`;
    }
    
    // Add ability scores
    markdown += `## Ability Scores\n\n`;
    
    const abilities = character.abilities || {};
    const abilityNames = {
      str: 'Strength',
      dex: 'Dexterity',
      con: 'Constitution',
      int: 'Intelligence',
      wis: 'Wisdom',
      cha: 'Charisma'
    };
    
        Object.entries(abilityNames).forEach(([key, name]) => {
      const score = abilities[key] || 10;
      const modifier = Math.floor((score - 10) / 2);
      const modifierText = modifier >= 0 ? `+${modifier}` : modifier;
      
      markdown += `**${name}:** ${score} (${modifierText})  \n`;
    });
    
    markdown += `\n`;
    
    // Add combat stats
    markdown += `## Combat Stats\n\n`;
    markdown += `**HP:** ${character.hp || 0}/${character.maxHp || 0}  \n`;
    markdown += `**AC:** ${character.ac || 10}  \n`;
    markdown += `**Initiative:** ${character.initiative !== undefined ? character.initiative : '—'}  \n\n`;
    
    // Add saving throws if available
    if (character.savingThrows) {
      markdown += `## Saving Throws\n\n`;
      
      Object.entries(character.savingThrows).forEach(([ability, modifier]) => {
        const modifierText = modifier >= 0 ? `+${modifier}` : modifier;
        markdown += `**${abilityNames[ability] || ability}:** ${modifierText}  \n`;
      });
      
      markdown += `\n`;
    }
    
    // Add skills if available
    if (character.skills && Object.keys(character.skills).length > 0) {
      markdown += `## Skills\n\n`;
      
      Object.entries(character.skills).forEach(([skill, modifier]) => {
        const modifierText = modifier >= 0 ? `+${modifier}` : modifier;
        markdown += `**${skill.charAt(0).toUpperCase() + skill.slice(1)}:** ${modifierText}  \n`;
      });
      
      markdown += `\n`;
    }
    
    // Add conditions if any
    if (character.conditions && character.conditions.length > 0) {
      const conditions = character.conditions.map(c => c.name || c).join(', ');
      markdown += `## Conditions\n\n${conditions}\n\n`;
    }
    
    // Add notes if available
    if (character.notes) {
      markdown += `## Notes\n\n${character.notes}\n\n`;
    }
    
    // Add export metadata
    markdown += `---\n`;
    markdown += `*Exported from Jesster's Combat Tracker on ${new Date().toLocaleString()}*\n`;
    
    // Create a download link
    const dataStr = `data:text/markdown;charset=utf-8,${encodeURIComponent(markdown)}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', `${character.name || 'character'}.md`);
    
    // Trigger the download
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    return true;
  } catch (error) {
    console.error('Error exporting character to Markdown:', error);
    return false;
  }
}

/**
 * Export a character to Foundry VTT format
 * @param {Object} character - The character to export
 * @param {Object} options - Additional export options
 * @returns {boolean} True if export was successful
 */
function exportCharacterToFoundryVTT(character, options = {}) {
  try {
    // Create Foundry VTT compatible JSON structure
    const foundryData = {
      name: character.name || 'Imported Character',
      type: 'character',
      img: character.portrait || 'icons/svg/mystery-man.svg',
      data: {
        abilities: {},
        attributes: {
          hp: {
            value: character.hp || 0,
            max: character.maxHp || 0
          },
          ac: {
            value: character.ac || 10
          }
        },
        details: {
          race: character.race || '',
          background: '',
          alignment: '',
          level: character.level || 1
        }
      },
      token: {
        name: character.name || 'Imported Character',
        displayName: 50, // HOVER
        actorLink: true,
        disposition: 1 // FRIENDLY
      }
    };
    
    // Add ability scores
    const abilities = character.abilities || {};
    const abilityNames = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
    
    abilityNames.forEach(ability => {
      foundryData.data.abilities[ability] = {
        value: abilities[ability] || 10,
        proficient: character.savingThrows && character.savingThrows[ability] ? 1 : 0
      };
    });
    
    // Add class information
    if (character.class) {
      foundryData.data.details.class = character.class;
    }
    
    // Add skills if available
    if (character.skills) {
      foundryData.data.skills = {};
      
      // Map from our skill names to Foundry's skill keys
      const skillMap = {
        'acrobatics': 'acr',
        'animal handling': 'ani',
        'arcana': 'arc',
        'athletics': 'ath',
        'deception': 'dec',
        'history': 'his',
        'insight': 'ins',
        'intimidation': 'itm',
        'investigation': 'inv',
        'medicine': 'med',
        'nature': 'nat',
        'perception': 'prc',
        'performance': 'prf',
        'persuasion': 'per',
        'religion': 'rel',
        'sleight of hand': 'slt',
        'stealth': 'ste',
        'survival': 'sur'
      };
      
      Object.entries(character.skills).forEach(([skill, modifier]) => {
        const foundrySkill = skillMap[skill.toLowerCase()];
        if (foundrySkill) {
          foundryData.data.skills[foundrySkill] = {
            value: 1, // Proficient
            ability: getAbilityForSkill(skill)
          };
        }
      });
    }
    
    // Convert to JSON string with pretty formatting
    const jsonString = JSON.stringify(foundryData, null, 2);
    
    // Create a download link
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(jsonString)}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', `${character.name || 'character'}-foundry.json`);
    
    // Trigger the download
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    return true;
  } catch (error) {
    console.error('Error exporting character to Foundry VTT:', error);
    return false;
  }
}

/**
 * Export a character to Roll20 format
 * @param {Object} character - The character to export
 * @param {Object} options - Additional export options
 * @returns {boolean} True if export was successful
 */
function exportCharacterToRoll20(character, options = {}) {
  try {
    // Create Roll20 compatible JSON structure
    const roll20Data = {
      schema_version: 2,
      type: 'character',
      character: {
        name: character.name || 'Imported Character',
        avatar: character.portrait || '',
        bio: '',
        gmnotes: '',
        defaulttoken: '',
        tags: 'jct-import',
        controlledby: '',
        inplayerjournals: '',
        attribs: []
      }
    };
    
    // Add attributes
    function addAttribute(name, current, max = '') {
      roll20Data.character.attribs.push({
        name,
        current: String(current),
        max: String(max),
        id: `attr_${Date.now()}_${Math.floor(Math.random() * 1000)}`
      });
    }
    
    // Add basic attributes
    addAttribute('hp', character.hp || 0, character.maxHp || 0);
    addAttribute('ac', character.ac || 10);
    addAttribute('level', character.level || 1);
    addAttribute('race', character.race || '');
    addAttribute('class', character.class || '');
    
    // Add ability scores
    const abilities = character.abilities || {};
    const abilityNames = {
      str: 'strength',
      dex: 'dexterity',
      con: 'constitution',
      int: 'intelligence',
      wis: 'wisdom',
      cha: 'charisma'
    };
    
    Object.entries(abilityNames).forEach(([key, name]) => {
      const score = abilities[key] || 10;
      const modifier = Math.floor((score - 10) / 2);
      
      addAttribute(name, score);
      addAttribute(`${name}_mod`, modifier);
    });
    
    // Add saving throws
    if (character.savingThrows) {
      Object.entries(character.savingThrows).forEach(([ability, modifier]) => {
        const fullName = abilityNames[ability];
        if (fullName) {
          addAttribute(`${fullName}_save`, modifier);
        }
      });
    }
    
    // Add skills
    if (character.skills) {
      Object.entries(character.skills).forEach(([skill, modifier]) => {
        // Convert to Roll20 skill name format
        const roll20Skill = skill.toLowerCase().replace(/\s+/g, '_');
        addAttribute(`${roll20Skill}`, modifier);
      });
    }
    
    // Add initiative
    if (character.initiative !== undefined) {
      addAttribute('initiative', character.initiative);
    } else if (abilities.dex) {
      addAttribute('initiative', Math.floor((abilities.dex - 10) / 2));
    }
    
    // Add conditions as notes
    if (character.conditions && character.conditions.length > 0) {
      const conditions = character.conditions.map(c => c.name || c).join(', ');
      addAttribute('conditions', conditions);
    }
    
    // Add notes
    if (character.notes) {
      roll20Data.character.bio = character.notes;
    }
    
    // Convert to JSON string with pretty formatting
    const jsonString = JSON.stringify(roll20Data, null, 2);
    
    // Create a download link
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(jsonString)}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', `${character.name || 'character'}-roll20.json`);
    
    // Trigger the download
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    return true;
  } catch (error) {
    console.error('Error exporting character to Roll20:', error);
    return false;
  }
}

/**
 * Export a character to Fantasy Grounds format
 * @param {Object} character - The character to export
 * @param {Object} options - Additional export options
 * @returns {boolean} True if export was successful
 */
function exportCharacterToFantasyGrounds(character, options = {}) {
  try {
    // Create Fantasy Grounds compatible XML structure
    let xml = '<?xml version="1.0" encoding="iso-8859-1"?>\n';
    xml += '<root version="3.3" release="8|CoreRPG:3">\n';
    xml += '  <character>\n';
    xml += `    <name type="string">${escapeXml(character.name || 'Imported Character')}</name>\n`;
    
    // Add basic info
    if (character.race) {
      xml += `    <race type="string">${escapeXml(character.race)}</race>\n`;
    }
    
    if (character.class) {
      xml += `    <class type="string">${escapeXml(character.class)}</class>\n`;
    }
    
    if (character.level) {
      xml += `    <level type="number">${character.level}</level>\n`;
    }
    
    // Add ability scores
    xml += '    <abilities>\n';
    const abilities = character.abilities || {};
    const abilityNames = {
      str: 'strength',
      dex: 'dexterity',
      con: 'constitution',
      int: 'intelligence',
      wis: 'wisdom',
      cha: 'charisma'
    };
    
    Object.entries(abilityNames).forEach(([key, name]) => {
      const score = abilities[key] || 10;
      xml += `      <${name} type="number">${score}</${name}>\n`;
    });
    xml += '    </abilities>\n';
    
    // Add combat stats
    xml += '    <hp>\n';
    xml += `      <total type="number">${character.maxHp || 0}</total>\n`;
    xml += `      <current type="number">${character.hp || 0}</current>\n`;
    xml += '    </hp>\n';
    xml += `    <ac type="number">${character.ac || 10}</ac>\n`;
    
    // Add initiative
    if (character.initiative !== undefined) {
      xml += `    <initiative type="number">${character.initiative}</initiative>\n`;
    }
    
    // Add saving throws
    if (character.savingThrows) {
      xml += '    <saves>\n';
      Object.entries(character.savingThrows).forEach(([ability, modifier]) => {
        const fullName = abilityNames[ability];
        if (fullName) {
          xml += `      <${fullName} type="number">${modifier}</${fullName}>\n`;
        }
      });
      xml += '    </saves>\n';
    }
    
    // Add skills
    if (character.skills && Object.keys(character.skills).length > 0) {
      xml += '    <skills>\n';
      Object.entries(character.skills).forEach(([skill, modifier]) => {
        // Convert to Fantasy Grounds skill name format
        const fgSkill = skill.toLowerCase().replace(/\s+/g, '');
        xml += `      <${fgSkill} type="number">${modifier}</${fgSkill}>\n`;
      });
      xml += '    </skills>\n';
    }
    
    // Add conditions
    if (character.conditions && character.conditions.length > 0) {
      xml += '    <conditions>\n';
      character.conditions.forEach((condition, index) => {
        const condName = condition.name || condition;
        xml += `      <condition${index + 1} type="string">${escapeXml(condName)}</condition${index + 1}>\n`;
      });
      xml += '    </conditions>\n';
    }
    
    // Add notes
    if (character.notes) {
      xml += `    <notes type="formattedtext">${escapeXml(character.notes)}</notes>\n`;
    }
    
    xml += '  </character>\n';
    xml += '</root>';
    
    // Create a download link
    const dataStr = `data:text/xml;charset=utf-8,${encodeURIComponent(xml)}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', `${character.name || 'character'}-fg.xml`);
    
    // Trigger the download
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    return true;
  } catch (error) {
    console.error('Error exporting character to Fantasy Grounds:', error);
    return false;
  }
}

/**
 * Export a monster to JSON format
 * @param {Object} monster - The monster to export
 * @param {Object} options - Additional export options
 * @returns {boolean} True if export was successful
 */
function exportMonsterToJSON(monster, options = {}) {
  try {
    // Create a copy of the monster with any necessary transformations
    const monsterData = {
      ...monster,
      exportDate: new Date().toISOString(),
      exportVersion: '2.3.1'
    };
    
    // Convert to JSON string with pretty formatting
    const jsonString = JSON.stringify(monsterData, null, 2);
    
    // Create a download link
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(jsonString)}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', `${monster.name || 'monster'}.json`);
    
    // Trigger the download
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    return true;
  } catch (error) {
    console.error('Error exporting monster to JSON:', error);
    return false;
  }
}

/**
 * Export a monster to HTML format
 * @param {Object} monster - The monster to export
 * @param {Object} options - Additional export options
 * @returns {boolean} True if export was successful
 */
function exportMonsterToHTML(monster, options = {}) {
  try {
    // Create HTML content
    let html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${monster.name || 'Monster'}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1, h2, h3 {
            color: #7b0000;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
          }
          .stat-block {
            border: 1px solid #ddd;
            padding: 20px;
            margin-bottom: 20px;
            background-color: #f9f9f9;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          }
          .monster-header {
            margin-bottom: 20px;
          }
          .monster-type {
            font-style: italic;
            color: #666;
            margin-bottom: 10px;
          }
          .ability-scores {
            display: flex;
            justify-content: space-between;
            margin: 20px 0;
            text-align: center;
          }
          .ability-score {
            width: 16%;
          }
          .ability-name {
            font-weight: bold;
          }
          .ability-value {
            font-size: 18px;
            font-weight: bold;
          }
          .ability-modifier {
            font-size: 14px;
          }
          .property-line {
            margin: 5px 0;
          }
          .property-name {
            font-weight: bold;
          }
          .actions h3, .traits h3, .legendary-actions h3 {
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
            margin-top: 20px;
          }
          .action-name, .trait-name {
            font-style: italic;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="stat-block">
          <div class="monster-header">
            <h1>${monster.name || 'Unknown Monster'}</h1>
            <div class="monster-type">
              ${monster.size || ''} ${monster.type || ''}, ${monster.alignment || 'unaligned'}
            </div>
          </div>
          
          <div class="property-line">
            <span class="property-name">Armor Class:</span> ${monster.ac || 10}
            ${monster.acType ? ` (${monster.acType})` : ''}
          </div>
          <div class="property-line">
            <span class="property-name">Hit Points:</span> ${monster.hp || 0}
            ${monster.hpDice ? ` (${monster.hpDice})` : ''}
          </div>
          <div class="property-line">
            <span class="property-name">Speed:</span> ${formatSpeed(monster.speed)}
          </div>
          
          <div class="ability-scores">
    `;
    
    // Add ability scores
    const abilities = monster.abilities || {};
    const abilityNames = {
      str: 'STR',
      dex: 'DEX',
      con: 'CON',
      int: 'INT',
      wis: 'WIS',
      cha: 'CHA'
    };
    
    Object.entries(abilityNames).forEach(([key, name]) => {
      const score = abilities[key] || 10;
      const modifier = Math.floor((score - 10) / 2);
      const modifierText = modifier >= 0 ? `+${modifier}` : modifier;
      
      html += `
        <div class="ability-score">
          <div class="ability-name">${name}</div>
          <div class="ability-value">${score}</div>
          <div class="ability-modifier">(${modifierText})</div>
        </div>
      `;
    });
    
    html += `
          </div>
          
          <div class="property-line">
            <span class="property-name">Challenge Rating:</span> ${monster.cr || '0'}
          </div>
    `;
    
    // Add traits if available
    if (monster.traits && monster.traits.length > 0) {
      html += `
        <div class="traits">
          <h3>Traits</h3>
      `;
      
      monster.traits.forEach(trait => {
        html += `
          <div class="trait">
            <span class="trait-name">${trait.name}.</span>
            ${trait.description || ''}
          </div>
        `;
      });
      
      html += `</div>`;
    }
    
    // Add actions if available
    if (monster.actions && monster.actions.length > 0) {
      html += `
        <div class="actions">
          <h3>Actions</h3>
      `;
      
      monster.actions.forEach(action => {
        html += `
          <div class="action">
            <span class="action-name">${action.name}.</span>
            ${action.description || ''}
          </div>
        `;
      });
      
      html += `</div>`;
    }
    
    // Add legendary actions if available
    if (monster.legendaryActions && monster.legendaryActions.length > 0) {
      html += `
        <div class="legendary-actions">
          <h3>Legendary Actions</h3>
          <p>The ${monster.name} can take 3 legendary actions, choosing from the options below. Only one legendary action can be used at a time and only at the end of another creature's turn. The ${monster.name} regains spent legendary actions at the start of its turn.</p>
      `;
      
      monster.legendaryActions.forEach(action => {
        html += `
          <div class="action">
            <span class="action-name">${action.name}.</span>
            ${action.description || ''}
          </div>
        `;
      });
      
      html += `</div>`;
    }
    
    html += `
        </div>
        
        <div style="font-size: 12px; color: #666; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px;">
          Exported from Jesster's Combat Tracker on ${new Date().toLocaleString()}
        </div>
      </body>
      </html>
    `;
    
    // Create a download link
    const dataStr = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', `${monster.name || 'monster'}.html`);
    
    // Trigger the download
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    return true;
  } catch (error) {
    console.error('Error exporting monster to HTML:', error);
    return false;
  }
}

/**
 * Export a monster to PDF format
 * @param {Object} monster - The monster to export
 * @param {Object} options - Additional export options
 * @returns {Promise<boolean>} A promise that resolves to true if export was successful
 */
async function exportMonsterToPDF(monster, options = {}) {
  try {
    // Check if jsPDF is available
    if (typeof window.jsPDF === 'undefined') {
      // Load jsPDF dynamically if not available
      await loadJsPDF();
    }
    
    // Create a new PDF document
    const doc = new window.jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Add title
    doc.setFontSize(24);
    doc.setTextColor(123, 0, 0); // Dark red for monster name
    doc.text(monster.name || 'Monster', 20, 20);
    doc.setTextColor(0, 0, 0); // Reset text color
    
    // Add monster type
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100); // Gray for type
    const typeText = `${monster.size || ''} ${monster.type || ''}, ${monster.alignment || 'unaligned'}`;
    doc.text(typeText, 20, 30);
    doc.setTextColor(0, 0, 0); // Reset text color
    
    // Add basic stats
    doc.setFontSize(12);
    doc.text(`Armor Class: ${monster.ac || 10}${monster.acType ? ` (${monster.acType})` : ''}`, 20, 40);
    doc.text(`Hit Points: ${monster.hp || 0}${monster.hpDice ? ` (${monster.hpDice})` : ''}`, 20, 47);
    doc.text(`Speed: ${formatSpeed(monster.speed)}`, 20, 54);
    
    // Add ability scores
    doc.setFontSize(14);
    doc.text('Ability Scores', 20, 65);
    
    const abilities = monster.abilities || {};
    const abilityNames = {
      str: 'STR',
      dex: 'DEX',
      con: 'CON',
      int: 'INT',
      wis: 'WIS',
      cha: 'CHA'
    };
    
    let abilityText = '';
    Object.entries(abilityNames).forEach(([key, name]) => {
      const score = abilities[key] || 10;
      const modifier = Math.floor((score - 10) / 2);
      const modifierText = modifier >= 0 ? `+${modifier}` : modifier;
      
      abilityText += `${name}: ${score} (${modifierText})   `;
    });
    
    doc.setFontSize(12);
    doc.text(abilityText, 20, 72);
    
    // Add challenge rating
    doc.text(`Challenge Rating: ${monster.cr || '0'}`, 20, 82);
    
    let yPos = 92;
    
    // Add traits if available
    if (monster.traits && monster.traits.length > 0) {
      doc.setFontSize(14);
      doc.text('Traits', 20, yPos);
      yPos += 7;
      
      doc.setFontSize(10);
      monster.traits.forEach(trait => {
        // Handle text wrapping
        const traitText = `${trait.name}. ${trait.description || ''}`;
        const textLines = doc.splitTextToSize(traitText, 170);
        doc.text(textLines, 20, yPos);
        yPos += 5 * textLines.length;
      });
      
      yPos += 5;
    }
    
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    // Add actions if available
    if (monster.actions && monster.actions.length > 0) {
      doc.setFontSize(14);
      doc.text('Actions', 20, yPos);
      yPos += 7;
      
      doc.setFontSize(10);
      monster.actions.forEach(action => {
        // Handle text wrapping
        const actionText = `${action.name}. ${action.description || ''}`;
        const textLines = doc.splitTextToSize(actionText, 170);
        doc.text(textLines, 20, yPos);
        yPos += 5 * textLines.length;
        
        // Check if we need a new page
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
      });
      
      yPos += 5;
    }
    
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    // Add legendary actions if available
    if (monster.legendaryActions && monster.legendaryActions.length > 0) {
      doc.setFontSize(14);
      doc.text('Legendary Actions', 20, yPos);
      yPos += 7;
      
      doc.setFontSize(10);
      const legendaryIntro = `The ${monster.name} can take 3 legendary actions, choosing from the options below. Only one legendary action can be used at a time and only at the end of another creature's turn. The ${monster.name} regains spent legendary actions at the start of its turn.`;
      const introLines = doc.splitTextToSize(legendaryIntro, 170);
      doc.text(introLines, 20, yPos);
      yPos += 5 * introLines.length + 2;
      
      monster.legendaryActions.forEach(action => {
        // Handle text wrapping
        const actionText = `${action.name}. ${action.description || ''}`;
        const textLines = doc.splitTextToSize(actionText, 170);
        doc.text(textLines, 20, yPos);
        yPos += 5 * textLines.length;
        
        // Check if we need a new page
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
      });
    }
    
    // Add export metadata
    doc.setFontSize(8);
    doc.text(`Exported from Jesster's Combat Tracker on ${new Date().toLocaleString()}`, 20, 285);
    
        // Add export metadata
    doc.setFontSize(8);
    doc.text(`Exported from Jesster's Combat Tracker on ${new Date().toLocaleString()}`, 20, 285);
    
    // Save the PDF
    doc.save(`${monster.name || 'monster'}.pdf`);
    
    return true;
  } catch (error) {
    console.error('Error exporting monster to PDF:', error);
    return false;
  }
}

/**
 * Export a monster to Markdown format
 * @param {Object} monster - The monster to export
 * @param {Object} options - Additional export options
 * @returns {boolean} True if export was successful
 */
function exportMonsterToMarkdown(monster, options = {}) {
  try {
    // Create Markdown content
    let markdown = `# ${monster.name || 'Monster'}\n\n`;
    markdown += `*${monster.size || ''} ${monster.type || ''}, ${monster.alignment || 'unaligned'}*\n\n`;
    
    markdown += `**Armor Class:** ${monster.ac || 10}${monster.acType ? ` (${monster.acType})` : ''}\n`;
    markdown += `**Hit Points:** ${monster.hp || 0}${monster.hpDice ? ` (${monster.hpDice})` : ''}\n`;
    markdown += `**Speed:** ${formatSpeed(monster.speed)}\n\n`;
    
    // Add ability scores
    markdown += `| STR | DEX | CON | INT | WIS | CHA |\n`;
    markdown += `|-----|-----|-----|-----|-----|-----|\n`;
    
    const abilities = monster.abilities || {};
    let abilityRow = '|';
    let modifierRow = '|';
    
    ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach(key => {
      const score = abilities[key] || 10;
      const modifier = Math.floor((score - 10) / 2);
      const modifierText = modifier >= 0 ? `+${modifier}` : modifier;
      
      abilityRow += ` ${score} |`;
      modifierRow += ` (${modifierText}) |`;
    });
    
    markdown += `${abilityRow}\n`;
    markdown += `${modifierRow}\n\n`;
    
    markdown += `**Challenge Rating:** ${monster.cr || '0'}\n\n`;
    
    // Add traits if available
    if (monster.traits && monster.traits.length > 0) {
      markdown += `## Traits\n\n`;
      
      monster.traits.forEach(trait => {
        markdown += `***${trait.name}.*** ${trait.description || ''}\n\n`;
      });
    }
    
    // Add actions if available
    if (monster.actions && monster.actions.length > 0) {
      markdown += `## Actions\n\n`;
      
      monster.actions.forEach(action => {
        markdown += `***${action.name}.*** ${action.description || ''}\n\n`;
      });
    }
    
    // Add legendary actions if available
    if (monster.legendaryActions && monster.legendaryActions.length > 0) {
      markdown += `## Legendary Actions\n\n`;
      markdown += `The ${monster.name} can take 3 legendary actions, choosing from the options below. Only one legendary action can be used at a time and only at the end of another creature's turn. The ${monster.name} regains spent legendary actions at the start of its turn.\n\n`;
      
      monster.legendaryActions.forEach(action => {
        markdown += `***${action.name}.*** ${action.description || ''}\n\n`;
      });
    }
    
    // Add export metadata
    markdown += `---\n`;
    markdown += `*Exported from Jesster's Combat Tracker on ${new Date().toLocaleString()}*\n`;
    
    // Create a download link
    const dataStr = `data:text/markdown;charset=utf-8,${encodeURIComponent(markdown)}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', `${monster.name || 'monster'}.md`);
    
    // Trigger the download
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    return true;
  } catch (error) {
    console.error('Error exporting monster to Markdown:', error);
    return false;
  }
}

/**
 * Export a monster to Foundry VTT format
 * @param {Object} monster - The monster to export
 * @param {Object} options - Additional export options
 * @returns {boolean} True if export was successful
 */
function exportMonsterToFoundryVTT(monster, options = {}) {
  try {
    // Create Foundry VTT compatible JSON structure
    const foundryData = {
      name: monster.name || 'Imported Monster',
      type: 'npc',
      img: monster.portrait || 'icons/svg/mystery-man.svg',
      data: {
        abilities: {},
        attributes: {
          hp: {
            value: monster.hp || 0,
            max: monster.hp || 0,
            formula: monster.hpDice || ''
          },
          ac: {
            value: monster.ac || 10
          }
        },
        details: {
          type: {
            value: monster.type || 'unknown'
          },
          cr: monster.cr || 0,
          alignment: monster.alignment || 'unaligned',
          source: 'JCT'
        },
        traits: {
          size: getSizeValue(monster.size)
        }
      },
      token: {
        name: monster.name || 'Imported Monster',
        displayName: 50, // HOVER
        actorLink: false,
        disposition: -1 // HOSTILE
      },
      items: []
    };
    
    // Add ability scores
    const abilities = monster.abilities || {};
    const abilityNames = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
    
    abilityNames.forEach(ability => {
      foundryData.data.abilities[ability] = {
        value: abilities[ability] || 10
      };
    });
    
    // Add speed
    if (monster.speed) {
      foundryData.data.attributes.speed = {
        value: monster.speed.walk || 30
      };
      
      if (monster.speed.fly) {
        foundryData.data.attributes.speed.fly = monster.speed.fly;
      }
      
      if (monster.speed.swim) {
        foundryData.data.attributes.speed.swim = monster.speed.swim;
      }
      
      if (monster.speed.climb) {
        foundryData.data.attributes.speed.climb = monster.speed.climb;
      }
      
      if (monster.speed.burrow) {
        foundryData.data.attributes.speed.burrow = monster.speed.burrow;
      }
    }
    
    // Add traits as features
    if (monster.traits && monster.traits.length > 0) {
      monster.traits.forEach(trait => {
        foundryData.items.push({
          name: trait.name,
          type: 'feat',
          data: {
            description: {
              value: trait.description || ''
            },
            activation: {
              type: 'special'
            }
          }
        });
      });
    }
    
    // Add actions
    if (monster.actions && monster.actions.length > 0) {
      monster.actions.forEach(action => {
        foundryData.items.push({
          name: action.name,
          type: 'weapon',
          data: {
            description: {
              value: action.description || ''
            },
            activation: {
              type: 'action',
              cost: 1
            }
          }
        });
      });
    }
    
    // Add legendary actions
    if (monster.legendaryActions && monster.legendaryActions.length > 0) {
      monster.legendaryActions.forEach(action => {
        foundryData.items.push({
          name: action.name,
          type: 'feat',
          data: {
            description: {
              value: action.description || ''
            },
            activation: {
              type: 'legendary'
            }
          }
        });
      });
    }
    
    // Convert to JSON string with pretty formatting
    const jsonString = JSON.stringify(foundryData, null, 2);
    
    // Create a download link
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(jsonString)}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', `${monster.name || 'monster'}-foundry.json`);
    
    // Trigger the download
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    return true;
  } catch (error) {
    console.error('Error exporting monster to Foundry VTT:', error);
    return false;
  }
}

/**
 * Export a monster to Roll20 format
 * @param {Object} monster - The monster to export
 * @param {Object} options - Additional export options
 * @returns {boolean} True if export was successful
 */
function exportMonsterToRoll20(monster, options = {}) {
  try {
    // Create Roll20 compatible JSON structure
    const roll20Data = {
      schema_version: 2,
      type: 'character',
      character: {
        name: monster.name || 'Imported Monster',
        avatar: monster.portrait || '',
        bio: '',
        gmnotes: '',
        defaulttoken: '',
        tags: 'monster,jct-import',
        controlledby: '',
        inplayerjournals: '',
        attribs: []
      }
    };
    
    // Add attributes
    function addAttribute(name, current, max = '') {
      roll20Data.character.attribs.push({
        name,
        current: String(current),
        max: String(max),
        id: `attr_${Date.now()}_${Math.floor(Math.random() * 1000)}`
      });
    }
    
    // Add basic attributes
    addAttribute('hp', monster.hp || 0, monster.hp || 0);
    addAttribute('ac', monster.ac || 10);
    addAttribute('npc', 1);
    addAttribute('npc_type', `${monster.size || ''} ${monster.type || ''}, ${monster.alignment || 'unaligned'}`);
    addAttribute('npc_challenge', monster.cr || '0');
    
    // Add ability scores
    const abilities = monster.abilities || {};
    const abilityNames = {
      str: 'strength',
      dex: 'dexterity',
      con: 'constitution',
      int: 'intelligence',
      wis: 'wisdom',
      cha: 'charisma'
    };
    
    Object.entries(abilityNames).forEach(([key, name]) => {
      const score = abilities[key] || 10;
      const modifier = Math.floor((score - 10) / 2);
      
      addAttribute(name, score);
      addAttribute(`${name}_mod`, modifier);
    });
    
    // Add speed
    if (monster.speed) {
      let speedText = `${monster.speed.walk || 30} ft.`;
      
      if (monster.speed.fly) {
        speedText += `, fly ${monster.speed.fly} ft.`;
      }
      
      if (monster.speed.swim) {
        speedText += `, swim ${monster.speed.swim} ft.`;
      }
      
      if (monster.speed.climb) {
        speedText += `, climb ${monster.speed.climb} ft.`;
      }
      
      if (monster.speed.burrow) {
        speedText += `, burrow ${monster.speed.burrow} ft.`;
      }
      
      addAttribute('npc_speed', speedText);
    }
    
    // Add traits, actions, and legendary actions to bio
    let bio = '';
    
    if (monster.traits && monster.traits.length > 0) {
      bio += '<h3>Traits</h3>\n';
      
      monster.traits.forEach(trait => {
        bio += `<p><strong><em>${trait.name}.</em></strong> ${trait.description || ''}</p>\n`;
      });
    }
    
    if (monster.actions && monster.actions.length > 0) {
      bio += '<h3>Actions</h3>\n';
      
      monster.actions.forEach(action => {
        bio += `<p><strong><em>${action.name}.</em></strong> ${action.description || ''}</p>\n`;
      });
    }
    
    if (monster.legendaryActions && monster.legendaryActions.length > 0) {
      bio += '<h3>Legendary Actions</h3>\n';
      bio += `<p>The ${monster.name} can take 3 legendary actions, choosing from the options below. Only one legendary action can be used at a time and only at the end of another creature's turn. The ${monster.name} regains spent legendary actions at the start of its turn.</p>\n`;
      
      monster.legendaryActions.forEach(action => {
        bio += `<p><strong><em>${action.name}.</em></strong> ${action.description || ''}</p>\n`;
      });
    }
    
    roll20Data.character.bio = bio;
    
    // Convert to JSON string with pretty formatting
    const jsonString = JSON.stringify(roll20Data, null, 2);
    
    // Create a download link
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(jsonString)}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', `${monster.name || 'monster'}-roll20.json`);
    
    // Trigger the download
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    return true;
  } catch (error) {
    console.error('Error exporting monster to Roll20:', error);
    return false;
  }
}

/**
 * Export a monster to Fantasy Grounds format
 * @param {Object} monster - The monster to export
 * @param {Object} options - Additional export options
 * @returns {boolean} True if export was successful
 */
function exportMonsterToFantasyGrounds(monster, options = {}) {
  try {
    // Create Fantasy Grounds compatible XML structure
    let xml = '<?xml version="1.0" encoding="iso-8859-1"?>\n';
    xml += '<root version="3.3" release="8|CoreRPG:3">\n';
    xml += '  <npc>\n';
    xml += `    <name type="string">${escapeXml(monster.name || 'Imported Monster')}</name>\n`;
    xml += `    <size type="string">${escapeXml(monster.size || 'Medium')}</size>\n`;
    xml += `    <type type="string">${escapeXml(monster.type || 'unknown')}</type>\n`;
    xml += `    <alignment type="string">${escapeXml(monster.alignment || 'unaligned')}</alignment>\n`;
    
    // Add basic stats
    xml += `    <ac type="number">${monster.ac || 10}</ac>\n`;
    xml += `    <hp type="number">${monster.hp || 0}</hp>\n`;
    
    if (monster.hpDice) {
      xml += `    <hd type="string">${escapeXml(monster.hpDice)}</hd>\n`;
    }
    
    // Add speed
    if (monster.speed) {
      xml += '    <speed>\n';
      xml += `      <walk type="number">${monster.speed.walk || 30}</walk>\n`;
      
      if (monster.speed.fly) {
        xml += `      <fly type="number">${monster.speed.fly}</fly>\n`;
      }
      
      if (monster.speed.swim) {
        xml += `      <swim type="number">${monster.speed.swim}</swim>\n`;
      }
      
      if (monster.speed.climb) {
        xml += `      <climb type="number">${monster.speed.climb}</climb>\n`;
      }
      
      if (monster.speed.burrow) {
        xml += `      <burrow type="number">${monster.speed.burrow}</burrow>\n`;
      }
      
      xml += '    </speed>\n';
    }
    
    // Add ability scores
    xml += '    <abilities>\n';
    const abilities = monster.abilities || {};
    const abilityNames = {
      str: 'strength',
      dex: 'dexterity',
      con: 'constitution',
      int: 'intelligence',
      wis: 'wisdom',
      cha: 'charisma'
    };
    
    Object.entries(abilityNames).forEach(([key, name]) => {
      const score = abilities[key] || 10;
      xml += `      <${name} type="number">${score}</${name}>\n`;
    });
    xml += '    </abilities>\n';
    
    // Add challenge rating
    xml += `    <cr type="string">${monster.cr || '0'}</cr>\n`;
    
    // Add traits
    if (monster.traits && monster.traits.length > 0) {
      xml += '    <traits>\n';
      monster.traits.forEach((trait, index) => {
        xml += `      <trait${index + 1}>\n`;
        xml += `        <name type="string">${escapeXml(trait.name)}</name>\n`;
        xml += `        <description type="formattedtext">${escapeXml(trait.description || '')}</description>\n`;
        xml += `      </trait${index + 1}>\n`;
      });
      xml += '    </traits>\n';
    }
    
    // Add actions
    if (monster.actions && monster.actions.length > 0) {
      xml += '    <actions>\n';
      monster.actions.forEach((action, index) => {
        xml += `      <action${index + 1}>\n`;
        xml += `        <name type="string">${escapeXml(action.name)}</name>\n`;
        xml += `        <description type="formattedtext">${escapeXml(action.description || '')}</description>\n`;
        xml += `      </action${index + 1}>\n`;
      });
      xml += '    </actions>\n';
    }
    
    // Add legendary actions
    if (monster.legendaryActions && monster.legendaryActions.length > 0) {
      xml += '    <legendaryactions>\n';
      monster.legendaryActions.forEach((action, index) => {
        xml += `      <legendaryaction${index + 1}>\n`;
        xml += `        <name type="string">${escapeXml(action.name)}</name>\n`;
        xml += `        <description type="formattedtext">${escapeXml(action.description || '')}</description>\n`;
        xml += `      </legendaryaction${index + 1}>\n`;
      });
      xml += '    </legendaryactions>\n';
    }
    
    xml += '  </npc>\n';
    xml += '</root>';
    
    // Create a download link
    const dataStr = `data:text/xml;charset=utf-8,${encodeURIComponent(xml)}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', `${monster.name || 'monster'}-fg.xml`);
    
    // Trigger the download
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    return true;
  } catch (error) {
    console.error('Error exporting monster to Fantasy Grounds:', error);
    return false;
  }
}

/**
 * Export combat history to JSON format
 * @param {Array} history - The combat history to export
 * @param {Object} options - Additional export options
 * @returns {boolean} True if export was successful
 */
function exportCombatHistoryToJSON(history, options = {}) {
  try {
    // Create a copy of the history with any necessary transformations
    const historyData = {
      history,
      exportDate: new Date().toISOString(),
      exportVersion: '2.3.1'
    };
    
    // Convert to JSON string with pretty formatting
    const jsonString = JSON.stringify(historyData, null, 2);
    
    // Create a download link
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(jsonString)}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', `combat-history-${formatDate(new Date())}.json`);
    
    // Trigger the download
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    return true;
  } catch (error) {
    console.error('Error exporting combat history to JSON:', error);
    return false;
  }
}

/**
 * Export combat history to HTML format
 * @param {Array} history - The combat history to export
 * @param {Object} options - Additional export options
 * @returns {boolean} True if export was successful
 */
function exportCombatHistoryToHTML(history, options = {}) {
  try {
    // Create HTML content
    let html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Combat History</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1, h2, h3 {
            color: #444;
          }
          .encounter {
            border: 1px solid #ddd;
            padding: 20px;
            margin-bottom: 20px;
            background-color: #f9f9f9;
          }
          .round {
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
          }
          .turn {
            margin-left: 20px;
            margin-bottom: 10px;
          }
          .action {
            margin-left: 40px;
            margin-bottom: 5px;
          }
          .player {
            color: #2c7c2c;
          }
          .monster {
            color: #7c2c2c;
          }
          .damage {
            color: #cc0000;
          }
          .healing {
            color: #00cc00;
          }
          .condition {
            color: #0000cc;
          }
          .timestamp {
            color: #666;
            font-size: 0.8em;
          }
        </style>
      </head>
      <body>
        <h1>Combat History</h1>
    `;
    
    // Group history by encounter
    const encounterGroups = {};
    
    history.forEach(entry => {
      const encounterId = entry.encounterId || 'unknown';
      if (!encounterGroups[encounterId]) {
        encounterGroups[encounterId] = [];
      }
      encounterGroups[encounterId].push(entry);
    });
    
    // Add each encounter
    Object.entries(encounterGroups).forEach(([encounterId, entries]) => {
      // Get encounter info from the first entry
      const firstEntry = entries[0];
      const encounterName = firstEntry.encounterName || 'Unknown Encounter';
      const encounterDate = firstEntry.timestamp ? new Date(firstEntry.timestamp) : new Date();
      
      html += `
        <div class="encounter">
          <h2>${encounterName}</h2>
          <p class="timestamp">Date: ${encounterDate.toLocaleString()}</p>
      `;
      
      // Group by rounds
      const roundGroups = {};
      entries.forEach(entry => {
        const round = entry.round || 0;
        if (!roundGroups[round]) {
          roundGroups[round] = [];
        }
        roundGroups[round].push(entry);
      });
      
      // Add each round
      Object.entries(roundGroups).forEach(([round, roundEntries]) => {
        html += `
          <div class="round">
            <h3>Round ${round}</h3>
        `;
        
        // Group by turns
        const turnGroups = {};
        roundEntries.forEach(entry => {
          const actorId = entry.actorId || 'unknown';
          if (!turnGroups[actorId]) {
            turnGroups[actorId] = [];
          }
          turnGroups[actorId].push(entry);
        });
        
        // Add each turn
        Object.entries(turnGroups).forEach(([actorId, turnEntries]) => {
          // Get actor info from the first entry
          const firstTurnEntry = turnEntries[0];
          const actorName = firstTurnEntry.actorName || 'Unknown';
          const actorType = firstTurnEntry.actorType || 'unknown';
          
          html += `
            <div class="turn">
              <h4 class="${actorType}">${actorName}'s Turn</h4>
          `;
          
          // Add each action
          turnEntries.forEach(entry => {
            let actionClass = '';
            if (entry.type === 'damage') actionClass = 'damage';
            if (entry.type === 'healing') actionClass = 'healing';
            if (entry.type === 'condition') actionClass = 'condition';
            
            html += `
              <div class="action ${actionClass}">
                ${entry.description || 'Unknown action'}
              </div>
            `;
          });
          
          html += `</div>`;
        });
        
        html += `</div>`;
      });
      
      html += `</div>`;
    });
    
    html += `
        <div style="font-size: 12px; color: #666; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px;">
          Exported from Jesster's Combat Tracker on ${new Date().toLocaleString()}
        </div>
      </body>
      </html>
    `;
    
    // Create a download link
    const dataStr = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', `combat-history-${formatDate(new Date())}.html`);
    
    // Trigger the download
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    return true;
  } catch (error) {
    console.error('Error exporting combat history to HTML:', error);
    return false;
  }
}

/**
 * Export combat history to PDF format
 * @param {Array} history - The combat history to export
 * @param {Object} options - Additional export options
 * @returns {Promise<boolean>} A promise that resolves to true if export was successful
 */
async function exportCombatHistoryToPDF(history, options = {}) {
  try {
    // Check if jsPDF is available
    if (typeof window.jsPDF === 'undefined') {
      // Load jsPDF dynamically if not available
      await loadJsPDF();
    }
    
    // Create a new PDF document
    const doc = new window.jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Add title
    doc.setFontSize(24);
    doc.text('Combat History', 20, 20);
    
    // Group history by encounter
    const encounterGroups = {};
    
    history.forEach(entry => {
      const encounterId = entry.encounterId || 'unknown';
      if (!encounterGroups[encounterId]) {
        encounterGroups[encounterId] = [];
      }
      encounterGroups[encounterId].push(entry);
    });
    
    let yPos = 30;
    let pageCount = 1;
    
    // Add each encounter
    Object.entries(encounterGroups).forEach(([encounterId, entries]) => {
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
        pageCount++;
      }
      
      // Get encounter info from the first entry
      const firstEntry = entries[0];
      const encounterName = firstEntry.encounterName || 'Unknown Encounter';
      const encounterDate = firstEntry.timestamp ? new Date(firstEntry.timestamp) : new Date();
      
      doc.setFontSize(18);
      doc.text(encounterName, 20, yPos);
      yPos += 7;
      
      doc.setFontSize(10);
      doc.text(`Date: ${encounterDate.toLocaleString()}`, 20, yPos);
      yPos += 10;
      
      // Group by rounds
      const roundGroups = {};
      entries.forEach(entry => {
        const round = entry.round || 0;
        if (!roundGroups[round]) {
          roundGroups[round] = [];
        }
        roundGroups[round].push(entry);
      });
      
      // Add each round
      Object.entries(roundGroups).forEach(([round, roundEntries]) => {
        // Check if we need a new page
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
          pageCount++;
        }
        
        doc.setFontSize(14);
        doc.text(`Round ${round}`, 20, yPos);
        yPos += 7;
        
        // Group by turns
        const turnGroups = {};
        roundEntries.forEach(entry => {
          const actorId = entry.actorId || 'unknown';
          if (!turnGroups[actorId]) {
            turnGroups[actorId] = [];
          }
          turnGroups[actorId].push(entry);
        });
        
        // Add each turn
        Object.entries(turnGroups).forEach(([actorId, turnEntries]) => {
          // Check if we need a new page
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
            pageCount++;
          }
          
          // Get actor info from the first entry
          const firstTurnEntry = turnEntries[0];
          const actorName = firstTurnEntry.actorName || 'Unknown';
          const actorType = firstTurnEntry.actorType || 'unknown';
          
                    doc.setFontSize(12);
          
          // Set color based on actor type
          if (actorType === 'player') {
            doc.setTextColor(44, 124, 44); // Green for players
          } else if (actorType === 'monster') {
            doc.setTextColor(124, 44, 44); // Red for monsters
          } else {
            doc.setTextColor(0, 0, 0); // Black for others
          }
          
          doc.text(`${actorName}'s Turn`, 25, yPos);
          doc.setTextColor(0, 0, 0); // Reset text color
          yPos += 5;
          
          // Add each action
          turnEntries.forEach(entry => {
            // Check if we need a new page
            if (yPos > 280) {
              doc.addPage();
              yPos = 20;
              pageCount++;
            }
            
            doc.setFontSize(10);
            
            // Set color based on action type
            if (entry.type === 'damage') {
              doc.setTextColor(204, 0, 0); // Red for damage
            } else if (entry.type === 'healing') {
              doc.setTextColor(0, 204, 0); // Green for healing
            } else if (entry.type === 'condition') {
              doc.setTextColor(0, 0, 204); // Blue for conditions
            } else {
              doc.setTextColor(0, 0, 0); // Black for others
            }
            
            // Handle text wrapping
            const actionText = entry.description || 'Unknown action';
            const textLines = doc.splitTextToSize(actionText, 160);
            doc.text(textLines, 30, yPos);
            yPos += 4 * textLines.length;
            
            doc.setTextColor(0, 0, 0); // Reset text color
          });
          
          yPos += 3;
        });
        
        yPos += 5;
      });
      
      yPos += 10;
    });
    
    // Add export metadata
    doc.setFontSize(8);
    doc.text(`Exported from Jesster's Combat Tracker on ${new Date().toLocaleString()}`, 20, 285);
    
    // Save the PDF
    doc.save(`combat-history-${formatDate(new Date())}.pdf`);
    
    return true;
  } catch (error) {
    console.error('Error exporting combat history to PDF:', error);
    return false;
  }
}

/**
 * Export combat history to CSV format
 * @param {Array} history - The combat history to export
 * @param {Object} options - Additional export options
 * @returns {boolean} True if export was successful
 */
function exportCombatHistoryToCSV(history, options = {}) {
  try {
    // Prepare CSV header
    let csv = 'Encounter,Date,Round,Actor,Actor Type,Action Type,Description\n';
    
    // Add each history entry
    history.forEach(entry => {
      const encounterName = entry.encounterName || 'Unknown Encounter';
      const timestamp = entry.timestamp ? new Date(entry.timestamp).toLocaleString() : '';
      const round = entry.round || 0;
      const actorName = entry.actorName || 'Unknown';
      const actorType = entry.actorType || 'unknown';
      const actionType = entry.type || 'unknown';
      const description = entry.description || '';
      
      // Escape fields that might contain commas
      const escapeCsv = (field) => {
        if (field === null || field === undefined) return '';
        const str = String(field);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };
      
      csv += `${escapeCsv(encounterName)},`;
      csv += `${escapeCsv(timestamp)},`;
      csv += `${escapeCsv(round)},`;
      csv += `${escapeCsv(actorName)},`;
      csv += `${escapeCsv(actorType)},`;
      csv += `${escapeCsv(actionType)},`;
      csv += `${escapeCsv(description)}\n`;
    });
    
    // Create a download link
    const dataStr = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', `combat-history-${formatDate(new Date())}.csv`);
    
    // Trigger the download
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    return true;
  } catch (error) {
    console.error('Error exporting combat history to CSV:', error);
    return false;
  }
}

/**
 * Export combat history to Markdown format
 * @param {Array} history - The combat history to export
 * @param {Object} options - Additional export options
 * @returns {boolean} True if export was successful
 */
function exportCombatHistoryToMarkdown(history, options = {}) {
  try {
    // Create Markdown content
    let markdown = `# Combat History\n\n`;
    
    // Group history by encounter
    const encounterGroups = {};
    
    history.forEach(entry => {
      const encounterId = entry.encounterId || 'unknown';
      if (!encounterGroups[encounterId]) {
        encounterGroups[encounterId] = [];
      }
      encounterGroups[encounterId].push(entry);
    });
    
    // Add each encounter
    Object.entries(encounterGroups).forEach(([encounterId, entries]) => {
      // Get encounter info from the first entry
      const firstEntry = entries[0];
      const encounterName = firstEntry.encounterName || 'Unknown Encounter';
      const encounterDate = firstEntry.timestamp ? new Date(firstEntry.timestamp) : new Date();
      
      markdown += `## ${encounterName}\n\n`;
      markdown += `*Date: ${encounterDate.toLocaleString()}*\n\n`;
      
      // Group by rounds
      const roundGroups = {};
      entries.forEach(entry => {
        const round = entry.round || 0;
        if (!roundGroups[round]) {
          roundGroups[round] = [];
        }
        roundGroups[round].push(entry);
      });
      
      // Add each round
      Object.entries(roundGroups).forEach(([round, roundEntries]) => {
        markdown += `### Round ${round}\n\n`;
        
        // Group by turns
        const turnGroups = {};
        roundEntries.forEach(entry => {
          const actorId = entry.actorId || 'unknown';
          if (!turnGroups[actorId]) {
            turnGroups[actorId] = [];
          }
          turnGroups[actorId].push(entry);
        });
        
        // Add each turn
        Object.entries(turnGroups).forEach(([actorId, turnEntries]) => {
          // Get actor info from the first entry
          const firstTurnEntry = turnEntries[0];
          const actorName = firstTurnEntry.actorName || 'Unknown';
          const actorType = firstTurnEntry.actorType || 'unknown';
          
          markdown += `#### ${actorName}'s Turn\n\n`;
          
          // Add each action
          turnEntries.forEach(entry => {
            let actionPrefix = '';
            if (entry.type === 'damage') actionPrefix = '🔴 ';
            if (entry.type === 'healing') actionPrefix = '🟢 ';
            if (entry.type === 'condition') actionPrefix = '🔵 ';
            
            markdown += `- ${actionPrefix}${entry.description || 'Unknown action'}\n`;
          });
          
          markdown += `\n`;
        });
      });
      
      markdown += `\n`;
    });
    
    // Add export metadata
    markdown += `---\n`;
    markdown += `*Exported from Jesster's Combat Tracker on ${new Date().toLocaleString()}*\n`;
    
    // Create a download link
    const dataStr = `data:text/markdown;charset=utf-8,${encodeURIComponent(markdown)}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', `combat-history-${formatDate(new Date())}.md`);
    
    // Trigger the download
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    return true;
  } catch (error) {
    console.error('Error exporting combat history to Markdown:', error);
    return false;
  }
}

/**
 * Load jsPDF library dynamically
 * @returns {Promise<void>} A promise that resolves when the library is loaded
 */
function loadJsPDF() {
  return new Promise((resolve, reject) => {
    if (typeof window.jsPDF !== 'undefined') {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.integrity = 'sha512-qZvrmS2ekKPF2mSznTQsxqPgnpkI4DNTlrdUmTzrDgektczlKNRRhy5X5AAOnx5S09ydFYWWNSfcEqDTTHgtNA==';
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      // Also load the AutoTable plugin for jsPDF
      const autoTableScript = document.createElement('script');
      autoTableScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js';
      autoTableScript.integrity = 'sha512-SgWjoscFBs4+Z8NCDzGGl++YnH/eGpxJgqAY1VDFdR5Jzl+hd+znEQQk44rYHxOPPiOKmZS0mAtM1KJrC2AYLA==';
      autoTableScript.crossOrigin = 'anonymous';
      autoTableScript.onload = resolve;
      autoTableScript.onerror = reject;
      document.head.appendChild(autoTableScript);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * Load html2canvas library dynamically
 * @returns {Promise<void>} A promise that resolves when the library is loaded
 */
function loadHtml2Canvas() {
  return new Promise((resolve, reject) => {
    if (typeof window.html2canvas !== 'undefined') {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    script.integrity = 'sha512-BNaRQnYJYiPSqHHDb58B0yaPfCu+Wgds8Gp/gU33kqBtgNS4tSPHuGibyoeqMV/TJlSKda6FXzoEyYGjTe+vXA==';
    script.crossOrigin = 'anonymous';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * Format a date as YYYY-MM-DD
 * @param {Date} date - The date to format
 * @returns {string} The formatted date
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format speed object as a string
 * @param {Object} speed - The speed object
 * @returns {string} The formatted speed string
 */
function formatSpeed(speed) {
  if (!speed) return '30 ft.';
  
  let speedText = `${speed.walk || 30} ft.`;
  
  if (speed.fly) {
    speedText += `, fly ${speed.fly} ft.`;
  }
  
  if (speed.swim) {
    speedText += `, swim ${speed.swim} ft.`;
  }
  
  if (speed.climb) {
    speedText += `, climb ${speed.climb} ft.`;
  }
  
  if (speed.burrow) {
    speedText += `, burrow ${speed.burrow} ft.`;
  }
  
  return speedText;
}

/**
 * Escape special characters for XML
 * @param {string} str - The string to escape
 * @returns {string} The escaped string
 */
function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, ''');
}

/**
 * Get the default portrait for a combatant type
 * @param {string} type - The combatant type
 * @returns {string} The portrait URL
 */
function getDefaultPortrait(type) {
  switch (type) {
    case 'player':
      return 'icons/svg/mystery-man.svg';
    case 'monster':
      return 'icons/svg/skull.svg';
    case 'npc':
      return 'icons/svg/cowled.svg';
    default:
      return 'icons/svg/mystery-man.svg';
  }
}

/**
 * Get Foundry VTT disposition value for a combatant type
 * @param {string} type - The combatant type
 * @returns {number} The disposition value
 */
function getFoundryDisposition(type) {
  switch (type) {
    case 'player':
      return 1; // FRIENDLY
    case 'monster':
      return -1; // HOSTILE
    case 'npc':
      return 0; // NEUTRAL
    default:
      return -1; // HOSTILE
  }
}

/**
 * Get size value for Foundry VTT
 * @param {string} size - The size string
 * @returns {string} The size value
 */
function getSizeValue(size) {
  switch (size && size.toLowerCase()) {
    case 'tiny':
      return 'tiny';
    case 'small':
      return 'sm';
    case 'medium':
      return 'med';
    case 'large':
      return 'lg';
    case 'huge':
      return 'huge';
    case 'gargantuan':
      return 'grg';
    default:
      return 'med';
  }
}

/**
 * Calculate initiative bonus from a combatant
 * @param {Object} combatant - The combatant
 * @returns {number} The initiative bonus
 */
function calculateInitiativeBonus(combatant) {
  if (combatant.initiativeModifier !== undefined) {
    return combatant.initiativeModifier;
  }
  
  if (combatant.abilities && combatant.abilities.dex) {
    return Math.floor((combatant.abilities.dex - 10) / 2);
  }
  
  return 0;
}

/**
 * Get the ability associated with a skill
 * @param {string} skill - The skill name
 * @returns {string} The ability key
 */
function getAbilityForSkill(skill) {
  const skillMap = {
    'acrobatics': 'dex',
    'animal handling': 'wis',
    'arcana': 'int',
    'athletics': 'str',
    'deception': 'cha',
    'history': 'int',
    'insight': 'wis',
    'intimidation': 'cha',
    'investigation': 'int',
    'medicine': 'wis',
    'nature': 'int',
    'perception': 'wis',
    'performance': 'cha',
    'persuasion': 'cha',
    'religion': 'int',
    'sleight of hand': 'dex',
    'stealth': 'dex',
    'survival': 'wis'
  };
  
  return skillMap[skill.toLowerCase()] || 'dex';
}

// Export the main functions
export default {
  exportEncounter,
  exportCharacter,
  exportMonster,
  exportCombatHistory,
  ExportFormat
};
