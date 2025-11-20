// Keyboard Shortcuts Management Component
import React, { useState, useEffect } from 'react';
import {
  Keyboard, Edit3, Save, X, Plus, Trash2, Download, Upload, AlertTriangle,
  CheckCircle, Search, Filter, RotateCcw
} from 'lucide-react';
import { KeyboardShortcut } from '../types/console.types';
import { keyboardShortcutManager } from '../services/keyboardShortcutManager';

interface ShortcutsManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShortcutsManager: React.FC<ShortcutsManagerProps> = ({ isOpen, onClose }) => {
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([]);
  const [editingShortcut, setEditingShortcut] = useState<KeyboardShortcut | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newShortcut, setNewShortcut] = useState<Partial<KeyboardShortcut>>({
    id: '',
    key: '',
    modifiers: [],
    action: '',
    description: '',
    enabled: true,
  });

  useEffect(() => {
    if (isOpen) {
      loadShortcuts();
    }
  }, [isOpen]);

  const loadShortcuts = () => {
    const allShortcuts = keyboardShortcutManager.getAllShortcuts();
    setShortcuts(allShortcuts);
  };

  const getShortcutString = (shortcut: KeyboardShortcut): string => {
    const parts: string[] = [];
    
    if (shortcut.modifiers.includes('ctrl')) parts.push('Ctrl');
    if (shortcut.modifiers.includes('alt')) parts.push('Alt');
    if (shortcut.modifiers.includes('shift')) parts.push('Shift');
    if (shortcut.modifiers.includes('meta')) parts.push('Cmd');
    
    parts.push(formatKey(shortcut.key));
    return parts.join('+');
  };

  const formatKey = (key: string): string => {
    const keyMap: Record<string, string> = {
      'ArrowUp': '↑',
      'ArrowDown': '↓',
      'ArrowLeft': '←',
      'ArrowRight': '→',
      'Enter': '↵',
      'Escape': 'Esc',
      'Backspace': '⌫',
      'Delete': 'Del',
      'Tab': '⇥',
      ' ': 'Space',
    };
    return keyMap[key] || key.toUpperCase();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.preventDefault();
    const key = e.key;
    const modifiers: ('ctrl' | 'alt' | 'shift' | 'meta')[] = [];
    
    if (e.ctrlKey || e.metaKey) modifiers.push('ctrl');
    if (e.altKey) modifiers.push('alt');
    if (e.shiftKey) modifiers.push('shift');
    if (e.metaKey) modifiers.push('meta');
    
    if (editingShortcut) {
      setEditingShortcut({
        ...editingShortcut,
        key,
        modifiers,
      });
    } else {
      setNewShortcut(prev => ({
        ...prev,
        key,
        modifiers,
      }));
    }
  };

  const saveShortcut = async (shortcut: KeyboardShortcut) => {
    const success = keyboardShortcutManager.updateShortcut(shortcut.id, shortcut);
    if (success) {
      setEditingShortcut(null);
      loadShortcuts();
      checkConflicts();
    } else {
      alert('Failed to save shortcut. Possible conflict detected.');
    }
  };

  const addShortcut = () => {
    if (!newShortcut.id || !newShortcut.key || !newShortcut.action) {
      alert('Please fill in all required fields');
      return;
    }

    const shortcut: KeyboardShortcut = {
      id: newShortcut.id!,
      key: newShortcut.key!,
      modifiers: newShortcut.modifiers || [],
      action: newShortcut.action!,
      description: newShortcut.description || '',
      enabled: newShortcut.enabled ?? true,
    };

    const success = keyboardShortcutManager.addShortcut(shortcut);
    if (success) {
      setShowAddForm(false);
      setNewShortcut({
        id: '',
        key: '',
        modifiers: [],
        action: '',
        description: '',
        enabled: true,
      });
      loadShortcuts();
      checkConflicts();
    } else {
      alert('Failed to add shortcut. Possible conflict detected.');
    }
  };

  const deleteShortcut = (id: string) => {
    if (confirm('Are you sure you want to delete this shortcut?')) {
      keyboardShortcutManager.removeShortcut(id);
      loadShortcuts();
      checkConflicts();
    }
  };

  const resetToDefaults = () => {
    if (confirm('Reset all shortcuts to default? This will overwrite your current shortcuts.')) {
      keyboardShortcutManager.resetToDefaults();
      loadShortcuts();
      checkConflicts();
    }
  };

  const exportShortcuts = () => {
    const data = keyboardShortcutManager.exportShortcuts();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'keyboard-shortcuts.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importShortcuts = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string;
        const success = keyboardShortcutManager.importShortcuts(data);
        if (success) {
          loadShortcuts();
          checkConflicts();
          alert('Shortcuts imported successfully');
        } else {
          alert('Failed to import shortcuts. Please check the file format.');
        }
      } catch (error) {
        alert('Invalid file format');
      }
    };
    reader.readAsText(file);
  };

  const checkConflicts = () => {
    const allShortcuts = keyboardShortcutManager.getAllShortcuts();
    const keyCombos = new Map<string, string[]>();
    
    for (const shortcut of allShortcuts) {
      const combo = getShortcutString(shortcut);
      if (!keyCombos.has(combo)) {
        keyCombos.set(combo, []);
      }
      keyCombos.get(combo)!.push(shortcut.id);
    }
    
    const conflictingIds: string[] = [];
    for (const [combo, ids] of keyCombos.entries()) {
      if (ids.length > 1) {
        conflictingIds.push(...ids);
      }
    }
    
    setConflicts(conflictingIds);
  };

  const filteredShortcuts = shortcuts.filter(shortcut => {
    const matchesSearch = shortcut.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         getShortcutString(shortcut).toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterCategory === 'all' || 
                         (filterCategory === 'enabled' && shortcut.enabled) ||
                         (filterCategory === 'disabled' && !shortcut.enabled) ||
                         (filterCategory === 'conflicts' && conflicts.includes(shortcut.id));
    
    return matchesSearch && matchesFilter;
  });

  const categories = keyboardShortcutManager.getShortcutsByCategory();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-900 px-6 py-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Keyboard className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Keyboard Shortcuts</h2>
            {conflicts.length > 0 && (
              <span className="bg-red-600 text-white px-2 py-1 rounded-full text-xs">
                {conflicts.length} conflicts
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls */}
        <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search shortcuts..."
                className="w-full bg-gray-700 text-gray-200 rounded pl-10 pr-4 py-2 text-sm"
              />
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-gray-700 text-gray-200 rounded px-3 py-2 text-sm"
            >
              <option value="all">All Shortcuts</option>
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
              <option value="conflicts">Conflicts Only</option>
            </select>

            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Shortcut
            </button>

            <div className="flex gap-2">
              <button
                onClick={exportShortcuts}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              
              <label className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm flex items-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={importShortcuts}
                  className="hidden"
                />
              </label>

              <button
                onClick={resetToDefaults}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded text-sm flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>

          {conflicts.length > 0 && (
            <div className="bg-red-900 border border-red-700 rounded p-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="text-red-200 text-sm">
                {conflicts.length} shortcut conflict(s) detected. Please resolve by editing conflicting shortcuts.
              </span>
            </div>
          )}
        </div>

        {/* Shortcuts List */}
        <div className="overflow-y-auto max-h-[60vh]">
          {Object.entries(categories).map(([category, categoryShortcuts]) => {
            const categoryFiltered = categoryShortcuts.filter(s => 
              filteredShortcuts.some(f => f.id === s.id)
            );
            
            if (categoryFiltered.length === 0) return null;

            return (
              <div key={category} className="border-b border-gray-700 last:border-b-0">
                <div className="bg-gray-750 px-6 py-2">
                  <h3 className="text-sm font-medium text-gray-300">{category}</h3>
                </div>
                <div className="divide-y divide-gray-700">
                  {categoryFiltered.map((shortcut) => (
                    <div
                      key={shortcut.id}
                      className={`px-6 py-3 hover:bg-gray-750 transition-colors ${
                        conflicts.includes(shortcut.id) ? 'bg-red-900/20' : ''
                      }`}
                    >
                      {editingShortcut?.id === shortcut.id ? (
                        <div className="flex items-center gap-4">
                          <div className="flex-1 grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Key Combination</label>
                              <div
                                className="bg-gray-700 rounded px-3 py-2 text-sm font-mono min-h-[36px] flex items-center"
                                onKeyDown={handleKeyDown}
                                tabIndex={0}
                              >
                                {getShortcutString(editingShortcut) || 'Press keys...'}
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Action</label>
                              <input
                                type="text"
                                value={editingShortcut.action}
                                onChange={(e) => setEditingShortcut(prev => prev ? {...prev, action: e.target.value} : null)}
                                className="w-full bg-gray-700 text-gray-200 rounded px-3 py-2 text-sm"
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-xs text-gray-400 mb-1">Description</label>
                              <input
                                type="text"
                                value={editingShortcut.description}
                                onChange={(e) => setEditingShortcut(prev => prev ? {...prev, description: e.target.value} : null)}
                                className="w-full bg-gray-700 text-gray-200 rounded px-3 py-2 text-sm"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => saveShortcut(editingShortcut)}
                              className="text-green-400 hover:text-green-300 p-1"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingShortcut(null)}
                              className="text-gray-400 hover:text-gray-300 p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-mono text-sm bg-gray-700 px-2 py-1 rounded text-blue-300">
                                {getShortcutString(shortcut)}
                              </span>
                              <span className="text-sm text-gray-200 font-medium">
                                {shortcut.action}
                              </span>
                              {conflicts.includes(shortcut.id) && (
                                <span className="text-red-400 text-xs flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  Conflict
                                </span>
                              )}
                              {!shortcut.enabled && (
                                <span className="text-gray-500 text-xs">Disabled</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400">{shortcut.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingShortcut(shortcut)}
                              className="text-gray-400 hover:text-gray-300 p-1"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteShortcut(shortcut.id)}
                              className="text-gray-400 hover:text-red-400 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Shortcut Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Add Shortcut</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">ID</label>
                  <input
                    type="text"
                    value={newShortcut.id || ''}
                    onChange={(e) => setNewShortcut(prev => ({ ...prev, id: e.target.value }))}
                    className="w-full bg-gray-700 text-gray-200 rounded px-3 py-2 text-sm"
                    placeholder="unique-shortcut-id"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Key Combination</label>
                  <div
                    className="bg-gray-700 rounded px-3 py-2 text-sm font-mono min-h-[36px] flex items-center"
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                  >
                    {newShortcut.key ? getShortcutString(newShortcut as KeyboardShortcut) : 'Press keys...'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Action</label>
                  <input
                    type="text"
                    value={newShortcut.action || ''}
                    onChange={(e) => setNewShortcut(prev => ({ ...prev, action: e.target.value }))}
                    className="w-full bg-gray-700 text-gray-200 rounded px-3 py-2 text-sm"
                    placeholder="action-name"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Description</label>
                  <input
                    type="text"
                    value={newShortcut.description || ''}
                    onChange={(e) => setNewShortcut(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-gray-700 text-gray-200 rounded px-3 py-2 text-sm"
                    placeholder="Description of what this shortcut does"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newShortcut.enabled ?? true}
                    onChange={(e) => setNewShortcut(prev => ({ ...prev, enabled: e.target.checked }))}
                    className="rounded"
                  />
                  <label className="text-sm text-gray-300">Enabled</label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={addShortcut}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm"
                >
                  Add Shortcut
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShortcutsManager;