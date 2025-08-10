/**
 * Jesster's Combat Tracker
 * Tactical Module
 * Version 2.3.1
 * 
 * This module handles tactical combat features like positioning, movement,
 * and battlefield management.
 */

/**
 * Grid types
 */
export const GridType = {
  SQUARE: 'square',
  HEX: 'hex',
  NONE: 'none'
};

/**
 * Terrain types
 */
export const TerrainType = {
  NORMAL: 'normal',
  DIFFICULT: 'difficult',
  VERY_DIFFICULT: 'veryDifficult',
  IMPASSABLE: 'impassable',
  HAZARDOUS: 'hazardous',
  WATER: 'water',
  LAVA: 'lava',
  COVER_HALF: 'coverHalf',
  COVER_THREE_QUARTERS: 'coverThreeQuarters',
  COVER_FULL: 'coverFull',
  OBSCURED: 'obscured',
  HEAVILY_OBSCURED: 'heavilyObscured'
};

/**
 * Movement types
 */
export const MovementType = {
  WALK: 'walk',
  FLY: 'fly',
  SWIM: 'swim',
  BURROW: 'burrow',
  CLIMB: 'climb',
  TELEPORT: 'teleport'
};

/**
 * Direction types (for hex grids)
 */
export const DirectionType = {
  NORTH: 'north',
  NORTHEAST: 'northeast',
  SOUTHEAST: 'southeast',
  SOUTH: 'south',
  SOUTHWEST: 'southwest',
  NORTHWEST: 'northwest'
};

/**
 * Size categories
 */
export const SizeCategory = {
  TINY: 'tiny',
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
  HUGE: 'huge',
  GARGANTUAN: 'gargantuan'
};

/**
 * Class representing a position on the battlefield
 */
export class Position {
  /**
   * Create a position
   * @param {number} x - The x coordinate
   * @param {number} y - The y coordinate
   * @param {number} z - The z coordinate (elevation)
   */
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  /**
   * Get the distance to another position
   * @param {Position} other - The other position
   * @param {boolean} includeElevation - Whether to include elevation in the calculation
   * @returns {number} The distance
   */
  distanceTo(other, includeElevation = true) {
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    const dz = includeElevation ? other.z - this.z : 0;
    
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Get the Manhattan distance to another position
   * @param {Position} other - The other position
   * @param {boolean} includeElevation - Whether to include elevation in the calculation
   * @returns {number} The Manhattan distance
   */
  manhattanDistanceTo(other, includeElevation = true) {
    const dx = Math.abs(other.x - this.x);
    const dy = Math.abs(other.y - this.y);
    const dz = includeElevation ? Math.abs(other.z - this.z) : 0;
    
    return dx + dy + dz;
  }

  /**
   * Get the hex distance to another position
   * @param {Position} other - The other position
   * @returns {number} The hex distance
   */
  hexDistanceTo(other) {
    // Convert to cube coordinates
    const x1 = this.x;
    const z1 = this.y;
    const y1 = -x1 - z1;
    
    const x2 = other.x;
    const z2 = other.y;
    const y2 = -x2 - z2;
    
    // Calculate distance
    return Math.max(
      Math.abs(x1 - x2),
      Math.abs(y1 - y2),
      Math.abs(z1 - z2)
    );
  }

  /**
   * Check if this position is equal to another
   * @param {Position} other - The other position
   * @returns {boolean} True if the positions are equal
   */
  equals(other) {
    return this.x === other.x && this.y === other.y && this.z === other.z;
  }

  /**
   * Clone this position
   * @returns {Position} A new position with the same coordinates
   */
  clone() {
    return new Position(this.x, this.y, this.z);
  }

  /**
   * Convert the position to a string
   * @returns {string} The string representation
   */
  toString() {
    return `(${this.x}, ${this.y}, ${this.z})`;
  }

  /**
   * Convert the position to an object
   * @returns {Object} The object representation
   */
  toObject() {
    return { x: this.x, y: this.y, z: this.z };
  }

  /**
   * Create a position from an object
   * @param {Object} obj - The object
   * @returns {Position} The position
   */
  static fromObject(obj) {
    return new Position(obj.x || 0, obj.y || 0, obj.z || 0);
  }
}

/**
 * Class representing a grid cell
 */
export class Cell {
  /**
   * Create a cell
   * @param {number} x - The x coordinate
   * @param {number} y - The y coordinate
   * @param {Object} options - Cell options
   */
  constructor(x, y, options = {}) {
    this.x = x;
    this.y = y;
    this.terrain = options.terrain || TerrainType.NORMAL;
    this.elevation = options.elevation || 0;
    this.occupants = new Set();
    this.features = new Set(options.features || []);
    this.light = options.light || 'normal';
    this.visible = options.visible !== undefined ? options.visible : true;
    this.explored = options.explored !== undefined ? options.explored : false;
    this.customProperties = options.customProperties || {};
  }

  /**
   * Check if the cell is occupied
   * @returns {boolean} True if the cell is occupied
   */
  isOccupied() {
    return this.occupants.size > 0;
  }

  /**
   * Check if the cell is difficult terrain
   * @returns {boolean} True if the cell is difficult terrain
   */
  isDifficultTerrain() {
    return this.terrain === TerrainType.DIFFICULT || 
           this.terrain === TerrainType.VERY_DIFFICULT;
  }

  /**
   * Check if the cell is impassable
   * @returns {boolean} True if the cell is impassable
   */
  isImpassable() {
    return this.terrain === TerrainType.IMPASSABLE;
  }

  /**
   * Check if the cell provides cover
   * @returns {boolean} True if the cell provides cover
   */
  providesCover() {
    return this.terrain === TerrainType.COVER_HALF || 
           this.terrain === TerrainType.COVER_THREE_QUARTERS || 
           this.terrain === TerrainType.COVER_FULL;
  }

  /**
   * Get the cover level provided by the cell
   * @returns {string|null} The cover level or null if no cover
   */
  getCoverLevel() {
    if (this.terrain === TerrainType.COVER_HALF) {
      return 'half';
    } else if (this.terrain === TerrainType.COVER_THREE_QUARTERS) {
      return 'threeQuarters';
    } else if (this.terrain === TerrainType.COVER_FULL) {
      return 'full';
    }
    
    return null;
  }

  /**
   * Check if the cell is obscured
   * @returns {boolean} True if the cell is obscured
   */
  isObscured() {
    return this.terrain === TerrainType.OBSCURED || 
           this.terrain === TerrainType.HEAVILY_OBSCURED;
  }

  /**
   * Add an occupant to the cell
   * @param {string} occupantId - The occupant ID
   */
  addOccupant(occupantId) {
    this.occupants.add(occupantId);
  }

  /**
   * Remove an occupant from the cell
   * @param {string} occupantId - The occupant ID
   * @returns {boolean} True if the occupant was removed
   */
  removeOccupant(occupantId) {
    return this.occupants.delete(occupantId);
  }

  /**
   * Check if the cell has a specific occupant
   * @param {string} occupantId - The occupant ID
   * @returns {boolean} True if the cell has the occupant
   */
  hasOccupant(occupantId) {
    return this.occupants.has(occupantId);
  }

  /**
   * Get all occupants of the cell
   * @returns {Array} The occupant IDs
   */
  getOccupants() {
    return Array.from(this.occupants);
  }

  /**
   * Add a feature to the cell
   * @param {string} feature - The feature to add
   */
  addFeature(feature) {
    this.features.add(feature);
  }

  /**
   * Remove a feature from the cell
   * @param {string} feature - The feature to remove
   * @returns {boolean} True if the feature was removed
   */
  removeFeature(feature) {
    return this.features.delete(feature);
  }

  /**
   * Check if the cell has a specific feature
   * @param {string} feature - The feature to check
   * @returns {boolean} True if the cell has the feature
   */
  hasFeature(feature) {
    return this.features.has(feature);
  }

  /**
   * Get all features of the cell
   * @returns {Array} The features
   */
  getFeatures() {
    return Array.from(this.features);
  }

  /**
   * Set the terrain type of the cell
   * @param {string} terrain - The terrain type
   */
  setTerrain(terrain) {
    this.terrain = terrain;
  }

  /**
   * Set the elevation of the cell
   * @param {number} elevation - The elevation
   */
  setElevation(elevation) {
    this.elevation = elevation;
  }

  /**
   * Set the light level of the cell
   * @param {string} light - The light level
   */
  setLight(light) {
    this.light = light;
  }

