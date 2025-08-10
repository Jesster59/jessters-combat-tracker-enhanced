/**
 * Jesster's Combat Tracker
 * Image Generator Module
 * Version 2.3.1
 * 
 * This module handles generating images for various elements in the application,
 * such as character portraits, monster tokens, maps, and other visual assets.
 */

/**
 * Available image generation methods
 */
export const GenerationMethod = {
  INITIALS: 'initials',
  SILHOUETTE: 'silhouette',
  PATTERN: 'pattern',
  GRADIENT: 'gradient',
  MONSTER_TYPE: 'monster_type',
  PROCEDURAL: 'procedural',
  AI: 'ai'
};

/**
 * Available image styles for AI generation
 */
export const ImageStyle = {
  FANTASY: 'fantasy',
  REALISTIC: 'realistic',
  PIXEL_ART: 'pixel_art',
  COMIC: 'comic',
  WATERCOLOR: 'watercolor',
  SKETCH: 'sketch'
};

/**
 * Default configuration for image generation
 */
const DEFAULT_CONFIG = {
  size: 256,
  format: 'png',
  quality: 0.9,
  backgroundColor: '#3e4a61',
  textColor: '#ffffff',
  font: 'Arial, sans-serif',
  method: GenerationMethod.INITIALS,
  style: ImageStyle.FANTASY,
  seed: null,
  aiEndpoint: null,
  aiApiKey: null
};

/**
 * Generate an image based on the provided parameters
 * @param {Object} params - Parameters for image generation
 * @returns {Promise<string>} A promise that resolves to the generated image as a data URL
 */
export async function generateImage(params = {}) {
  // Merge default config with provided params
  const config = { ...DEFAULT_CONFIG, ...params };
  
  // Select generation method
  switch (config.method) {
    case GenerationMethod.INITIALS:
      return generateInitialsImage(config);
    case GenerationMethod.SILHOUETTE:
      return generateSilhouetteImage(config);
    case GenerationMethod.PATTERN:
      return generatePatternImage(config);
    case GenerationMethod.GRADIENT:
      return generateGradientImage(config);
    case GenerationMethod.MONSTER_TYPE:
      return generateMonsterTypeImage(config);
    case GenerationMethod.PROCEDURAL:
      return generateProceduralImage(config);
    case GenerationMethod.AI:
      return generateAIImage(config);
    default:
      return generateInitialsImage(config);
  }
}

/**
 * Generate an image with initials
 * @param {Object} config - Configuration for image generation
 * @returns {Promise<string>} A promise that resolves to the generated image as a data URL
 */
async function generateInitialsImage(config) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = config.size;
    canvas.height = config.size;
    
    const ctx = canvas.getContext('2d');
    
    // Draw background
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, config.size, config.size);
    
    // Get initials from name
    const name = config.name || 'Unknown';
    const initials = getInitials(name);
    
    // Draw initials
    ctx.fillStyle = config.textColor;
    ctx.font = `bold ${config.size / 2}px ${config.font}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, config.size / 2, config.size / 2);
    
    // Convert to data URL
    const dataUrl = canvas.toDataURL(`image/${config.format}`, config.quality);
    resolve(dataUrl);
  });
}

/**
 * Generate a silhouette image based on entity type
 * @param {Object} config - Configuration for image generation
 * @returns {Promise<string>} A promise that resolves to the generated image as a data URL
 */
async function generateSilhouetteImage(config) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = config.size;
    canvas.height = config.size;
    
    const ctx = canvas.getContext('2d');
    
    // Draw background
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, config.size, config.size);
    
    // Determine silhouette type
    const type = config.entityType || 'generic';
    
    // Draw silhouette based on type
    ctx.fillStyle = config.textColor;
    
    const centerX = config.size / 2;
    const centerY = config.size / 2;
    
    switch (type.toLowerCase()) {
      case 'player':
      case 'humanoid':
        drawHumanoidSilhouette(ctx, centerX, centerY, config.size);
        break;
      case 'monster':
      case 'beast':
        drawBeastSilhouette(ctx, centerX, centerY, config.size);
        break;
      case 'dragon':
        drawDragonSilhouette(ctx, centerX, centerY, config.size);
        break;
      case 'undead':
        drawUndeadSilhouette(ctx, centerX, centerY, config.size);
        break;
      case 'construct':
        drawConstructSilhouette(ctx, centerX, centerY, config.size);
        break;
      case 'celestial':
      case 'fiend':
        drawCelestialSilhouette(ctx, centerX, centerY, config.size);
        break;
      default:
        drawGenericSilhouette(ctx, centerX, centerY, config.size);
    }
    
    // Convert to data URL
    const dataUrl = canvas.toDataURL(`image/${config.format}`, config.quality);
    resolve(dataUrl);
  });
}

/**
 * Generate a pattern-based image
 * @param {Object} config - Configuration for image generation
 * @returns {Promise<string>} A promise that resolves to the generated image as a data URL
 */
async function generatePatternImage(config) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = config.size;
    canvas.height = config.size;
    
    const ctx = canvas.getContext('2d');
    
    // Draw background
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, config.size, config.size);
    
    // Determine pattern type
    const patternType = config.patternType || 'dots';
    
    // Generate a seed if not provided
    const seed = config.seed || Math.floor(Math.random() * 10000);
    const rng = createSeededRandom(seed);
    
    // Draw pattern
    ctx.fillStyle = config.textColor;
    
    switch (patternType) {
      case 'dots':
        drawDotsPattern(ctx, config.size, rng);
        break;
      case 'lines':
        drawLinesPattern(ctx, config.size, rng);
        break;
      case 'grid':
        drawGridPattern(ctx, config.size, rng);
        break;
      case 'triangles':
        drawTrianglesPattern(ctx, config.size, rng);
        break;
      case 'hexagons':
        drawHexagonsPattern(ctx, config.size, rng);
        break;
      default:
        drawDotsPattern(ctx, config.size, rng);
    }
    
    // Convert to data URL
    const dataUrl = canvas.toDataURL(`image/${config.format}`, config.quality);
    resolve(dataUrl);
  });
}

/**
 * Generate a gradient image
 * @param {Object} config - Configuration for image generation
 * @returns {Promise<string>} A promise that resolves to the generated image as a data URL
 */
async function generateGradientImage(config) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = config.size;
    canvas.height = config.size;
    
    const ctx = canvas.getContext('2d');
    
    // Determine gradient type
    const gradientType = config.gradientType || 'linear';
    
    // Determine colors
    const startColor = config.startColor || config.backgroundColor;
    const endColor = config.endColor || config.textColor;
    
    // Generate a seed if not provided
    const seed = config.seed || Math.floor(Math.random() * 10000);
    const rng = createSeededRandom(seed);
    
    // Create gradient
    let gradient;
    
    switch (gradientType) {
      case 'linear':
        // Random angle
        const angle = rng() * Math.PI * 2;
        const startX = config.size / 2 + Math.cos(angle) * config.size;
        const startY = config.size / 2 + Math.sin(angle) * config.size;
        const endX = config.size / 2 + Math.cos(angle + Math.PI) * config.size;
        const endY = config.size / 2 + Math.sin(angle + Math.PI) * config.size;
        
        gradient = ctx.createLinearGradient(startX, startY, endX, endY);
        break;
      case 'radial':
        gradient = ctx.createRadialGradient(
          config.size / 2, config.size / 2, 0,
          config.size / 2, config.size / 2, config.size / 2
        );
        break;
      default:
        gradient = ctx.createLinearGradient(0, 0, config.size, config.size);
    }
    
    gradient.addColorStop(0, startColor);
    gradient.addColorStop(1, endColor);
    
    // Draw gradient
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, config.size, config.size);
    
    // Add some noise for texture
    if (config.addNoise) {
      addNoiseTexture(ctx, config.size, config.noiseOpacity || 0.1, rng);
    }
    
    // Convert to data URL
    const dataUrl = canvas.toDataURL(`image/${config.format}`, config.quality);
    resolve(dataUrl);
  });
}

/**
 * Generate an image based on monster type
 * @param {Object} config - Configuration for image generation
 * @returns {Promise<string>} A promise that resolves to the generated image as a data URL
 */
async function generateMonsterTypeImage(config) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = config.size;
    canvas.height = config.size;
    
    const ctx = canvas.getContext('2d');
    
    // Draw background
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, config.size, config.size);
    
    // Determine monster type
    const monsterType = config.monsterType || 'unknown';
    
    // Generate a seed if not provided
    const seed = config.seed || Math.floor(Math.random() * 10000);
    const rng = createSeededRandom(seed);
    
    // Get color for monster type
    const typeColor = getMonsterTypeColor(monsterType);
    ctx.fillStyle = typeColor;
    
    // Draw monster type symbol
    const centerX = config.size / 2;
    const centerY = config.size / 2;
    const symbolSize = config.size * 0.6;
    
    drawMonsterTypeSymbol(ctx, monsterType, centerX, centerY, symbolSize, rng);
    
    // Add monster initials or name
    if (config.name) {
      const initials = getInitials(config.name);
      
      ctx.fillStyle = config.textColor;
      ctx.font = `bold ${config.size / 4}px ${config.font}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(initials, config.size / 2, config.size - 10);
    }
    
    // Convert to data URL
    const dataUrl = canvas.toDataURL(`image/${config.format}`, config.quality);
    resolve(dataUrl);
  });
}

/**
 * Generate a procedurally generated creature image
 * @param {Object} config - Configuration for image generation
 * @returns {Promise<string>} A promise that resolves to the generated image as a data URL
 */
async function generateProceduralImage(config) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = config.size;
    canvas.height = config.size;
    
    const ctx = canvas.getContext('2d');
    
    // Draw background
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, config.size, config.size);
    
    // Generate a seed if not provided
    const seed = config.seed || Math.floor(Math.random() * 10000);
    const rng = createSeededRandom(seed);
    
    // Determine creature type and size
    const creatureType = config.creatureType || 'random';
    const creatureSize = config.creatureSize || 'medium';
    
    // Generate procedural creature
    drawProceduralCreature(ctx, creatureType, creatureSize, config.size, rng);
    
    // Convert to data URL
    const dataUrl = canvas.toDataURL(`image/${config.format}`, config.quality);
    resolve(dataUrl);
  });
}

/**
 * Generate an image using AI
 * @param {Object} config - Configuration for image generation
 * @returns {Promise<string>} A promise that resolves to the generated image as a data URL
 */
async function generateAIImage(config) {
  // Check if AI endpoint and API key are provided
  if (!config.aiEndpoint || !config.aiApiKey) {
    console.warn('AI image generation requires an endpoint and API key');
    // Fall back to procedural generation
    return generateProceduralImage(config);
  }
  
  try {
    // Create prompt based on entity details
    const prompt = createImagePrompt(config);
    
    // Call AI image generation API
    const response = await fetch(config.aiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.aiApiKey}`
      },
      body: JSON.stringify({
        prompt: prompt,
        size: `${config.size}x${config.size}`,
        n: 1,
        response_format: 'b64_json',
        style: config.style.toLowerCase()
      })
    });
    
    if (!response.ok) {
      throw new Error(`AI API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Check if we got a valid response with an image
    if (data && data.data && data.data[0] && data.data[0].b64_json) {
      return `data:image/${config.format};base64,${data.data[0].b64_json}`;
    } else {
      throw new Error('Invalid response from AI API');
    }
  } catch (error) {
    console.error('Error generating AI image:', error);
    // Fall back to procedural generation
    return generateProceduralImage(config);
  }
}

/**
 * Create an image prompt for AI generation
 * @param {Object} config - Configuration for image generation
 * @returns {string} The generated prompt
 */
function createImagePrompt(config) {
  let prompt = '';
  
  // Add entity type and name
  if (config.entityType === 'player') {
    prompt += `Fantasy character portrait of ${config.name || 'an adventurer'}`;
    
    // Add race and class if available
    if (config.race) {
      prompt += `, ${config.race}`;
    }
    
    if (config.class) {
      prompt += ` ${config.class}`;
    }
  } else if (config.entityType === 'monster') {
    prompt += `Fantasy monster illustration of ${config.name || 'a creature'}`;
    
    // Add monster type and size if available
    if (config.monsterType) {
      prompt += `, ${config.monsterType}`;
    }
    
    if (config.monsterSize) {
      prompt += ` of ${config.monsterSize} size`;
    }
  } else {
    prompt += `Fantasy illustration of ${config.name || 'a being'}`;
  }
  
  // Add style information
  switch (config.style) {
    case ImageStyle.REALISTIC:
      prompt += ', photorealistic, detailed, high quality';
      break;
    case ImageStyle.PIXEL_ART:
      prompt += ', pixel art style, 16-bit, retro game art';
      break;
    case ImageStyle.COMIC:
      prompt += ', comic book style, bold lines, vibrant colors';
      break;
    case ImageStyle.WATERCOLOR:
      prompt += ', watercolor painting style, soft edges, artistic';
      break;
    case ImageStyle.SKETCH:
      prompt += ', pencil sketch, hand-drawn, black and white';
      break;
    case ImageStyle.FANTASY:
    default:
      prompt += ', fantasy art style, detailed, vibrant';
      break;
  }
  
  // Add token/portrait specification
  prompt += ', centered composition, suitable as a character token';
  
  // Add any additional details
  if (config.additionalDetails) {
    prompt += `, ${config.additionalDetails}`;
  }
  
  return prompt;
}

