// Syntax Highlighting Service for Multiple Programming Languages
import { SyntaxLanguage, SyntaxToken } from '../types/console.types';

// Language-specific token patterns
const LANGUAGE_PATTERNS: Record<SyntaxLanguage, Record<string, RegExp>> = {
  javascript: {
    keyword: /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|async|await|class|extends|import|export|default|from|new|this|super|static|get|set|typeof|instanceof|in|of|delete|void|yield)\b/g,
    string: /(["'`])(?:(?=(\\?))\2.)*?\1/g,
    number: /\b\d+\.?\d*\b/g,
    comment: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
    function: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g,
    operator: /[+\-*/%=<>!&|^~?:]/g,
    class: /\b([A-Z][a-zA-Z0-9_]*)\b/g,
  },
  typescript: {
    keyword: /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|async|await|class|extends|import|export|default|from|new|this|super|static|get|set|typeof|instanceof|in|of|delete|void|yield|interface|type|enum|namespace|module|declare|public|private|protected|readonly|abstract|implements)\b/g,
    string: /(["'`])(?:(?=(\\?))\2.)*?\1/g,
    number: /\b\d+\.?\d*\b/g,
    comment: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
    function: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g,
    operator: /[+\-*/%=<>!&|^~?:]/g,
    class: /\b([A-Z][a-zA-Z0-9_]*)\b/g,
  },
  python: {
    keyword: /\b(def|class|if|elif|else|for|while|return|import|from|as|try|except|finally|raise|with|lambda|yield|pass|break|continue|global|nonlocal|assert|del|and|or|not|in|is|True|False|None)\b/g,
    string: /(["'])(?:(?=(\\?))\2.)*?\1|"""[\s\S]*?"""|'''[\s\S]*?'''/g,
    number: /\b\d+\.?\d*\b/g,
    comment: /#.*$/gm,
    function: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g,
    operator: /[+\-*/%=<>!&|^~]/g,
    class: /\b([A-Z][a-zA-Z0-9_]*)\b/g,
  },
  java: {
    keyword: /\b(public|private|protected|static|final|abstract|class|interface|extends|implements|new|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|throws|import|package|void|int|long|double|float|boolean|char|byte|short|String)\b/g,
    string: /(["'])(?:(?=(\\?))\2.)*?\1/g,
    number: /\b\d+\.?\d*[fFdDlL]?\b/g,
    comment: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
    function: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g,
    operator: /[+\-*/%=<>!&|^~?:]/g,
    class: /\b([A-Z][a-zA-Z0-9_]*)\b/g,
  },
  cpp: {
    keyword: /\b(auto|break|case|char|const|continue|default|do|double|else|enum|extern|float|for|goto|if|inline|int|long|register|return|short|signed|sizeof|static|struct|switch|typedef|union|unsigned|void|volatile|while|class|namespace|template|typename|public|private|protected|virtual|override|final|nullptr|constexpr|decltype|using)\b/g,
    string: /(["'])(?:(?=(\\?))\2.)*?\1/g,
    number: /\b\d+\.?\d*[fFlLuU]?\b/g,
    comment: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
    function: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g,
    operator: /[+\-*/%=<>!&|^~?:]/g,
    class: /\b([A-Z][a-zA-Z0-9_]*)\b/g,
  },
  csharp: {
    keyword: /\b(abstract|as|base|bool|break|byte|case|catch|char|checked|class|const|continue|decimal|default|delegate|do|double|else|enum|event|explicit|extern|false|finally|fixed|float|for|foreach|goto|if|implicit|in|int|interface|internal|is|lock|long|namespace|new|null|object|operator|out|override|params|private|protected|public|readonly|ref|return|sbyte|sealed|short|sizeof|stackalloc|static|string|struct|switch|this|throw|true|try|typeof|uint|ulong|unchecked|unsafe|ushort|using|virtual|void|volatile|while|async|await|var)\b/g,
    string: /(["'])(?:(?=(\\?))\2.)*?\1|@"(?:[^"]|"")*"/g,
    number: /\b\d+\.?\d*[fFdDmM]?\b/g,
    comment: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
    function: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g,
    operator: /[+\-*/%=<>!&|^~?:]/g,
    class: /\b([A-Z][a-zA-Z0-9_]*)\b/g,
  },
  go: {
    keyword: /\b(break|case|chan|const|continue|default|defer|else|fallthrough|for|func|go|goto|if|import|interface|map|package|range|return|select|struct|switch|type|var)\b/g,
    string: /(["'`])(?:(?=(\\?))\2.)*?\1/g,
    number: /\b\d+\.?\d*\b/g,
    comment: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
    function: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g,
    operator: /[+\-*/%=<>!&|^~:]/g,
    class: /\b([A-Z][a-zA-Z0-9_]*)\b/g,
  },
  rust: {
    keyword: /\b(as|break|const|continue|crate|else|enum|extern|false|fn|for|if|impl|in|let|loop|match|mod|move|mut|pub|ref|return|self|Self|static|struct|super|trait|true|type|unsafe|use|where|while|async|await|dyn)\b/g,
    string: /(["'])(?:(?=(\\?))\2.)*?\1|r#*"[\s\S]*?"#*/g,
    number: /\b\d+\.?\d*[fFiIuU]?\b/g,
    comment: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
    function: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g,
    operator: /[+\-*/%=<>!&|^~?:]/g,
    class: /\b([A-Z][a-zA-Z0-9_]*)\b/g,
  },
  php: {
    keyword: /\b(abstract|and|array|as|break|callable|case|catch|class|clone|const|continue|declare|default|die|do|echo|else|elseif|empty|enddeclare|endfor|endforeach|endif|endswitch|endwhile|eval|exit|extends|final|finally|for|foreach|function|global|goto|if|implements|include|include_once|instanceof|insteadof|interface|isset|list|namespace|new|or|print|private|protected|public|require|require_once|return|static|switch|throw|trait|try|unset|use|var|while|xor|yield)\b/g,
    string: /(["'])(?:(?=(\\?))\2.)*?\1/g,
    number: /\b\d+\.?\d*\b/g,
    comment: /(\/\/.*$|\/\*[\s\S]*?\*\/|#.*$)/gm,
    function: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g,
    operator: /[+\-*/%=<>!&|^~?:]/g,
    class: /\b([A-Z][a-zA-Z0-9_]*)\b/g,
  },
  ruby: {
    keyword: /\b(BEGIN|END|alias|and|begin|break|case|class|def|defined|do|else|elsif|end|ensure|false|for|if|in|module|next|nil|not|or|redo|rescue|retry|return|self|super|then|true|undef|unless|until|when|while|yield)\b/g,
    string: /(["'])(?:(?=(\\?))\2.)*?\1/g,
    number: /\b\d+\.?\d*\b/g,
    comment: /#.*$/gm,
    function: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g,
    operator: /[+\-*/%=<>!&|^~?:]/g,
    class: /\b([A-Z][a-zA-Z0-9_]*)\b/g,
  },
  html: {
    keyword: /(<\/?[a-zA-Z][a-zA-Z0-9]*|\/?>)/g,
    string: /(["'])(?:(?=(\\?))\2.)*?\1/g,
    comment: /<!--[\s\S]*?-->/g,
    operator: /=/g,
    class: /\b([a-zA-Z-]+)(?==)/g,
  },
  css: {
    keyword: /(@[a-zA-Z-]+|\b(?:important|inherit|initial|unset)\b)/g,
    string: /(["'])(?:(?=(\\?))\2.)*?\1/g,
    number: /\b\d+\.?\d*(?:px|em|rem|%|vh|vw|pt|cm|mm|in|pc|ex|ch|vmin|vmax|deg|rad|turn|s|ms)?\b/g,
    comment: /\/\*[\s\S]*?\*\//g,
    function: /\b([a-zA-Z-]+)\s*\(/g,
    operator: /[{}:;,]/g,
    class: /[.#][a-zA-Z-_][a-zA-Z0-9-_]*/g,
  },
  json: {
    keyword: /\b(true|false|null)\b/g,
    string: /"(?:[^"\\]|\\.)*"/g,
    number: /-?\b\d+\.?\d*(?:[eE][+-]?\d+)?\b/g,
    operator: /[{}[\]:,]/g,
  },
  xml: {
    keyword: /(<\/?[a-zA-Z][a-zA-Z0-9:]*|\/?>)/g,
    string: /(["'])(?:(?=(\\?))\2.)*?\1/g,
    comment: /<!--[\s\S]*?-->/g,
    operator: /=/g,
    class: /\b([a-zA-Z:][a-zA-Z0-9:_-]*)(?==)/g,
  },
  sql: {
    keyword: /\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TABLE|DATABASE|INDEX|VIEW|JOIN|INNER|LEFT|RIGHT|OUTER|ON|AND|OR|NOT|IN|LIKE|BETWEEN|IS|NULL|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|AS|DISTINCT|COUNT|SUM|AVG|MAX|MIN|UNION|ALL|EXISTS|CASE|WHEN|THEN|ELSE|END)\b/gi,
    string: /(["'])(?:(?=(\\?))\2.)*?\1/g,
    number: /\b\d+\.?\d*\b/g,
    comment: /(--.*$|\/\*[\s\S]*?\*\/)/gm,
    function: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g,
    operator: /[+\-*/%=<>!]/g,
  },
  bash: {
    keyword: /\b(if|then|else|elif|fi|case|esac|for|while|until|do|done|in|function|return|exit|break|continue|local|export|readonly|declare|typeset|shift|eval|exec|source|alias|unalias|echo|printf|read|cd|pwd|ls|mkdir|rm|cp|mv|cat|grep|sed|awk|sort|uniq|wc|head|tail|find|chmod|chown|ps|kill|bg|fg|jobs|wait)\b/g,
    string: /(["'])(?:(?=(\\?))\2.)*?\1/g,
    number: /\b\d+\.?\d*\b/g,
    comment: /#.*$/gm,
    variable: /\$[a-zA-Z_][a-zA-Z0-9_]*|\$\{[^}]+\}/g,
    operator: /[|&;<>()$`\\]/g,
  },
  powershell: {
    keyword: /\b(begin|break|catch|continue|data|do|dynamicparam|else|elseif|end|exit|filter|finally|for|foreach|from|function|if|in|param|process|return|switch|throw|trap|try|until|while)\b/gi,
    string: /(["'])(?:(?=(\\?))\2.)*?\1/g,
    number: /\b\d+\.?\d*\b/g,
    comment: /#.*$/gm,
    function: /\b([a-zA-Z_][a-zA-Z0-9_-]*)\s*\(/g,
    operator: /[+\-*/%=<>!&|^~]/g,
    variable: /\$[a-zA-Z_][a-zA-Z0-9_]*/g,
  },
};

// Color schemes for different token types
const TOKEN_COLORS = {
  keyword: '#569CD6',
  string: '#CE9178',
  number: '#B5CEA8',
  comment: '#6A9955',
  function: '#DCDCAA',
  operator: '#D4D4D4',
  variable: '#9CDCFE',
  class: '#4EC9B0',
};

export class SyntaxHighlighter {
  private cache: Map<string, SyntaxToken[]> = new Map();
  private maxCacheSize = 100;

  /**
   * Highlight code with syntax tokens
   */
  highlight(code: string, language: SyntaxLanguage): SyntaxToken[] {
    const cacheKey = `${language}:${code}`;
    
    // Check cache
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const tokens: SyntaxToken[] = [];
    const patterns = LANGUAGE_PATTERNS[language];

    if (!patterns) {
      return tokens;
    }

    // Track processed positions to avoid overlaps
    const processed = new Set<number>();

    // Process each token type
    const tokenTypes = Object.keys(patterns) as Array<keyof typeof patterns>;
    
    for (const type of tokenTypes) {
      const pattern = patterns[type];
      const matches = code.matchAll(pattern);

      for (const match of matches) {
        if (match.index === undefined) continue;

        const start = match.index;
        const end = start + match[0].length;
        
        // Check if this range is already processed
        let overlap = false;
        for (let i = start; i < end; i++) {
          if (processed.has(i)) {
            overlap = true;
            break;
          }
        }

        if (!overlap) {
          tokens.push({
            type: type as any,
            value: match[0],
            start,
            end,
            color: TOKEN_COLORS[type as keyof typeof TOKEN_COLORS] || TOKEN_COLORS.operator,
          });

          // Mark positions as processed
          for (let i = start; i < end; i++) {
            processed.add(i);
          }
        }
      }
    }

    // Sort tokens by position
    tokens.sort((a, b) => a.start - b.start);

    // Cache the result
    this.cacheResult(cacheKey, tokens);

    return tokens;
  }

  /**
   * Convert highlighted tokens to HTML
   */
  toHTML(code: string, tokens: SyntaxToken[]): string {
    if (tokens.length === 0) {
      return this.escapeHTML(code);
    }

    let html = '';
    let lastIndex = 0;

    for (const token of tokens) {
      // Add unhighlighted text before this token
      if (token.start > lastIndex) {
        html += this.escapeHTML(code.substring(lastIndex, token.start));
      }

      // Add highlighted token
      html += `<span style="color: ${token.color}">${this.escapeHTML(token.value)}</span>`;
      lastIndex = token.end;
    }

    // Add remaining unhighlighted text
    if (lastIndex < code.length) {
      html += this.escapeHTML(code.substring(lastIndex));
    }

    return html;
  }

  /**
   * Detect language from code content
   */
  detectLanguage(code: string): SyntaxLanguage {
    const scores: Partial<Record<SyntaxLanguage, number>> = {};

    for (const [lang, patterns] of Object.entries(LANGUAGE_PATTERNS)) {
      let score = 0;
      
      for (const pattern of Object.values(patterns)) {
        const matches = code.match(pattern);
        if (matches) {
          score += matches.length;
        }
      }

      scores[lang as SyntaxLanguage] = score;
    }

    // Return language with highest score
    let maxScore = 0;
    let detectedLang: SyntaxLanguage = 'javascript';

    for (const [lang, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        detectedLang = lang as SyntaxLanguage;
      }
    }

    return detectedLang;
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): SyntaxLanguage[] {
    return Object.keys(LANGUAGE_PATTERNS) as SyntaxLanguage[];
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Cache result with size limit
   */
  private cacheResult(key: string, tokens: SyntaxToken[]): void {
    if (this.cache.size >= this.maxCacheSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, tokens);
  }

  /**
   * Escape HTML special characters
   */
  private escapeHTML(text: string): string {
    return text
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, '&#039;');
  }
}

// Export singleton instance
export const syntaxHighlighter = new SyntaxHighlighter();