  /**
   * Set whether the cell is visible
   * @param {boolean} visible - Whether the cell is visible
   */
  setVisible(visible) {
    this.visible = visible;
  }

  /**
   * Set whether the cell has been explored
   * @param {boolean} explored - Whether the cell has been explored
   */
  setExplored(explored) {
    this.explored = explored;
  }

  /**
   * Clone the cell
   * @returns {Cell} A new cell with the same properties
   */
  clone() {
    const newCell = new Cell(this.x, this.y, {
      terrain: this.terrain,
      elevation: this.elevation,
      features: Array.from(this.features),
      light: this.light,
      visible: this.visible,
      explored: this.explored,
      customProperties: { ...this.customProperties }
    });
    
    // Copy occupants
    this.occupants.forEach(occupant => {
      newCell.occupants.add(occupant);
    });
    
    return newCell;
  }

  /**
   * Convert the cell to an object
   * @returns {Object} The object representation
   */
  toObject() {
    return {
      x: this.x,
      y: this.y,
      terrain: this.terrain,
      elevation: this.elevation,
      occupants: Array.from(this.occupants),
      features: Array.from(this.features),
      light: this.light,
      visible: this.visible,
      explored: this.explored,
      customProperties: { ...this.customProperties }
    };
  }

  /**
   * Create a cell from an object
   * @param {Object} obj - The object
   * @returns {Cell} The cell
   */
  static fromObject(obj) {
    const cell = new Cell(obj.x, obj.y, {
      terrain: obj.terrain,
      elevation: obj.elevation,
      features: obj.features,
      light: obj.light,
      visible: obj.visible,
      explored: obj.explored,
      customProperties: obj.customProperties
    });
    
    // Add occupants
    if (obj.occupants) {
      obj.occupants.forEach(occupant => {
        cell.occupants.add(occupant);
      });
    }
    
    return cell;
  }
}

/**
 * Class representing a grid
 */
export class Grid {
  /**
   * Create a grid
   * @param {Object} options - Grid options
   */
  constructor(options = {}) {
    this.width = options.width || 10;
    this.height = options.height || 10;
    this.type = options.type || GridType.SQUARE;
    this.cellSize = options.cellSize || 5; // 5 feet per cell
    this.cells = new Map();
    this.listeners = [];
    
    // Initialize cells
    this._initializeCells();
  }

