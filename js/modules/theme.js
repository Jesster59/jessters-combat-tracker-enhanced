/**
 * Theme Manager for Jesster's Combat Tracker
 * Handles theme and appearance settings
 */
export class ThemeManager {
  constructor(app) {
    this.app = app;
    this.darkMode = true; // Default to dark mode
  }
  
  init() {
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('jesster_theme');
    if (savedTheme) {
      this.darkMode = savedTheme === 'dark';
    } else {
      // Check system preference
      this.darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    // Apply theme
    this.applyTheme();
    
    console.log("Theme initialized:", this.darkMode ? "dark" : "light");
  }
  
  applyTheme() {
    // For now, we always use dark mode
    document.documentElement.classList.add('dark');
  }
  
  toggleTheme() {
    this.darkMode = !this.darkMode;
    this.applyTheme();
    localStorage.setItem('jesster_theme', this.darkMode ? 'dark' : 'light');
    return this.darkMode;
  }
}
