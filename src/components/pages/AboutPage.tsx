import React from 'react';
import { Code2, Zap, Globe, Shield, TrendingUp, Users, Brain, Sparkles, Lightbulb, Wrench, FileText, Instagram, Linkedin, Github, Codepen, Mail, Link, CheckCircle, Star } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const AboutPage: React.FC = () => {
  const { isDark } = useTheme();

  const features = [
    {
      icon: <Code2 className="w-6 h-6" />,
      title: "Write and run HTML, CSS, and JavaScript online",
      color: "text-orange-500"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Live preview of your frontend code",
      color: "text-blue-500"
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI suggestions to improve HTML, CSS, JS code",
      color: "text-purple-500"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Ask coding-related questions to AI in real-time",
      color: "text-yellow-500"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "One-click code replace with AI-enhanced suggestions",
      color: "text-green-500"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Load local files and preview instantly",
      color: "text-indigo-500"
    }
  ];

  const keyBenefits = [
    {
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      text: "Free to use - Lifetime free access to all features"
    },
    {
      icon: <Brain className="w-5 h-5 text-purple-500" />,
      text: "AI powered - Intelligent code suggestions and enhancements"
    },
    {
      icon: <Wrench className="w-5 h-5 text-blue-500" />,
      text: "Enhance existing codes with AI recommendations"
    },
    {
      icon: <Code2 className="w-5 h-5 text-orange-500" />,
      text: "Compile and run codes directly in the browser"
    },
    {
      icon: <Globe className="w-5 h-5 text-green-500" />,
      text: "Live preview of written code as you type"
    },
    {
      icon: <Shield className="w-5 h-5 text-red-500" />,
      text: "No need login or sign up - Hassle free experience"
    },
    {
      icon: <Sparkles className="w-5 h-5 text-yellow-500" />,
      text: "Easy to use interface for all skill levels"
    },
    {
      icon: <Star className="w-5 h-5 text-indigo-500" />,
      text: "Generate code using AI with simple prompts"
    },
    {
      icon: <Zap className="w-5 h-5 text-cyan-500" />,
      text: "Ad free experience for uninterrupted coding"
    }
  ];

  const aiFeatures = [
    {
      icon: <Lightbulb className="w-8 h-8 text-yellow-500" />,
      title: "Intelligent Code Suggestions",
      description: "Get real-time AI-powered suggestions to improve your HTML, CSS, and JavaScript code with best practices, performance optimizations, and accessibility enhancements."
    },
    {
      icon: <Wrench className="w-8 h-8 text-blue-500" />,
      title: "Automated Code Enhancement",
      description: "Our AI analyzes your code and provides comprehensive enhancements with detailed explanations of each improvement made."
    },
    {
      icon: <Brain className="w-8 h-8 text-purple-500" />,
      title: "Context-Aware Recommendations",
      description: "The AI understands the context of your code and provides relevant suggestions tailored to your specific implementation."
    },
    {
      icon: <FileText className="w-8 h-8 text-green-500" />,
      title: "Code Comparison & Review",
      description: "Visual side-by-side comparison of your original code and AI-enhanced version with detailed change tracking."
    }
  ];

  const whyChooseUs = [
    {
      icon: <Brain className="w-8 h-8 text-purple-500" />,
      title: "Advanced AI Integration",
      description: "Cutting-edge AI technology that understands modern web development practices and provides actionable insights."
    },
    {
      icon: <Users className="w-8 h-8 text-blue-500" />,
      title: "Developer Focused",
      description: "Built by developers for developers – we know what you need to write better code faster."
    },
    {
      icon: <Globe className="w-8 h-8 text-green-500" />,
      title: "Cross-Platform",
      description: "Works in any browser, any device - no installation required. Code anywhere, anytime."
    },
    {
      icon: <Shield className="w-8 h-8 text-red-500" />,
      title: "Secure and Private",
      description: "Your code is yours. We do not store any user data. All processing happens in real-time without saving your code."
    }
  ];

  const socialMedia = [
    {
      name: "Instagram",
      url: "https://www.instagram.com/girish_lade_/",
      icon: <Instagram className="w-5 h-5" />
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/girish-lade-075bba201/",
      icon: <Linkedin className="w-5 h-5" />
    },
    {
      name: "GitHub",
      url: "https://github.com/girishlade111",
      icon: <Github className="w-5 h-5" />
    },
    {
      name: "Codepen",
      url: "https://codepen.io/Girish-Lade-the-looper",
      icon: <Codepen className="w-5 h-5" />
    },
    {
      name: "Email",
      url: "mailto:girishlade111@gmail.com",
      icon: <Mail className="w-5 h-5" />
    }
  ];

  const keywords = [
    "Online code editor",
    "Online compiler",
    "Free code editor",
    "Online IDE",
    "JavaScript code runner",
    "Online HTML CSS JS editor",
    "AI code improvement tool",
    "Online compiler for students",
    "HTML CSS JavaScript live editor",
    "AI-powered code editor",
    "Code enhancement AI",
    "Web development AI assistant",
    "Smart code editor",
    "Browser-based IDE",
    "Real-time code preview"
  ];

  const longTailKeywords = [
    "AI-powered online code editor with real-time suggestions",
    "Free browser-based IDE for HTML CSS JavaScript development",
    "Online compiler with AI code enhancement features",
    "Smart code editor with live preview and AI assistance",
    "Web development tool with artificial intelligence integration",
    "Online JavaScript editor with AI-powered code suggestions",
    "HTML CSS editor with real-time preview and AI optimization",
    "Browser-based code compiler with AI enhancement capabilities",
    "Free online IDE with artificial intelligence code assistant",
    "Modern web development platform with AI integration"
  ];

  return (
    <div className={`min-h-screen transition-colors ${
      isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* SEO Meta Tags */}
      <div style={{ display: 'none' }}>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": "About GB Coder - AI-Powered Online Code Editor",
            "description": "AI-powered online code editor & compiler for HTML, CSS, JS with live preview & smart suggestions. Fast, free & browser-based.",
            "url": window.location.href,
            "mainEntity": {
              "@type": "Organization",
              "name": "GB Coder",
              "founder": "Girish Lade",
              "foundingDate": "2024",
              "description": "Smart online code editor and compiler with AI integration"
            }
          })}
        </script>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            About Us – Your Smart Online Code Editor & Compiler with AI Suggestions
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Welcome to Girish Lade's AI Code Compiler & Editor – your ultimate online code editor, 
            free compiler, and AI-integrated IDE for writing, editing, and running code in real-time.
          </p>
        </div>

        {/* Key Benefits Section */}
        <section className="mb-16">
          <div className={`rounded-2xl p-8 ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          } shadow-lg`}>
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Star className="w-8 h-8 text-yellow-500" />
              Why Choose GB Coder?
            </h2>
            <p className="text-lg leading-relaxed mb-6">
              Our platform offers a comprehensive set of features designed to make your coding experience 
              as smooth and productive as possible:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              {keyBenefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                  {benefit.icon}
                  <span className="text-sm font-medium">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who We Are Section */}
        <section className="mb-16">
          <div className={`rounded-2xl p-8 ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          } shadow-lg`}>
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-500" />
              Who We Are
            </h2>
            <p className="text-lg leading-relaxed mb-6">
              We are a forward-thinking team of developers led by <strong>Girish Lade</strong>, an experienced programmer, 
              AI tools maker, and UI/UX engineer. Our mission is to make coding faster, smarter, and more accessible 
              using the power of artificial intelligence.
            </p>
            <p className="text-lg leading-relaxed mb-6">
              Our tool is not just another online compiler. It's a full-featured AI-powered code editor, built for 
              modern developers who want to write, edit, preview, and optimize their HTML, CSS, and JavaScript code 
              with the help of smart AI.
            </p>
            {/* Professional Backlink to Main Website */}
            <div className={`p-4 rounded-lg border-l-4 ${
              isDark ? 'bg-gray-700 border-blue-500' : 'bg-blue-50 border-blue-500'
            }`}>
              <p className="text-lg mb-2">
                <span className="font-semibold">Visit our main website:</span>{' '}
                <a 
                  href="https://ladestack.in" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium underline"
                >
                  ladestack.in
                  <Link className="w-4 h-4" />
                </a>
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Explore more of our projects and services on our main portfolio website.
              </p>
            </div>
          </div>
        </section>

        {/* Social Media Section */}
        <section className="mb-16">
          <div className={`rounded-2xl p-8 ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          } shadow-lg`}>
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Users className="w-8 h-8 text-purple-500" />
              Connect With Us
            </h2>
            <p className="text-lg leading-relaxed mb-6">
              Follow our journey and stay updated with the latest developments in AI-powered coding tools. 
              Connect with us on social media:
            </p>
            
            <div className="flex flex-wrap gap-4">
              {socialMedia.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {social.icon}
                  <span className="font-medium">{social.name}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* AI Features Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Powerful AI Features</h2>
          <div className={`rounded-2xl p-8 mb-8 ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          } shadow-lg`}>
            <p className="text-lg leading-relaxed mb-8">
              Our AI-powered code editor leverages cutting-edge artificial intelligence to help you write better code faster. 
              With advanced machine learning algorithms, our tool provides intelligent suggestions, automated enhancements, 
              and comprehensive code reviews.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {aiFeatures.map((feature, index) => (
                <div key={index} className={`p-6 rounded-xl ${
                  isDark ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50 border border-gray-200'
                }`}>
                  <div className="flex items-center gap-4 mb-4">
                    {feature.icon}
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            <div className={`p-6 rounded-lg ${
              isDark ? 'bg-gray-700' : 'bg-blue-50'
            } border-l-4 border-blue-500`}>
              <h3 className="text-xl font-bold mb-3">How Our AI Works</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Our AI analyzes your code in real-time, identifying opportunities for improvement in:
              </p>
              <ul className="grid md:grid-cols-2 gap-2 mb-4">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Performance optimization
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Accessibility enhancements
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Best coding practices
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Modern syntax adoption
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Security improvements
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Code maintainability
                </li>
              </ul>
              <p className="text-gray-600 dark:text-gray-300">
                Each suggestion comes with a detailed explanation of why the change is beneficial and how it improves your code.
              </p>
            </div>
          </div>
        </section>

        {/* What We Offer Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">What We Offer</h2>
          <div className={`rounded-2xl p-8 mb-8 ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          } shadow-lg`}>
            <p className="text-lg leading-relaxed mb-8">
              Our platform is a smart online code editor and compiler created in 2024, built with performance, 
              simplicity, and productivity in mind.
            </p>
            <p className="text-lg font-semibold mb-6">
              Here's what makes our online compiler and code editor different:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className={feature.color}>
                    {feature.icon}
                  </div>
                  <span className="text-sm font-medium">{feature.title}</span>
                </div>
              ))}
            </div>

            <div className={`p-6 rounded-lg ${
              isDark ? 'bg-gray-700' : 'bg-blue-50'
            } border-l-4 border-blue-500`}>
              <p className="text-lg font-medium mb-2">✅ No setup required – 100% browser-based</p>
              <p className="text-gray-600 dark:text-gray-300">
                Whether you're looking for a free code editor online, an online JavaScript code runner, 
                or an online HTML/CSS/JS editor with live preview, we've got you covered.
              </p>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Why Choose Us?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {whyChooseUs.map((item, index) => (
              <div key={index} className={`p-6 rounded-xl ${
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              } shadow-lg hover:shadow-xl transition-shadow`}>
                <div className="flex items-center gap-4 mb-4">
                  {item.icon}
                  <h3 className="text-xl font-bold">{item.title}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* SEO Optimization Section */}
        <section className="mb-16">
          <div className={`rounded-2xl p-8 ${
            isDark ? 'bg-gradient-to-r from-purple-900 to-indigo-900' : 'bg-gradient-to-r from-purple-50 to-indigo-50'
          } border border-purple-200 dark:border-purple-700`}>
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-purple-500" />
              Optimized for SEO and High Google Rankings
            </h2>
            <p className="text-lg mb-6">
              We created this online IDE with SEO best practices in mind, targeting long-tail keywords like:
            </p>
            <ul className="space-y-2 mb-6">
              {longTailKeywords.map((keyword, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>{keyword}</span>
                </li>
              ))}
            </ul>
            <div className={`p-4 rounded-lg ${
              isDark ? 'bg-purple-800' : 'bg-purple-100'
            }`}>
              <h3 className="font-bold mb-2">Additional Target Keywords:</h3>
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, index) => (
                  <span key={index} className={`px-3 py-1 rounded-full text-sm ${
                    isDark ? 'bg-purple-900 text-purple-200' : 'bg-purple-200 text-purple-800'
                  }`}>
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Our Vision Section */}
        <section className="mb-16">
          <div className={`rounded-2xl p-8 ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          } shadow-lg`}>
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-yellow-500" />
              Our Vision
            </h2>
            <p className="text-lg leading-relaxed mb-4">
              We envision a future where AI and coding tools merge to help every developer become more efficient. 
              Our AI code editor helps beginners and professionals alike to learn, improve, and ship better code faster.
            </p>
            <p className="text-lg leading-relaxed">
              By integrating artificial intelligence directly into the development workflow, we're creating tools that 
              not only help you write code but also teach you to become a better developer. Our platform is designed to 
              be an educational resource as much as it is a productivity tool.
            </p>
          </div>
        </section>

        {/* Search-Optimized Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Search-Optimized Features</h2>
          <div className={`rounded-2xl p-8 ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          } shadow-lg`}>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-bold mb-4">Technical SEO</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    Keyword-optimized content
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    Fast loading
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    Mobile-friendly
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    Crawling-enabled metadata and schema
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    Proper H1, H2, meta tags
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">Target Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword, index) => (
                    <span key={index} className={`px-3 py-1 rounded-full text-sm ${
                      isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="mb-16">
          <div className={`rounded-2xl p-8 text-center ${
            isDark ? 'bg-gradient-to-r from-blue-900 to-purple-900' : 'bg-gradient-to-r from-blue-50 to-purple-50'
          } border border-blue-200 dark:border-blue-700`}>
            <h2 className="text-3xl font-bold mb-6">Join the Future of Coding Today</h2>
            <p className="text-lg mb-8 max-w-3xl mx-auto">
              We invite you to try our free online code editor and compiler. Discover how AI can take your 
              coding skills to the next level. Experience the smartest way to edit HTML/CSS/JS online with 
              live preview and code improvement suggestions.
            </p>
            <p className="text-lg font-medium">
              Whether you're a student, developer, or tech enthusiast – our AI code compiler is your new go-to tool.
            </p>
          </div>
        </section>

        {/* Legal Info */}
        <section className="text-center">
          <div className={`rounded-lg p-6 ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'
          }`}>
            <h3 className="text-xl font-bold mb-4">Legal Info</h3>
            <p className="text-gray-600 dark:text-gray-300">
              © 2024 - All rights reserved. Built and maintained by Girish Lade. 
              Unauthorized use or duplication of content is prohibited.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;