  /**
   * Initialize cells
   * @private
   */
  _initializeCells() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.setCell(x, y, new Cell(x, y));
      }
    }
  }

  /**
   * Get a cell at the specified coordinates
   * @param {number} x - The x coordinate
   * @param {number} y - The y coordinate
   * @returns {Cell|null} The cell or null if out of bounds
   */
  getCell(x, y) {
    if (this._isOutOfBounds(x, y)) {
      return null;
    }
    
    const key = this._getCellKey(x, y);
    return this.cells.get(key) || null;
  }

  /**
   * Set a cell at the specified coordinates
   * @param {number} x - The x coordinate
   * @param {number} y - The y coordinate
   * @param {Cell} cell - The cell
   * @returns {boolean} True if the cell was set
   */
  setCell(x, y, cell) {
    if (this._isOutOfBounds(x, y)) {
      return false;
    }
    
    const key = this._getCellKey(x, y);
    this.cells.set(key, cell);
    
    // Notify listeners
    this._notifyListeners('cellUpdated', { x, y, cell });
    
    return true;
  }

  /**
   * Check if coordinates are out of bounds
   * @param {number} x - The x coordinate
   * @param {number} y - The y coordinate
   * @returns {boolean} True if out of bounds
   * @private
   */
  _isOutOfBounds(x, y) {
    return x < 0 || x >= this.width || y < 0 || y >= this.height;
  }

  /**
   * Get the key for a cell
   * @param {number} x - The x coordinate
   * @param {number} y - The y coordinate
   * @returns {string} The cell key
   * @private
   */
  _getCellKey(x, y) {
    return `${x},${y}`;
  }

  /**
   * Get all cells
   * @returns {Array} Array of cells
   */
  getAllCells() {
    return Array.from(this.cells.values());
  }

  /**
   * Get neighbors of a cell
   * @param {number} x - The x coordinate
   * @param {number} y - The y coordinate
   * @param {boolean} includeDiagonals - Whether to include diagonal neighbors (for square grids)
   * @returns {Array} Array of neighboring cells
   */
  getNeighbors(x, y, includeDiagonals = false) {
    const neighbors = [];
    
    if (this.type === GridType.SQUARE) {
      // Cardinal directions
      const cardinalDirections = [
        { x: 0, y: -1 }, // North
        { x: 1, y: 0 },  // East
        { x: 0, y: 1 },  // South
        { x: -1, y: 0 }  // West
      ];
      
      for (const dir of cardinalDirections) {
        const nx = x + dir.x;
        const ny = y + dir.y;
        const neighbor = this.getCell(nx, ny);
        
        if (neighbor) {
          neighbors.push(neighbor);
        }
      }
      
      // Diagonal directions
      if (includeDiagonals) {
        const diagonalDirections = [
          { x: 1, y: -1 },  // Northeast
          { x: 1, y: 1 },   // Southeast
          { x: -1, y: 1 },  // Southwest
          { x: -1, y: -1 }  // Northwest
        ];
        
        for (const dir of diagonalDirections) {
          const nx = x + dir.x;
          const ny = y + dir.y;
          const neighbor = this.getCell(nx, ny);
          
          if (neighbor) {
            neighbors.push(neighbor);
          }
        }
      }
    } else if (this.type === GridType.HEX) {
      // Hex directions (using odd-q offset coordinates)
      const parity = x & 1; // 1 if x is odd, 0 if x is even
      const directions = [
        // Even columns
        [
          { x: 0, y: -1 },  // North
          { x: 1, y: -1 },  // Northeast
          { x: 1, y: 0 },   // Southeast
          { x: 0, y: 1 },   // South
          { x: -1, y: 0 },  // Southwest
          { x: -1, y: -1 }  // Northwest
        ],
        // Odd columns
        [
          { x: 0, y: -1 },  // North
          { x: 1, y: 0 },   // Northeast
          { x: 1, y: 1 },   // Southeast
          { x: 0, y: 1 },   // South
          { x: -1, y: 1 },  // Southwest
          { x: -1, y: 0 }   // Northwest
        ]
      ];
      
      for (const dir of directions[parity]) {
        const nx = x + dir.x;
        const ny = y + dir.y;
        const neighbor = this.getCell(nx, ny);
        
        if (neighbor) {
          neighbors.push(neighbor);
        }
      }
    }
    
    return neighbors;
  }

  /**
   * Get cells in a line between two points
   * @param {number} x1 - The starting x coordinate
   * @param {number} y1 - The starting y coordinate
   * @param {number} x2 - The ending x coordinate
   * @param {number} y2 - The ending y coordinate
   * @returns {Array} Array of cells in the line
   */
  getLine(x1, y1, x2, y2) {
    const cells = [];
    
    // Use Bresenham's line algorithm
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;
    
    let x = x1;
    let y = y1;
    
    while (true) {
      const cell = this.getCell(x, y);
      
      if (cell) {
        cells.push(cell);
      }
      
      if (x === x2 && y === y2) {
        break;
      }
      
      const e2 = 2 * err;
      
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
    
    return cells;
  }

  /**
   * Get cells in a circle
   * @param {number} centerX - The center x coordinate
   * @param {number} centerY - The center y coordinate
   * @param {number} radius - The radius in cells
   * @returns {Array} Array of cells in the circle
   */
  getCircle(centerX, centerY, radius) {
    const cells = [];
    
    // Check all cells in a square around the center
    for (let y = centerY - radius; y <= centerY + radius; y++) {
      for (let x = centerX - radius; x <= centerX + radius; x++) {
        const cell = this.getCell(x, y);
        
        if (cell) {
          // Calculate distance based on grid type
          let distance;
          
          if (this.type === GridType.SQUARE) {
            // Euclidean distance
            const dx = x - centerX;
            const dy = y - centerY;
            distance = Math.sqrt(dx * dx + dy * dy);
          } else if (this.type === GridType.HEX) {
            // Hex distance
            const pos1 = new Position(centerX, centerY);
            const pos2 = new Position(x, y);
            distance = pos1.hexDistanceTo(pos2);
          }
          
          if (distance <= radius) {
            cells.push(cell);
          }
        }
      }
    }
    
    return cells;
  }

  /**
   * Get cells in a cone
   * @param {number} originX - The origin x coordinate
   * @param {number} originY - The origin y coordinate
   * @param {number} length - The length of the cone in cells
   * @param {number} direction - The direction in degrees (0 = north, 90 = east, etc.)
   * @param {number} angle - The angle of the cone in degrees
   * @returns {Array} Array of cells in the cone
   */
  getCone(originX, originY, length, direction, angle) {
    const cells = [];
    
    // Convert direction to radians
    const dirRad = (direction * Math.PI) / 180;
    
    // Convert angle to radians
    const angleRad = (angle * Math.PI) / 180;
    const halfAngleRad = angleRad / 2;
    
    // Check all cells in a square around the origin
    for (let y = originY - length; y <= originY + length; y++) {
      for (let x = originX - length; x <= originX + length; x++) {
        const cell = this.getCell(x, y);
        
        if (cell) {
          // Calculate distance and angle to the cell
          const dx = x - originX;
          const dy = y - originY;
          
          // Skip the origin cell
          if (dx === 0 && dy === 0) {
            cells.push(cell);
            continue;
          }
          
          // Calculate distance based on grid type
          let distance;
          
          if (this.type === GridType.SQUARE) {
            // Euclidean distance
            distance = Math.sqrt(dx * dx + dy * dy);
          } else if (this.type === GridType.HEX) {
            // Hex distance
            const pos1 = new Position(originX, originY);
            const pos2 = new Position(x, y);
            distance = pos1.hexDistanceTo(pos2);
          }
          
          // Skip cells that are too far away
          if (distance > length) {
            continue;
          }
          
          // Calculate angle to the cell
          const cellAngle = Math.atan2(-dy, dx); // Negative dy because y increases downward
          
          // Normalize the angle difference to [-π, π]
          let angleDiff = cellAngle - dirRad;
          while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
          while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
          
          // Check if the cell is within the cone angle
          if (Math.abs(angleDiff) <= halfAngleRad) {
            cells.push(cell);
          }
        }
      }
    }
    
    return cells;
  }

  /**
   * Get cells in a rectangle
   * @param {number} x - The top-left x coordinate
   * @param {number} y - The top-left y coordinate
   * @param {number} width - The width in cells
   * @param {number} height - The height in cells
   * @returns {Array} Array of cells in the rectangle
   */
  getRectangle(x, y, width, height) {
    const cells = [];
    
    for (let cy = y; cy < y + height; cy++) {
      for (let cx = x; cx < x + width; cx++) {
        const cell = this.getCell(cx, cy);
        
        if (cell) {
          cells.push(cell);
        }
      }
    }
    
    return cells;
  }

  /**
   * Calculate the distance between two cells
   * @param {number} x1 - The first x coordinate
   * @param {number} y1 - The first y coordinate
   * @param {number} x2 - The second x coordinate
   * @param {number} y2 - The second y coordinate
   * @returns {number} The distance in cells
   */
  getDistance(x1, y1, x2, y2) {
    if (this.type === GridType.SQUARE) {
      // Euclidean distance
      const dx = x2 - x1;
      const dy = y2 - y1;
      return Math.sqrt(dx * dx + dy * dy);
    } else if (this.type === GridType.HEX) {
      // Hex distance
      const pos1 = new Position(x1, y1);
      const pos2 = new Position(x2, y2);
      return pos1.hexDistanceTo(pos2);
    }
    
    return 0;
  }

  /**
   * Find a path between two cells
   * @param {number} startX - The starting x coordinate
   * @param {number} startY - The starting y coordinate
   * @param {number} endX - The ending x coordinate
   * @param {number} endY - The ending y coordinate
   * @param {Object} options - Pathfinding options
   * @returns {Array|null} Array of cells in the path or null if no path found
   */
  findPath(startX, startY, endX, endY, options = {}) {
    const {
      ignoreTerrain = false,
      ignoreOccupants = false,
      maxDistance = Infinity,
      movementType = MovementType.WALK
    } = options;
    
    // Check if start and end are valid
    const startCell = this.getCell(startX, startY);
    const endCell = this.getCell(endX, endY);
    
    if (!startCell || !endCell) {
      return null;
    }
    
    // A* pathfinding algorithm
    const openSet = new Set();
    const closedSet = new Set();
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();
    
    const startKey = this._getCellKey(startX, startY);
    const endKey = this._getCellKey(endX, endY);
    
    openSet.add(startKey);
    gScore.set(startKey, 0);
    fScore.set(startKey, this._heuristic(startX, startY, endX, endY));
    
    while (openSet.size > 0) {
      // Find the node in openSet with the lowest fScore
      let currentKey = null;
      let lowestFScore = Infinity;
      
      for (const key of openSet) {
        const score = fScore.get(key);
        
        if (score < lowestFScore) {
          lowestFScore = score;
          currentKey = key;
        }
      }
      
      // If we've reached the end, reconstruct the path
      if (currentKey === endKey) {
        return this._reconstructPath(cameFrom, currentKey);
      }
      
      // Move current from openSet to closedSet
      openSet.delete(currentKey);
      closedSet.add(currentKey);
      
      // Get the current cell coordinates
      const [currentX, currentY] = currentKey.split(',').map(Number);
      
      // Check neighbors
      const neighbors = this.getNeighbors(currentX, currentY, this.type === GridType.SQUARE);
      
      for (const neighbor of neighbors) {
        const neighborKey = this._getCellKey(neighbor.x, neighbor.y);
        
        // Skip if already evaluated
        if (closedSet.has(neighborKey)) {
          continue;
        }
        
        // Skip if impassable
        if (!ignoreTerrain && neighbor.isImpassable()) {
          continue;
        }
        
        // Skip if occupied
        if (!ignoreOccupants && neighbor.isOccupied()) {
          continue;
        }
        
        // Calculate movement cost
        let movementCost = 1;
        
        // Adjust cost for difficult terrain
        if (!ignoreTerrain && neighbor.isDifficultTerrain()) {
          if (neighbor.terrain === TerrainType.DIFFICULT) {
            movementCost = 2;
          } else if (neighbor.terrain === TerrainType.VERY_DIFFICULT) {
            movementCost = 3;
          }
        }
        
        // Adjust cost for elevation changes
        const currentCell = this.getCell(currentX, currentY);
        const elevationDiff = Math.abs(neighbor.elevation - currentCell.elevation);
        
        if (movementType === MovementType.CLIMB) {
          // Climbing costs extra movement
          movementCost += elevationDiff * 0.5;
        } else if (movementType === MovementType.FLY) {
          // Flying ignores elevation
        } else {
          // Normal movement costs extra for elevation changes
          movementCost += elevationDiff;
        }
        
        // Calculate tentative gScore
        const tentativeGScore = gScore.get(currentKey) + movementCost;
        
        // Skip if this path is too long
        if (tentativeGScore > maxDistance) {
          continue;
        }
        
        // Check if this is a better path
        if (!openSet.has(neighborKey) || tentativeGScore < gScore.get(neighborKey)) {
          // Record this path
          cameFrom.set(neighborKey, currentKey);
          gScore.set(neighborKey, tentativeGScore);
            findPath(startX, startY, endX, endY, options = {}) {
    const {
      ignoreTerrain = false,
      ignoreOccupants = false,
      maxDistance = Infinity,
      movementType = MovementType.WALK
    } = options;
    
    // Check if start and end are valid
    const startCell = this.getCell(startX, startY);
    const endCell = this.getCell(endX, endY);
    
    if (!startCell || !endCell) {
      return null;
    }
    
    // A* pathfinding algorithm
    const openSet = new Set();
    const closedSet = new Set();
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();
    
    const startKey = this._getCellKey(startX, startY);
    const endKey = this._getCellKey(endX, endY);
    
    openSet.add(startKey);
    gScore.set(startKey, 0);
    fScore.set(startKey, this._heuristic(startX, startY, endX, endY));
    
    while (openSet.size > 0) {
      // Find the node in openSet with the lowest fScore
      let currentKey = null;
      let lowestFScore = Infinity;
      
      for (const key of openSet) {
        const score = fScore.get(key);
        
        if (score < lowestFScore) {
          lowestFScore = score;
          currentKey = key;
        }
      }
      
      // If we've reached the end, reconstruct the path
      if (currentKey === endKey) {
        return this._reconstructPath(cameFrom, currentKey);
      }
      
      // Move current from openSet to closedSet
      openSet.delete(currentKey);
      closedSet.add(currentKey);
      
      // Get the current cell coordinates
      const [currentX, currentY] = currentKey.split(',').map(Number);
      
      // Check neighbors
      const neighbors = this.getNeighbors(currentX, currentY, this.type === GridType.SQUARE);
      
      for (const neighbor of neighbors) {
        const neighborKey = this._getCellKey(neighbor.x, neighbor.y);
        
        // Skip if already evaluated
        if (closedSet.has(neighborKey)) {
          continue;
        }
        
        // Skip if impassable
        if (!ignoreTerrain && neighbor.isImpassable()) {
          continue;
        }
        
        // Skip if occupied
        if (!ignoreOccupants && neighbor.isOccupied()) {
          continue;
        }
        
        // Calculate movement cost
        let movementCost = 1;
        
        // Adjust cost for difficult terrain
        if (!ignoreTerrain && neighbor.isDifficultTerrain()) {
          if (neighbor.terrain === TerrainType.DIFFICULT) {
            movementCost = 2;
          } else if (neighbor.terrain === TerrainType.VERY_DIFFICULT) {
            movementCost = 3;
          }
        }
        
        // Adjust cost for elevation changes
        const currentCell = this.getCell(currentX, currentY);
        const elevationDiff = Math.abs(neighbor.elevation - currentCell.elevation);
        
        if (movementType === MovementType.CLIMB) {
          // Climbing costs extra movement
          movementCost += elevationDiff * 0.5;
        } else if (movementType === MovementType.FLY) {
          // Flying ignores elevation
        } else {
          // Normal movement costs extra for elevation changes
          movementCost += elevationDiff;
        }
        
        // Calculate tentative gScore
        const tentativeGScore = gScore.get(currentKey) + movementCost;
        
        // Skip if this path is too long
        if (tentativeGScore > maxDistance) {
          continue;
        }
        
        // Check if this is a better path
        if (!openSet.has(neighborKey) || tentativeGScore < gScore.get(neighborKey)) {
          // Record this path
          cameFrom.set(neighborKey, currentKey);
          gScore.set(neighborKey, tentativeGScore);
          fScore.set(neighborKey, tentativeGScore + this._heuristic(neighbor.x, neighbor.y, endX, endY));
          
          // Add to open set if not already there
          if (!openSet.has(neighborKey)) {
            openSet.add(neighborKey);
          }
        }
      }
    }
    
    // No path found
    return null;
  }

  /**
   * Heuristic function for A* pathfinding
   * @param {number} x1 - The first x coordinate
   * @param {number} y1 - The first y coordinate
   * @param {number} x2 - The second x coordinate
   * @param {number} y2 - The second y coordinate
   * @returns {number} The heuristic value
   * @private
   */
  _heuristic(x1, y1, x2, y2) {
    if (this.type === GridType.SQUARE) {
      // Manhattan distance for square grids
      return Math.abs(x2 - x1) + Math.abs(y2 - y1);
    } else if (this.type === GridType.HEX) {
      // Hex distance for hex grids
      const pos1 = new Position(x1, y1);
      const pos2 = new Position(x2, y2);
      return pos1.hexDistanceTo(pos2);
    }
    
    return 0;
  }

  /**
   * Reconstruct a path from A* pathfinding
   * @param {Map} cameFrom - The path map
   * @param {string} currentKey - The current cell key
   * @returns {Array} The path as an array of cells
   * @private
   */
  _reconstructPath(cameFrom, currentKey) {
    const path = [];
    let key = currentKey;
    
    while (cameFrom.has(key)) {
      const [x, y] = key.split(',').map(Number);
      const cell = this.getCell(x, y);
      
      if (cell) {
        path.unshift(cell);
      }
      
      key = cameFrom.get(key);
    }
    
    // Add the start cell
    const [x, y] = key.split(',').map(Number);
    const startCell = this.getCell(x, y);
    
    if (startCell) {
      path.unshift(startCell);
    }
    
    return path;
  }

  /**
   * Calculate the movement cost between two cells
   * @param {Cell} fromCell - The starting cell
   * @param {Cell} toCell - The ending cell
   * @param {Object} options - Movement options
   * @returns {number} The movement cost
   */
  getMovementCost(fromCell, toCell, options = {}) {
    const {
      ignoreTerrain = false,
      ignoreOccupants = false,
      movementType = MovementType.WALK
    } = options;
    
    // Base cost is 1
    let cost = 1;
    
    // Check if the destination is impassable
    if (!ignoreTerrain && toCell.isImpassable()) {
      return Infinity;
    }
    
    // Check if the destination is occupied
    if (!ignoreOccupants && toCell.isOccupied()) {
      return Infinity;
    }
    
    // Adjust cost for difficult terrain
    if (!ignoreTerrain && toCell.isDifficultTerrain()) {
      if (toCell.terrain === TerrainType.DIFFICULT) {
        cost = 2;
      } else if (toCell.terrain === TerrainType.VERY_DIFFICULT) {
        cost = 3;
      }
    }
    
    // Adjust cost for elevation changes
    const elevationDiff = Math.abs(toCell.elevation - fromCell.elevation);
    
    if (movementType === MovementType.CLIMB) {
      // Climbing costs extra movement
      cost += elevationDiff * 0.5;
    } else if (movementType === MovementType.FLY) {
      // Flying ignores elevation
    } else {
      // Normal movement costs extra for elevation changes
      cost += elevationDiff;
    }
    
    return cost;
  }

  /**
   * Calculate the cells reachable within a certain movement range
   * @param {number} startX - The starting x coordinate
   * @param {number} startY - The starting y coordinate
   * @param {number} movementRange - The movement range
   * @param {Object} options - Movement options
   * @returns {Object} Map of reachable cells with movement costs
   */
  getReachableCells(startX, startY, movementRange, options = {}) {
    const {
      ignoreTerrain = false,
      ignoreOccupants = false,
      movementType = MovementType.WALK
    } = options;
    
    // Check if start is valid
    const startCell = this.getCell(startX, startY);
    
    if (!startCell) {
      return new Map();
    }
    
    // Dijkstra's algorithm to find all reachable cells
    const openSet = new Set();
    const reachable = new Map();
    
    const startKey = this._getCellKey(startX, startY);
    
    openSet.add(startKey);
    reachable.set(startKey, 0);
    
    while (openSet.size > 0) {
      // Find the node in openSet with the lowest cost
      let currentKey = null;
      let lowestCost = Infinity;
      
      for (const key of openSet) {
        const cost = reachable.get(key);
        
        if (cost < lowestCost) {
          lowestCost = cost;
          currentKey = key;
        }
      }
      
      // Remove current from openSet
      openSet.delete(currentKey);
      
      // Get the current cell coordinates
      const [currentX, currentY] = currentKey.split(',').map(Number);
      const currentCell = this.getCell(currentX, currentY);
      const currentCost = reachable.get(currentKey);
      
      // Check neighbors
      const neighbors = this.getNeighbors(currentX, currentY, this.type === GridType.SQUARE);
      
      for (const neighbor of neighbors) {
        // Skip if impassable
        if (!ignoreTerrain && neighbor.isImpassable()) {
          continue;
        }
        
        // Skip if occupied (except the starting cell)
        if (!ignoreOccupants && neighbor.isOccupied() && neighbor !== startCell) {
          continue;
        }
        
        // Calculate movement cost
        const movementCost = this.getMovementCost(currentCell, neighbor, {
          ignoreTerrain,
          ignoreOccupants,
          movementType
        });
        
        // Calculate total cost
        const totalCost = currentCost + movementCost;
        
        // Skip if this path is too long
        if (totalCost > movementRange) {
          continue;
        }
        
        // Check if this is a better path
        const neighborKey = this._getCellKey(neighbor.x, neighbor.y);
        
        if (!reachable.has(neighborKey) || totalCost < reachable.get(neighborKey)) {
          // Record this path
          reachable.set(neighborKey, totalCost);
          
          // Add to open set
          openSet.add(neighborKey);
        }
      }
    }
    
    return reachable;
  }

  /**
   * Check if there is line of sight between two cells
   * @param {number} x1 - The first x coordinate
   * @param {number} y1 - The first y coordinate
   * @param {number} x2 - The second x coordinate
   * @param {number} y2 - The second y coordinate
   * @returns {boolean} True if there is line of sight
   */
  hasLineOfSight(x1, y1, x2, y2) {
    // Get cells in the line
    const line = this.getLine(x1, y1, x2, y2);
    
    // Check if any cell blocks line of sight
    for (let i = 1; i < line.length - 1; i++) {
      const cell = line[i];
      
      if (cell.terrain === TerrainType.COVER_FULL || cell.isImpassable()) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Calculate cover between two cells
   * @param {number} x1 - The first x coordinate
   * @param {number} y1 - The first y coordinate
   * @param {number} x2 - The second x coordinate
   * @param {number} y2 - The second y coordinate
   * @returns {string|null} The cover level or null if no cover
   */
  getCoverBetween(x1, y1, x2, y2) {
    // Get cells in the line
    const line = this.getLine(x1, y1, x2, y2);
    
    // Count cells that provide cover
    let halfCoverCount = 0;
    let threeQuartersCoverCount = 0;
    
    for (let i = 1; i < line.length - 1; i++) {
      const cell = line[i];
      
      if (cell.terrain === TerrainType.COVER_FULL || cell.isImpassable()) {
        // Full cover blocks line of sight
        return 'full';
      } else if (cell.terrain === TerrainType.COVER_THREE_QUARTERS) {
        threeQuartersCoverCount++;
      } else if (cell.terrain === TerrainType.COVER_HALF) {
        halfCoverCount++;
      }
    }
    
    // Determine cover level
    if (threeQuartersCoverCount > 0) {
      return 'threeQuarters';
    } else if (halfCoverCount > 0) {
      return 'half';
    }
    
    return null;
  }

  /**
   * Resize the grid
   * @param {number} width - The new width
   * @param {number} height - The new height
   * @param {boolean} preserveCells - Whether to preserve existing cells
   */
  resize(width, height, preserveCells = true) {
    // Store old cells if preserving
    const oldCells = preserveCells ? new Map(this.cells) : null;
    
    // Update dimensions
    this.width = width;
    this.height = height;
    
    // Clear cells
    this.cells.clear();
    
    // Initialize new cells
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const key = this._getCellKey(x, y);
        
        if (preserveCells && oldCells && oldCells.has(key)) {
          // Preserve existing cell
          this.cells.set(key, oldCells.get(key));
        } else {
          // Create new cell
          this.cells.set(key, new Cell(x, y));
        }
      }
    }
    
    // Notify listeners
    this._notifyListeners('gridResized', { width, height });
  }

  /**
   * Clear the grid
   * @param {boolean} resetTerrain - Whether to reset terrain
   */
  clear(resetTerrain = true) {
    // Reset all cells
    for (const cell of this.cells.values()) {
      // Clear occupants
      cell.occupants.clear();
      
      if (resetTerrain) {
        // Reset terrain
        cell.terrain = TerrainType.NORMAL;
        cell.elevation = 0;
        cell.features.clear();
      }
    }
    
    // Notify listeners
    this._notifyListeners('gridCleared', { resetTerrain });
  }

  /**
   * Add a listener for grid events
   * @param {Function} listener - The listener function
   * @returns {Function} Function to remove the listener
   */
  addListener(listener) {
    if (typeof listener !== 'function') {
      console.error('Listener must be a function');
      return () => {};
    }
    
    this.listeners.push(listener);
    
    // Return a function to remove this listener
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners of an event
   * @param {string} event - The event name
   * @param {Object} data - The event data
   * @private
   */
  _notifyListeners(event, data) {
    this.listeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Error in grid listener:', error);
      }
    });
  }

  /**
   * Convert the grid to an object
   * @returns {Object} The object representation
   */
  toObject() {
    return {
      width: this.width,
      height: this.height,
      type: this.type,
      cellSize: this.cellSize,
      cells: Array.from(this.cells.entries()).map(([key, cell]) => ({
        key,
        cell: cell.toObject()
      }))
    };
  }

  /**
   * Create a grid from an object
   * @param {Object} obj - The object
   * @returns {Grid} The grid
   */
  static fromObject(obj) {
    const grid = new Grid({
      width: obj.width,
      height: obj.height,
      type: obj.type,
      cellSize: obj.cellSize
    });
    
    // Load cells
    if (obj.cells && Array.isArray(obj.cells)) {
      obj.cells.forEach(({ key, cell }) => {
        grid.cells.set(key, Cell.fromObject(cell));
      });
    }
    
    return grid;
  }
}

/**
 * Class representing a combatant on the battlefield
 */
export class Combatant {
  /**
   * Create a combatant
   * @param {Object} data - Combatant data
   */
  constructor(data = {}) {
    this.id = data.id || generateId();
    this.name = data.name || 'Unknown';
    this.type = data.type || 'creature';
    this.size = data.size || SizeCategory.MEDIUM;
    this.position = data.position ? Position.fromObject(data.position) : new Position();
    this.facing = data.facing || 0; // Degrees, 0 = north
    this.speed = data.speed || { walk: 30 };
    this.movementRemaining = { ...this.speed };
    this.reachWeapon = data.reachWeapon || 5;
    this.reachNatural = data.reachNatural || 5;
    this.senses = data.senses || { darkvision: 0, blindsight: 0, tremorsense: 0, truesight: 0 };
    this.isFlying = data.isFlying || false;
    this.isHovering = data.isHovering || false;
    this.isSwimming = data.isSwimming || false;
    this.isBurrowing = data.isBurrowing || false;
    this.isClimbing = data.isClimbing || false;
    this.isGrappled = data.isGrappled || false;
    this.isRestrained = data.isRestrained || false;
    this.isProne = data.isProne || false;
    this.isUnconscious = data.isUnconscious || false;
    this.isInvisible = data.isInvisible || false;
    this.isHidden = data.isHidden || false;
    this.customProperties = data.customProperties || {};
  }

  /**
   * Get the size in cells
   * @returns {number} The size in cells
   */
  getSizeInCells() {
    switch (this.size) {
      case SizeCategory.TINY:
        return 0.5;
      case SizeCategory.SMALL:
      case SizeCategory.MEDIUM:
        return 1;
      case SizeCategory.LARGE:
        return 2;
      case SizeCategory.HUGE:
        return 3;
      case SizeCategory.GARGANTUAN:
        return 4;
      default:
        return 1;
    }
  }

  /**
   * Get the space occupied by the combatant
   * @returns {Array} Array of positions
   */
  getOccupiedSpace() {
    const positions = [];
    const size = this.getSizeInCells();
    
    // For tiny creatures, just return the current position
    if (size <= 0.5) {
      positions.push(this.position.clone());
      return positions;
    }
    
    // For larger creatures, calculate all occupied cells
    const halfSize = Math.floor(size / 2);
    
    for (let y = -halfSize; y < size - halfSize; y++) {
      for (let x = -halfSize; x < size - halfSize; x++) {
        positions.push(new Position(
          this.position.x + x,
          this.position.y + y,
          this.position.z
        ));
      }
    }
    
    return positions;
  }

  /**
   * Move the combatant
   * @param {number} x - The new x coordinate
   * @param {number} y - The new y coordinate
   * @param {number} z - The new z coordinate
   * @param {Object} options - Movement options
   * @returns {boolean} True if the move was successful
   */
  move(x, y, z = this.position.z, options = {}) {
    const {
      consumeMovement = true,
      movementType = this.isFlying ? MovementType.FLY : 
                     this.isSwimming ? MovementType.SWIM : 
                     this.isBurrowing ? MovementType.BURROW : 
                     this.isClimbing ? MovementType.CLIMB : 
                     MovementType.WALK,
      movementCost = null
    } = options;
    
    // Calculate movement cost if not provided
    const cost = movementCost !== null ? movementCost : 
                 Math.abs(x - this.position.x) + 
                 Math.abs(y - this.position.y) + 
                 Math.abs(z - this.position.z);
    
    // Check if we have enough movement
    if (consumeMovement) {
      const movementKey = movementType.toLowerCase();
      
      if (!this.movementRemaining[movementKey] || this.movementRemaining[movementKey] < cost) {
        return false;
      }
      
      // Consume movement
      this.movementRemaining[movementKey] -= cost;
    }
    
    // Update position
    this.position.x = x;
    this.position.y = y;
    this.position.z = z;
    
    return true;
  }

  /**
   * Set the facing direction
   * @param {number} degrees - The facing direction in degrees
   */
  setFacing(degrees) {
    // Normalize to 0-359
    this.facing = ((degrees % 360) + 360) % 360;
  }

  /**
   * Reset movement for a new turn
   */
  resetMovement() {
    this.movementRemaining = { ...this.speed };
  }

  /**
   * Check if the combatant can see another combatant
   * @param {Combatant} other - The other combatant
   * @param {Grid} grid - The grid
   * @returns {boolean} True if the combatant can see the other
   */
  canSee(other, grid) {
    // Check if the other combatant is invisible
    if (other.isInvisible) {
      // Check for special senses
      if (this.senses.truesight > 0) {
        // Truesight can see invisible creatures
        const distance = this.position.distanceTo(other.position);
        return distance <= this.senses.truesight;
      }
      
      if (this.senses.blindsight > 0) {
        // Blindsight can detect invisible creatures
        const distance = this.position.distanceTo(other.position);
        return distance <= this.senses.blindsight;
      }
      
      return false;
    }
    
    // Check if the other combatant is hidden
    if (other.isHidden) {
      // Hidden combatants can't be seen without a perception check
      return false;
    }
    
    // Check line of sight
    if (grid) {
      return grid.hasLineOfSight(
        this.position.x,
        this.position.y,
        other.position.x,
        other.position.y
      );
    }
    
    // Without a grid, assume line of sight
    return true;
  }

  /**
   * Check if the combatant can reach another combatant
   * @param {Combatant} other - The other combatant
   * @param {boolean} useWeaponReach - Whether to use weapon reach
   * @returns {boolean} True if the combatant can reach the other
   */
  canReach(other, useWeaponReach = true) {
    const reach = useWeaponReach ? this.reachWeapon : this.reachNatural;
    const distance = this.position.distanceTo(other.position);
    
    return distance <= reach;
  }

  /**
   * Convert the combatant to an object
   * @returns {Object} The object representation
   */
  toObject() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      size: this.size,
      position: this.position.toObject(),
      facing: this.facing,
      speed: { ...this.speed },
      movementRemaining: { ...this.movementRemaining },
      reachWeapon: this.reachWeapon,
      reachNatural: this.reachNatural,
      senses: { ...this.senses },
      isFlying: this.isFlying,
      isHovering: this.isHovering,
      isSwimming: this.isSwimming,
      isBurrowing: this.isBurrowing,
      isClimbing: this.isClimbing,
      isGrappled: this.isGrappled,
      isRestrained: this.isRestrained,
      isProne: this.isProne,
      isUnconscious: this.isUnconscious,
      isInvisible: this.isInvisible,
      isHidden: this.isHidden,
      customProperties: { ...this.customProperties }
    };
  }

  /**
   * Create a combatant from an object
   * @param {Object} obj - The object
   * @returns {Combatant} The combatant
   */
  static fromObject(obj) {
    return new Combatant(obj);
  }
}

