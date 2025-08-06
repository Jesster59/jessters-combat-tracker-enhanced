/**
 * Theme Manager for Jesster's Combat Tracker
 * Handles dark/light mode
 */
export class ThemeManager {
  constructor(app) {
    this.app = app;
    this.currentTheme = 'dark'; // Default theme
  }
  
  init() {
    // Load theme from local storage
    const savedTheme = localStorage.getItem('jessterTheme');
    if (savedTheme) {
      this.currentTheme = savedTheme;
    }
    
    // Apply the theme
    this.applyTheme(this.currentTheme);
    
    // Create theme toggle
    this.createThemeToggle();
  }
  
  applyTheme(theme) {
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(theme);
    this.currentTheme = theme;
    
    // Save to local storage
    localStorage.setItem('jessterTheme', theme);
  }
  
  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
    return newTheme;
  }
  
  createThemeToggle() {
    const container = document.getElementById('theme-toggle');
    if (!container) return;
    
    container.innerHTML = `
      <button id="toggle-theme-btn" class="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded">
        <span id="theme-icon" class="${this.currentTheme === 'dark' ? 'text-yellow-400' : 'text-blue-400'}">
          ${this.currentTheme === 'dark' ? '🌙' : '☀️'}
        </span>
        <span>${this.currentTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
      </button>
    `;
    
    // Add event listener
    document.getElementById('toggle-theme-btn').addEventListener('click', () => {
      const newTheme = this.toggleTheme();
      document.getElementById('theme-icon').textContent = newTheme === 'dark' ? '🌙' : '☀️';
      document.getElementById('theme-icon').className = newTheme === 'dark' ? 'text-yellow-400' : 'text-blue-400';
      document.getElementById('toggle-theme-btn').querySelector('span:last-child').textContent = 
        newTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
    });
  }
}