/**
 * Get initials from a name
 * @param {string} name - The name to get initials from
 * @returns {string} The initials
 */
function getInitials(name) {
  if (!name) return '?';
  
  const words = name.trim().split(/\s+/);
  
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  } else {
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  }
}

/**
 * Create a seeded random number generator
 * @param {number} seed - The seed for the random number generator
 * @returns {Function} A function that returns a random number between 0 and 1
 */
function createSeededRandom(seed) {
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

/**
 * Get a color for a monster type
 * @param {string} monsterType - The type of monster
 * @returns {string} A color hex code
 */
function getMonsterTypeColor(monsterType) {
  const typeColors = {
    aberration: '#9932CC', // Dark Orchid
    beast: '#8B4513', // Saddle Brown
    celestial: '#FFD700', // Gold
    construct: '#708090', // Slate Gray
    dragon: '#FF4500', // Orange Red
    elemental: '#00FFFF', // Cyan
    fey: '#FF69B4', // Hot Pink
    fiend: '#8B0000', // Dark Red
    giant: '#A52A2A', // Brown
    humanoid: '#4682B4', // Steel Blue
    monstrosity: '#9ACD32', // Yellow Green
    ooze: '#7CFC00', // Lawn Green
    plant: '#228B22', // Forest Green
    undead: '#483D8B' // Dark Slate Blue
  };
  
  return typeColors[monsterType.toLowerCase()] || '#808080'; // Default to gray
}

/**
 * Draw a humanoid silhouette
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} x - The center x coordinate
 * @param {number} y - The center y coordinate
 * @param {number} size - The size of the canvas
 */
function drawHumanoidSilhouette(ctx, x, y, size) {
  const scale = size / 100;
  
  // Head
  ctx.beginPath();
  ctx.arc(x, y - 30 * scale, 15 * scale, 0, Math.PI * 2);
  ctx.fill();
  
  // Body
  ctx.beginPath();
  ctx.moveTo(x, y - 15 * scale);
  ctx.lineTo(x, y + 15 * scale);
  ctx.lineWidth = 10 * scale;
  ctx.stroke();
  
  // Arms
  ctx.beginPath();
  ctx.moveTo(x - 15 * scale, y - 5 * scale);
  ctx.lineTo(x + 15 * scale, y - 5 * scale);
  ctx.lineWidth = 5 * scale;
  ctx.stroke();
  
  // Legs
  ctx.beginPath();
  ctx.moveTo(x, y + 15 * scale);
  ctx.lineTo(x - 10 * scale, y + 40 * scale);
  ctx.moveTo(x, y + 15 * scale);
  ctx.lineTo(x + 10 * scale, y + 40 * scale);
  ctx.lineWidth = 5 * scale;
  ctx.stroke();
}

/**
 * Draw a beast silhouette
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} x - The center x coordinate
 * @param {number} y - The center y coordinate
 * @param {number} size - The size of the canvas
 */
function drawBeastSilhouette(ctx, x, y, size) {
  const scale = size / 100;
  
  // Body
  ctx.beginPath();
  ctx.ellipse(x, y, 30 * scale, 15 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Head
  ctx.beginPath();
  ctx.ellipse(x + 25 * scale, y, 12 * scale, 8 * scale, 0.3, 0, Math.PI * 2);
  ctx.fill();
  
  // Tail
  ctx.beginPath();
  ctx.moveTo(x - 30 * scale, y);
  ctx.quadraticCurveTo(x - 40 * scale, y - 20 * scale, x - 45 * scale, y - 5 * scale);
  ctx.lineWidth = 5 * scale;
  ctx.stroke();
  
  // Legs
  ctx.beginPath();
  ctx.moveTo(x - 20 * scale, y + 15 * scale);
  ctx.lineTo(x - 20 * scale, y + 30 * scale);
  ctx.moveTo(x - 5 * scale, y + 15 * scale);
  ctx.lineTo(x - 5 * scale, y + 30 * scale);
  ctx.moveTo(x + 10 * scale, y + 15 * scale);
  ctx.lineTo(x + 10 * scale, y + 30 * scale);
  ctx.moveTo(x + 25 * scale, y + 15 * scale);
  ctx.lineTo(x + 25 * scale, y + 30 * scale);
  ctx.lineWidth = 5 * scale;
  ctx.stroke();
}

/**
 * Draw a dragon silhouette
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} x - The center x coordinate
 * @param {number} y - The center y coordinate
 * @param {number} size - The size of the canvas
 */
function drawDragonSilhouette(ctx, x, y, size) {
  const scale = size / 100;
  
  // Body
  ctx.beginPath();
  ctx.ellipse(x, y, 25 * scale, 15 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Head and neck
  ctx.beginPath();
  ctx.moveTo(x + 20 * scale, y - 5 * scale);
  ctx.quadraticCurveTo(x + 30 * scale, y - 25 * scale, x + 40 * scale, y - 15 * scale);
  ctx.quadraticCurveTo(x + 45 * scale, y - 10 * scale, x + 40 * scale, y - 5 * scale);
  ctx.closePath();
  ctx.fill();
  
  // Wings
  ctx.beginPath();
  ctx.moveTo(x, y - 15 * scale);
  ctx.quadraticCurveTo(x - 10 * scale, y - 40 * scale, x - 30 * scale, y - 30 * scale);
  ctx.lineTo(x - 10 * scale, y - 10 * scale);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(x, y - 15 * scale);
  ctx.quadraticCurveTo(x + 10 * scale, y - 40 * scale, x + 30 * scale, y - 30 * scale);
  ctx.lineTo(x + 10 * scale, y - 10 * scale);
  ctx.closePath();
  ctx.fill();
  
  // Tail
  ctx.beginPath();
  ctx.moveTo(x - 25 * scale, y);
  ctx.quadraticCurveTo(x - 40 * scale, y, x - 45 * scale, y + 15 * scale);
  ctx.lineWidth = 5 * scale;
  ctx.stroke();
  
  // Legs
  ctx.beginPath();
  ctx.moveTo(x - 15 * scale, y + 15 * scale);
  ctx.lineTo(x - 15 * scale, y + 30 * scale);
  ctx.moveTo(x + 15 * scale, y + 15 * scale);
  ctx.lineTo(x + 15 * scale, y + 30 * scale);
  ctx.lineWidth = 5 * scale;
  ctx.stroke();
}

/**
 * Draw an undead silhouette
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} x - The center x coordinate
 * @param {number} y - The center y coordinate
 * @param {number} size - The size of the canvas
 */
function drawUndeadSilhouette(ctx, x, y, size) {
  const scale = size / 100;
  
  // Skull
  ctx.beginPath();
  ctx.arc(x, y - 30 * scale, 15 * scale, 0, Math.PI * 2);
  ctx.fill();
  
  // Eye sockets
  ctx.fillStyle = config.backgroundColor;
  ctx.beginPath();
  ctx.arc(x - 5 * scale, y - 30 * scale, 3 * scale, 0, Math.PI * 2);
  ctx.arc(x + 5 * scale, y - 30 * scale, 3 * scale, 0, Math.PI * 2);
  ctx.fill();
  
  // Reset fill style
  ctx.fillStyle = config.textColor;
  
  // Ribcage
  ctx.beginPath();
  ctx.moveTo(x, y - 15 * scale);
  ctx.lineTo(x, y + 15 * scale);
  ctx.lineWidth = 3 * scale;
  ctx.stroke();
  
  // Ribs
  for (let i = -10; i <= 10; i += 5) {
    ctx.beginPath();
    ctx.moveTo(x, y - 15 * scale + i * scale);
    ctx.quadraticCurveTo(
      x + 15 * scale,
      y - 15 * scale + i * scale,
      x + 10 * scale,
      y - 15 * scale + (i + 3) * scale
    );
    ctx.lineWidth = 2 * scale;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(x, y - 15 * scale + i * scale);
    ctx.quadraticCurveTo(
      x - 15 * scale,
      y - 15 * scale + i * scale,
      x - 10 * scale,
      y - 15 * scale + (i + 3) * scale
    );
    ctx.lineWidth = 2 * scale;
    ctx.stroke();
  }
  
  // Pelvis
  ctx.beginPath();
  ctx.moveTo(x - 10 * scale, y + 15 * scale);
  ctx.lineTo(x + 10 * scale, y + 15 * scale);
  ctx.quadraticCurveTo(
    x,
    y + 25 * scale,
    x - 10 * scale,
    y + 15 * scale
  );
  ctx.lineWidth = 2 * scale;
  ctx.stroke();
  
  // Leg bones
  ctx.beginPath();
  ctx.moveTo(x - 5 * scale, y + 15 * scale);
  ctx.lineTo(x - 10 * scale, y + 40 * scale);
  ctx.moveTo(x + 5 * scale, y + 15 * scale);
  ctx.lineTo(x + 10 * scale, y + 40 * scale);
  ctx.lineWidth = 3 * scale;
  ctx.stroke();
}

/**
 * Draw a construct silhouette
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} x - The center x coordinate
 * @param {number} y - The center y coordinate
 * @param {number} size - The size of the canvas
 */
function drawConstructSilhouette(ctx, x, y, size) {
  const scale = size / 100;
  
  // Head
  ctx.beginPath();
  ctx.rect(x - 10 * scale, y - 40 * scale, 20 * scale, 15 * scale);
  ctx.fill();
  
  // Body
  ctx.beginPath();
  ctx.rect(x - 15 * scale, y - 25 * scale, 30 * scale, 30 * scale);
  ctx.fill();
  
  // Arms
  ctx.beginPath();
  ctx.rect(x - 25 * scale, y - 20 * scale, 10 * scale, 25 * scale);
  ctx.rect(x + 15 * scale, y - 20 * scale, 10 * scale, 25 * scale);
  ctx.fill();
  
  // Legs
  ctx.beginPath();
  ctx.rect(x - 15 * scale, y + 5 * scale, 10 * scale, 25 * scale);
  ctx.rect(x + 5 * scale, y + 5 * scale, 10 * scale, 25 * scale);
  ctx.fill();
  
  // Mechanical details
  ctx.strokeStyle = config.backgroundColor;
  ctx.lineWidth = 2 * scale;
  
    // Face plate
  ctx.beginPath();
  ctx.rect(x - 5 * scale, y - 37 * scale, 10 * scale, 5 * scale);
  ctx.stroke();
  
  // Body details
  ctx.beginPath();
  ctx.moveTo(x - 15 * scale, y - 15 * scale);
  ctx.lineTo(x + 15 * scale, y - 15 * scale);
  ctx.moveTo(x - 15 * scale, y - 5 * scale);
  ctx.lineTo(x + 15 * scale, y - 5 * scale);
  ctx.stroke();
  
  // Reset stroke style
  ctx.strokeStyle = config.textColor;
}

/**
 * Draw a celestial silhouette
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} x - The center x coordinate
 * @param {number} y - The center y coordinate
 * @param {number} size - The size of the canvas
 */
function drawCelestialSilhouette(ctx, x, y, size) {
  const scale = size / 100;
  
  // Halo
  ctx.beginPath();
  ctx.arc(x, y - 30 * scale, 20 * scale, 0, Math.PI * 2);
  ctx.lineWidth = 3 * scale;
  ctx.stroke();
  
  // Head
  ctx.beginPath();
  ctx.arc(x, y - 30 * scale, 15 * scale, 0, Math.PI * 2);
  ctx.fill();
  
  // Body
  ctx.beginPath();
  ctx.moveTo(x, y - 15 * scale);
  ctx.lineTo(x, y + 15 * scale);
  ctx.lineWidth = 10 * scale;
  ctx.stroke();
  
  // Wings
  ctx.beginPath();
  ctx.moveTo(x, y - 10 * scale);
  ctx.quadraticCurveTo(x - 20 * scale, y - 30 * scale, x - 40 * scale, y);
  ctx.quadraticCurveTo(x - 20 * scale, y - 10 * scale, x, y - 5 * scale);
  ctx.moveTo(x, y - 10 * scale);
  ctx.quadraticCurveTo(x + 20 * scale, y - 30 * scale, x + 40 * scale, y);
  ctx.quadraticCurveTo(x + 20 * scale, y - 10 * scale, x, y - 5 * scale);
  ctx.lineWidth = 2 * scale;
  ctx.stroke();
  
  // Arms
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - 15 * scale, y + 15 * scale);
  ctx.moveTo(x, y);
  ctx.lineTo(x + 15 * scale, y + 15 * scale);
  ctx.lineWidth = 5 * scale;
  ctx.stroke();
  
  // Legs
  ctx.beginPath();
  ctx.moveTo(x, y + 15 * scale);
  ctx.lineTo(x - 10 * scale, y + 40 * scale);
  ctx.moveTo(x, y + 15 * scale);
  ctx.lineTo(x + 10 * scale, y + 40 * scale);
  ctx.lineWidth = 5 * scale;
  ctx.stroke();
}

/**
 * Draw a generic silhouette
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} x - The center x coordinate
 * @param {number} y - The center y coordinate
 * @param {number} size - The size of the canvas
 */
function drawGenericSilhouette(ctx, x, y, size) {
  const scale = size / 100;
  
  // Simple blob shape
  ctx.beginPath();
  ctx.ellipse(x, y, 30 * scale, 35 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Eyes
  ctx.fillStyle = config.backgroundColor;
  ctx.beginPath();
  ctx.arc(x - 10 * scale, y - 10 * scale, 5 * scale, 0, Math.PI * 2);
  ctx.arc(x + 10 * scale, y - 10 * scale, 5 * scale, 0, Math.PI * 2);
  ctx.fill();
  
  // Reset fill style
  ctx.fillStyle = config.textColor;
}

/**
 * Draw dots pattern
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} size - The size of the canvas
 * @param {Function} rng - Random number generator
 */
function drawDotsPattern(ctx, size, rng) {
  const dotCount = Math.floor(size / 5);
  const dotSize = size / 50;
  
  for (let i = 0; i < dotCount; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const radius = dotSize * (0.5 + rng());
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Draw lines pattern
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} size - The size of the canvas
 * @param {Function} rng - Random number generator
 */
function drawLinesPattern(ctx, size, rng) {
  const lineCount = Math.floor(size / 10);
  
  for (let i = 0; i < lineCount; i++) {
    const startX = rng() * size;
    const startY = rng() * size;
    const endX = rng() * size;
    const endY = rng() * size;
    const lineWidth = size / 100 * (0.5 + rng());
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

/**
 * Draw grid pattern
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} size - The size of the canvas
 * @param {Function} rng - Random number generator
 */
function drawGridPattern(ctx, size, rng) {
  const gridSize = Math.floor(size / 10);
  const variance = size / 50;
  
  // Draw vertical lines
  for (let x = 0; x <= size; x += gridSize) {
    const offset = (rng() - 0.5) * variance;
    ctx.beginPath();
    ctx.moveTo(x + offset, 0);
    ctx.lineTo(x + offset, size);
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  
  // Draw horizontal lines
  for (let y = 0; y <= size; y += gridSize) {
    const offset = (rng() - 0.5) * variance;
    ctx.beginPath();
    ctx.moveTo(0, y + offset);
    ctx.lineTo(size, y + offset);
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

/**
 * Draw triangles pattern
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} size - The size of the canvas
 * @param {Function} rng - Random number generator
 */
function drawTrianglesPattern(ctx, size, rng) {
  const triangleCount = Math.floor(size / 20);
  
  for (let i = 0; i < triangleCount; i++) {
    const x1 = rng() * size;
    const y1 = rng() * size;
    const x2 = x1 + (rng() - 0.5) * size / 4;
    const y2 = y1 + (rng() - 0.5) * size / 4;
    const x3 = x1 + (rng() - 0.5) * size / 4;
    const y3 = y1 + (rng() - 0.5) * size / 4;
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();
    
    // Randomly fill or stroke
    if (rng() > 0.5) {
      ctx.fill();
    } else {
      ctx.lineWidth = size / 100;
      ctx.stroke();
    }
  }
}

/**
 * Draw hexagons pattern
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} size - The size of the canvas
 * @param {Function} rng - Random number generator
 */
function drawHexagonsPattern(ctx, size, rng) {
  const hexSize = size / 10;
  const rows = Math.ceil(size / (hexSize * 1.5));
  const cols = Math.ceil(size / (hexSize * Math.sqrt(3)));
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const offsetX = col % 2 === 0 ? 0 : hexSize * 0.75;
      const x = col * hexSize * 1.5;
      const y = row * hexSize * Math.sqrt(3) + offsetX;
      
      // Skip some hexagons randomly
      if (rng() < 0.3) continue;
      
      drawHexagon(ctx, x, y, hexSize * (0.7 + rng() * 0.3), rng);
    }
  }
}

/**
 * Draw a hexagon
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} x - The center x coordinate
 * @param {number} y - The center y coordinate
 * @param {number} size - The size of the hexagon
 * @param {Function} rng - Random number generator
 */
function drawHexagon(ctx, x, y, size, rng) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = Math.PI / 3 * i;
    const pointX = x + size * Math.cos(angle);
    const pointY = y + size * Math.sin(angle);
    
    if (i === 0) {
      ctx.moveTo(pointX, pointY);
    } else {
      ctx.lineTo(pointX, pointY);
    }
  }
  ctx.closePath();
  
  // Randomly fill or stroke
  if (rng() > 0.5) {
    ctx.fill();
  } else {
    ctx.lineWidth = size / 10;
    ctx.stroke();
  }
}

/**
 * Add noise texture to an image
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} size - The size of the canvas
 * @param {number} opacity - The opacity of the noise
 * @param {Function} rng - Random number generator
 */
function addNoiseTexture(ctx, size, opacity, rng) {
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const noise = (rng() - 0.5) * opacity * 255;
    
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Draw a monster type symbol
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {string} monsterType - The type of monster
 * @param {number} x - The center x coordinate
 * @param {number} y - The center y coordinate
 * @param {number} size - The size of the symbol
 * @param {Function} rng - Random number generator
 */
function drawMonsterTypeSymbol(ctx, monsterType, x, y, size, rng) {
  const halfSize = size / 2;
  
  switch (monsterType.toLowerCase()) {
    case 'aberration':
      drawAberrationSymbol(ctx, x, y, halfSize);
      break;
    case 'beast':
      drawBeastSymbol(ctx, x, y, halfSize);
      break;
    case 'celestial':
      drawCelestialSymbol(ctx, x, y, halfSize);
      break;
    case 'construct':
      drawConstructSymbol(ctx, x, y, halfSize);
      break;
    case 'dragon':
      drawDragonSymbol(ctx, x, y, halfSize);
      break;
    case 'elemental':
      drawElementalSymbol(ctx, x, y, halfSize);
      break;
    case 'fey':
      drawFeySymbol(ctx, x, y, halfSize);
      break;
    case 'fiend':
      drawFiendSymbol(ctx, x, y, halfSize);
      break;
    case 'giant':
      drawGiantSymbol(ctx, x, y, halfSize);
      break;
    case 'humanoid':
      drawHumanoidSymbol(ctx, x, y, halfSize);
      break;
    case 'monstrosity':
      drawMonstrositySymbol(ctx, x, y, halfSize);
      break;
    case 'ooze':
      drawOozeSymbol(ctx, x, y, halfSize);
      break;
    case 'plant':
      drawPlantSymbol(ctx, x, y, halfSize);
      break;
    case 'undead':
      drawUndeadSymbol(ctx, x, y, halfSize);
      break;
    default:
      drawGenericSymbol(ctx, x, y, halfSize, rng);
  }
}

/**
 * Draw an aberration symbol
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} x - The center x coordinate
 * @param {number} y - The center y coordinate
 * @param {number} size - The size of the symbol
 */
function drawAberrationSymbol(ctx, x, y, size) {
  // Eye with tentacles
  ctx.beginPath();
  ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
  ctx.fill();
  
  // Pupil
  ctx.fillStyle = config.backgroundColor;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.25, 0, Math.PI * 2);
  ctx.fill();
  
  // Reset fill style
  ctx.fillStyle = config.textColor;
  
  // Tentacles
  for (let i = 0; i < 8; i++) {
    const angle = Math.PI / 4 * i;
    const length = size * 0.8;
    const startX = x + Math.cos(angle) * size * 0.5;
    const startY = y + Math.sin(angle) * size * 0.5;
    const endX = x + Math.cos(angle) * length;
    const endY = y + Math.sin(angle) * length;
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(
      x + Math.cos(angle + 0.5) * size * 0.7,
      y + Math.sin(angle + 0.5) * size * 0.7,
      endX,
      endY
    );
    ctx.lineWidth = size * 0.1;
    ctx.stroke();
  }
}

/**
 * Draw a beast symbol
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} x - The center x coordinate
 * @param {number} y - The center y coordinate
 * @param {number} size - The size of the symbol
 */
function drawBeastSymbol(ctx, x, y, size) {
  // Paw print
  const padSize = size * 0.3;
  
  // Main pad
  ctx.beginPath();
  ctx.arc(x, y + padSize * 0.5, padSize, 0, Math.PI * 2);
  ctx.fill();
  
  // Toe pads
  for (let i = 0; i < 4; i++) {
    const angle = Math.PI / 6 + (Math.PI * 2 / 3) * (i / 3);
    const padX = x + Math.cos(angle) * padSize * 1.5;
    const padY = y - padSize + Math.sin(angle) * padSize * 1.5;
    
    ctx.beginPath();
    ctx.arc(padX, padY, padSize * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Draw a celestial symbol
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} x - The center x coordinate
 * @param {number} y - The center y coordinate
 * @param {number} size - The size of the symbol
 */
function drawCelestialSymbol(ctx, x, y, size) {
  // Sun/star with rays
  ctx.beginPath();
  ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
  ctx.fill();
  
  // Rays
  for (let i = 0; i < 8; i++) {
    const angle = Math.PI / 4 * i;
    const innerRadius = size * 0.4;
    const outerRadius = size;
    
    ctx.beginPath();
    ctx.moveTo(
      x + Math.cos(angle) * innerRadius,
      y + Math.sin(angle) * innerRadius
    );
    ctx.lineTo(
      x + Math.cos(angle) * outerRadius,
      y + Math.sin(angle) * outerRadius
    );
    ctx.lineWidth = size * 0.15;
    ctx.stroke();
  }
}

/**
 * Draw a construct symbol
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} x - The center x coordinate
 * @param {number} y - The center y coordinate
 * @param {number} size - The size of the symbol
 */
function drawConstructSymbol(ctx, x, y, size) {
  // Gear
  const outerRadius = size;
  const innerRadius = size * 0.6;
  const teethCount = 8;
  
  ctx.beginPath();
  
  // Draw gear teeth
  for (let i = 0; i < teethCount; i++) {
    const angle1 = (Math.PI * 2 / teethCount) * i;
    const angle2 = (Math.PI * 2 / teethCount) * (i + 0.5);
    const angle3 = (Math.PI * 2 / teethCount) * (i + 1);
    
    ctx.lineTo(
      x + Math.cos(angle1) * outerRadius,
      y + Math.sin(angle1) * outerRadius
    );
    ctx.lineTo(
      x + Math.cos(angle2) * innerRadius,
      y + Math.sin(angle2) * innerRadius
    );
    ctx.lineTo(
      x + Math.cos(angle3) * outerRadius,
      y + Math.sin(angle3) * outerRadius
    );
  }
  
  ctx.closePath();
  ctx.fill();
  
  // Inner circle
  ctx.beginPath();
  ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
  ctx.fillStyle = config.backgroundColor;
  ctx.fill();
  
  // Reset fill style
  ctx.fillStyle = config.textColor;
}

/**
 * Draw a dragon symbol
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} x - The center x coordinate
 * @param {number} y - The center y coordinate
 * @param {number} size - The size of the symbol
 */
function drawDragonSymbol(ctx, x, y, size) {
  // Dragon head silhouette
  ctx.beginPath();
  
  // Jaw
  ctx.moveTo(x - size * 0.3, y + size * 0.2);
  ctx.lineTo(x + size * 0.7, y + size * 0.1);
  
  // Snout and head
  ctx.lineTo(x + size * 0.5, y - size * 0.2);
  ctx.lineTo(x, y - size * 0.4);
  
  // Horns
  ctx.lineTo(x - size * 0.2, y - size * 0.8);
  ctx.lineTo(x - size * 0.3, y - size * 0.3);
  ctx.lineTo(x - size * 0.5, y - size * 0.7);
  ctx.lineTo(x - size * 0.4, y - size * 0.2);
  
  // Back to jaw
  ctx.lineTo(x - size * 0.5, y);
  ctx.lineTo(x - size * 0.3, y + size * 0.2);
  
  ctx.fill();
  
  // Eye
  ctx.fillStyle = config.backgroundColor;
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.2,
    y - size * 0.1,
    size * 0.1,
    size * 0.15,
    Math.PI / 4,
    0,
    Math.PI * 2
  );
  ctx.fill();
  
  // Reset fill style
  ctx.fillStyle = config.textColor;
}

/**
 * Draw an elemental symbol
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} x - The center x coordinate
 * @param {number} y - The center y coordinate
 * @param {number} size - The size of the symbol
 */
function drawElementalSymbol(ctx, x, y, size) {
  // Four elements symbol
  const elements = 4;
  const angleStep = Math.PI * 2 / elements;
  const radius = size * 0.8;
  
  for (let i = 0; i < elements; i++) {
    const angle = angleStep * i;
    const elementX = x + Math.cos(angle) * radius * 0.5;
    const elementY = y + Math.sin(angle) * radius * 0.5;
    
    switch (i) {
      case 0: // Fire (triangle)
        ctx.beginPath();
        ctx.moveTo(elementX, elementY - radius * 0.3);
        ctx.lineTo(elementX - radius * 0.25, elementY + radius * 0.2);
        ctx.lineTo(elementX + radius * 0.25, elementY + radius * 0.2);
        ctx.closePath();
        ctx.fill();
        break;
      case 1: // Water (wave)
        ctx.beginPath();
        ctx.arc(elementX - radius * 0.15, elementY, radius * 0.15, 0, Math.PI * 2);
        ctx.arc(elementX + radius * 0.15, elementY, radius * 0.15, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 2: // Earth (square)
        ctx.beginPath();
        ctx.rect(elementX - radius * 0.2, elementY - radius * 0.2, radius * 0.4, radius * 0.4);
        ctx.fill();
        break;
      case 3: // Air (circle)
        ctx.beginPath();
        ctx.arc(elementX, elementY, radius * 0.25, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
  }
}

/**
 * Draw a fey symbol
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} x - The center x coordinate
 * @param {number} y - The center y coordinate
 * @param {number} size - The size of the symbol
 */
function drawFeySymbol(ctx, x, y, size) {
  // Butterfly/fairy wings
  const wingSize = size * 0.8;
  
  // Left wings
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(
    x - wingSize * 0.5,
    y - wingSize * 0.5,
    x - wingSize,
    y - wingSize
  );
  ctx.quadraticCurveTo(
    x - wingSize * 0.3,
    y - wingSize * 0.3,
    x,
    y
  );
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(
    x - wingSize * 0.5,
    y + wingSize * 0.5,
    x - wingSize,
    y + wingSize
  );
  ctx.quadraticCurveTo(
    x - wingSize * 0.3,
    y + wingSize * 0.3,
    x,
    y
  );
  ctx.fill();
  
  // Right wings
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(
    x + wingSize * 0.5,
    y - wingSize * 0.5,
    x + wingSize,
    y - wingSize
  );
  ctx.quadraticCurveTo(
    x + wingSize * 0.3,
    y - wingSize * 0.3,
    x,
    y
  );
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(
    x + wingSize * 0.5,
    y + wingSize * 0.5,
    x + wingSize,
    y + wingSize
  );
  ctx.quadraticCurveTo(
    x + wingSize * 0.3,
    y + wingSize * 0.3,
    x,
    y
  );
  ctx.fill();
  
  // Body
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.1, size * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draw a fiend symbol
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} x - The center x coordinate
 * @param {number} y - The center y coordinate
 * @param {number} size - The size of the symbol
 */
function drawFiendSymbol(ctx, x, y, size) {
  // Pentagram
  const points = 5;
  const outerRadius = size;
  const innerRadius = size * 0.4;
  
  ctx.beginPath();
  
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (Math.PI / points) * i - Math.PI / 2;
    
    const pointX = x + Math.cos(angle) * radius;
    const pointY = y + Math.sin(angle) * radius;
    
    if (i === 0) {
      ctx.moveTo(pointX, pointY);
    } else {
      ctx.lineTo(pointX, pointY);
    }
  }
  
  ctx.closePath();
  ctx.fill();
  
  // Horns
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y - size * 0.5);
  ctx.quadraticCurveTo(
    x - size * 0.5,
    y - size * 1.2,
    x - size * 0.1,
    y - size * 0.7
  );
  ctx.moveTo(x + size * 0.3, y - size * 0.5);
  ctx.quadraticCurveTo(
    x + size * 0.5,
    y - size * 1.2,
    x + size * 0.1,
    y - size * 0.7
  );
  ctx.lineWidth = size * 0.15;
  ctx.stroke();
}

/**
 * Draw a giant symbol
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} x - The center x coordinate
 * @param {number} y - The center y coordinate
 * @param {number} size - The size of the symbol
 */
function drawGiantSymbol(ctx, x, y, size) {
  // Large humanoid silhouette
  
  // Head
  ctx.beginPath();
  ctx.arc(x, y - size * 0.6, size * 0.2, 0, Math.PI * 2);
  ctx.fill();
  
  // Body
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.4);
  ctx.lineTo(x, y + size * 0.2);
  ctx.lineWidth = size * 0.3;
  ctx.stroke();
  
  // Arms
  ctx.beginPath();
  ctx.moveTo(x - size * 0.4, y - size * 0.2);
  ctx.lineTo(x + size * 0.4, y - size * 0.2);
  ctx.lineWidth = size * 0.2;
  ctx.stroke();
  
  // Legs
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.2);
  ctx.lineTo(x - size * 0.3, y + size * 0.8);
  ctx.moveTo(x, y + size * 0.2);
  ctx.lineTo(x + size * 0.3, y + size * 0.8);
  ctx.lineWidth = size * 0.2;
  ctx.stroke();
}

/**
 * Draw a humanoid symbol
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} x - The center x coordinate
 * @param {number} y - The center y coordinate
 * @param {number} size - The size of the symbol
 */
function drawHumanoidSymbol(ctx, x, y, size) {
  // Simple humanoid figure
  
    // Head
  ctx.beginPath();
  ctx.arc(x, y - size * 0.5, size * 0.25, 0, Math.PI * 2);
  ctx.fill();
  
  // Body
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.25);
  ctx.lineTo(x, y + size * 0.3);
  ctx.lineWidth = size * 0.15;
  ctx.stroke();
  
  // Arms
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y);
  ctx.lineTo(x + size * 0.3, y);
  ctx.lineWidth = size * 0.1;
  ctx.stroke();
  
  // Legs
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.3);
  ctx.lineTo(x - size * 0.2, y + size * 0.8);
  ctx.moveTo(x, y + size * 0.3);
  ctx.lineTo(x + size * 0.2, y + size * 0.8);
  ctx.lineWidth = size * 0.1;
  ctx.stroke();
}

/**
 * Draw a monstrosity symbol
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} x - The center x coordinate
 * @param {number} y - The center y coordinate
 * @param {number} size - The size of the symbol
 */
function drawMonstrositySymbol(ctx, x, y, size) {
  // Chimera-like mixed creature
  
  // Body (snake-like)
  ctx.beginPath();
  ctx.moveTo(x - size * 0.7, y);
  ctx.quadraticCurveTo(
    x,
    y + size * 0.5,
    x + size * 0.7,
    y
  );
  ctx.lineWidth = size * 0.25;
  ctx.stroke();
  
  // Multiple heads
  // Head 1 (left)
  ctx.beginPath();
  ctx.arc(x - size * 0.5, y - size * 0.4, size * 0.2, 0, Math.PI * 2);
  ctx.fill();
  
  // Head 2 (center)
  ctx.beginPath();
  ctx.arc(x, y - size * 0.5, size * 0.2, 0, Math.PI * 2);
  ctx.fill();
  
  // Head 3 (right)
  ctx.beginPath();
  ctx.arc(x + size * 0.5, y - size * 0.4, size * 0.2, 0, Math.PI * 2);
  ctx.fill();
  
  // Tail
  ctx.beginPath();
  ctx.moveTo(x + size * 0.7, y);
  ctx.quadraticCurveTo(
    x + size * 0.9,
    y - size * 0.3,
    x + size * 0.6,
    y - size * 0.5
  );
  ctx.lineWidth = size * 0.1;
  ctx.stroke();
}

/**
 * Draw an ooze symbol
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} x - The center x coordinate
 * @param {number} y - The center y coordinate
 * @param {number} size - The size of the symbol
 */
function drawOozeSymbol(ctx, x, y, size) {
  // Blob shape with drips
  
  // Main blob
  ctx.beginPath();
  ctx.arc(x, y - size * 0.2, size * 0.6, 0, Math.PI * 2);
  ctx.fill();
  
  // Drips
  const dripCount = 5;
  for (let i = 0; i < dripCount; i++) {
    const angle = Math.PI + (Math.PI / (dripCount - 1)) * i;
    const startX = x + Math.cos(angle) * size * 0.6;
    const startY = y - size * 0.2 + Math.sin(angle) * size * 0.6;
    const endY = startY + size * 0.5;
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(
      startX + size * 0.1,
      startY + size * 0.25,
      startX,
      endY
    );
    ctx.quadraticCurveTo(
      startX - size * 0.1,
      startY + size * 0.25,
      startX,
      startY
    );
    ctx.fill();
  }
  
  // Bubbles
  for (let i = 0; i < 3; i++) {
    const bubbleX = x + (i - 1) * size * 0.25;
    const bubbleY = y - size * 0.3;
    const bubbleSize = size * (0.1 + i * 0.05);
    
    ctx.beginPath();
    ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
    ctx.fillStyle = config.backgroundColor;
    ctx.fill();
  }
  
  // Reset fill style
  ctx.fillStyle = config.textColor;
}

/**
 * Draw a plant symbol
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} x - The center x coordinate
 * @param {number} y - The center y coordinate
 * @param {number} size - The size of the symbol
 */
function drawPlantSymbol(ctx, x, y, size) {
  // Tree/plant shape
  
  // Trunk
  ctx.beginPath();
  ctx.rect(x - size * 0.1, y, size * 0.2, size * 0.7);
  ctx.fill();
  
  // Foliage
  ctx.beginPath();
  ctx.arc(x, y - size * 0.1, size * 0.5, 0, Math.PI * 2);
  ctx.fill();
  
  // Roots
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y + size * 0.7);
  ctx.lineTo(x - size * 0.4, y + size * 0.9);
  ctx.moveTo(x + size * 0.1, y + size * 0.7);
  ctx.lineTo(x + size * 0.4, y + size * 0.9);
  ctx.moveTo(x, y + size * 0.7);
  ctx.lineTo(x, y + size * 0.9);
  ctx.lineWidth = size * 0.05;
  ctx.stroke();
}

/**
 * Draw an undead symbol
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} x - The center x coordinate
 * @param {number} y - The center y coordinate
 * @param {number} size - The size of the symbol
 */
function drawUndeadSymbol(ctx, x, y, size) {
  // Skull
  
  // Skull shape
  ctx.beginPath();
  ctx.arc(x, y - size * 0.2, size * 0.6, 0, Math.PI * 2);
  ctx.fill();
  
  // Eye sockets
  ctx.fillStyle = config.backgroundColor;
  ctx.beginPath();
  ctx.arc(x - size * 0.25, y - size * 0.2, size * 0.15, 0, Math.PI * 2);
  ctx.arc(x + size * 0.25, y - size * 0.2, size * 0.15, 0, Math.PI * 2);
  ctx.fill();
  
  // Nose
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.2);
  ctx.lineTo(x - size * 0.1, y + size * 0.1);
  ctx.lineTo(x + size * 0.1, y + size * 0.1);
  ctx.closePath();
  ctx.fill();
  
  // Jaw
  ctx.fillStyle = config.textColor;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.2, size * 0.3, size * 0.15, 0, 0, Math.PI);
  ctx.fill();
  
  // Teeth
  ctx.fillStyle = config.backgroundColor;
  const teethCount = 5;
  const teethWidth = (size * 0.6) / teethCount;
  
  for (let i = 0; i < teethCount; i++) {
    const toothX = x - size * 0.3 + teethWidth * (i + 0.5);
    ctx.beginPath();
    ctx.rect(toothX - teethWidth * 0.3, y + size * 0.05, teethWidth * 0.6, size * 0.15);
    ctx.fill();
  }
  
  // Reset fill style
  ctx.fillStyle = config.textColor;
  
  // Crossbones
  ctx.beginPath();
  ctx.moveTo(x - size * 0.5, y + size * 0.5);
  ctx.lineTo(x + size * 0.5, y + size * 0.9);
  ctx.moveTo(x + size * 0.5, y + size * 0.5);
  ctx.lineTo(x - size * 0.5, y + size * 0.9);
  ctx.lineWidth = size * 0.1;
  ctx.stroke();
}