/**
 * Class for managing tactical combat
 */
export class TacticalCombatManager {
  /**
   * Create a tactical combat manager
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      gridType: options.gridType || GridType.SQUARE,
      gridWidth: options.gridWidth || 20,
      gridHeight: options.gridHeight || 20,
      cellSize: options.cellSize || 5,
      ...options
    };
    
    this.grid = new Grid({
      width: this.options.gridWidth,
      height: this.options.gridHeight,
      type: this.options.gridType,
      cellSize: this.options.cellSize
    });
    
    this.combatants = new Map();
    this.listeners = [];
    
    // Initialize grid listener
    this.grid.addListener((event, data) => {
      this._notifyListeners(`grid:${event}`, data);
    });
  }

  /**
   * Add a combatant to the battlefield
   * @param {Combatant|Object} combatant - The combatant to add
   * @param {number} x - The x coordinate
   * @param {number} y - The y coordinate
   * @param {number} z - The z coordinate
   * @returns {Combatant} The added combatant
   */
  addCombatant(combatant, x = 0, y = 0, z = 0) {
    // Convert to Combatant instance if needed
    const combatantInstance = combatant instanceof Combatant ? combatant : new Combatant(combatant);
    
    // Set position
    combatantInstance.position = new Position(x, y, z);
    
    // Add to combatants map
    this.combatants.set(combatantInstance.id, combatantInstance);
    
    // Update grid cells
    this._updateCombatantCells(combatantInstance);
    
    // Notify listeners
    this._notifyListeners('combatantAdded', { combatant: combatantInstance });
    
    return combatantInstance;
  }

