/**
 * Action History for Jesster's Combat Tracker
 * Tracks actions for undo/redo functionality
 */
class ActionHistory {
  constructor(app) {
    this.app = app;
    this.history = [];
  }
}