/**
 * Draw a generic symbol
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} x - The center x coordinate
 * @param {number} y - The center y coordinate
 * @param {number} size - The size of the symbol
 * @param {Function} rng - Random number generator
 */
function drawGenericSymbol(ctx, x, y, size, rng) {
  // Random geometric shape
  const shapeType = Math.floor(rng() * 5);
  
  switch (shapeType) {
    case 0: // Circle
      ctx.beginPath();
      ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 1: // Square
      ctx.beginPath();
      ctx.rect(x - size * 0.6, y - size * 0.6, size * 1.2, size * 1.2);
      ctx.fill();
      break;
    case 2: // Triangle
      ctx.beginPath();
      ctx.moveTo(x, y - size * 0.7);
      ctx.lineTo(x - size * 0.7, y + size * 0.5);
      ctx.lineTo(x + size * 0.7, y + size * 0.5);
      ctx.closePath();
      ctx.fill();
      break;
    case 3: // Diamond
      ctx.beginPath();
      ctx.moveTo(x, y - size * 0.7);
      ctx.lineTo(x + size * 0.7, y);
      ctx.lineTo(x, y + size * 0.7);
      ctx.lineTo(x - size * 0.7, y);
      ctx.closePath();
      ctx.fill();
      break;
    case 4: // Star
      const points = 5;
      const outerRadius = size * 0.7;
      const innerRadius = size * 0.3;
      
      ctx.beginPath();
      
      for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (Math.PI / points) * i - Math.PI / 2;
        
        const pointX = x + Math.cos(angle) * radius;
        const pointY = y + Math.sin(angle) * radius;
        
        if (i === 0) {
          ctx.moveTo(pointX, pointY);
        } else {
          ctx.lineTo(pointX, pointY);
        }
      }
      
      ctx.closePath();
      ctx.fill();
      break;
  }
}