  /**
   * Get a combatant by ID
   * @param {string} id - The combatant ID
   * @returns {Combatant|null} The combatant or null if not found
   */
  getCombatant(id) {
    return this.combatants.get(id) || null;
  }

  /**
   * Remove a combatant from the battlefield
   * @param {string} id - The ID of the combatant to remove
   * @returns {boolean} True if the combatant was removed
   */
  removeCombatant(id) {
    const combatant = this.getCombatant(id);
    
    if (!combatant) {
      return false;
    }
    
    // Remove from grid cells
    const occupiedSpace = combatant.getOccupiedSpace();
    
    for (const pos of occupiedSpace) {
      const cell = this.grid.getCell(pos.x, pos.y);
      
      if (cell) {
        cell.removeOccupant(id);
      }
    }
    
    // Remove from combatants map
    this.combatants.delete(id);
    
    // Notify listeners
    this._notifyListeners('combatantRemoved', { combatant });
    
    return true;
  }

    /**
   * Move a combatant
   * @param {string} id - The combatant ID
   * @param {number} x - The new x coordinate
   * @param {number} y - The new y coordinate
   * @param {number} z - The new z coordinate
   * @param {Object} options - Movement options
   * @returns {boolean} True if the move was successful
   */
  moveCombatant(id, x, y, z = null, options = {}) {
    const combatant = this.getCombatant(id);
    
    if (!combatant) {
      return false;
    }
    
    // Check if the move is valid
    if (!this._isValidMove(combatant, x, y, z !== null ? z : combatant.position.z)) {
      return false;
    }
    
    // Remove from current cells
    const oldSpace = combatant.getOccupiedSpace();
    
    for (const pos of oldSpace) {
      const cell = this.grid.getCell(pos.x, pos.y);
      
      if (cell) {
        cell.removeOccupant(id);
      }
    }
    
    // Move the combatant
    const success = combatant.move(x, y, z !== null ? z : combatant.position.z, options);
    
    if (!success) {
      // If move failed, restore old cells
      for (const pos of oldSpace) {
        const cell = this.grid.getCell(pos.x, pos.y);
        
        if (cell) {
          cell.addOccupant(id);
        }
      }
      
      return false;
    }
    
    // Update grid cells
    this._updateCombatantCells(combatant);
    
    // Notify listeners
    this._notifyListeners('combatantMoved', { 
      combatant, 
      from: { x: oldSpace[0].x, y: oldSpace[0].y, z: oldSpace[0].z },
      to: { x, y, z: z !== null ? z : combatant.position.z }
    });
    
    return true;
  }

