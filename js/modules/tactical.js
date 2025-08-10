/**
 * Jesster's Combat Tracker
 * Tactical Combat Module
 * Version 2.3.1
 * 
 * This module provides tactical map functionality for visualizing combat.
 */

/**
 * Grid types
 */
const GridType = {
  SQUARE: 'square',
  HEX: 'hex',
  NONE: 'none'
};

/**
 * Tactical combat manager class
 */
class TacticalCombatManager {
  /**
   * Create a tactical combat manager
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      gridType: GridType.SQUARE,
      gridSize: 50,
      gridColor: 'rgba(0, 0, 0, 0.2)',
      showGrid: true,
      snapToGrid: true,
      ...options
    };
    
    this.canvas = null;
    this.ctx = null;
    this.battlefield = {
      width: 1000,
      height: 1000,
      background: null,
      tokens: [],
      walls: [],
      doors: [],
      objects: []
    };
    
    this.view = {
      x: 0,
      y: 0,
      zoom: 1,
      isDragging: false,
      dragStart: { x: 0, y: 0 },
      dragOffset: { x: 0, y: 0 }
    };
    
    this.listeners = [];
    this.selectedToken = null;
  }

  /**
   * Initialize the tactical manager with a canvas
   * @param {HTMLCanvasElement} canvas - The canvas element
   */
  initialize(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Set up event listeners
    this._setupEventListeners();
    
    // Center the view
    this._centerView();
  }

