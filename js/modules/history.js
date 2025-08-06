/**
 * Action History for Jesster's Combat Tracker
 * Tracks actions for undo/redo functionality
 */
class ActionHistory {
  constructor(app) {
    this.app = app;
    this.history = [];
    this.position = -1;
    this.maxSize = 50;
  }
  
  addAction(action) {
    // If we're not at the end of the history, remove all actions after current position
    if (this.position < this.history.length - 1) {
      this.history = this.history.slice(0, this.position + 1);
    }
    
    // Add the new action
    this.history.push(action);
    
    // If we've exceeded the max size, remove the oldest action
    if (this.history.length > this.maxSize) {
      this.history.shift();
    } else {
      this.position++;
    }
  }
  
  undo() {
    if (this.position < 0) {
      return false; // Nothing to undo
    }
    
    const action = this.history[this.position];
    if (action.undo) {
      action.undo();
    }
    
    this.position--;
    return true;
  }
  
  redo() {
    if (this.position >= this.history.length - 1) {
      return false; // Nothing to redo
    }
    
    this.position++;
    const action = this.history[this.position];
    if (action.redo) {
      action.redo();
    }
    
    return true;
  }
  
  clear() {
    this.history = [];
    this.position = -1;
  }
}