  /**
   * Check if a move is valid
   * @param {Combatant} combatant - The combatant
   * @param {number} x - The new x coordinate
   * @param {number} y - The new y coordinate
   * @param {number} z - The new z coordinate
   * @returns {boolean} True if the move is valid
   * @private
   */
  _isValidMove(combatant, x, y, z) {
    // Check if the destination is within the grid
    if (x < 0 || x >= this.grid.width || y < 0 || y >= this.grid.height) {
      return false;
    }
    
    // Check if the destination is occupied
    const size = combatant.getSizeInCells();
    const halfSize = Math.floor(size / 2);
    
    for (let dy = -halfSize; dy < size - halfSize; dy++) {
      for (let dx = -halfSize; dx < size - halfSize; dx++) {
        const cell = this.grid.getCell(x + dx, y + dy);
        
        if (!cell) {
          return false;
        }
        
        // Check if cell is impassable
        if (cell.isImpassable()) {
          return false;
        }
        
        // Check if cell is occupied by another combatant
        if (cell.isOccupied()) {
          for (const occupantId of cell.getOccupants()) {
            if (occupantId !== combatant.id) {
              return false;
            }
          }
        }
      }
    }
    
    return true;
  }

  /**
   * Update grid cells for a combatant
   * @param {Combatant} combatant - The combatant
   * @private
   */
  _updateCombatantCells(combatant) {
    const occupiedSpace = combatant.getOccupiedSpace();
    
    for (const pos of occupiedSpace) {
      const cell = this.grid.getCell(pos.x, pos.y);
      
      if (cell) {
        cell.addOccupant(combatant.id);
      }
    }
  }