/**
 * Draw a procedural creature
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {string} creatureType - The type of creature
 * @param {string} creatureSize - The size of the creature
 * @param {number} size - The size of the canvas
 * @param {Function} rng - Random number generator
 */
function drawProceduralCreature(ctx, creatureType, creatureSize, size, rng) {
  // Determine creature characteristics based on type and size
  let bodyShape, headShape, limbCount, eyeCount, hasHorns, hasTail;
  
  // Set default values
  bodyShape = 'round';
  headShape = 'round';
  limbCount = 4;
  eyeCount = 2;
  hasHorns = false;
  hasTail = false;
  
  // Modify based on creature type
  if (creatureType === 'random') {
    creatureType = ['beast', 'humanoid', 'monstrosity', 'dragon', 'fiend'][Math.floor(rng() * 5)];
  }
  
  switch (creatureType.toLowerCase()) {
    case 'beast':
      bodyShape = rng() > 0.5 ? 'oval' : 'round';
      headShape = 'oval';
      limbCount = 4;
      eyeCount = 2;
      hasTail = true;
      break;
    case 'humanoid':
      bodyShape = 'rectangle';
      headShape = 'round';
      limbCount = 4;
      eyeCount = 2;
      break;
    case 'monstrosity':
      bodyShape = rng() > 0.5 ? 'amorphous' : 'oval';
      headShape = rng() > 0.5 ? 'triangle' : 'oval';
      limbCount = 4 + Math.floor(rng() * 4);
      eyeCount = 1 + Math.floor(rng() * 4);
      hasHorns = rng() > 0.5;
      hasTail = rng() > 0.3;
      break;
    case 'dragon':
      bodyShape = 'oval';
      headShape = 'triangle';
      limbCount = 4;
      eyeCount = 2;
      hasHorns = true;
      hasTail = true;
      break;
    case 'fiend':
      bodyShape = 'rectangle';
      headShape = 'triangle';
      limbCount = 4;
      eyeCount = 2;
      hasHorns = true;
      hasTail = rng() > 0.5;
      break;
  }
  
  // Modify based on creature size
  let sizeMultiplier = 1;
  switch (creatureSize.toLowerCase()) {
    case 'tiny':
      sizeMultiplier = 0.6;
      break;
    case 'small':
      sizeMultiplier = 0.8;
      break;
    case 'medium':
      sizeMultiplier = 1;
      break;
    case 'large':
      sizeMultiplier = 1.2;
      break;
    case 'huge':
      sizeMultiplier = 1.4;
      break;
    case 'gargantuan':
      sizeMultiplier = 1.6;
      break;
  }
  
  // Draw the creature
  const centerX = size / 2;
  const centerY = size / 2;
  const bodySize = size * 0.4 * sizeMultiplier;
  
  // Draw body
  drawCreatureBody(ctx, centerX, centerY, bodySize, bodyShape, rng);
  
  // Draw head
  const headSize = bodySize * 0.6;
  const headX = centerX;
  const headY = centerY - bodySize * 0.7;
  drawCreatureHead(ctx, headX, headY, headSize, headShape, eyeCount, hasHorns, rng);
  
  // Draw limbs
  drawCreatureLimbs(ctx, centerX, centerY, bodySize, limbCount, rng);
  
  // Draw tail if needed
  if (hasTail) {
    drawCreatureTail(ctx, centerX, centerY, bodySize, rng);
  }
}