  /**
   * Set up canvas event listeners
   * @private
   */
  _setupEventListeners() {
    if (!this.canvas) return;
    
    // Mouse down - start dragging
    this.canvas.addEventListener('mousedown', (e) => {
      const pos = this._getMousePosition(e);
      
      // Check if clicking on a token
      const token = this._getTokenAtPosition(pos.x, pos.y);
      
      if (token) {
        // Select token
        this.selectedToken = token;
        this._notifyListeners('tokenSelected', { token });
        
        // Start dragging token
        token.isDragging = true;
        token.dragOffset = {
          x: pos.x - token.x,
          y: pos.y - token.y
        };
      } else {
        // Start dragging view
        this.view.isDragging = true;
        this.view.dragStart = pos;
        this.view.dragOffset = { x: this.view.x, y: this.view.y };
      }
      
      this.drawMap();
    });
    
    // Mouse move - update dragging
    this.canvas.addEventListener('mousemove', (e) => {
      const pos = this._getMousePosition(e);
      
      // Check if dragging a token
      if (this.selectedToken && this.selectedToken.isDragging) {
        const oldPos = {
          x: this.selectedToken.x,
          y: this.selectedToken.y
        };
        
        // Update token position
        this.selectedToken.x = pos.x - this.selectedToken.dragOffset.x;
        this.selectedToken.y = pos.y - this.selectedToken.dragOffset.y;
        
        // Snap to grid if enabled
        if (this.options.snapToGrid) {
          this._snapTokenToGrid(this.selectedToken);
        }
        
        // Notify listeners of token movement
        this._notifyListeners('tokenMoved', {
          token: this.selectedToken,
          from: oldPos,
          to: { x: this.selectedToken.x, y: this.selectedToken.y }
        });
        
        this.drawMap();
      } 
      // Check if dragging the view
      else if (this.view.isDragging) {
        this.view.x = this.view.dragOffset.x + (this.view.dragStart.x - pos.x) / this.view.zoom;
        this.view.y = this.view.dragOffset.y + (this.view.dragStart.y - pos.y) / this.view.zoom;
        
        this.drawMap();
      }
    });
    
    // Mouse up - stop dragging
    this.canvas.addEventListener('mouseup', () => {
      // Stop dragging token
      if (this.selectedToken && this.selectedToken.isDragging) {
        this.selectedToken.isDragging = false;
        
        // Notify listeners of token movement end
        this._notifyListeners('tokenMoveEnd', {
          token: this.selectedToken,
          position: { x: this.selectedToken.x, y: this.selectedToken.y }
        });
      }
      
      // Stop dragging view
      this.view.isDragging = false;
    });
    
    // Mouse leave - stop dragging
    this.canvas.addEventListener('mouseleave', () => {
      // Stop dragging token
      if (this.selectedToken && this.selectedToken.isDragging) {
        this.selectedToken.isDragging = false;
      }
      
      // Stop dragging view
      this.view.isDragging = false;
    });
    
    // Mouse wheel - zoom
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      
      const pos = this._getMousePosition(e);
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      
      this._zoomAtPoint(pos.x, pos.y, delta);
      this.drawMap();
    });
    
    // Double click - add token or select object
    this.canvas.addEventListener('dblclick', (e) => {
      const pos = this._getMousePosition(e);
      const worldPos = this._screenToWorld(pos.x, pos.y);
      
      // Notify listeners of double click
      this._notifyListeners('mapDoubleClick', {
        position: worldPos,
        screenPosition: pos
      });
    });
    
    // Right click - context menu
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      
      const pos = this._getMousePosition(e);
      const token = this._getTokenAtPosition(pos.x, pos.y);
      
      if (token) {
        // Notify listeners of token right click
        this._notifyListeners('tokenRightClick', {
          token,
          position: pos
        });
      } else {
        // Notify listeners of map right click
        this._notifyListeners('mapRightClick', {
          position: this._screenToWorld(pos.x, pos.y),
          screenPosition: pos
        });
      }
    });
  }

  /**
   * Get mouse position relative to canvas
   * @param {MouseEvent} e - Mouse event
   * @returns {Object} Mouse position
   * @private
   */
  _getMousePosition(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  /**
   * Convert screen coordinates to world coordinates
   * @param {number} x - Screen X coordinate
   * @param {number} y - Screen Y coordinate
   * @returns {Object} World coordinates
   * @private
   */
  _screenToWorld(x, y) {
    return {
      x: (x / this.view.zoom) + this.view.x,
      y: (y / this.view.zoom) + this.view.y
    };
  }

  /**
   * Convert world coordinates to screen coordinates
   * @param {number} x - World X coordinate
   * @param {number} y - World Y coordinate
   * @returns {Object} Screen coordinates
   * @private
   */
  _worldToScreen(x, y) {
    return {
      x: (x - this.view.x) * this.view.zoom,
      y: (y - this.view.y) * this.view.zoom
    };
  }

  /**
   * Get token at position
   * @param {number} x - Screen X coordinate
   * @param {number} y - Screen Y coordinate
   * @returns {Object|null} Token at position or null
   * @private
   */
  _getTokenAtPosition(x, y) {
    const worldPos = this._screenToWorld(x, y);
    
    // Check tokens in reverse order (top to bottom)
    for (let i = this.battlefield.tokens.length - 1; i >= 0; i--) {
      const token = this.battlefield.tokens[i];
      const distance = Math.sqrt(
        Math.pow(worldPos.x - token.x, 2) + 
        Math.pow(worldPos.y - token.y, 2)
      );
      
      if (distance <= token.size / 2) {
        return token;
      }
    }
    
    return null;
  }

  /**
   * Snap token to grid
   * @param {Object} token - Token to snap
   * @private
   */
  _snapTokenToGrid(token) {
    const gridSize = this.options.gridSize;
    
    if (this.options.gridType === GridType.SQUARE) {
      token.x = Math.round(token.x / gridSize) * gridSize;
      token.y = Math.round(token.y / gridSize) * gridSize;
    } else if (this.options.gridType === GridType.HEX) {
      // Hex grid snapping is more complex
      // This is a simplified version for regular hexagons
      const hexHeight = gridSize;
      const hexWidth = gridSize * Math.sqrt(3) / 2;
      
      // Convert to hex grid coordinates
      const row = Math.round(token.y / (hexHeight * 0.75));
      const col = Math.round(token.x / hexWidth);
      
      // Convert back to pixel coordinates
      token.x = col * hexWidth;
      token.y = row * (hexHeight * 0.75);
      
      // Offset every other row
      if (row % 2 !== 0) {
        token.x += hexWidth / 2;
      }
    }
  }

  /**
   * Zoom at point
   * @param {number} x - Screen X coordinate
   * @param {number} y - Screen Y coordinate
   * @param {number} factor - Zoom factor
   * @private
   */
  _zoomAtPoint(x, y, factor) {
    // Convert screen point to world coordinates before zoom
    const worldX = (x / this.view.zoom) + this.view.x;
    const worldY = (y / this.view.zoom) + this.view.y;
    
    // Apply zoom factor
    this.view.zoom *= factor;
    
    // Limit zoom level
    this.view.zoom = Math.max(0.1, Math.min(5, this.view.zoom));
    
    // Adjust view position to keep the point under the cursor
    this.view.x = worldX - (x / this.view.zoom);
    this.view.y = worldY - (y / this.view.zoom);
  }

  /**
   * Center the view
   * @private
   */
  _centerView() {
    if (!this.canvas) return;
    
    this.view.x = (this.battlefield.width - this.canvas.width / this.view.zoom) / 2;
    this.view.y = (this.battlefield.height - this.canvas.height / this.view.zoom) / 2;
  }

  /**
   * Draw the map
   */
  drawMap() {
    if (!this.canvas || !this.ctx) return;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw background
    this._drawBackground();
    
    // Draw grid
    if (this.options.showGrid) {
      this._drawGrid();
    }
    
    // Draw walls
    this._drawWalls();
    
    // Draw doors
    this._drawDoors();
    
    // Draw objects
    this._drawObjects();
    
    // Draw tokens
    this._drawTokens();
    
    // Draw selection indicator
    if (this.selectedToken) {
      this._drawSelectionIndicator();
    }
  }

  /**
   * Draw background
   * @private
   */
  _drawBackground() {
    if (this.battlefield.background) {
      // Draw image background
      const bg = this.battlefield.background;
      const screenPos = this._worldToScreen(0, 0);
      
      this.ctx.drawImage(
        bg.image,
        screenPos.x,
        screenPos.y,
        bg.width * this.view.zoom,
        bg.height * this.view.zoom
      );
    } else {
      // Draw solid color background
      const screenPos = this._worldToScreen(0, 0);
      
      this.ctx.fillStyle = '#f5f5f5';
      this.ctx.fillRect(
        screenPos.x,
        screenPos.y,
        this.battlefield.width * this.view.zoom,
        this.battlefield.height * this.view.zoom
      );
    }
  }

  /**
   * Draw grid
   * @private
   */
  _drawGrid() {
    const gridSize = this.options.gridSize;
    const startX = Math.floor(this.view.x / gridSize) * gridSize;
    const startY = Math.floor(this.view.y / gridSize) * gridSize;
    const endX = startX + this.canvas.width / this.view.zoom + gridSize;
    const endY = startY + this.canvas.height / this.view.zoom + gridSize;
    
    this.ctx.strokeStyle = this.options.gridColor;
    this.ctx.lineWidth = 1 / this.view.zoom;
    
    if (this.options.gridType === GridType.SQUARE) {
      // Draw vertical lines
      for (let x = startX; x <= endX; x += gridSize) {
        const screenX = (x - this.view.x) * this.view.zoom;
        
        this.ctx.beginPath();
        this.ctx.moveTo(screenX, 0);
        this.ctx.lineTo(screenX, this.canvas.height);
        this.ctx.stroke();
      }
      
      // Draw horizontal lines
      for (let y = startY; y <= endY; y += gridSize) {
        const screenY = (y - this.view.y) * this.view.zoom;
        
        this.ctx.beginPath();
        this.ctx.moveTo(0, screenY);
        this.ctx.lineTo(this.canvas.width, screenY);
        this.ctx.stroke();
      }
    } else if (this.options.gridType === GridType.HEX) {
      // Hex grid parameters
      const hexHeight = gridSize;
      const hexWidth = gridSize * Math.sqrt(3) / 2;
      const hexSide = gridSize / 2;
      const hexVerticalSpacing = hexHeight * 0.75;
      
      // Calculate grid bounds
      const startRow = Math.floor(this.view.y / hexVerticalSpacing);
      const endRow = startRow + Math.ceil(this.canvas.height / (hexVerticalSpacing * this.view.zoom)) + 1;
      const startCol = Math.floor(this.view.x / hexWidth);
      const endCol = startCol + Math.ceil(this.canvas.width / (hexWidth * this.view.zoom)) + 1;
      
      // Draw hex grid
      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          // Calculate hex center
          let x = col * hexWidth;
          let y = row * hexVerticalSpacing;
          
          // Offset every other row
          if (row % 2 !== 0) {
            x += hexWidth / 2;
          }
          
          // Convert to screen coordinates
          const screenPos = this._worldToScreen(x, y);
          
          // Draw hexagon
          this.ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const hx = screenPos.x + (hexSide * this.view.zoom) * Math.cos(angle);
            const hy = screenPos.y + (hexSide * this.view.zoom) * Math.sin(angle);
            
            if (i === 0) {
              this.ctx.moveTo(hx, hy);
            } else {
              this.ctx.lineTo(hx, hy);
            }
          }
          this.ctx.closePath();
          this.ctx.stroke();
        }
      }
    }
  }

  /**
   * Draw walls
   * @private
   */
  _drawWalls() {
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 3 / this.view.zoom;
    
    this.battlefield.walls.forEach(wall => {
      const start = this._worldToScreen(wall.x1, wall.y1);
      const end = this._worldToScreen(wall.x2, wall.y2);
      
      this.ctx.beginPath();
      this.ctx.moveTo(start.x, start.y);
      this.ctx.lineTo(end.x, end.y);
      this.ctx.stroke();
    });
  }

  /**
   * Draw doors
   * @private
   */
  _drawDoors() {
    this.battlefield.doors.forEach(door => {
      const start = this._worldToScreen(door.x1, door.y1);
      const end = this._worldToScreen(door.x2, door.y2);
      
      // Draw door line
      this.ctx.strokeStyle = door.open ? '#8B4513' : '#A52A2A';
      this.ctx.lineWidth = 5 / this.view.zoom;
      
      this.ctx.beginPath();
      this.ctx.moveTo(start.x, start.y);
      this.ctx.lineTo(end.x, end.y);
      this.ctx.stroke();
      
      // Draw door symbol
      const midX = (start.x + end.x) / 2;
      const midY = (start.y + end.y) / 2;
      const size = 8 * this.view.zoom;
      
      this.ctx.fillStyle = door.open ? '#8B4513' : '#A52A2A';
      this.ctx.beginPath();
      this.ctx.arc(midX, midY, size, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

    /**
   * Draw objects
   * @private
   */
  _drawObjects() {
    this.battlefield.objects.forEach(obj => {
      const pos = this._worldToScreen(obj.x, obj.y);
      
      // Draw object based on type
      switch (obj.type) {
        case 'circle':
          this._drawCircleObject(obj, pos);
          break;
        case 'rectangle':
          this._drawRectangleObject(obj, pos);
          break;
        case 'image':
          this._drawImageObject(obj, pos);
          break;
        default:
          this._drawGenericObject(obj, pos);
          break;
      }
      
      // Draw label if present
      if (obj.label) {
        this._drawObjectLabel(obj, pos);
      }
    });
  }

  /**
   * Draw circle object
   * @param {Object} obj - Object data
   * @param {Object} pos - Screen position
   * @private
   */
  _drawCircleObject(obj, pos) {
    const radius = obj.radius * this.view.zoom;
    
    this.ctx.fillStyle = obj.color || '#888888';
    this.ctx.beginPath();
    this.ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
    this.ctx.fill();
    
    if (obj.border) {
      this.ctx.strokeStyle = obj.borderColor || '#000000';
      this.ctx.lineWidth = (obj.borderWidth || 1) / this.view.zoom;
      this.ctx.stroke();
    }
  }

  /**
   * Draw rectangle object
   * @param {Object} obj - Object data
   * @param {Object} pos - Screen position
   * @private
   */
  _drawRectangleObject(obj, pos) {
    const width = obj.width * this.view.zoom;
    const height = obj.height * this.view.zoom;
    
    this.ctx.fillStyle = obj.color || '#888888';
    this.ctx.fillRect(
      pos.x - width / 2,
      pos.y - height / 2,
      width,
      height
    );
    
    if (obj.border) {
      this.ctx.strokeStyle = obj.borderColor || '#000000';
      this.ctx.lineWidth = (obj.borderWidth || 1) / this.view.zoom;
      this.ctx.strokeRect(
        pos.x - width / 2,
        pos.y - height / 2,
        width,
        height
      );
    }
  }

  /**
   * Draw image object
   * @param {Object} obj - Object data
   * @param {Object} pos - Screen position
   * @private
   */
  _drawImageObject(obj, pos) {
    if (obj.image) {
      const width = obj.width * this.view.zoom;
      const height = obj.height * this.view.zoom;
      
      this.ctx.drawImage(
        obj.image,
        pos.x - width / 2,
        pos.y - height / 2,
        width,
        height
      );
    }
  }

  /**
   * Draw generic object
   * @param {Object} obj - Object data
   * @param {Object} pos - Screen position
   * @private
   */
  _drawGenericObject(obj, pos) {
    const size = (obj.size || 20) * this.view.zoom;
    
    this.ctx.fillStyle = obj.color || '#888888';
    this.ctx.beginPath();
    this.ctx.arc(pos.x, pos.y, size / 2, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 1 / this.view.zoom;
    this.ctx.stroke();
  }

  /**
   * Draw object label
   * @param {Object} obj - Object data
   * @param {Object} pos - Screen position
   * @private
   */
  _drawObjectLabel(obj, pos) {
    const fontSize = 12 * this.view.zoom;
    this.ctx.font = `${fontSize}px Arial`;
    this.ctx.fillStyle = '#000000';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    
    const size = obj.size || 20;
    this.ctx.fillText(obj.label, pos.x, pos.y + (size / 2 + 5) * this.view.zoom);
  }

  /**
   * Draw tokens
   * @private
   */
  _drawTokens() {
    this.battlefield.tokens.forEach(token => {
      const pos = this._worldToScreen(token.x, token.y);
      const size = token.size * this.view.zoom;
      
      // Draw token background
      this.ctx.fillStyle = token.color || '#3f51b5';
      this.ctx.beginPath();
      this.ctx.arc(pos.x, pos.y, size / 2, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Draw token border
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 2 / this.view.zoom;
      this.ctx.stroke();
      
      // Draw token image if available
      if (token.image) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, size / 2 - 2 / this.view.zoom, 0, Math.PI * 2);
        this.ctx.clip();
        
        this.ctx.drawImage(
          token.image,
          pos.x - size / 2 + 2 / this.view.zoom,
          pos.y - size / 2 + 2 / this.view.zoom,
          size - 4 / this.view.zoom,
          size - 4 / this.view.zoom
        );
        
        this.ctx.restore();
      } else {
        // Draw token initial
        const initial = token.name ? token.name.charAt(0).toUpperCase() : '?';
        const fontSize = size * 0.6;
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = `bold ${fontSize}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(initial, pos.x, pos.y);
      }
      
      // Draw token label
      if (token.name) {
        const fontSize = 12 * this.view.zoom;
        this.ctx.font = `${fontSize}px Arial`;
        this.ctx.fillStyle = '#000000';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(token.name, pos.x, pos.y + (size / 2 + 5));
      }
      
      // Draw token health bar if applicable
      if (token.hp && token.hp.max > 0) {
        const barWidth = size;
        const barHeight = 5 * this.view.zoom;
        const barX = pos.x - barWidth / 2;
        const barY = pos.y + (size / 2 + 20 * this.view.zoom);
        
        // Background
        this.ctx.fillStyle = '#444444';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Health
        const healthPercent = Math.max(0, Math.min(1, token.hp.current / token.hp.max));
        let healthColor = '#4CAF50'; // Green
        
        if (healthPercent < 0.3) {
          healthColor = '#F44336'; // Red
        } else if (healthPercent < 0.6) {
          healthColor = '#FFC107'; // Yellow
        }
        
        this.ctx.fillStyle = healthColor;
        this.ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
      }
      
      // Draw conditions if any
      if (token.conditions && token.conditions.length > 0) {
        this._drawTokenConditions(token, pos, size);
      }
    });
  }

  /**
   * Draw token conditions
   * @param {Object} token - Token data
   * @param {Object} pos - Screen position
   * @param {number} size - Token size
   * @private
   */
  _drawTokenConditions(token, pos, size) {
    const conditionSize = 16 * this.view.zoom;
    const maxConditions = 3; // Max conditions to show
    const startX = pos.x - (conditionSize * Math.min(token.conditions.length, maxConditions)) / 2;
    
    token.conditions.slice(0, maxConditions).forEach((condition, index) => {
      const condX = startX + index * conditionSize;
      const condY = pos.y - size / 2 - conditionSize - 5;
      
      // Draw condition background
      this.ctx.fillStyle = this._getConditionColor(condition.type);
      this.ctx.beginPath();
      this.ctx.arc(condX + conditionSize / 2, condY + conditionSize / 2, conditionSize / 2, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Draw condition border
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 1 / this.view.zoom;
      this.ctx.stroke();
      
      // Draw condition initial
      const initial = condition.type.charAt(0).toUpperCase();
      const fontSize = conditionSize * 0.7;
      
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = `bold ${fontSize}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(initial, condX + conditionSize / 2, condY + conditionSize / 2);
    });
    
    // Draw indicator for more conditions
    if (token.conditions.length > maxConditions) {
      const moreX = startX + maxConditions * conditionSize;
      const moreY = pos.y - size / 2 - conditionSize - 5;
      
      this.ctx.fillStyle = '#888888';
      this.ctx.beginPath();
      this.ctx.arc(moreX + conditionSize / 2, moreY + conditionSize / 2, conditionSize / 2, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 1 / this.view.zoom;
      this.ctx.stroke();
      
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = `bold ${conditionSize * 0.7}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('+', moreX + conditionSize / 2, moreY + conditionSize / 2);
    }
  }

  /**
   * Get color for condition type
   * @param {string} type - Condition type
   * @returns {string} Color for condition
   * @private
   */
  _getConditionColor(type) {
    const colors = {
      'blinded': '#795548',
      'charmed': '#E91E63',
      'deafened': '#607D8B',
      'frightened': '#9C27B0',
      'grappled': '#FF9800',
      'incapacitated': '#F44336',
      'invisible': '#BBBBBB',
      'paralyzed': '#FFEB3B',
      'petrified': '#795548',
      'poisoned': '#4CAF50',
      'prone': '#FF5722',
      'restrained': '#3F51B5',
      'stunned': '#00BCD4',
      'unconscious': '#9E9E9E'
    };
    
    return colors[type.toLowerCase()] || '#888888';
  }

  /**
   * Draw selection indicator
   * @private
   */
  _drawSelectionIndicator() {
    if (!this.selectedToken) return;
    
    const pos = this._worldToScreen(this.selectedToken.x, this.selectedToken.y);
    const size = this.selectedToken.size * this.view.zoom;
    
    // Draw selection ring
    this.ctx.strokeStyle = '#ffeb3b';
    this.ctx.lineWidth = 3 / this.view.zoom;
    this.ctx.setLineDash([5 / this.view.zoom, 5 / this.view.zoom]);
    
    this.ctx.beginPath();
    this.ctx.arc(pos.x, pos.y, size / 2 + 5, 0, Math.PI * 2);
    this.ctx.stroke();
    
    this.ctx.setLineDash([]);
  }

  /**
   * Add a token to the battlefield
   * @param {Object} tokenData - Token data
   * @returns {Object} The added token
   */
  addToken(tokenData) {
    const token = {
      id: tokenData.id || `token_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      x: tokenData.x || this.battlefield.width / 2,
      y: tokenData.y || this.battlefield.height / 2,
      size: tokenData.size || 50,
      name: tokenData.name || 'Token',
      color: tokenData.color || '#3f51b5',
      image: tokenData.image || null,
      hp: tokenData.hp || { current: 0, max: 0 },
      conditions: tokenData.conditions || [],
      isDragging: false,
      dragOffset: { x: 0, y: 0 }
    };
    
    // Snap to grid if enabled
    if (this.options.snapToGrid) {
      this._snapTokenToGrid(token);
    }
    
    this.battlefield.tokens.push(token);
    this.drawMap();
    
    this._notifyListeners('tokenAdded', { token });
    
    return token;
  }

  /**
   * Update a token
   * @param {string} id - Token ID
   * @param {Object} updates - Token updates
   * @returns {Object|null} The updated token or null if not found
   */
  updateToken(id, updates) {
    const token = this.battlefield.tokens.find(t => t.id === id);
    
    if (!token) return null;
    
    // Apply updates
    Object.assign(token, updates);
    
    // Snap to grid if position changed and snap is enabled
    if ((updates.x !== undefined || updates.y !== undefined) && this.options.snapToGrid) {
      this._snapTokenToGrid(token);
    }
    
    this.drawMap();
    
    this._notifyListeners('tokenUpdated', { token });
    
    return token;
  }

  /**
   * Remove a token
   * @param {string} id - Token ID
   * @returns {boolean} True if token was removed
   */
  removeToken(id) {
    const index = this.battlefield.tokens.findIndex(t => t.id === id);
    
    if (index === -1) return false;
    
    const token = this.battlefield.tokens[index];
    this.battlefield.tokens.splice(index, 1);
    
    // Clear selection if removed token was selected
    if (this.selectedToken && this.selectedToken.id === id) {
      this.selectedToken = null;
    }
    
    this.drawMap();
    
    this._notifyListeners('tokenRemoved', { token });
    
    return true;
  }

  /**
   * Add a wall to the battlefield
   * @param {Object} wallData - Wall data
   * @returns {Object} The added wall
   */
  addWall(wallData) {
    const wall = {
      id: wallData.id || `wall_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      x1: wallData.x1 || 0,
      y1: wallData.y1 || 0,
      x2: wallData.x2 || 100,
      y2: wallData.y2 || 0,
      type: wallData.type || 'normal'
    };
    
    this.battlefield.walls.push(wall);
    this.drawMap();
    
    this._notifyListeners('wallAdded', { wall });
    
    return wall;
  }

  /**
   * Add a door to the battlefield
   * @param {Object} doorData - Door data
   * @returns {Object} The added door
   */
  addDoor(doorData) {
    const door = {
      id: doorData.id || `door_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      x1: doorData.x1 || 0,
      y1: doorData.y1 || 0,
      x2: doorData.x2 || 100,
      y2: doorData.y2 || 0,
      open: doorData.open || false
    };
    
    this.battlefield.doors.push(door);
    this.drawMap();
    
    this._notifyListeners('doorAdded', { door });
    
    return door;
  }

  /**
   * Toggle door state
   * @param {string} id - Door ID
   * @returns {boolean} New door state or null if not found
   */
  toggleDoor(id) {
    const door = this.battlefield.doors.find(d => d.id === id);
    
    if (!door) return null;
    
    door.open = !door.open;
    this.drawMap();
    
    this._notifyListeners('doorToggled', { door });
    
    return door.open;
  }

  /**
   * Add an object to the battlefield
   * @param {Object} objectData - Object data
   * @returns {Object} The added object
   */
  addObject(objectData) {
    const object = {
      id: objectData.id || `object_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      type: objectData.type || 'generic',
      x: objectData.x || 0,
      y: objectData.y || 0,
      size: objectData.size || 20,
      color: objectData.color || '#888888',
      label: objectData.label || '',
      ...objectData
    };
    
    this.battlefield.objects.push(object);
    this.drawMap();
    
    this._notifyListeners('objectAdded', { object });
    
    return object;
  }

  /**
   * Set background image
   * @param {HTMLImageElement} image - Background image
   * @param {number} width - Image width
   * @param {number} height - Image height
   */
  setBackground(image, width, height) {
    this.battlefield.background = {
      image,
      width: width || this.battlefield.width,
      height: height || this.battlefield.height
    };
    
    // Resize battlefield to match background
    this.battlefield.width = this.battlefield.background.width;
    this.battlefield.height = this.battlefield.background.height;
    
    this.drawMap();
    
    this._notifyListeners('backgroundChanged', { background: this.battlefield.background });
  }

  /**
   * Resize the battlefield
   * @param {number} width - New width
   * @param {number} height - New height
   */
  resizeBattlefield(width, height) {
    this.battlefield.width = width;
    this.battlefield.height = height;
    
    this.drawMap();
    
    this._notifyListeners('battlefieldResized', {
      width: this.battlefield.width,
      height: this.battlefield.height
    });
  }

  /**
   * Zoom the map
   * @param {number} factor - Zoom factor
   */
  zoom(factor) {
    // Zoom at center of canvas
    if (this.canvas) {
      const centerX = this.canvas.width / 2;
      const centerY = this.canvas.height / 2;
      
      this._zoomAtPoint(centerX, centerY, factor);
      this.drawMap();
    }
  }

  /**
   * Reset the view
   */
  resetView() {
    this.view.zoom = 1;
    this._centerView();
    this.drawMap();
  }

  /**
   * Toggle grid visibility
   */
  toggleGrid() {
    this.options.showGrid = !this.options.showGrid;
    this.drawMap();
    
    return this.options.showGrid;
  }

  /**
   * Clear the battlefield
   */
  clear() {
    this.battlefield.tokens = [];
    this.battlefield.walls = [];
    this.battlefield.doors = [];
    this.battlefield.objects = [];
    this.battlefield.background = null;
    
    this.selectedToken = null;
    
    this.drawMap();
    
    this._notifyListeners('battlefieldCleared', {});
  }

  /**
   * Add event listener
   * @param {Function} listener - Event listener function
   * @returns {Function} Function to remove the listener
   */
  addListener(listener) {
    this.listeners.push(listener);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index !== -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify listeners of an event
   * @param {string} event - Event name
   * @param {Object} data - Event data
   * @private
   */
  _notifyListeners(event, data) {
    this.listeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Error in tactical manager listener:', error);
      }
    });
  }

  /**
   * Save battlefield data
   * @returns {Object} Battlefield data
   */
  saveToData() {
    // Clone battlefield data without circular references
    return {
      width: this.battlefield.width,
      height: this.battlefield.height,
      tokens: this.battlefield.tokens.map(token => ({
        ...token,
        isDragging: false,
        dragOffset: { x: 0, y: 0 },
        image: null // Don't save image objects
      })),
      walls: [...this.battlefield.walls],
      doors: [...this.battlefield.doors],
      objects: this.battlefield.objects.map(obj => ({
        ...obj,
        image: null // Don't save image objects
      })),
      background: this.battlefield.background ? {
        width: this.battlefield.background.width,
        height: this.battlefield.background.height,
        image: null // Don't save image object
      } : null
    };
  }

  /**
   * Load battlefield data
   * @param {Object} data - Battlefield data
   */
  loadFromData(data) {
    if (!data) return;
    
    this.battlefield.width = data.width || 1000;
    this.battlefield.height = data.height || 1000;
    this.battlefield.tokens = data.tokens || [];
    this.battlefield.walls = data.walls || [];
    this.battlefield.doors = data.doors || [];
    this.battlefield.objects = data.objects || [];
    this.battlefield.background = data.background || null;
    
    // Reset selection
    this.selectedToken = null;
    
    // Redraw map
    this.drawMap();
  }
}

/**
 * Create a tactical combat manager
 * @param {Object} options - Configuration options
 * @returns {TacticalCombatManager} A new tactical combat manager instance
 */
export function createTacticalCombatManager(options = {}) {
  return new TacticalCombatManager(options);
}

export default {
  createTacticalCombatManager,
  GridType
};