  /**
   * Find a path for a combatant
   * @param {string} id - The combatant ID
   * @param {number} targetX - The target x coordinate
   * @param {number} targetY - The target y coordinate
   * @param {Object} options - Pathfinding options
   * @returns {Array|null} Array of cells in the path or null if no path found
   */
  findPath(id, targetX, targetY, options = {}) {
    const combatant = this.getCombatant(id);
    
    if (!combatant) {
      return null;
    }
    
    // Determine movement type
    const movementType = options.movementType || 
                         (combatant.isFlying ? MovementType.FLY : 
                          combatant.isSwimming ? MovementType.SWIM : 
                          combatant.isBurrowing ? MovementType.BURROW : 
                          combatant.isClimbing ? MovementType.CLIMB : 
                          MovementType.WALK);
    
    // Determine maximum distance
    const maxDistance = options.maxDistance || 
                        (combatant.movementRemaining[movementType.toLowerCase()] || 
                         combatant.speed[movementType.toLowerCase()] || 
                         30);
    
    // Find path
    return this.grid.findPath(
      combatant.position.x,
      combatant.position.y,
      targetX,
      targetY,
      {
        ignoreTerrain: options.ignoreTerrain || false,
        ignoreOccupants: options.ignoreOccupants || false,
        maxDistance,
        movementType
      }
    );
  }

  /**
   * Move a combatant along a path
   * @param {string} id - The combatant ID
   * @param {Array} path - The path to follow
   * @param {Object} options - Movement options
   * @returns {boolean} True if the move was successful
   */
  moveAlongPath(id, path, options = {}) {
    const combatant = this.getCombatant(id);
    
    if (!combatant || !path || path.length < 2) {
      return false;
    }
    
    // Get the destination (last cell in the path)
    const destination = path[path.length - 1];
    
    // Move the combatant
    return this.moveCombatant(
      id,
      destination.x,
      destination.y,
      options.z !== undefined ? options.z : combatant.position.z,
      options
    );
  }

  /**
   * Get cells reachable by a combatant
   * @param {string} id - The combatant ID
   * @param {Object} options - Movement options
   * @returns {Object} Map of reachable cells with movement costs
   */
  getReachableCells(id, options = {}) {
    const combatant = this.getCombatant(id);
    
    if (!combatant) {
      return new Map();
    }
    
    // Determine movement type
    const movementType = options.movementType || 
                         (combatant.isFlying ? MovementType.FLY : 
                          combatant.isSwimming ? MovementType.SWIM : 
                          combatant.isBurrowing ? MovementType.BURROW : 
                          combatant.isClimbing ? MovementType.CLIMB : 
                          MovementType.WALK);
    
    // Determine movement range
    const movementRange = options.movementRange || 
                          (combatant.movementRemaining[movementType.toLowerCase()] || 
                           combatant.speed[movementType.toLowerCase()] || 
                           30);
    
    // Get reachable cells
    return this.grid.getReachableCells(
      combatant.position.x,
      combatant.position.y,
      movementRange,
      {
        ignoreTerrain: options.ignoreTerrain || false,
        ignoreOccupants: options.ignoreOccupants || false,
        movementType
      }
    );
  }

  /**
   * Check if a combatant can see another combatant
   * @param {string} observerId - The observer combatant ID
   * @param {string} targetId - The target combatant ID
   * @returns {boolean} True if the observer can see the target
   */
  canSee(observerId, targetId) {
    const observer = this.getCombatant(observerId);
    const target = this.getCombatant(targetId);
    
    if (!observer || !target) {
      return false;
    }
    
    return observer.canSee(target, this.grid);
  }

  /**
   * Check if a combatant can reach another combatant
   * @param {string} attackerId - The attacker combatant ID
   * @param {string} targetId - The target combatant ID
   * @param {boolean} useWeaponReach - Whether to use weapon reach
   * @returns {boolean} True if the attacker can reach the target
   */
  canReach(attackerId, targetId, useWeaponReach = true) {
    const attacker = this.getCombatant(attackerId);
    const target = this.getCombatant(targetId);
    
    if (!attacker || !target) {
      return false;
    }
    
    return attacker.canReach(target, useWeaponReach);
  }

  /**
   * Get combatants within a certain range of a position
   * @param {number} x - The x coordinate
   * @param {number} y - The y coordinate
   * @param {number} range - The range in feet
   * @returns {Array} Array of combatants within range
   */
  getCombatantsWithinRange(x, y, range) {
    const rangeInCells = range / this.grid.cellSize;
    const result = [];
    
    for (const combatant of this.combatants.values()) {
      const distance = Math.sqrt(
        Math.pow(combatant.position.x - x, 2) + 
        Math.pow(combatant.position.y - y, 2)
      );
      
      if (distance <= rangeInCells) {
        result.push(combatant);
      }
    }
    
    return result;
  }

  /**
   * Get combatants within a certain range of a combatant
   * @param {string} id - The combatant ID
   * @param {number} range - The range in feet
   * @returns {Array} Array of combatants within range
   */
  getCombatantsWithinRangeOfCombatant(id, range) {
    const combatant = this.getCombatant(id);
    
    if (!combatant) {
      return [];
    }
    
    return this.getCombatantsWithinRange(
      combatant.position.x,
      combatant.position.y,
      range
    ).filter(c => c.id !== id);
  }

  /**
   * Get combatants affected by an area effect
   * @param {string} areaType - The area type (circle, cone, line, etc.)
   * @param {Object} areaParams - The area parameters
   * @returns {Array} Array of affected combatants
   */
  getCombatantsInArea(areaType, areaParams) {
    let cells = [];
    
    // Get cells in the area
    switch (areaType) {
      case 'circle':
        cells = this.grid.getCircle(
          areaParams.x,
          areaParams.y,
          areaParams.radius / this.grid.cellSize
        );
        break;
      case 'cone':
        cells = this.grid.getCone(
          areaParams.x,
          areaParams.y,
          areaParams.length / this.grid.cellSize,
          areaParams.direction,
          areaParams.angle
        );
        break;
      case 'line':
        cells = this.grid.getLine(
          areaParams.startX,
          areaParams.startY,
          areaParams.endX,
          areaParams.endY
        );
        break;
      case 'rectangle':
        cells = this.grid.getRectangle(
          areaParams.x,
          areaParams.y,
          areaParams.width / this.grid.cellSize,
          areaParams.height / this.grid.cellSize
        );
        break;
      default:
        return [];
    }
    
    // Get unique combatants in the cells
    const combatantIds = new Set();
    
    for (const cell of cells) {
      for (const occupantId of cell.getOccupants()) {
        combatantIds.add(occupantId);
      }
    }
    
    // Convert IDs to combatants
    return Array.from(combatantIds)
      .map(id => this.getCombatant(id))
      .filter(Boolean);
  }

  /**
   * Reset movement for all combatants
   */
  resetMovement() {
    for (const combatant of this.combatants.values()) {
      combatant.resetMovement();
    }
    
    // Notify listeners
    this._notifyListeners('movementReset', {});
  }

  /**
   * Set terrain for a cell
   * @param {number} x - The x coordinate
   * @param {number} y - The y coordinate
   * @param {string} terrain - The terrain type
   * @returns {boolean} True if the terrain was set
   */
  setTerrain(x, y, terrain) {
    const cell = this.grid.getCell(x, y);
    
    if (!cell) {
      return false;
    }
    
    cell.setTerrain(terrain);
    
    // Notify listeners
    this._notifyListeners('terrainChanged', { x, y, terrain });
    
    return true;
  }

  /**
   * Set elevation for a cell
   * @param {number} x - The x coordinate
   * @param {number} y - The y coordinate
   * @param {number} elevation - The elevation
   * @returns {boolean} True if the elevation was set
   */
  setElevation(x, y, elevation) {
    const cell = this.grid.getCell(x, y);
    
    if (!cell) {
      return false;
    }
    
    cell.setElevation(elevation);
    
    // Notify listeners
    this._notifyListeners('elevationChanged', { x, y, elevation });
    
    return true;
  }

