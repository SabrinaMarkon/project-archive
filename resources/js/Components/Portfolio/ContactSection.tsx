import { Mail, Github, Linkedin } from 'lucide-react';

export default function ContactSection() {
    return (
        <section id="contact" className="py-24 px-6" style={{ backgroundColor: '#ffffff' }}>
            <div className="max-w-6xl mx-auto text-center">
                <h2 className="text-5xl font-bold mb-6" style={{ color: '#2d2d2d' }}>Let's Work Together</h2>
                <p className="text-xl mb-12 max-w-2xl mx-auto" style={{ color: '#4a4a4a' }}>
                    I'm always interested in hearing about new projects and opportunities.
                    Let's create something amazing together.
                </p>
                <div className="flex justify-center gap-6 mb-8">
                    <a href="mailto:phpsitescripts@outlook.com" className="p-4 bg-white rounded-xl transition-all hover:scale-110 duration-300 shadow-md" style={{ border: '2px solid #7a9d7a' }}>
                        <Mail size={28} style={{ color: '#658965' }} />
                    </a>
                    <a href="https://github.com/sabrinamarkon" className="p-4 bg-white rounded-xl transition-all hover:scale-110 duration-300 shadow-md" style={{ border: '2px solid #7a9d7a' }}>
                        <Github size={28} style={{ color: '#658965' }} />
                    </a>
                    <a href="https://www.linkedin.com/in/sabrinamarkon/" className="p-4 bg-white rounded-xl transition-all hover:scale-110 duration-300 shadow-md" style={{ border: '2px solid #7a9d7a' }}>
                        <Linkedin size={28} style={{ color: '#658965' }} />
                    </a>
                </div>
                <a href="mailto:sabrina@sabrinamarkon.com" className="inline-block px-8 py-4 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-bold text-lg" style={{ backgroundColor: '#7a9d7a' }}>
                    Get In Touch
                </a>
            </div>
        </section>
    );
}
