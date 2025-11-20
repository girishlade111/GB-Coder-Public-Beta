export interface ExternalLibrary {
  id: string;
  name: string;
  url: string;
  type: 'css' | 'js';
  description?: string;
  addedAt: string;
}

const STORAGE_KEY = 'gb-coder-external-libraries';

class ExternalLibraryService {
  private libraries: ExternalLibrary[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.libraries = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load external libraries from storage:', error);
      this.libraries = [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.libraries));
    } catch (error) {
      console.error('Failed to save external libraries to storage:', error);
    }
  }

  // Get all libraries
  getLibraries(): ExternalLibrary[] {
    return [...this.libraries];
  }

  // Get libraries by type
  getLibrariesByType(type: 'css' | 'js'): ExternalLibrary[] {
    return this.libraries.filter(lib => lib.type === type);
  }

  // Add a new library
  addLibrary(library: Omit<ExternalLibrary, 'id' | 'addedAt'>): ExternalLibrary {
    const newLibrary: ExternalLibrary = {
      ...library,
      id: this.generateId(),
      addedAt: new Date().toISOString(),
    };

    this.libraries.push(newLibrary);
    this.saveToStorage();
    return newLibrary;
  }

  // Remove a library by ID
  removeLibrary(id: string): boolean {
    const index = this.libraries.findIndex(lib => lib.id === id);
    if (index !== -1) {
      this.libraries.splice(index, 1);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // Update a library
  updateLibrary(id: string, updates: Partial<Omit<ExternalLibrary, 'id' | 'addedAt'>>): ExternalLibrary | null {
    const index = this.libraries.findIndex(lib => lib.id === id);
    if (index !== -1) {
      this.libraries[index] = { ...this.libraries[index], ...updates };
      this.saveToStorage();
      return this.libraries[index];
    }
    return null;
  }

  // Check if a library URL already exists
  libraryExists(url: string): boolean {
    return this.libraries.some(lib => lib.url === url);
  }

  // Clear all libraries
  clearAll(): void {
    this.libraries = [];
    this.saveToStorage();
  }

  // Generate HTML tags for injecting libraries into iframe
  generateInjectionHTML(): string {
    const cssLibraries = this.getLibrariesByType('css');
    const jsLibraries = this.getLibrariesByType('js');

    let html = '';

    // Add CSS links
    cssLibraries.forEach(lib => {
      html += `    <link rel="stylesheet" href="${lib.url}" crossorigin="anonymous">\n`;
    });

    // Add JS scripts
    jsLibraries.forEach(lib => {
      html += `    <script src="${lib.url}" crossorigin="anonymous"></script>\n`;
    });

    return html;
  }

  // Get popular library templates
  getPopularLibraries(): Array<{
    name: string;
    url: string;
    type: 'css' | 'js';
    description?: string;
  }> {
    return [
      { name: 'Bootstrap', url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css', type: 'css' as const, description: 'CSS Framework' },
      { name: 'Tailwind CSS', url: 'https://cdn.tailwindcss.com', type: 'css' as const, description: 'Utility-first CSS Framework' },
      { name: 'jQuery', url: 'https://code.jquery.com/jquery-3.7.1.min.js', type: 'js' as const, description: 'JavaScript Library' },
      { name: 'React', url: 'https://unpkg.com/react@18/umd/react.development.js', type: 'js' as const, description: 'JavaScript Library' },
      { name: 'Vue.js', url: 'https://unpkg.com/vue@3/dist/vue.global.js', type: 'js' as const, description: 'JavaScript Framework' },
      { name: 'Font Awesome', url: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css', type: 'css' as const, description: 'Icon Library' },
      { name: 'Chart.js', url: 'https://cdn.jsdelivr.net/npm/chart.js', type: 'js' as const, description: 'JavaScript Charting' },
      { name: 'AOS (Animate On Scroll)', url: 'https://unpkg.com/aos@2.3.1/dist/aos.css', type: 'css' as const, description: 'CSS Animation Library' },
      { name: 'AOS JS', url: 'https://unpkg.com/aos@2.3.1/dist/aos.js', type: 'js' as const, description: 'JavaScript Animation Library' },
      { name: 'SweetAlert2', url: 'https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css', type: 'css' as const, description: 'JavaScript Alert Library' },
      { name: 'SweetAlert2 JS', url: 'https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.js', type: 'js' as const, description: 'JavaScript Alert Library' },
      { name: 'Materialize CSS', url: 'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css', type: 'css' as const, description: 'CSS Framework' },
      { name: 'Materialize JS', url: 'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js', type: 'js' as const, description: 'JavaScript Framework' },
      { name: 'Bulma', url: 'https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css', type: 'css' as const, description: 'CSS Framework' },
      { name: 'Lodash', url: 'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js', type: 'js' as const, description: 'JavaScript Utility Library' },
      { name: 'Moment.js', url: 'https://cdn.jsdelivr.net/npm/moment@2.29.4/moment.min.js', type: 'js' as const, description: 'JavaScript Date Library' },
      { name: 'D3.js', url: 'https://d3js.org/d3.v7.min.js', type: 'js' as const, description: 'JavaScript Data Visualization' },
      { name: 'GSAP', url: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js', type: 'js' as const, description: 'JavaScript Animation Library' },
    ];
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Export libraries for backup
  exportLibraries(): string {
    return JSON.stringify(this.libraries, null, 2);
  }

  // Import libraries from backup
  importLibraries(jsonData: string): boolean {
    try {
      const imported = JSON.parse(jsonData);
      if (Array.isArray(imported)) {
        // Validate the structure
        const validLibraries = imported.filter(lib => 
          lib.id && lib.name && lib.url && (lib.type === 'css' || lib.type === 'js')
        );
        this.libraries = validLibraries;
        this.saveToStorage();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import libraries:', error);
      return false;
    }
  }
}

// Export singleton instance
export const externalLibraryService = new ExternalLibraryService();