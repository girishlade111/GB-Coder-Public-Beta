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
      html += `    <link rel="stylesheet" href="${lib.url}" crossorigin="anonymous">\\n`;
    });

    // Add JS scripts
    jsLibraries.forEach(lib => {
      html += `    <script src="${lib.url}" crossorigin="anonymous"></script>\\n`;
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
      // CSS Frameworks
      { name: 'Bootstrap 5 CSS', url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css', type: 'css' as const, description: 'Popular CSS Framework' },
      { name: 'Bootstrap 5 JS', url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js', type: 'js' as const, description: 'Bootstrap JavaScript Bundle' },
      { name: 'Tailwind CSS', url: 'https://cdn.tailwindcss.com', type: 'css' as const, description: 'Utility-first CSS Framework' },
      { name: 'Bulma', url: 'https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css', type: 'css' as const, description: 'Modern CSS Framework' },
      { name: 'Materialize CSS', url: 'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css', type: 'css' as const, description: 'Material Design CSS Framework' },
      { name: 'Materialize JS', url: 'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js', type: 'js' as const, description: 'Material Design JavaScript' },
      { name: 'Foundation CSS', url: 'https://cdn.jsdelivr.net/npm/foundation-sites@6.8.1/dist/css/foundation.min.css', type: 'css' as const, description: 'Responsive Front-end Framework' },
      { name: 'Foundation JS', url: 'https://cdn.jsdelivr.net/npm/foundation-sites@6.8.1/dist/js/foundation.min.js', type: 'js' as const, description: 'Foundation JavaScript' },
      { name: 'Semantic UI CSS', url: 'https://cdn.jsdelivr.net/npm/semantic-ui@2.5.0/dist/semantic.min.css', type: 'css' as const, description: 'User Interface Framework' },
      { name: 'Semantic UI JS', url: 'https://cdn.jsdelivr.net/npm/semantic-ui@2.5.0/dist/semantic.min.js', type: 'js' as const, description: 'Semantic UI JavaScript' },

      // JavaScript Frameworks & Libraries
      { name: 'jQuery', url: 'https://code.jquery.com/jquery-3.7.1.min.js', type: 'js' as const, description: 'Fast, small JavaScript Library' },
      { name: 'React 18', url: 'https://unpkg.com/react@18/umd/react.production.min.js', type: 'js' as const, description: 'React Library' },
      { name: 'React DOM 18', url: 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js', type: 'js' as const, description: 'React DOM Library' },
      { name: 'Vue 3', url: 'https://unpkg.com/vue@3/dist/vue.global.prod.js', type: 'js' as const, description: 'Progressive JavaScript Framework' },
      { name: 'Alpine.js', url: 'https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js', type: 'js' as const, description: 'Lightweight JavaScript Framework' },
      { name: 'Svelte', url: 'https://unpkg.com/svelte@4/compiler.js', type: 'js' as const, description: 'Cybernetically Enhanced Web Apps' },
      { name: 'Angular', url: 'https://ajax.googleapis.com/ajax/libs/angularjs/1.8.3/angular.min.js', type: 'js' as const, description: 'JavaScript MVW Framework' },
      { name: 'Preact', url: 'https://unpkg.com/preact@latest/dist/preact.min.js', type: 'js' as const, description: 'Fast 3kB React Alternative' },

      // Animation Libraries
      { name: 'AOS CSS', url: 'https://unpkg.com/aos@2.3.1/dist/aos.css', type: 'css' as const, description: 'Animate On Scroll Library' },
      { name: 'AOS JS', url: 'https://unpkg.com/aos@2.3.1/dist/aos.js', type: 'js' as const, description: 'Animate On Scroll JavaScript' },
      { name: 'Anime.js', url: 'https://cdn.jsdelivr.net/npm/animejs@3.2.1/lib/anime.min.js', type: 'js' as const, description: 'Lightweight JavaScript Animation Library' },
      { name: 'GSAP', url: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js', type: 'js' as const, description: 'Professional-grade Animation Library' },
      { name: 'Animate.css', url: 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css', type: 'css' as const, description: 'Cross-browser CSS Animations' },
      { name: 'Hover.css', url: 'https://cdnjs.cloudflare.com/ajax/libs/hover.css/2.3.1/css/hover-min.css', type: 'css' as const, description: 'CSS3 Hover Effects' },
      { name: 'WOW.js', url: 'https://cdn.jsdelivr.net/npm/wowjs@1.1.3/dist/wow.min.js', type: 'js' as const, description: 'Reveal Animations When Scrolling' },
      { name: 'Particles.js', url: 'https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js', type: 'js' as const, description: 'Lightweight Particle Backgrounds' },
      { name: 'Three.js', url: 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js', type: 'js' as const, description: '3D Graphics Library' },
      { name: 'Lottie Web', url: 'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js', type: 'js' as const, description: 'Render After Effects Animations' },

      // UI Components & Plugins
      { name: 'Swiper CSS', url: 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css', type: 'css' as const, description: 'Modern Mobile Touch Slider' },
      { name: 'Swiper JS', url: 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js', type: 'js' as const, description: 'Swiper JavaScript Library' },
      { name: 'Slick Carousel CSS', url: 'https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.css', type: 'css' as const, description: 'Responsive Carousel' },
      { name: 'Slick Carousel JS', url: 'https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js', type: 'js' as const, description: 'Slick Carousel JavaScript' },
      { name: 'SweetAlert2 CSS', url: 'https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css', type: 'css' as const, description: 'Beautiful Alert Popups' },
      { name: 'SweetAlert2 JS', url: 'https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.js', type: 'js' as const, description: 'SweetAlert2 JavaScript' },
      { name: 'Toastify CSS', url: 'https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css', type: 'css' as const, description: 'Lightweight Toast Notifications' },
      { name: 'Toastify JS', url: 'https://cdn.jsdelivr.net/npm/toastify-js', type: 'js' as const, description: 'Toastify JavaScript' },
      { name: 'Select2 CSS', url: 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css', type: 'css' as const, description: 'jQuery Replacement for Select Boxes' },
      { name: 'Select2 JS', url: 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js', type: 'js' as const, description: 'Select2 JavaScript' },
      { name: 'Lightbox2 CSS', url: 'https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.4/css/lightbox.min.css', type: 'css' as const, description: 'Simple Image Lightbox' },
      { name: 'Lightbox2 JS', url: 'https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.4/js/lightbox.min.js', type: 'js' as const, description: 'Lightbox2 JavaScript' },
      { name: 'Tippy.js', url: 'https://unpkg.com/@popperjs/core@2', type: 'js' as const, description: 'Tooltip & Popover Library' },

      // Icon Libraries
      { name: 'Font Awesome 6', url: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css', type: 'css' as const, description: 'Popular Icon Library' },
      { name: 'Bootstrap Icons', url: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css', type: 'css' as const, description: 'Official Bootstrap Icons' },
      { name: 'Material Icons', url: 'https://fonts.googleapis.com/icon?family=Material+Icons', type: 'css' as const, description: 'Google Material Design Icons' },
      { name: 'Ionicons', url: 'https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.css', type: 'css' as const, description: 'Premium Icon Font' },
      { name: 'Feather Icons', url: 'https://cdn.jsdelivr.net/npm/feather-icons/dist/feather.min.js', type: 'js' as const, description: 'Simply Beautiful Open Source Icons' },

      // Data Visualization & Charts
      { name: 'Chart.js', url: 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js', type: 'js' as const, description: 'Simple HTML5 Charts' },
      { name: 'D3.js', url: 'https://d3js.org/d3.v7.min.js', type: 'js' as const, description: 'Data-Driven Documents' },
      { name: 'Plotly.js', url: 'https://cdn.plot.ly/plotly-2.27.0.min.js', type: 'js' as const, description: 'Interactive Graphing Library' },
      { name: 'ApexCharts', url: 'https://cdn.jsdelivr.net/npm/apexcharts', type: 'js' as const, description: 'Modern Charting Library' },
      { name: 'Highcharts', url: 'https://code.highcharts.com/highcharts.js', type: 'js' as const, description: 'Interactive JavaScript Charts' },
      { name: 'ECharts', url: 'https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js', type: 'js' as const, description: 'Powerful Charting Library' },

      // Utility Libraries
      { name: 'Lodash', url: 'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js', type: 'js' as const, description: 'Modern JavaScript Utility Library' },
      { name: 'Underscore.js', url: 'https://cdn.jsdelivr.net/npm/underscore@1.13.6/underscore-min.js', type: 'js' as const, description: 'JavaScript Utility Belt' },
      { name: 'Axios', url: 'https://cdn.jsdelivr.net/npm/axios@1.6.5/dist/axios.min.js', type: 'js' as const, description: 'Promise-based HTTP Client' },
      { name: 'Moment.js', url: 'https://cdn.jsdelivr.net/npm/moment@2.30.1/moment.min.js', type: 'js' as const, description: 'Parse, Validate, Manipulate Dates' },
      { name: 'Day.js', url: 'https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js', type: 'js' as const, description: 'Fast 2kB Moment.js Alternative' },
      { name: 'UUID', url: 'https://cdn.jsdelivr.net/npm/uuid@9.0.1/dist/umd/uuidv4.min.js', type: 'js' as const, description: 'Generate RFC-compliant UUIDs' },
      { name: 'Validator.js', url: 'https://cdn.jsdelivr.net/npm/validator@13.11.0/validator.min.js', type: 'js' as const, description: 'String Validators & Sanitizers' },

      // Form Libraries
      { name: 'jQuery Validation', url: 'https://cdn.jsdelivr.net/npm/jquery-validation@1.19.5/dist/jquery.validate.min.js', type: 'js' as const, description: 'Form Validation Plugin' },
      { name: 'Parsley.js', url: 'https://cdn.jsdelivr.net/npm/parsleyjs@2.9.2/dist/parsley.min.js', type: 'js' as const, description: 'JavaScript Form Validation' },
      { name: 'Cleave.js', url: 'https://cdn.jsdelivr.net/npm/cleave.js@1.6.0/dist/cleave.min.js', type: 'js' as const, description: 'Format Input Text Content' },

      // State Management
      { name: 'Redux', url: 'https://cdn.jsdelivr.net/npm/redux@5.0.1/dist/redux.min.js', type: 'js' as const, description: 'Predictable State Container' },
      { name: 'MobX', url: 'https://cdn.jsdelivr.net/npm/mobx@6.12.0/dist/mobx.umd.production.min.js', type: 'js' as const, description: 'Simple, Scalable State Management' },

      // Miscellaneous
      { name: 'ScrollReveal', url: 'https://unpkg.com/scrollreveal@4.0.9/dist/scrollreveal.min.js', type: 'js' as const, description: 'Animate Elements on Scroll' },
      { name: 'Typed.js', url: 'https://cdn.jsdelivr.net/npm/typed.js@2.1.0', type: 'js' as const, description: 'Typing Animation Library' },
      { name: 'SortableJS', url: 'https://cdn.jsdelivr.net/npm/sortablejs@1.15.2/Sortable.min.js', type: 'js' as const, description: 'Reorderable Drag-and-Drop Lists' },
      { name: 'Masonry', url: 'https://unpkg.com/masonry-layout@4/dist/masonry.pkgd.min.js', type: 'js' as const, description: 'Cascading Grid Layout Library' },
      { name: 'Popper.js', url: 'https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js', type: 'js' as const, description: 'Tooltip & Popover Positioning' },
      { name: 'QRCode.js', url: 'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js', type: 'js' as const, description: 'Generate QR Codes' },
      { name: 'Highlight.js CSS', url: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css', type: 'css' as const, description: 'Syntax Highlighting Styles' },
      { name: 'Highlight.js', url: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js', type: 'js' as const, description: 'Syntax Highlighting Library' },
      { name: 'Prism.js CSS', url: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css', type: 'css' as const, description: 'Lightweight Syntax Highlighting' },
      { name: 'Prism.js', url: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js', type: 'js' as const, description: 'Prism Syntax Highlighting' },
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