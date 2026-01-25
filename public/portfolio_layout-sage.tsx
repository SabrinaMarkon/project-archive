import React, { useState } from 'react';
import { Menu, X, Github, Linkedin, Mail, ExternalLink, ChevronRight, Code2, BookOpen, Sparkles, Leaf } from 'lucide-react';

export default function PortfolioLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const projects = [
    {
      title: "Project Archive System",
      description: "A comprehensive project management and archival application built with Laravel and React.",
      tags: ["Laravel", "React", "MySQL"],
      link: "#"
    },
    {
      title: "Another Project",
      description: "Description of another interesting project you've worked on.",
      tags: ["JavaScript", "API", "Design"],
      link: "#"
    },
    {
      title: "Third Project",
      description: "Yet another project showcasing your skills and expertise.",
      tags: ["PHP", "Frontend", "UX"],
      link: "#"
    }
  ];

  const writings = [
    {
      title: "Building Scalable Web Applications",
      excerpt: "Thoughts on architecture patterns and best practices for modern web development...",
      date: "March 15, 2024",
      readTime: "5 min read"
    },
    {
      title: "The Art of Clean Code",
      excerpt: "Why writing maintainable code matters more than clever solutions...",
      date: "March 8, 2024",
      readTime: "7 min read"
    },
    {
      title: "React Performance Optimization",
      excerpt: "Practical tips for keeping your React applications fast and responsive...",
      date: "February 28, 2024",
      readTime: "6 min read"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b z-50 shadow-sm" style={{ borderColor: '#e5e3df' }}>
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <a href="#" className="text-2xl font-bold flex items-center gap-2" style={{ color: '#3d3d3d' }}>
              <Leaf style={{ color: '#7a9d7a' }} size={28} />
              Sabrina Markon
            </a>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="font-medium transition hover:opacity-70" style={{ color: '#5a5a5a' }}>Home</a>
              <a href="#projects" className="font-medium transition hover:opacity-70" style={{ color: '#5a5a5a' }}>Projects</a>
              <a href="#writing" className="font-medium transition hover:opacity-70" style={{ color: '#5a5a5a' }}>Writing</a>
              <a href="#about" className="font-medium transition hover:opacity-70" style={{ color: '#5a5a5a' }}>About</a>
              <a href="#contact" className="px-5 py-2.5 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300" style={{ backgroundColor: '#7a9d7a' }}>
                Contact
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden"
              style={{ color: '#5a5a5a' }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden pt-4 pb-2 space-y-2">
              <a href="#home" className="block py-2 font-medium" style={{ color: '#5a5a5a' }}>Home</a>
              <a href="#projects" className="block py-2 font-medium" style={{ color: '#5a5a5a' }}>Projects</a>
              <a href="#writing" className="block py-2 font-medium" style={{ color: '#5a5a5a' }}>Writing</a>
              <a href="#about" className="block py-2 font-medium" style={{ color: '#5a5a5a' }}>About</a>
              <a href="#contact" className="block py-2 font-medium" style={{ color: '#5a5a5a' }}>Contact</a>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section - White background */}
      <section id="home" className="pt-32 pb-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles style={{ color: '#7a9d7a' }} size={24} />
            <span className="font-semibold" style={{ color: '#658965' }}>Welcome to my portfolio</span>
          </div>
          <div className="max-w-4xl">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight" style={{ color: '#2d2d2d' }}>
              Developer & <span style={{ color: '#7a9d7a' }}>Writer</span>
            </h1>
            <p className="text-xl mb-8 leading-relaxed max-w-2xl" style={{ color: '#5a5a5a' }}>
              I build elegant web applications with Laravel and React, and share my journey 
              through writing about technology, development practices, and the craft of creating software.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#projects" className="px-8 py-4 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 font-semibold" style={{ backgroundColor: '#7a9d7a' }}>
                <Code2 size={20} />
                View Projects
              </a>
              <a href="#writing" className="px-8 py-4 bg-white rounded-xl transition-all duration-300 flex items-center gap-2 font-semibold shadow-sm hover:shadow-md" style={{ border: '2px solid #7a9d7a', color: '#658965' }}>
                <BookOpen size={20} />
                Read Writing
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section - Light yellow-green background */}
      <section id="projects" className="py-24 px-6" style={{ backgroundColor: '#d4e5c8' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4" style={{ color: '#2d2d2d' }}>Featured Projects</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#4a4a4a' }}>
              A selection of work I've built and contributed to, showcasing my skills in full-stack development.
            </p>
          </div>
          
          <div className="grid gap-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {projects.map((project, i) => (
              <div key={i} className="group bg-white rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl hover:-translate-y-1" style={{ borderColor: '#c0d8b4' }}>
                <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center" style={{ backgroundColor: '#7a9d7a' }}>
                  <Code2 className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#2d2d2d' }}>
                  {project.title}
                </h3>
                <p className="mb-4 leading-relaxed" style={{ color: '#5a5a5a' }}>
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag, j) => (
                    <span key={j} className="px-3 py-1 text-sm rounded-full font-medium" style={{ backgroundColor: '#e8ede8', color: '#658965' }}>
                      {tag}
                    </span>
                  ))}
                </div>
                <a href={project.link} className="font-semibold flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: '#658965' }}>
                  View Project <ExternalLink size={16} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Writing Section - Soft yellow-green background */}
      <section id="writing" className="py-24 px-6" style={{ backgroundColor: '#d8e5b8' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4" style={{ color: '#2d2d2d' }}>Latest Writing</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#4a4a4a' }}>
              Thoughts on development, technology, and building for the web.
            </p>
          </div>
          
          <div className="grid gap-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {writings.map((post, i) => (
              <article key={i} className="bg-white rounded-2xl p-6 border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group" style={{ borderColor: '#c8d8a8' }}>
                <div className="inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4" style={{ backgroundColor: '#e8ede8', color: '#658965' }}>
                  {post.readTime}
                </div>
                <h3 className="text-xl font-bold mb-3 transition" style={{ color: '#2d2d2d' }}>
                  {post.title}
                </h3>
                <p className="mb-4 leading-relaxed" style={{ color: '#5a5a5a' }}>
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-sm mb-4" style={{ color: '#7a7a7a' }}>
                  <span>{post.date}</span>
                </div>
                <a href="#" className="font-semibold flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: '#658965' }}>
                  Read More <ChevronRight size={16} />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* About Section - Golden yellow background */}
      <section id="about" className="py-24 px-6" style={{ backgroundColor: '#f4e4c1' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-5xl font-bold mb-6" style={{ color: '#2d2d2d' }}>About Me</h2>
              <div className="space-y-4 text-lg leading-relaxed" style={{ color: '#5a5a5a' }}>
                <p>
                  I'm a developer with a passion for building clean, efficient web applications. 
                  My work focuses on full-stack development with Laravel and React, creating 
                  systems that are both powerful and maintainable.
                </p>
                <p>
                  When I'm not coding, I write about software development, share insights on 
                  architecture patterns, and explore new technologies. I believe in learning in 
                  public and contributing to the development community.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#ffffff' }}>
                <div className="text-center p-8">
                  <Code2 size={64} className="mx-auto mb-4" style={{ color: '#658965' }} />
                  <p className="font-semibold text-lg" style={{ color: '#3d3d3d' }}>Building the web, one line at a time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section - Light yellow-green background */}
      <section id="contact" className="py-24 px-6" style={{ backgroundColor: '#d4e5c8' }}>
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6" style={{ color: '#2d2d2d' }}>Let's Work Together</h2>
          <p className="text-xl mb-12 max-w-2xl mx-auto" style={{ color: '#4a4a4a' }}>
            I'm always interested in hearing about new projects and opportunities. 
            Let's create something amazing together.
          </p>
          <div className="flex justify-center gap-6 mb-8">
            <a href="mailto:hello@sabrinamarkon.com" className="p-4 bg-white rounded-xl transition-all hover:scale-110 duration-300 shadow-md" style={{ border: '2px solid #7a9d7a' }}>
              <Mail size={28} style={{ color: '#658965' }} />
            </a>
            <a href="#" className="p-4 bg-white rounded-xl transition-all hover:scale-110 duration-300 shadow-md" style={{ border: '2px solid #7a9d7a' }}>
              <Github size={28} style={{ color: '#658965' }} />
            </a>
            <a href="#" className="p-4 bg-white rounded-xl transition-all hover:scale-110 duration-300 shadow-md" style={{ border: '2px solid #7a9d7a' }}>
              <Linkedin size={28} style={{ color: '#658965' }} />
            </a>
          </div>
          <a href="mailto:hello@sabrinamarkon.com" className="inline-block px-8 py-4 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-bold text-lg" style={{ backgroundColor: '#7a9d7a' }}>
            Get In Touch
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6 bg-white" style={{ borderColor: '#e5e3df' }}>
        <div className="max-w-6xl mx-auto text-center" style={{ color: '#7a7a7a' }}>
          <p>© 2026 Sabrina Markon. Crafted with care and code.</p>
        </div>
      </footer>
    </div>
  );
}