import React, { useState, useRef, useMemo } from 'react';
import {
  Save,
  FolderOpen,
  Download,
  Trash2,
  Upload,
  Edit3,
  Copy,
  Calendar,
  X,
  Check,
  AlertCircle,
  Archive,
  Code2,
  FileCode,
  Palette,
  Lock,
  Globe,
  ChevronDown,
  Star,
  Sparkles,
  Plus,
  Search,
  FileText
} from 'lucide-react';
import { CodeSnippet, SnippetType, SnippetScope } from '../types';
import {
  exportSnippetAsJSON,
  importSnippetFromJSON,
  exportAllSnippets,
  searchSnippets,
  sortSnippets,
  getSnippetStats,
  filterByType,
  detectSnippetType,
  getRecommendedSnippets
} from '../utils/snippetUtils';

interface SnippetManagerProps {
  snippets: CodeSnippet[];
  onSave: (name: string, html: string, css: string, javascript: string, description?: string, tags?: string[], category?: string, type?: SnippetType, scope?: SnippetScope) => void;
  onLoad: (snippet: CodeSnippet) => void;
  onInsert: (snippet: CodeSnippet) => void; // NEW: Insert mode
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<CodeSnippet>) => void;
  currentCode: {
    html: string;
    css: string;
    javascript: string;
  };
}

type SortOption = 'name' | 'date' | 'updated';