  /**
   * Add a feature to a cell
   * @param {number} x - The x coordinate
   * @param {number} y - The y coordinate
   * @param {string} feature - The feature to add
   * @returns {boolean} True if the feature was added
   */
  addFeature(x, y, feature) {
    const cell = this.grid.getCell(x, y);
    
    if (!cell) {
      return false;
    }
    
    cell.addFeature(feature);
    
    // Notify listeners
    this._notifyListeners('featureAdded', { x, y, feature });
    
    return true;
  }

  /**
   * Remove a feature from a cell
   * @param {number} x - The x coordinate
   * @param {number} y - The y coordinate
   * @param {string} feature - The feature to remove
   * @returns {boolean} True if the feature was removed
   */
  removeFeature(x, y, feature) {
    const cell = this.grid.getCell(x, y);
    
    if (!cell) {
      return false;
    }
    
    const removed = cell.removeFeature(feature);
    
    if (removed) {
      // Notify listeners
      this._notifyListeners('featureRemoved', { x, y, feature });
    }
    
    return removed;
  }

  /**
   * Set the light level for a cell
   * @param {number} x - The x coordinate
   * @param {number} y - The y coordinate
   * @param {string} light - The light level
   * @returns {boolean} True if the light level was set
   */
  setLight(x, y, light) {
    const cell = this.grid.getCell(x, y);
    
    if (!cell) {
      return false;
    }
    
    cell.setLight(light);
    
    // Notify listeners
    this._notifyListeners('lightChanged', { x, y, light });
    
    return true;
  }

  /**
   * Set visibility for a cell
   * @param {number} x - The x coordinate
   * @param {number} y - The y coordinate
   * @param {boolean} visible - Whether the cell is visible
   * @returns {boolean} True if the visibility was set
   */
  setVisibility(x, y, visible) {
    const cell = this.grid.getCell(x, y);
    
    if (!cell) {
      return false;
    }
    
    cell.setVisible(visible);
    
    // Notify listeners
    this._notifyListeners('visibilityChanged', { x, y, visible });
    
    return true;
  }

  /**
   * Calculate line of sight for a combatant
   * @param {string} id - The combatant ID
   * @param {number} range - The sight range in feet
   * @returns {Array} Array of visible cells
   */
  calculateLineOfSight(id, range = null) {
    const combatant = this.getCombatant(id);
    
    if (!combatant) {
      return [];
    }
    
    // Determine sight range
    let sightRange = range;
    
    if (sightRange === null) {
      // Use the combatant's senses
      if (combatant.senses.darkvision > 0) {
        sightRange = combatant.senses.darkvision;
      } else if (combatant.senses.blindsight > 0) {
        sightRange = combatant.senses.blindsight;
      } else if (combatant.senses.tremorsense > 0) {
        sightRange = combatant.senses.tremorsense;
      } else if (combatant.senses.truesight > 0) {
        sightRange = combatant.senses.truesight;
      } else {
        // Default to 60 feet
        sightRange = 60;
      }
    }
    
    // Convert range to cells
    const rangeInCells = sightRange / this.grid.cellSize;
    
    // Get cells within range
    const cellsInRange = this.grid.getCircle(
      combatant.position.x,
      combatant.position.y,
      rangeInCells
    );
    
    // Check line of sight for each cell
    const visibleCells = [];
    
    for (const cell of cellsInRange) {
      if (this.grid.hasLineOfSight(
        combatant.position.x,
        combatant.position.y,
        cell.x,
        cell.y
      )) {
        visibleCells.push(cell);
      }
    }
    
    return visibleCells;
  }

  /**
   * Update visibility based on a combatant's line of sight
   * @param {string} id - The combatant ID
   * @param {number} range - The sight range in feet
   * @param {boolean} revealExplored - Whether to mark cells as explored
   * @returns {boolean} True if visibility was updated
   */
  updateVisibility(id, range = null, revealExplored = true) {
    const visibleCells = this.calculateLineOfSight(id, range);
    
    if (visibleCells.length === 0) {
      return false;
    }
    
    // Hide all cells first
    for (let y = 0; y < this.grid.height; y++) {
      for (let x = 0; x < this.grid.width; x++) {
        const cell = this.grid.getCell(x, y);
        
        if (cell) {
          cell.setVisible(false);
        }
      }
    }
    
    // Show visible cells
    for (const cell of visibleCells) {
      cell.setVisible(true);
      
      if (revealExplored) {
        cell.setExplored(true);
      }
    }
    
    // Notify listeners
    this._notifyListeners('visibilityUpdated', { combatantId: id });
    
    return true;
  }

  /**
   * Resize the battlefield
   * @param {number} width - The new width
   * @param {number} height - The new height
   * @param {boolean} preserveCells - Whether to preserve existing cells
   */
  resize(width, height, preserveCells = true) {
    this.grid.resize(width, height, preserveCells);
    
    // Update options
    this.options.gridWidth = width;
    this.options.gridHeight = height;
    
    // Notify listeners
    this._notifyListeners('battlefieldResized', { width, height });
  }

  /**
   * Clear the battlefield
   * @param {boolean} removeCombatants - Whether to remove combatants
   * @param {boolean} resetTerrain - Whether to reset terrain
   */
  clear(removeCombatants = true, resetTerrain = true) {
    // Clear the grid
    this.grid.clear(resetTerrain);
    
    // Remove combatants if requested
    if (removeCombatants) {
      this.combatants.clear();
    }
    
    // Notify listeners
    this._notifyListeners('battlefieldCleared', { removeCombatants, resetTerrain });
  }

  /**
   * Add a listener for tactical combat events
   * @param {Function} listener - The listener function
   * @returns {Function} Function to remove the listener
   */
  addListener(listener) {
    if (typeof listener !== 'function') {
      console.error('Listener must be a function');
      return () => {};
    }
    
    this.listeners.push(listener);
    
    // Return a function to remove this listener
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners of an event
   * @param {string} event - The event name
   * @param {Object} data - The event data
   * @private
   */
  _notifyListeners(event, data) {
    this.listeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Error in tactical combat manager listener:', error);
      }
    });
  }

  /**
   * Convert the tactical combat manager to an object
   * @returns {Object} The object representation
   */
  toObject() {
    return {
      options: { ...this.options },
      grid: this.grid.toObject(),
      combatants: Array.from(this.combatants.values()).map(combatant => combatant.toObject())
    };
  }

  /**
   * Create a tactical combat manager from an object
   * @param {Object} obj - The object
   * @returns {TacticalCombatManager} The tactical combat manager
   */
  static fromObject(obj) {
    const manager = new TacticalCombatManager(obj.options || {});
    
    // Load grid
    if (obj.grid) {
      manager.grid = Grid.fromObject(obj.grid);
    }
    
    // Load combatants
    if (obj.combatants && Array.isArray(obj.combatants)) {
      obj.combatants.forEach(combatantData => {
        const combatant = Combatant.fromObject(combatantData);
        manager.combatants.set(combatant.id, combatant);
        manager._updateCombatantCells(combatant);
      });
    }
    
    return manager;
  }
}

/**
 * Generate a unique ID
 * @returns {string} A unique ID
 */
function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Create a position
 * @param {number} x - The x coordinate
 * @param {number} y - The y coordinate
 * @param {number} z - The z coordinate
 * @returns {Position} A new position instance
 */
export function createPosition(x = 0, y = 0, z = 0) {
  return new Position(x, y, z);
}

/**
 * Create a cell
 * @param {number} x - The x coordinate
 * @param {number} y - The y coordinate
 * @param {Object} options - Cell options
 * @returns {Cell} A new cell instance
 */
export function createCell(x, y, options = {}) {
  return new Cell(x, y, options);
}

/**
 * Create a grid
 * @param {Object} options - Grid options
 * @returns {Grid} A new grid instance
 */
export function createGrid(options = {}) {
  return new Grid(options);
}

/**
 * Create a combatant
 * @param {Object} data - Combatant data
 * @returns {Combatant} A new combatant instance
 */
export function createCombatant(data = {}) {
  return new Combatant(data);
}

/**
 * Create a tactical combat manager
 * @param {Object} options - Configuration options
 * @returns {TacticalCombatManager} A new tactical combat manager instance
 */
export function createTacticalCombatManager(options = {}) {
  return new TacticalCombatManager(options);
}

// Export the main tactical functions and classes
export default {
  createPosition,
  createCell,
  createGrid,
  createCombatant,
  createTacticalCombatManager,
  GridType,
  TerrainType,
  MovementType,
  DirectionType,
  SizeCategory
};