/**
 * Draw a creature's body
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} x - The center x coordinate
 * @param {number} y - The center y coordinate
 * @param {number} size - The size of the body
 * @param {string} shape - The shape of the body
 * @param {Function} rng - Random number generator
 */
function drawCreatureBody(ctx, x, y, size, shape, rng) {
  switch (shape) {
    case 'round':
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'oval':
      ctx.beginPath();
      ctx.ellipse(x, y, size, size * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'rectangle':
      ctx.beginPath();
      ctx.rect(x - size * 0.6, y - size, size * 1.2, size * 1.5);
      ctx.fill();
      break;
    case 'amorphous':
      ctx.beginPath();
      
      // Create a blob shape with random points
      const points = 8;
      const startAngle = rng() * Math.PI * 2;
      
      for (let i = 0; i <= points; i++) {
        const angle = startAngle + (Math.PI * 2 / points) * i;
        const radius = size * (0.7 + rng() * 0.6);
        const pointX = x + Math.cos(angle) * radius;
        const pointY = y + Math.sin(angle) * radius;
        
        if (i === 0) {
          ctx.moveTo(pointX, pointY);
        } else {
          const controlX = x + Math.cos(angle - Math.PI / points) * radius * 1.2;
          const controlY = y + Math.sin(angle - Math.PI / points) * radius * 1.2;
          ctx.quadraticCurveTo(controlX, controlY, pointX, pointY);
        }
      }
      
      ctx.closePath();
      ctx.fill();
      break;
  }
}

/**
 * Draw a creature's head
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} x - The center x coordinate
 * @param {number} y - The center y coordinate
 * @param {number} size - The size of the head
 * @param {string} shape - The shape of the head
 * @param {number} eyeCount - The number of eyes
 * @param {boolean} hasHorns - Whether the creature has horns
 * @param {Function} rng - Random number generator
 */
function drawCreatureHead(ctx, x, y, size, shape, eyeCount, hasHorns, rng) {
  // Draw head shape
  switch (shape) {
    case 'round':
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'oval':
      ctx.beginPath();
      ctx.ellipse(x, y, size, size * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'triangle':
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.lineTo(x - size, y + size * 0.5);
      ctx.lineTo(x + size, y + size * 0.5);
      ctx.closePath();
      ctx.fill();
      break;
  }
  
  // Draw eyes
  ctx.fillStyle = config.backgroundColor;
  
  if (eyeCount === 1) {
    // Cyclops eye
    ctx.beginPath();
    ctx.arc(x, y - size * 0.2, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Multiple eyes
    const eyeSize = size * 0.2;
    const eyeSpacing = size * 0.4;
    
    for (let i = 0; i < eyeCount; i++) {
      let eyeX, eyeY;
      
      if (eyeCount === 2) {
        // Standard two eyes
        eyeX = x + (i === 0 ? -eyeSpacing : eyeSpacing);
        eyeY = y - size * 0.1;
      } else {
        // Multiple eyes in a pattern
        const angle = (Math.PI * 2 / eyeCount) * i;
        eyeX = x + Math.cos(angle) * eyeSpacing;
        eyeY = y + Math.sin(angle) * eyeSpacing * 0.5;
      }
      
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, eyeSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Reset fill style
  ctx.fillStyle = config.textColor;
  
  // Draw horns if needed
  if (hasHorns) {
    const hornLength = size * 0.8;
    const hornWidth = size * 0.2;
    const hornSpacing = size * 0.5;
    
    for (let i = 0; i < 2; i++) {
      const hornX = x + (i === 0 ? -hornSpacing : hornSpacing);
      const hornY = y - size * 0.5;
      const hornTipX = hornX + (i === 0 ? -hornWidth : hornWidth);
      const hornTipY = hornY - hornLength;
      
      ctx.beginPath();
      ctx.moveTo(hornX, hornY);
      ctx.quadraticCurveTo(
        hornX + (i === 0 ? -hornLength * 0.5 : hornLength * 0.5),
        hornY - hornLength * 0.5,
        hornTipX,
        hornTipY
      );
      ctx.lineWidth = hornWidth * 0.5;
      ctx.stroke();
    }
  }
}

/**
 * Draw a creature's limbs
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} x - The center x coordinate
 * @param {number} y - The center y coordinate
 * @param {number} bodySize - The size of the body
 * @param {number} limbCount - The number of limbs
 * @param {Function} rng - Random number generator
 */
function drawCreatureLimbs(ctx, x, y, bodySize, limbCount, rng) {
  const limbLength = bodySize * 0.8;
  const limbWidth = bodySize * 0.2;
  
  // Determine if limbs are arms/legs or tentacles/etc.
  const isHumanoid = limbCount === 4 || limbCount === 2;
  
  if (isHumanoid) {
    // Draw arms (top limbs)
    const armCount = Math.min(2, limbCount);
    const armY = y - bodySize * 0.3;
    
    for (let i = 0; i < armCount; i++) {
      const isLeft = i === 0;
      const armX = x + (isLeft ? -bodySize * 0.7 : bodySize * 0.7);
      const shoulderX = x + (isLeft ? -bodySize * 0.3 : bodySize * 0.3);
      
      ctx.beginPath();
      ctx.moveTo(shoulderX, armY);
      ctx.lineTo(armX, armY + limbLength * 0.7);
      ctx.lineWidth = limbWidth;
      ctx.stroke();
    }
    
    // Draw legs (bottom limbs)
    const legCount = Math.min(2, limbCount - armCount);
    if (legCount > 0) {
      const legY = y + bodySize * 0.5;
      
      for (let i = 0; i < legCount; i++) {
        const isLeft = i === 0;
        const legX = x + (isLeft ? -bodySize * 0.3 : bodySize * 0.3);
        
        ctx.beginPath();
        ctx.moveTo(legX, legY);
        ctx.lineTo(legX, legY + limbLength);
        ctx.lineWidth = limbWidth;
        ctx.stroke();
      }
    }
  } else {
    // Draw radial limbs or tentacles
    for (let i = 0; i < limbCount; i++) {
      const angle = (Math.PI * 2 / limbCount) * i;
      const limbX = x + Math.cos(angle) * bodySize * 0.7;
      const limbY = y + Math.sin(angle) * bodySize * 0.7;
      const endX = x + Math.cos(angle) * (bodySize * 0.7 + limbLength);
      const endY = y + Math.sin(angle) * (bodySize * 0.7 + limbLength);
      
      ctx.beginPath();
      ctx.moveTo(limbX, limbY);
      
      // Make tentacles curvy
      const controlX = limbX + Math.cos(angle + Math.PI / 4) * limbLength * 0.7;
      const controlY = limbY + Math.sin(angle + Math.PI / 4) * limbLength * 0.7;
      
      ctx.quadraticCurveTo(controlX, controlY, endX, endY);
      ctx.lineWidth = limbWidth * (0.7 + rng() * 0.6);
      ctx.stroke();
    }
  }
}

/**
 * Draw a creature's tail
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} x - The center x coordinate
 * @param {number} y - The center y coordinate
 * @param {number} bodySize - The size of the body
 * @param {Function} rng - Random number generator
 */
function drawCreatureTail(ctx, x, y, bodySize, rng) {
  const tailLength = bodySize * (1 + rng());
  const tailWidth = bodySize * 0.3;
  const tailX = x;
  const tailY = y + bodySize * 0.5;
  
  // Determine tail type
  const tailType = Math.floor(rng() * 3);
  
  switch (tailType) {
    case 0: // Straight tail
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(tailX, tailY + tailLength);
      ctx.lineWidth = tailWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.lineCap = 'butt'; // Reset line cap
      break;
    case 1: // Curved tail
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.quadraticCurveTo(
        tailX + tailLength * 0.7,
        tailY + tailLength * 0.5,
        tailX + tailLength * 0.5,
        tailY + tailLength
      );
      ctx.lineWidth = tailWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.lineCap = 'butt'; // Reset line cap
      break;
    case 2: // Spiky tail
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      
      const segments = 3 + Math.floor(rng() * 3);
      const segmentLength = tailLength / segments;
      
      for (let i = 1; i <= segments; i++) {
        const segmentY = tailY + i * segmentLength;
        const offsetX = (i % 2 === 1 ? 1 : -1) * tailWidth * 2 * rng();
        ctx.lineTo(tailX + offsetX, segmentY);
      }
      
      ctx.lineWidth = tailWidth;
      ctx.stroke();
      break;
  }
}

/**
 * Generate a map image
 * @param {Object} config - Configuration for map generation
 * @returns {Promise<string>} A promise that resolves to the generated map as a data URL
 */
export async function generateMapImage(config = {}) {
  // Default map configuration
  const mapConfig = {
    width: config.width || 800,
    height: config.height || 600,
    gridSize: config.gridSize || 50,
    showGrid: config.showGrid !== undefined ? config.showGrid : true,
    gridColor: config.gridColor || 'rgba(0, 0, 0, 0.2)',
    backgroundColor: config.backgroundColor || '#f5f5dc', // Beige
    terrainType: config.terrainType || 'dungeon',
    seed: config.seed || Math.floor(Math.random() * 10000),
    format: config.format || 'png',
    quality: config.quality || 0.9
  };
  
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = mapConfig.width;
    canvas.height = mapConfig.height;
    
    const ctx = canvas.getContext('2d');
    
    // Create a seeded random number generator
    const rng = createSeededRandom(mapConfig.seed);
    
    // Draw background
    ctx.fillStyle = mapConfig.backgroundColor;
    ctx.fillRect(0, 0, mapConfig.width, mapConfig.height);
    
    // Generate terrain based on type
    switch (mapConfig.terrainType) {
      case 'dungeon':
        generateDungeonMap(ctx, mapConfig, rng);
        break;
      case 'forest':
        generateForestMap(ctx, mapConfig, rng);
        break;
      case 'cave':
        generateCaveMap(ctx, mapConfig, rng);
        break;
      case 'city':
        generateCityMap(ctx, mapConfig, rng);
        break;
      case 'desert':
        generateDesertMap(ctx, mapConfig, rng);
        break;
      default:
        generateDungeonMap(ctx, mapConfig, rng);
    }
    
    // Draw grid if enabled
    if (mapConfig.showGrid) {
      drawGrid(ctx, mapConfig);
    }
    
    // Convert to data URL
    const dataUrl = canvas.toDataURL(`image/${mapConfig.format}`, mapConfig.quality);
    resolve(dataUrl);
  });
}

/**
 * Draw a grid on the map
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Object} config - Map configuration
 */
function drawGrid(ctx, config) {
  ctx.strokeStyle = config.gridColor;
  ctx.lineWidth = 1;
  
  // Draw vertical lines
  for (let x = 0; x <= config.width; x += config.gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, config.height);
    ctx.stroke();
  }
  
  // Draw horizontal lines
  for (let y = 0; y <= config.height; y += config.gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(config.width, y);
    ctx.stroke();
  }
}

/**
 * Generate a dungeon map
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Object} config - Map configuration
 * @param {Function} rng - Random number generator
 */
function generateDungeonMap(ctx, config, rng) {
  const gridSize = config.gridSize;
  const gridWidth = Math.floor(config.width / gridSize);
  const gridHeight = Math.floor(config.height / gridSize);
  
  // Create a grid representation of the dungeon
  const grid = Array(gridHeight).fill().map(() => Array(gridWidth).fill(0));
  
  // Generate rooms
  const roomCount = Math.floor(5 + rng() * 10);
  const rooms = [];
  
  for (let i = 0; i < roomCount; i++) {
    const roomWidth = Math.floor(3 + rng() * 5);
    const roomHeight = Math.floor(3 + rng() * 5);
    const roomX = Math.floor(rng() * (gridWidth - roomWidth - 2)) + 1;
    const roomY = Math.floor(rng() * (gridHeight - roomHeight - 2)) + 1;
    
    // Check if room overlaps with existing rooms
    let overlaps = false;
    for (const room of rooms) {
      if (
        roomX <= room.x + room.width + 1 &&
        roomX + roomWidth + 1 >= room.x &&
        roomY <= room.y + room.height + 1 &&
        roomY + roomHeight + 1 >= room.y
      ) {
        overlaps = true;
        break;
      }
    }
    
    if (!overlaps) {
      rooms.push({ x: roomX, y: roomY, width: roomWidth, height: roomHeight });
      
      // Mark room cells in grid
      for (let y = roomY; y < roomY + roomHeight; y++) {
        for (let x = roomX; x < roomX + roomWidth; x++) {
          grid[y][x] = 1; // 1 represents floor
        }
      }
    }
  }
  
  // Connect rooms with corridors
  for (let i = 0; i < rooms.length - 1; i++) {
    const roomA = rooms[i];
    const roomB = rooms[i + 1];
    
    // Get center points of rooms
    const ax = Math.floor(roomA.x + roomA.width / 2);
    const ay = Math.floor(roomA.y + roomA.height / 2);
    const bx = Math.floor(roomB.x + roomB.width / 2);
    const by = Math.floor(roomB.y + roomB.height / 2);
    
    // Decide corridor path (horizontal then vertical, or vice versa)
    if (rng() > 0.5) {
      // Horizontal then vertical
      for (let x = Math.min(ax, bx); x <= Math.max(ax, bx); x++) {
        grid[ay][x] = 1;
      }
      for (let y = Math.min(ay, by); y <= Math.max(ay, by); y++) {
        grid[y][bx] = 1;
      }
    } else {
      // Vertical then horizontal
      for (let y = Math.min(ay, by); y <= Math.max(ay, by); y++) {
        grid[y][ax] = 1;
      }
      for (let x = Math.min(ax, bx); x <= Math.max(ax, bx); x++) {
        grid[by][x] = 1;
      }
    }
  }
  
  // Draw the dungeon
  // Wall color
  const wallColor = '#555555';
  const floorColor = '#bbbbbb';
  
  // Draw walls and floors
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const cellX = x * gridSize;
      const cellY = y * gridSize;
      
      if (grid[y][x] === 0) {
        // Wall
        ctx.fillStyle = wallColor;
        ctx.fillRect(cellX, cellY, gridSize, gridSize);
      } else {
        // Floor
        ctx.fillStyle = floorColor;
        ctx.fillRect(cellX, cellY, gridSize, gridSize);
        
        // Add some floor detail
        if (rng() > 0.9) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
          ctx.beginPath();
          ctx.arc(
            cellX + gridSize / 2 + (rng() - 0.5) * gridSize * 0.5,
            cellY + gridSize / 2 + (rng() - 0.5) * gridSize * 0.5,
            gridSize * 0.1,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }
    }
  }
  
  // Add some decorations
  for (const room of rooms) {
    // Add a random decoration to some rooms
    if (rng() > 0.7) {
      const decorationType = Math.floor(rng() * 3);
      const roomCenterX = (room.x + room.width / 2) * gridSize;
      const roomCenterY = (room.y + room.height / 2) * gridSize;
      
      switch (decorationType) {
        case 0: // Table
          ctx.fillStyle = '#8B4513'; // Brown
          ctx.fillRect(
            roomCenterX - gridSize * 0.4,
            roomCenterY - gridSize * 0.7,
            gridSize * 0.8,
            gridSize * 1.4
          );
          break;
        case 1: // Pillar
          ctx.fillStyle = '#777777';
          ctx.beginPath();
          ctx.arc(
            roomCenterX,
            roomCenterY,
            gridSize * 0.3,
            0,
            Math.PI * 2
          );
          ctx.fill();
          break;
        case 2: // Chest
          ctx.fillStyle = '#8B4513'; // Brown
          ctx.fillRect(
            roomCenterX - gridSize * 0.3,
            roomCenterY - gridSize * 0.3,
            gridSize * 0.6,
            gridSize * 0.6
          );
          // Chest lock
          ctx.fillStyle = '#FFD700'; // Gold
          ctx.fillRect(
            roomCenterX - gridSize * 0.1,
            roomCenterY - gridSize * 0.1,
            gridSize * 0.2,
            gridSize * 0.2
          );
          break;
      }
    }
  }
}

/**
 * Generate a forest map
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Object} config - Map configuration
 * @param {Function} rng - Random number generator
 */
function generateForestMap(ctx, config, rng) {
  const width = config.width;
  const height = config.height;
  const gridSize = config.gridSize;
  
  // Draw grass background
  ctx.fillStyle = '#7cba6b'; // Green
  ctx.fillRect(0, 0, width, height);
  
  // Add texture to the grass
  for (let i = 0; i < width * height / 100; i++) {
    const x = rng() * width;
    const y = rng() * height;
    const size = 2 + rng() * 3;
    
    ctx.fillStyle = rng() > 0.5 ? '#6ba95c' : '#8cc97b';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Draw a path through the forest
  const pathWidth = gridSize * 0.8;
  const pathPoints = [];
  
  // Generate path points
  let x = 0;
  let y = height / 2 + (rng() - 0.5) * height * 0.5;
  pathPoints.push({ x, y });
  
  while (x < width) {
    x += gridSize * (1 + rng() * 2);
    y += (rng() - 0.5) * gridSize * 2;
    y = Math.max(gridSize, Math.min(height - gridSize, y));
    pathPoints.push({ x, y });
  }
  
  // Draw the path
  ctx.fillStyle = '#c2b280'; // Sandy color
  ctx.beginPath();
  ctx.moveTo(pathPoints[0].x, pathPoints[0].y - pathWidth / 2);
  
  // Draw top edge of path
  for (let i = 1; i < pathPoints.length; i++) {
    ctx.lineTo(pathPoints[i].x, pathPoints[i].y - pathWidth / 2);
  }
  
  // Draw bottom edge of path (in reverse)
  for (let i = pathPoints.length - 1; i >= 0; i--) {
    ctx.lineTo(pathPoints[i].x, pathPoints[i].y + pathWidth / 2);
  }
  
  ctx.closePath();
  ctx.fill();
  
  // Add some path texture
  for (let i = 0; i < pathPoints.length * 5; i++) {
    const pathSegment = Math.floor(rng() * (pathPoints.length - 1));
    const t = rng();
    const x = pathPoints[pathSegment].x * (1 - t) + pathPoints[pathSegment + 1].x * t;
    const y = pathPoints[pathSegment].y * (1 - t) + pathPoints[pathSegment + 1].y * t;
    const size = 1 + rng() * 2;
    
    ctx.fillStyle = rng() > 0.5 ? '#b0a172' : '#d4c292';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Draw trees
  const treeCount = Math.floor(width * height / (gridSize * gridSize) * 0.2);
  
  for (let i = 0; i < treeCount; i++) {
    const x = rng() * width;
    const y = rng() * height;
    const size = gridSize * (0.7 + rng() * 0.6);
    
    // Check if tree is not on the path
    let onPath = false;
    for (let j = 0; j < pathPoints.length - 1; j++) {
      const pathX = pathPoints[j].x * (1 - t) + pathPoints[j + 1].x * t;
      const pathY = pathPoints[j].y * (1 - t) + pathPoints[j + 1].y * t;
      const distance = Math.sqrt((x - pathX) ** 2 + (y - pathY) ** 2);
      
      if (distance < pathWidth + size) {
        onPath = true;
        break;
      }
    }
    
    if (!onPath) {
      drawTree(ctx, x, y, size, rng);
    }
  }
  
  // Add some bushes
  const bushCount = Math.floor(width * height / (gridSize * gridSize) * 0.1);
  
  for (let i = 0; i < bushCount; i++) {
    const x = rng() * width;
    const y = rng() * height;
    const size = gridSize * (0.3 + rng() * 0.3);
    
    ctx.fillStyle = rng() > 0.3 ? '#5d9e4e' : '#4f8a41';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Add some rocks
  const rockCount = Math.floor(width * height / (gridSize * gridSize) * 0.05);
  
  for (let i = 0; i < rockCount; i++) {
    const x = rng() * width;
    const y = rng() * height;
    const size = gridSize * (0.2 + rng() * 0.3);
    
    ctx.fillStyle = rng() > 0.5 ? '#aaaaaa' : '#888888';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Draw a tree
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} x - The x coordinate
 * @param {number} y - The y coordinate
 * @param {number} size - The size of the tree
 * @param {Function} rng - Random number generator
 */
function drawTree(ctx, x, y, size, rng) {
  // Tree type
  const treeType = Math.floor(rng() * 3);
  
  switch (treeType) {
    case 0: // Pine tree
      // Trunk
      ctx.fillStyle = '#8B4513'; // Brown
      ctx.fillRect(x - size * 0.1, y, size * 0.2, size * 0.4);
      
      // Foliage (triangular)
      ctx.fillStyle = rng() > 0.5 ? '#2e5d34' : '#1d3d21';
      ctx.beginPath();
      ctx.moveTo(x, y - size * 0.8);
      ctx.lineTo(x - size * 0.5, y);
      ctx.lineTo(x + size * 0.5, y);
      ctx.closePath();
      ctx.fill();
      
      // Second layer of foliage
      ctx.beginPath();
      ctx.moveTo(x, y - size * 0.5);
      ctx.lineTo(x - size * 0.6, y + size * 0.2);
      ctx.lineTo(x + size * 0.6, y + size * 0.2);
      ctx.closePath();
      ctx.fill();
      break;
    
    case 1: // Oak tree
      // Trunk
      ctx.fillStyle = '#8B4513'; // Brown
      ctx.fillRect(x - size * 0.15, y, size * 0.3, size * 0.5);
      
      // Foliage (circular)
      ctx.fillStyle = rng() > 0.5 ? '#4e7a3e' : '#3e6a2e';
      ctx.beginPath();
      ctx.arc(x, y - size * 0.3, size * 0.6, 0, Math.PI * 2);
      ctx.fill();
      break;
    
    case 2: // Willow tree
      // Trunk
      ctx.fillStyle = '#8B4513'; // Brown
      ctx.fillRect(x - size * 0.1, y - size * 0.3, size * 0.2, size * 0.7);
      
      // Foliage (drooping)
      ctx.fillStyle = rng() > 0.5 ? '#6b9158' : '#5a8048';
      ctx.beginPath();
      ctx.arc(x, y - size * 0.5, size * 0.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Drooping branches
      ctx.strokeStyle = ctx.fillStyle;
      ctx.lineWidth = size * 0.05;
      
      for (let i = 0; i < 8; i++) {
        const angle = Math.PI * 2 * (i / 8);
        const startX = x + Math.cos(angle) * size * 0.4;
        const startY = y - size * 0.5 + Math.sin(angle) * size * 0.4;
        const endX = x + Math.cos(angle) * size * 0.7;
        const endY = y + Math.sin(angle) * size * 0.3;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(
          x + Math.cos(angle) * size * 0.6,
          y - size * 0.1 + Math.sin(angle) * size * 0.2,
          endX,
          endY
        );
        ctx.stroke();
      }
      break;
  }
}

/**
 * Generate a cave map
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Object} config - Map configuration
 * @param {Function} rng - Random number generator
 */
function generateCaveMap(ctx, config, rng) {
  const width = config.width;
  const height = config.height;
  const gridSize = config.gridSize;
  const gridWidth = Math.floor(width / gridSize);
  const gridHeight = Math.floor(height / gridSize);
  
  // Create a grid representation of the cave using cellular automata
  let grid = Array(gridHeight).fill().map(() => Array(gridWidth).fill(0));
  
  // Initialize with random walls
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      // More walls near the edges
      const edgeDistance = Math.min(
        x, y, gridWidth - x - 1, gridHeight - y - 1
      ) / Math.min(gridWidth, gridHeight);
      
      const wallChance = 0.4 + (1 - edgeDistance) * 0.4;
      grid[y][x] = rng() < wallChance ? 0 : 1; // 0 is wall, 1 is floor
    }
  }
  
  // Apply cellular automata rules to create natural-looking caves
  for (let iteration = 0; iteration < 4; iteration++) {
    const newGrid = Array(gridHeight).fill().map(() => Array(gridWidth).fill(0));
    
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        // Count neighboring walls
        let wallCount = 0;
        
        for (let ny = -1; ny <= 1; ny++) {
          for (let nx = -1; nx <= 1; nx++) {
            if (nx === 0 && ny === 0) continue;
            
            const neighborX = x + nx;
            const neighborY = y + ny;
            
            // Count edge cells as walls
            if (
              neighborX < 0 || neighborX >= gridWidth ||
              neighborY < 0 || neighborY >= gridHeight ||
              grid[neighborY][neighborX] === 0
            ) {
              wallCount++;
            }
          }
        }
        
        // Apply cellular automata rules
        if (grid[y][x] === 0) {
          // Wall cell
          newGrid[y][x] = wallCount >= 4 ? 0 : 1;
        } else {
          // Floor cell
          newGrid[y][x] = wallCount >= 5 ? 0 : 1;
        }
      }
    }
    
    grid = newGrid;
  }
  
  // Ensure there's a path from top to bottom
  const pathWidth = Math.floor(gridWidth * 0.1);
  const pathX = Math.floor(gridWidth / 2 - pathWidth / 2);
  
  for (let y = 0; y < gridHeight; y++) {
    for (let x = pathX; x < pathX + pathWidth; x++) {
      if (x >= 0 && x < gridWidth) {
        grid[y][x] = 1; // Floor
      }
    }
  }
  
  // Draw the cave
  const wallColor = '#554433'; // Brown
  const floorColor = '#776655'; // Lighter brown
  
  // Draw walls and floors
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const cellX = x * gridSize;
      const cellY = y * gridSize;
      
      if (grid[y][x] === 0) {
        // Wall
        ctx.fillStyle = wallColor;
        ctx.fillRect(cellX, cellY, gridSize, gridSize);
        
        // Add some wall texture
        if (rng() > 0.7) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.beginPath();
          ctx.arc(
            cellX + gridSize / 2 + (rng() - 0.5) * gridSize * 0.5,
            cellY + gridSize / 2 + (rng() - 0.5) * gridSize * 0.5,
            gridSize * 0.2,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      } else {
        // Floor
        ctx.fillStyle = floorColor;
        ctx.fillRect(cellX, cellY, gridSize, gridSize);
        
        // Add some floor detail
        if (rng() > 0.8) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
          ctx.beginPath();
          ctx.arc(
            cellX + gridSize / 2 + (rng() - 0.5) * gridSize * 0.5,
            cellY + gridSize / 2 + (rng() - 0.5) * gridSize * 0.5,
            gridSize * 0.1,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }
    }
  }
  
  // Add some stalagmites and stalactites
  const formationCount = Math.floor(gridWidth * gridHeight * 0.02);
  
  for (let i = 0; i < formationCount; i++) {
    const x = Math.floor(rng() * gridWidth);
    const y = Math.floor(rng() * gridHeight);
    
    if (grid[y][x] === 1) { // Only on floor cells
      const formationType = Math.floor(rng() * 2);
      const formationX = x * gridSize + gridSize / 2;
      const formationY = y * gridSize + gridSize / 2;
      const formationSize = gridSize * (0.3 + rng() * 0.3);
      
      if (formationType === 0) {
        // Stalagmite (from ground)
        ctx.fillStyle = '#665544';
        ctx.beginPath();
        ctx.moveTo(formationX - formationSize / 2, formationY + formationSize / 2);
        ctx.lineTo(formationX, formationY - formationSize);
        ctx.lineTo(formationX + formationSize / 2, formationY + formationSize / 2);
        ctx.closePath();
        ctx.fill();
      } else {
        // Stalactite (from ceiling)
        ctx.fillStyle = '#665544';
        ctx.beginPath();
        ctx.moveTo(formationX - formationSize / 2, formationY - formationSize / 2);
        ctx.lineTo(formationX, formationY + formationSize);
        ctx.lineTo(formationX + formationSize / 2, formationY - formationSize / 2);
        ctx.closePath();
        ctx.fill();
      }
    }
  }
  
  // Add some water pools
  const poolCount = Math.floor(gridWidth * gridHeight * 0.01);
  
  for (let i = 0; i < poolCount; i++) {
    const x = Math.floor(rng() * gridWidth);
    const y = Math.floor(rng() * gridHeight);
    
    if (grid[y][x] === 1) { // Only on floor cells
      const poolX = x * gridSize + gridSize / 2;
      const poolY = y * gridSize + gridSize / 2;
      const poolSize = gridSize * (0.5 + rng() * 0.5);
      
      ctx.fillStyle = 'rgba(68, 85, 153, 0.7)'; // Blue water
      ctx.beginPath();
      ctx.ellipse(poolX, poolY, poolSize, poolSize * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Water highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.ellipse(
        poolX - poolSize * 0.2,
        poolY - poolSize * 0.2,
        poolSize * 0.3,
        poolSize * 0.1,
        Math.PI / 4,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }
}

/**
 * Generate a city map
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Object} config - Map configuration
 * @param {Function} rng - Random number generator
 */
function generateCityMap(ctx, config, rng) {
  const width = config.width;
  const height = config.height;
  const gridSize = config.gridSize;
  const gridWidth = Math.floor(width / gridSize);
  const gridHeight = Math.floor(height / gridSize);
  
  // Draw ground
  ctx.fillStyle = '#aaaaaa'; // Gray for streets
  ctx.fillRect(0, 0, width, height);
  
  // Create a grid for buildings and streets
  const grid = Array(gridHeight).fill().map(() => Array(gridWidth).fill(0)); // 0 = street, 1 = building
  
  // Create main streets
  const mainStreetWidth = 2;
  
  // Horizontal main streets
  for (let i = 0; i < 3; i++) {
    const y = Math.floor(gridHeight * (i + 1) / 4);
    
    for (let x = 0; x < gridWidth; x++) {
      for (let dy = -mainStreetWidth; dy <= mainStreetWidth; dy++) {
        const streetY = y + dy;
        if (streetY >= 0 && streetY < gridHeight) {
          grid[streetY][x] = 0; // Street
        }
      }
    }
  }
  
  // Vertical main streets
  for (let i = 0; i < 3; i++) {
    const x = Math.floor(gridWidth * (i + 1) / 4);
    
    for (let y = 0; y < gridHeight; y++) {
      for (let dx = -mainStreetWidth; dx <= mainStreetWidth; dx++) {
        const streetX = x + dx;
        if (streetX >= 0 && streetX < gridWidth) {
          grid[y][streetX] = 0; // Street
        }
      }
    }
  }
  
  // Create building blocks
  for (let blockY = 0; blockY < 4; blockY++) {
    for (let blockX = 0; blockX < 4; blockX++) {
      const startX = Math.floor(gridWidth * blockX / 4) + mainStreetWidth + 1;
      const endX = Math.floor(gridWidth * (blockX + 1) / 4) - mainStreetWidth - 1;
      const startY = Math.floor(gridHeight * blockY / 4) + mainStreetWidth + 1;
      const endY = Math.floor(gridHeight * (blockY + 1) / 4) - mainStreetWidth - 1;
      
      // Skip if block is too small
      if (endX - startX < 4 || endY - startY < 4) continue;
      
      // Create buildings in the block
      const buildingCount = Math.floor(2 + rng() * 4);
      
      for (let i = 0; i < buildingCount; i++) {
        const buildingWidth = Math.floor(2 + rng() * 4);
        const buildingHeight = Math.floor(2 + rng() * 4);
        const buildingX = startX + Math.floor(rng() * (endX - startX - buildingWidth));
        const buildingY = startY + Math.floor(rng() * (endY - startY - buildingHeight));
        
        // Mark building cells
        for (let y = buildingY; y < buildingY + buildingHeight; y++) {
          for (let x = buildingX; x < buildingX + buildingWidth; x++) {
            if (y >= 0 && y < gridHeight && x >= 0 && x < gridWidth) {
              grid[y][x] = 1; // Building
            }
          }
        }
      }
      
      // Create some smaller streets within the block
      if (rng() > 0.5 && endX - startX > 8) {
        const streetX = startX + Math.floor((endX - startX) / 2);
        
        for (let y = startY; y < endY; y++) {
          grid[y][streetX] = 0; // Street
        }
      }
      
      if (rng() > 0.5 && endY - startY > 8) {
        const streetY = startY + Math.floor((endY - startY) / 2);
        
        for (let x = startX; x < endX; x++) {
          grid[streetY][x] = 0; // Street
        }
      }
    }
  }
  
  // Draw the city
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const cellX = x * gridSize;
      const cellY = y * gridSize;
      
      if (grid[y][x] === 1) {
        // Building
        const buildingColor = rng() > 0.7 ? '#cc8866' : '#ddaa88'; // Varying building colors
        ctx.fillStyle = buildingColor;
        ctx.fillRect(cellX, cellY, gridSize, gridSize);
        
        // Add windows
        if (rng() > 0.3) {
          ctx.fillStyle = 'rgba(173, 216, 230, 0.7)'; // Light blue windows
          const windowSize = gridSize * 0.3;
          const windowSpacing = gridSize * 0.2;
          
          ctx.fillRect(
            cellX + windowSpacing,
            cellY + windowSpacing,
            windowSize,
            windowSize
          );
          
                    ctx.fillRect(
            cellX + gridSize - windowSpacing - windowSize,
            cellY + windowSpacing,
            windowSize,
            windowSize
          );
          
          ctx.fillRect(
            cellX + windowSpacing,
            cellY + gridSize - windowSpacing - windowSize,
            windowSize,
            windowSize
          );
          
          ctx.fillRect(
            cellX + gridSize - windowSpacing - windowSize,
            cellY + gridSize - windowSpacing - windowSize,
            windowSize,
            windowSize
          );
        }
      } else {
        // Street
        ctx.fillStyle = '#aaaaaa'; // Gray
        ctx.fillRect(cellX, cellY, gridSize, gridSize);
        
        // Add street details
        if (rng() > 0.9) {
          // Manhole or drain
          ctx.fillStyle = '#777777';
          ctx.beginPath();
          ctx.arc(
            cellX + gridSize / 2,
            cellY + gridSize / 2,
            gridSize * 0.2,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }
    }
  }
  
  // Add some trees along main streets
  for (let i = 0; i < gridWidth * gridHeight * 0.01; i++) {
    const x = Math.floor(rng() * gridWidth);
    const y = Math.floor(rng() * gridHeight);
    
    // Check if it's near a street but not on a building
    let nearStreet = false;
    let onBuilding = grid[y][x] === 1;
    
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        
        if (
          nx >= 0 && nx < gridWidth &&
          ny >= 0 && ny < gridHeight &&
          grid[ny][nx] === 0
        ) {
          nearStreet = true;
        }
      }
    }
    
    if (nearStreet && !onBuilding) {
      const treeX = x * gridSize + gridSize / 2;
      const treeY = y * gridSize + gridSize / 2;
      const treeSize = gridSize * 0.4;
      
      // Tree trunk
      ctx.fillStyle = '#8B4513'; // Brown
      ctx.fillRect(treeX - treeSize * 0.2, treeY, treeSize * 0.4, treeSize * 0.5);
      
      // Tree foliage
      ctx.fillStyle = '#228B22'; // Forest green
      ctx.beginPath();
      ctx.arc(treeX, treeY - treeSize * 0.3, treeSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Add a central plaza
  const plazaX = Math.floor(gridWidth / 2);
  const plazaY = Math.floor(gridHeight / 2);
  const plazaSize = Math.min(gridWidth, gridHeight) / 10;
  
  for (let y = plazaY - plazaSize; y <= plazaY + plazaSize; y++) {
    for (let x = plazaX - plazaSize; x <= plazaX + plazaSize; x++) {
      if (
        x >= 0 && x < gridWidth &&
        y >= 0 && y < gridHeight
      ) {
        // Plaza pavement
        const cellX = x * gridSize;
        const cellY = y * gridSize;
        
        ctx.fillStyle = '#bbbbbb'; // Lighter gray
        ctx.fillRect(cellX, cellY, gridSize, gridSize);
        
        // Checkerboard pattern
        if ((x + y) % 2 === 0) {
          ctx.fillStyle = '#cccccc'; // Even lighter gray
          ctx.fillRect(cellX, cellY, gridSize, gridSize);
        }
      }
    }
  }
  
  // Add a fountain in the center of the plaza
  const fountainX = plazaX * gridSize + gridSize / 2;
  const fountainY = plazaY * gridSize + gridSize / 2;
  const fountainSize = plazaSize * gridSize * 0.4;
  
  // Fountain base
  ctx.fillStyle = '#999999';
  ctx.beginPath();
  ctx.arc(fountainX, fountainY, fountainSize, 0, Math.PI * 2);
  ctx.fill();
  
  // Fountain water
  ctx.fillStyle = 'rgba(68, 85, 153, 0.7)'; // Blue water
  ctx.beginPath();
  ctx.arc(fountainX, fountainY, fountainSize * 0.7, 0, Math.PI * 2);
  ctx.fill();
  
  // Fountain center
  ctx.fillStyle = '#999999';
  ctx.beginPath();
  ctx.arc(fountainX, fountainY, fountainSize * 0.2, 0, Math.PI * 2);
  ctx.fill();
  
  // Water spray
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 1;
  
  for (let i = 0; i < 12; i++) {
    const angle = Math.PI * 2 * (i / 12);
    const length = fountainSize * (0.3 + rng() * 0.3);
    
    ctx.beginPath();
    ctx.moveTo(fountainX, fountainY);
    ctx.lineTo(
      fountainX + Math.cos(angle) * length,
      fountainY + Math.sin(angle) * length
    );
    ctx.stroke();
  }
}

/**
 * Generate a desert map
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Object} config - Map configuration
 * @param {Function} rng - Random number generator
 */
function generateDesertMap(ctx, config, rng) {
  const width = config.width;
  const height = config.height;
  const gridSize = config.gridSize;
  
  // Draw sand background
  ctx.fillStyle = '#e6c588'; // Sand color
  ctx.fillRect(0, 0, width, height);
  
  // Add texture to the sand
  for (let i = 0; i < width * height / 50; i++) {
    const x = rng() * width;
    const y = rng() * height;
    const size = 1 + rng() * 2;
    
    ctx.fillStyle = rng() > 0.5 ? '#d4b67a' : '#f3d6a0';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Add some dunes
  for (let i = 0; i < 10; i++) {
    const x = rng() * width;
    const y = rng() * height;
    const duneWidth = gridSize * (3 + rng() * 5);
    const duneHeight = gridSize * (1 + rng() * 2);
    
    // Create gradient for dune
    const gradient = ctx.createLinearGradient(
      x - duneWidth / 2,
      y,
      x + duneWidth / 2,
      y
    );
    
    gradient.addColorStop(0, '#d4b67a');
    gradient.addColorStop(0.5, '#f3d6a0');
    gradient.addColorStop(1, '#d4b67a');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(x, y, duneWidth, duneHeight, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Add some rocks
  for (let i = 0; i < width * height / (gridSize * gridSize) * 0.05; i++) {
    const x = rng() * width;
    const y = rng() * height;
    const rockSize = gridSize * (0.2 + rng() * 0.3);
    
    ctx.fillStyle = rng() > 0.5 ? '#a89078' : '#887058';
    ctx.beginPath();
    ctx.arc(x, y, rockSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Add shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(
      x + rockSize * 0.2,
      y + rockSize * 0.3,
      rockSize,
      rockSize * 0.3,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  
  // Add some cacti
  for (let i = 0; i < width * height / (gridSize * gridSize) * 0.02; i++) {
    const x = rng() * width;
    const y = rng() * height;
    const cactusHeight = gridSize * (1 + rng() * 2);
    
    drawCactus(ctx, x, y, cactusHeight, rng);
  }
  
  // Add an oasis
  if (rng() > 0.5) {
    const oasisX = width * (0.3 + rng() * 0.4);
    const oasisY = height * (0.3 + rng() * 0.4);
    const oasisSize = gridSize * (3 + rng() * 5);
    
    // Water
    ctx.fillStyle = 'rgba(68, 118, 153, 0.8)'; // Blue water
    ctx.beginPath();
    ctx.arc(oasisX, oasisY, oasisSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Water highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.ellipse(
      oasisX - oasisSize * 0.2,
      oasisY - oasisSize * 0.2,
      oasisSize * 0.4,
      oasisSize * 0.2,
      Math.PI / 4,
      0,
      Math.PI * 2
    );
    ctx.fill();
    
    // Surrounding vegetation
    for (let i = 0; i < 12; i++) {
      const angle = Math.PI * 2 * (i / 12);
      const distance = oasisSize * (1 + rng() * 0.3);
      const palmX = oasisX + Math.cos(angle) * distance;
      const palmY = oasisY + Math.sin(angle) * distance;
      const palmHeight = gridSize * (1 + rng());
      
      drawPalmTree(ctx, palmX, palmY, palmHeight, rng);
    }
  }
  
  // Add a caravan trail
  const trailPoints = [];
  let x = 0;
  let y = height * (0.3 + rng() * 0.4);
  trailPoints.push({ x, y });
  
  while (x < width) {
    x += gridSize * (1 + rng() * 3);
    y += (rng() - 0.5) * gridSize * 2;
    y = Math.max(gridSize, Math.min(height - gridSize, y));
    trailPoints.push({ x, y });
  }
  
  // Draw the trail
  ctx.strokeStyle = '#d4b67a'; // Slightly darker than sand
  ctx.lineWidth = gridSize * 0.5;
  ctx.beginPath();
  ctx.moveTo(trailPoints[0].x, trailPoints[0].y);
  
  for (let i = 1; i < trailPoints.length; i++) {
    ctx.lineTo(trailPoints[i].x, trailPoints[i].y);
  }
  
  ctx.stroke();
  
  // Add footprints along the trail
  for (let i = 0; i < trailPoints.length - 1; i++) {
    const startX = trailPoints[i].x;
    const startY = trailPoints[i].y;
    const endX = trailPoints[i + 1].x;
    const endY = trailPoints[i + 1].y;
    const distance = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
    const footprintCount = Math.floor(distance / (gridSize * 0.5));
    
    for (let j = 0; j < footprintCount; j++) {
      const t = j / footprintCount;
      const footprintX = startX * (1 - t) + endX * t;
      const footprintY = startY * (1 - t) + endY * t;
      
      if (rng() > 0.7) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.beginPath();
        ctx.ellipse(
          footprintX,
          footprintY,
          gridSize * 0.1,
          gridSize * 0.2,
          Math.atan2(endY - startY, endX - startX),
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
  }
}

/**
 * Draw a cactus
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} x - The x coordinate
 * @param {number} y - The y coordinate
 * @param {number} height - The height of the cactus
 * @param {Function} rng - Random number generator
 */
function drawCactus(ctx, x, y, height, rng) {
  const width = height * 0.3;
  
  // Main body
  ctx.fillStyle = '#2d8659'; // Cactus green
  ctx.beginPath();
  ctx.roundRect(x - width / 2, y - height, width, height, width / 2);
  ctx.fill();
  
  // Arms
  const armCount = Math.floor(rng() * 3);
  
  for (let i = 0; i < armCount; i++) {
    const armHeight = height * (0.3 + rng() * 0.3);
    const armWidth = width * 0.7;
    const armY = y - height * (0.4 + rng() * 0.4);
    const isLeft = rng() > 0.5;
    const armX = x + (isLeft ? -width / 2 : width / 2);
    
    ctx.beginPath();
    ctx.roundRect(
      isLeft ? armX - armWidth : armX,
      armY - armHeight,
      armWidth,
      armHeight,
      armWidth / 2
    );
    ctx.fill();
  }
  
  // Spines
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  
  for (let i = 0; i < height / 5; i++) {
    const spineY = y - i * 5;
    
    // Left spines
    ctx.beginPath();
    ctx.moveTo(x - width / 2, spineY);
    ctx.lineTo(x - width / 2 - width * 0.2, spineY - width * 0.2);
    ctx.stroke();
    
    // Right spines
    ctx.beginPath();
    ctx.moveTo(x + width / 2, spineY);
    ctx.lineTo(x + width / 2 + width * 0.2, spineY - width * 0.2);
    ctx.stroke();
  }
}

/**
 * Draw a palm tree
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} x - The x coordinate
 * @param {number} y - The y coordinate
 * @param {number} height - The height of the palm tree
 * @param {Function} rng - Random number generator
 */
function drawPalmTree(ctx, x, y, height, rng) {
  const trunkWidth = height * 0.15;
  
  // Trunk
  ctx.fillStyle = '#8B4513'; // Brown
  ctx.beginPath();
  ctx.moveTo(x - trunkWidth / 2, y);
  ctx.quadraticCurveTo(
    x + trunkWidth,
    y - height * 0.6,
    x,
    y - height
  );
  ctx.quadraticCurveTo(
    x - trunkWidth,
    y - height * 0.6,
    x + trunkWidth / 2,
    y
  );
  ctx.closePath();
  ctx.fill();
  
  // Leaves
  const leafCount = 5 + Math.floor(rng() * 4);
  
  for (let i = 0; i < leafCount; i++) {
    const angle = Math.PI * 2 * (i / leafCount);
    const leafLength = height * (0.6 + rng() * 0.4);
    const leafWidth = height * 0.2;
    
    ctx.fillStyle = '#2e8b57'; // Sea green
    ctx.beginPath();
    ctx.moveTo(x, y - height);
    
    // Create a curved leaf
    const cp1x = x + Math.cos(angle) * leafLength * 0.3;
    const cp1y = y - height + Math.sin(angle) * leafLength * 0.3;
    const cp2x = x + Math.cos(angle) * leafLength * 0.6;
    const cp2y = y - height + Math.sin(angle) * leafLength * 0.6;
    const endX = x + Math.cos(angle) * leafLength;
    const endY = y - height + Math.sin(angle) * leafLength;
    
    ctx.quadraticCurveTo(cp1x, cp1y, endX, endY);
    
    // Create leaf width
    const perpAngle = angle + Math.PI / 2;
    ctx.lineTo(
      endX + Math.cos(perpAngle) * leafWidth,
      endY + Math.sin(perpAngle) * leafWidth
    );
    
    // Return to center with curve
    ctx.quadraticCurveTo(cp2x, cp2y, x, y - height);
    
    ctx.closePath();
    ctx.fill();
  }
}

/**
 * Generate a token image for a combatant
 * @param {Object} combatant - The combatant data
 * @param {Object} options - Additional options
 * @returns {Promise<string>} A promise that resolves to the generated token as a data URL
 */
export async function generateTokenImage(combatant, options = {}) {
  // Default options
  const tokenOptions = {
    size: options.size || 256,
    format: options.format || 'png',
    quality: options.quality || 0.9,
    backgroundColor: options.backgroundColor || getDefaultBackgroundColor(combatant.type),
    textColor: options.textColor || '#ffffff',
    method: options.method || getDefaultMethod(combatant.type),
    name: combatant.name,
    entityType: combatant.type,
    monsterType: combatant.monsterType || 'unknown',
    creatureType: combatant.monsterType || 'unknown',
    creatureSize: combatant.size || 'medium',
    seed: options.seed || generateSeedFromName(combatant.name)
  };
  
  // Generate the image
  return generateImage(tokenOptions);
}

/**
 * Get the default background color for a combatant type
 * @param {string} type - The combatant type
 * @returns {string} The default background color
 */
function getDefaultBackgroundColor(type) {
  switch (type) {
    case 'player':
      return '#3e4a61'; // Blue
    case 'monster':
      return '#613e3e'; // Red
    case 'npc':
      return '#3e613e'; // Green
    default:
      return '#3e4a61'; // Blue
  }
}

/**
 * Get the default generation method for a combatant type
 * @param {string} type - The combatant type
 * @returns {string} The default generation method
 */
function getDefaultMethod(type) {
  switch (type) {
    case 'player':
      return GenerationMethod.INITIALS;
    case 'monster':
      return GenerationMethod.MONSTER_TYPE;
    case 'npc':
      return GenerationMethod.SILHOUETTE;
    default:
      return GenerationMethod.INITIALS;
  }
}

/**
 * Generate a seed from a name
 * @param {string} name - The name to generate a seed from
 * @returns {number} The generated seed
 */
function generateSeedFromName(name) {
  if (!name) return Math.floor(Math.random() * 10000);
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Export the main functions
export default {
  generateImage,
  generateMapImage,
  generateTokenImage,
  GenerationMethod,
  ImageStyle
};