const SnippetManager: React.FC<SnippetManagerProps> = ({
  snippets,
  onSave,
  onLoad,
  onInsert,
  onDelete,
  onUpdate,
  currentCode,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSnippets, setShowSnippets] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<CodeSnippet | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('updated');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showStats, setShowStats] = useState(false);
  const [typeFilter, setTypeFilter] = useState<SnippetType | 'all'>('all');
  const [showRecommended, setShowRecommended] = useState(false);

  // Form states
  const [snippetName, setSnippetName] = useState('');
  const [snippetDescription, setSnippetDescription] = useState('');
  const [snippetTags, setSnippetTags] = useState('');
  const [snippetCategory, setSnippetCategory] = useState('');
  const [snippetType, setSnippetType] = useState<SnippetType>('full');
  const [snippetScope, setSnippetScope] = useState<SnippetScope>('private');

  // Import/Export states
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  // Dropdown states for snippet actions
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get recommended snippets
  const recommendedSnippets = useMemo(() => getRecommendedSnippets(), []);

  // Filter and sort snippets
  const filteredSnippets = useMemo(() => {
    let filtered = searchSnippets(snippets, searchQuery);

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(snippet => snippet.category === selectedCategory);
    }

    filtered = filterByType(filtered, typeFilter);

    return sortSnippets(filtered, sortBy);
  }, [snippets, searchQuery, selectedCategory, sortBy, typeFilter]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(snippets.map(s => s.category).filter(Boolean))];
    return ['all', ...cats];
  }, [snippets]);

  // Get snippet statistics
  const stats = useMemo(() => getSnippetStats(snippets), [snippets]);

  const resetForm = () => {
    setSnippetName('');
    setSnippetDescription('');
    setSnippetTags('');
    setSnippetCategory('');
    setSnippetType('full');
    setSnippetScope('private');
    setEditingSnippet(null);
  };

  const handleSave = () => {
    if (snippetName.trim()) {
      const tags = snippetTags.split(',').map(tag => tag.trim()).filter(Boolean);

      if (editingSnippet) {
        // Update existing snippet
        onUpdate(editingSnippet.id, {
          name: snippetName.trim(),
          description: snippetDescription.trim() || undefined,
          tags: tags.length > 0 ? tags : undefined,
          category: snippetCategory.trim() || undefined,
          html: currentCode.html,
          css: currentCode.css,
          javascript: currentCode.javascript,
          type: snippetType,
          scope: snippetScope,
          updatedAt: new Date().toISOString(),
        });
      } else {
        // Create new snippet
        onSave(
          snippetName.trim(),
          currentCode.html,
          currentCode.css,
          currentCode.javascript,
          snippetDescription.trim() || undefined,
          tags.length > 0 ? tags : undefined,
          snippetCategory.trim() || undefined,
          snippetType,
          snippetScope
        );
      }

      resetForm();
      setIsModalOpen(false);
    }
  };

  const handleEdit = (snippet: CodeSnippet) => {
    setEditingSnippet(snippet);
    setSnippetName(snippet.name);
    setSnippetDescription(snippet.description || '');
    setSnippetTags(snippet.tags?.join(', ') || '');
    setSnippetCategory(snippet.category || '');
    setSnippetType(snippet.type || detectSnippetType(snippet));
    setSnippetScope(snippet.scope || 'private');
    setIsModalOpen(true);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(null);

    try {
      const snippet = await importSnippetFromJSON(file);
      onSave(
        snippet.name,
        snippet.html,
        snippet.css,
        snippet.javascript,
        snippet.description,
        snippet.tags,
        snippet.category,
        snippet.type || detectSnippetType(snippet),
        snippet.scope || 'private'
      );
      setImportSuccess(`Successfully imported "${snippet.name}"`);
      setTimeout(() => setImportSuccess(null), 3000);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Import failed');
      setTimeout(() => setImportError(null), 5000);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const duplicateSnippet = (snippet: CodeSnippet) => {
    onSave(
      `${snippet.name} (Copy)`,
      snippet.html,
      snippet.css,
      snippet.javascript,
      snippet.description,
      snippet.tags,
      snippet.category,
      snippet.type || detectSnippetType(snippet),
      snippet.scope || 'private'
    );
  };

  const getTypeIcon = (type?: SnippetType) => {
    const effectiveType = type || 'full';
    switch (effectiveType) {
      case 'html': return <FileCode className="w-3 h-3" />;
      case 'css': return <Palette className="w-3 h-3" />;
      case 'javascript': return <Code2 className="w-3 h-3" />;
      case 'full': return <Sparkles className="w-3 h-3" />;
      default: return <FileText className="w-3 h-3" />;
    }
  };

  const getTypeLabel = (type?: SnippetType) => {
    const effectiveType = type || 'full';
    switch (effectiveType) {
      case 'html': return 'HTML';
      case 'css': return 'CSS';
      case 'javascript': return 'JavaScript';
      case 'full': return 'Full Page';
      default: return 'Unknown';
    }
  };

  const getTypeColor = (type?: SnippetType) => {
    const effectiveType = type || 'full';
    switch (effectiveType) {
      case 'html': return 'bg-orange-600 text-orange-100';
      case 'css': return 'bg-blue-600 text-blue-100';
      case 'javascript': return 'bg-yellow-600 text-yellow-100';
      case 'full': return 'bg-purple-600 text-purple-100';
      default: return 'bg-gray-600 text-gray-100';
    }
  };

  const openModal = () => {
    // Auto-detect type based on current code when opening
    const detectedType = detectSnippetType(currentCode);
    setSnippetType(detectedType);
    setIsModalOpen(true);
  };

  const renderSnippetCard = (snippet: CodeSnippet, isRecommended = false) => {
    const snippetType = snippet.type || detectSnippetType(snippet);
    const snippetScope = snippet.scope || 'private';
    const isMenuOpen = openActionMenu === snippet.id;

    return (
      <div
        key={snippet.id}
        className="flex items-start justify-between p-4 bg-matte-black rounded-lg border border-gray-600 hover:border-gray-500 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h4 className="text-sm font-medium text-gray-200 truncate">
              {snippet.name}
            </h4>

            {/* Type Badge */}
            <span className={`px-2 py-0.5 text-xs rounded flex items-center gap-1 ${getTypeColor(snippetType)}`}>
              {getTypeIcon(snippetType)}
              {getTypeLabel(snippetType)}
            </span>

            {/* Scope Indicator */}
            <span className={`px-2 py-0.5 text-xs rounded ${snippetScope === 'public' ? 'bg-green-600 text-green-100' : 'bg-gray-700 text-gray-300'}`}>
              {snippetScope === 'public' ? <Globe className="w-3 h-3 inline mr-1" /> : <Lock className="w-3 h-3 inline mr-1" />}
              {snippetScope}
            </span>

            {snippet.category && (
              <span className="px-2 py-0.5 bg-blue-600 text-blue-100 text-xs rounded">
                {snippet.category}
              </span>
            )}

            {isRecommended && (
              <span className="px-2 py-0.5 bg-yellow-600 text-yellow-100 text-xs rounded flex items-center gap-1">
                <Star className="w-3 h-3" />
                Recommended
              </span>
            )}
          </div>

          {snippet.description && (
            <p className="text-xs text-gray-400 mb-2 line-clamp-2">
              {snippet.description}
            </p>
          )}

          {snippet.tags && snippet.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {snippet.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {!isRecommended && (
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(snippet.createdAt)}
              </span>
              {snippet.updatedAt && snippet.updatedAt !== snippet.createdAt && (
                <span className="flex items-center gap-1">
                  <Edit3 className="w-3 h-3" />
                  Updated {formatDate(snippet.updatedAt)}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 ml-4 relative">
          {/* Load/Insert Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setOpenActionMenu(isMenuOpen ? null : snippet.id)}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded flex items-center gap-1 text-xs transition-colors"
              title="Load Snippet"
            >
              <FolderOpen className="w-4 h-4" />
              Load
              <ChevronDown className="w-3 h-3" />
            </button>

            {isMenuOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setOpenActionMenu(null)}
                />

                {/* Dropdown Menu */}
                <div className="absolute top-full right-0 mt-1 bg-dark-gray border border-gray-600 rounded-lg shadow-lg py-1 z-20 min-w-[150px]">
                  <button
                    onClick={() => {
                      onLoad(snippet);
                      setOpenActionMenu(null);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Download className="w-3 h-3" />
                    Replace All
                  </button>
                  <button
                    onClick={() => {
                      onInsert(snippet);
                      setOpenActionMenu(null);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Plus className="w-3 h-3" />
                    Insert Code
                  </button>
                </div>
              </>
            )}
          </div>

          {!isRecommended && (
            <>
              <button
                onClick={() => duplicateSnippet(snippet)}
                className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-blue-400 transition-colors"
                title="Duplicate Snippet"
              >
                <Copy className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleEdit(snippet)}
                className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-yellow-400 transition-colors"
                title="Edit Snippet"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <button
                onClick={() => exportSnippetAsJSON(snippet)}
                className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-purple-400 transition-colors"
                title="Export Snippet"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={() => onDelete(snippet.id)}
                className="p-2 hover:bg-red-600 rounded text-gray-400 hover:text-red-200 transition-colors"
                title="Delete Snippet"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}

          {isRecommended && (
            <button
              onClick={() => duplicateSnippet(snippet)}
              className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-blue-400 transition-colors"
              title="Add to My Snippets"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
        >
          <Save className="w-4 h-4" />
          Save Snippet
        </button>

        <button
          onClick={() => setShowSnippets(!showSnippets)}
          className="flex items-center gap-2 px-3 py-2 bg-dark-gray hover:bg-gray-600 text-gray-200 rounded-lg transition-colors text-sm"
        >
          <FolderOpen className="w-4 h-4" />
          Snippets ({snippets.length})
        </button>

        {snippets.length > 0 && (
          <button
            onClick={() => exportAllSnippets(snippets)}
            className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
            title="Export all snippets"
          >
            <Archive className="w-4 h-4" />
            Export All
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
          title="Import snippet"
        >
          <Upload className="w-4 h-4" />
          Import
        </button>
      </div>

      {/* Import/Export Feedback */}
      {(importError || importSuccess) && (
        <div className="mt-2">
          {importError && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-900 border border-red-700 rounded-lg text-red-200 text-sm">
              <AlertCircle className="w-4 h-4" />
              {importError}
            </div>
          )}
          {importSuccess && (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-900 border border-green-700 rounded-lg text-green-200 text-sm">
              <Check className="w-4 h-4" />
              {importSuccess}
            </div>
          )}
        </div>
      )}

      {/* Snippets Panel */}
      {showSnippets && (
        <div className="mt-4 bg-dark-gray border border-gray-700 rounded-lg overflow-hidden">
          {/* Header with controls */}
          <div className="bg-matte-black px-4 py-3 border-b border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-300">
                {showRecommended ? 'Recommended Snippets' : 'My Snippets'}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowRecommended(!showRecommended)}
                  className={`px-3 py-1 rounded text-xs transition-colors ${showRecommended ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                >
                  {showRecommended ? 'Show My Snippets' : 'Show Recommended'}
                </button>
                <button
                  onClick={() => setShowStats(!showStats)}
                  className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {showStats ? 'Hide Stats' : 'Show Stats'}
                </button>
              </div>
            </div>

            {/* Statistics */}
            {showStats && !showRecommended && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 p-3 bg-dark-gray rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-400">{stats.totalSnippets}</div>
                  <div className="text-xs text-gray-400">Snippets</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">{Math.round(stats.totalSize / 1024)}KB</div>
                  <div className="text-xs text-gray-400">Total Size</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-400">{stats.categories}</div>
                  <div className="text-xs text-gray-400">Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-400">{stats.tags}</div>
                  <div className="text-xs text-gray-400">Tags</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-400">{Math.round(stats.averageSize / 1024)}KB</div>
                  <div className="text-xs text-gray-400">Avg Size</div>
                </div>
              </div>
            )}

            {/* Search and filters - Only show for user snippets */}
            {!showRecommended && (
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search snippets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-dark-gray border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>

                {/* Type Filter */}
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as SnippetType | 'all')}
                  className="px-3 py-2 bg-dark-gray border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:border-blue-500 text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="full">Full Page</option>
                  <option value="html">HTML Only</option>
                  <option value="css">CSS Only</option>
                  <option value="javascript">JavaScript Only</option>
                </select>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 bg-dark-gray border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:border-blue-500 text-sm"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:border-blue-500 text-sm"
                >
                  <option value="updated">Recently Updated</option>
                  <option value="date">Recently Created</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
            )}
          </div>

          {/* Snippets list */}
          <div className="max-h-96 overflow-y-auto">
            {showRecommended ? (
              <div className="space-y-2 p-4">
                {recommendedSnippets.map((snippet) => renderSnippetCard(snippet, true))}
              </div>
            ) : (
              <>
                {filteredSnippets.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {searchQuery || selectedCategory !== 'all' || typeFilter !== 'all'
                      ? 'No snippets match your filters'
                      : 'No snippets saved yet'}
                  </div>
                ) : (
                  <div className="space-y-2 p-4">
                    {filteredSnippets.map((snippet) => renderSnippetCard(snippet, false))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Save/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-gray border border-gray-700 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-200">
                {editingSnippet ? 'Edit Snippet' : 'Save New Snippet'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={snippetName}
                  onChange={(e) => setSnippetName(e.target.value)}
                  placeholder="Enter snippet name"
                  className="w-full px-3 py-2 bg-matte-black border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={snippetDescription}
                  onChange={(e) => setSnippetDescription(e.target.value)}
                  placeholder="Optional description"
                  rows={3}
                  className="w-full px-3 py-2 bg-matte-black border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSnippetType('full')}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors flex items-center justify-center gap-2 ${snippetType === 'full'
                        ? 'border-purple-500 bg-purple-500/20 text-purple-200'
                        : 'border-gray-600 bg-matte-black text-gray-400 hover:border-gray-500'
                      }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    Full Page
                  </button>
                  <button
                    onClick={() => setSnippetType('html')}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors flex items-center justify-center gap-2 ${snippetType === 'html'
                        ? 'border-orange-500 bg-orange-500/20 text-orange-200'
                        : 'border-gray-600 bg-matte-black text-gray-400 hover:border-gray-500'
                      }`}
                  >
                    <FileCode className="w-4 h-4" />
                    HTML
                  </button>
                  <button
                    onClick={() => setSnippetType('css')}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors flex items-center justify-center gap-2 ${snippetType === 'css'
                        ? 'border-blue-500 bg-blue-500/20 text-blue-200'
                        : 'border-gray-600 bg-matte-black text-gray-400 hover:border-gray-500'
                      }`}
                  >
                    <Palette className="w-4 h-4" />
                    CSS
                  </button>
                  <button
                    onClick={() => setSnippetType('javascript')}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors flex items-center justify-center gap-2 ${snippetType === 'javascript'
                        ? 'border-yellow-500 bg-yellow-500/20 text-yellow-200'
                        : 'border-gray-600 bg-matte-black text-gray-400 hover:border-gray-500'
                      }`}
                  >
                    <Code2 className="w-4 h-4" />
                    JavaScript
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Scope *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSnippetScope('private')}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors flex items-center justify-center gap-2 ${snippetScope === 'private'
                        ? 'border-gray-500 bg-gray-500/20 text-gray-200'
                        : 'border-gray-600 bg-matte-black text-gray-400 hover:border-gray-500'
                      }`}
                  >
                    <Lock className="w-4 h-4" />
                    Private
                  </button>
                  <button
                    onClick={() => setSnippetScope('public')}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors flex items-center justify-center gap-2 ${snippetScope === 'public'
                        ? 'border-green-500 bg-green-500/20 text-green-200'
                        : 'border-gray-600 bg-matte-black text-gray-400 hover:border-gray-500'
                      }`}
                  >
                    <Globe className="w-4 h-4" />
                    Public
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Public snippets are ready for future sharing features
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={snippetCategory}
                  onChange={(e) => setSnippetCategory(e.target.value)}
                  placeholder="e.g., Components, Layouts, Animations"
                  className="w-full px-3 py-2 bg-matte-black border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  value={snippetTags}
                  onChange={(e) => setSnippetTags(e.target.value)}
                  placeholder="Comma-separated tags (e.g., responsive, animation, form)"
                  className="w-full px-3 py-2 bg-matte-black border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate multiple tags with commas
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!snippetName.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {editingSnippet ? 'Update' : 'Save'} Snippet
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SnippetManager;
