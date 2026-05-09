/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Github, Linkedin, Mail, Smartphone, Code2, Layers, Cpu, ExternalLink, ChevronRight, Menu, X, Sparkles, Send, ArrowRight } from 'lucide-react';
import { cn } from './lib/utils';
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Types
interface GitHubRepo {
  id: number;
  name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  language: string;
  homepage: string;
}

interface GitHubProfile {
  name: string;
  bio: string;
  avatar_url: string;
  public_repos: number;
  followers: number;
}

export default function App() {
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  
  // AI Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: "Hi! I'm Santosh's AI assistant. Ask me anything about his projects, skills, or experience!" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [profileRes, reposRes] = await Promise.all([
          fetch('https://api.github.com/users/ItsWrecker'),
          fetch('https://api.github.com/users/ItsWrecker/repos?sort=updated&per_page=6')
        ]);
        
        if (profileRes.ok) setProfile(await profileRes.json());
        if (reposRes.ok) setRepos(await reposRes.json());
      } catch (error) {
        console.error('Error fetching GitHub data:', error);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setIsTyping(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMsg,
        config: {
          systemInstruction: `You are an AI assistant for Santosh Mehta (ItsWrecker), a passionate Android Software Engineer. 
          Use the following info to answer: 
          - Focus: Android Development, Clean Architecture, Jetpack Compose.
          - GitHub: ItsWrecker. 
          - Personality: Professional, technical, concise, yet friendly. 
          - Skills: Kotlin, Java, Firebase, MVVM, MVI, Dagger Hilt.
          If asked about contact, refer to santoshmh07@gmail.com.
          Keep responses relatively short and professional.`
        }
      });
      
      setChatMessages(prev => [...prev, { role: 'ai', text: response.text || "I'm sorry, I couldn't process that." }]);
    } catch (error) {
       setChatMessages(prev => [...prev, { role: 'ai', text: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const navItems = [
    { name: 'About', id: 'about' },
    { name: 'Projects', id: 'projects' },
    { name: 'Skills', id: 'skills' },
    { name: 'Contact', id: 'contact' }
  ];

  const skills = [
    { name: 'Android SDK', icon: <Smartphone className="w-5 h-5" />, category: 'Platform' },
    { name: 'Kotlin/Java', icon: <Code2 className="w-5 h-5" />, category: 'Language' },
    { name: 'Jetpack Compose', icon: <Layers className="w-5 h-5" />, category: 'UI' },
    { name: 'Firebase', icon: <Cpu className="w-5 h-5" />, category: 'Backend' },
    { name: 'Dagger Hilt', icon: <Cpu className="w-5 h-5" />, category: 'Architecture' },
    { name: 'Coroutines', icon: <Code2 className="w-5 h-5" />, category: 'Threading' }
  ];

  return (
    <div className="min-h-screen bg-surface selection:bg-white/20 selection:text-white text-[#e0e0e0]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-12 py-12 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl font-display font-medium tracking-[0.2em] text-white"
          >
            WRECKER.
          </motion.div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-12 text-[10px] uppercase tracking-[0.3em] font-medium">
            {navItems.map((item, index) => (
              <motion.a
                key={item.id}
                href={`#${item.id}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "transition-all duration-300 hover:text-white",
                  activeSection === item.id ? "text-white border-b border-white/40 pb-1" : "text-white/40"
                )}
                onClick={() => setActiveSection(item.id)}
              >
                {item.name}
              </motion.a>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-6"
          >
            <a href="#contact" className="hidden md:block px-6 py-2 border border-white/10 rounded-full text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all cursor-pointer">
              Contact
            </a>
            <button 
              className="md:hidden p-2 text-white/60 hover:text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </motion.div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-surface/95 backdrop-blur-xl pt-24 px-8"
          >
            <div className="flex flex-col gap-6">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="text-4xl font-display font-bold hover:text-brand transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {/* Hero Section */}
        <section id="hero" className="min-h-screen flex items-center justify-center pt-24 px-12 relative overflow-hidden">
          <div className="max-w-7xl mx-auto w-full relative z-10 grid md:grid-cols-12 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="md:col-span-5"
            >
              <h1 className="text-7xl md:text-8xl font-display font-light leading-[0.9] text-white mb-8 tracking-tighter">
                Creative<br />
                <span className="font-medium italic text-white/50">Systems.</span>
              </h1>
              <p className="text-base text-white/40 max-w-sm mb-12 leading-relaxed font-light">
                Architecting digital experiences through minimal code and maximal impact. Focused on Android performance and aesthetic precision.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="#projects" className="px-10 py-4 bg-white text-black hover:bg-gray-200 rounded-full font-bold transition-all text-xs uppercase tracking-widest">
                  View Work
                </a>
                <a href="#contact" className="px-10 py-4 border border-white/10 hover:bg-white hover:text-black rounded-full font-bold transition-all text-xs uppercase tracking-widest">
                  Contact
                </a>
              </div>

              {/* Tag Cloud */}
              <div className="flex flex-wrap gap-2 mt-16">
                {['Kotlin', 'Compose', 'Architecture', 'Firebase', 'Clean Code'].map(tag => (
                  <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded text-[10px] uppercase tracking-wider text-white/60">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative hidden md:block md:col-span-7"
            >
              <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-white/5 bg-white/[0.02] relative group">
                <div className="absolute inset-0 flex flex-col p-12">
                   <div className="flex justify-between items-center mb-8">
                      <h2 className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-semibold">Featured Work</h2>
                      <div className="h-[1px] flex-1 bg-white/10 mx-6"></div>
                      <div className="text-[10px] text-white/60">VIEW ALL</div>
                   </div>
                   <div className="grid grid-cols-2 gap-6 flex-1">
                      {repos.slice(0, 2).map(repo => (
                        <div key={repo.id} className="bg-white/[0.02] border border-white/10 p-6 rounded-2xl flex flex-col justify-between hover:bg-white/[0.05] hover:border-white/20 transition-all">
                          <div>
                            <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 mb-4">
                              <Code2 className="w-5 h-5 text-white/70" />
                            </div>
                            <h3 className="text-white text-lg font-medium mb-1">{repo.name}</h3>
                            <p className="text-white/40 text-[10px] leading-relaxed line-clamp-2">{repo.description || "Minimal engineering excellence."}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-4">
                            <div className="w-1 h-1 rounded-full bg-white/40" />
                            <span className="text-[10px] uppercase tracking-tighter text-white/60">{repo.language || 'Kotlin'}</span>
                          </div>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
              
              {/* Decorative Corner Stats */}
              <div className="absolute -bottom-6 -right-6 glass p-8 rounded-3xl shadow-2xl border-white/5">
                <div className="text-white font-display font-light text-4xl">1,4k+</div>
                <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold">Contributions</div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-32 px-12 border-t border-white/5">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-24 items-center">
             <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                >
                  <h2 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.4em] mb-8">Architectural Intent</h2>
                  <h3 className="text-5xl md:text-7xl font-display font-light text-white mb-10 tracking-tight leading-none">Engineering Minimal<br /><span className="italic font-medium">Systems</span>.</h3>
                  <div className="space-y-6 text-white/40 leading-relaxed text-lg font-light">
                    <p>
                      Based in India, I'm a Software Engineer with a deep obsession for the Android ecosystem. 
                    </p>
                    <p>
                      My approach: balance functional complexity with surgical aesthetic precision. Whether it's a sleek UI in Compose or a robust data layer with Room, I craft every line with purpose.
                    </p>
                  </div>
                </motion.div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-white/[0.02] border border-white/10 p-10 rounded-[2.5rem] aspect-square flex flex-col justify-end group hover:bg-white/5 transition-colors">
                    <Smartphone className="w-8 h-8 text-white/40 mb-4 group-hover:text-white transition-colors" />
                    <h4 className="font-medium text-white text-xl">Mobile</h4>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">Native Android</p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/10 p-10 rounded-[2.5rem] aspect-[4/3] flex flex-col justify-end group hover:bg-white/5 transition-colors">
                    <Code2 className="w-8 h-8 text-white/40 mb-4 group-hover:text-white transition-colors" />
                    <h4 className="font-medium text-white text-xl">Clean Code</h4>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">Solid Principles</p>
                  </div>
                </div>
                <div className="space-y-4 mt-12">
                  <div className="bg-white/[0.02] border border-white/10 p-10 rounded-[2.5rem] aspect-[4/3] flex flex-col justify-end group hover:bg-white/5 transition-colors">
                    <Layers className="w-8 h-8 text-white/40 mb-4 group-hover:text-white transition-colors" />
                    <h4 className="font-medium text-white text-xl">UI/UX</h4>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">Modern Patterns</p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/10 p-10 rounded-[2.5rem] aspect-square flex flex-col justify-end group hover:bg-white/5 transition-colors">
                    <Cpu className="w-8 h-8 text-white/40 mb-4 group-hover:text-white transition-colors" />
                    <h4 className="font-medium text-white text-xl">Arch</h4>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">Scalable</p>
                  </div>
                </div>
             </div>
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" className="py-32 px-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6">
              <div>
                <h2 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.4em] mb-4">Case Studies</h2>
                <h3 className="text-5xl font-display font-light text-white tracking-tight leading-none">Featured<br /><span className="italic font-medium">Repositories</span>.</h3>
              </div>
              <a href="https://github.com/ItsWrecker" target="_blank" className="text-[10px] uppercase tracking-[0.2em] text-white/60 hover:text-white border-b border-white/20 pb-1 flex items-center gap-2 group transition-all">
                VIEW ALL PROJECTS
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {repos.map((repo, index) => (
                <motion.div
                  key={repo.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/[0.02] border border-white/10 p-10 rounded-[2.5rem] flex flex-col transition-all duration-500 hover:border-white/30 group"
                >
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-white group-hover:text-black transition-all">
                      <Code2 className="w-6 h-6" />
                    </div>
                    <div className="text-[10px] text-white/20 font-mono uppercase tracking-tighter">
                      {repo.language || 'Code'}
                    </div>
                  </div>
                  <h4 className="text-2xl font-display font-medium text-white mb-4 group-hover:translate-x-1 transition-transform">{repo.name}</h4>
                  <p className="text-white/40 text-sm leading-relaxed mb-8 flex-grow line-clamp-3 font-light">
                    {repo.description || 'A professional software project built with precision and modern engineering principles.'}
                  </p>
                  <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-auto">
                    <a 
                      href={repo.html_url} 
                      target="_blank" 
                      className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40 flex items-center gap-2 hover:text-white transition-colors"
                    >
                      REPOSITORY <ChevronRight className="w-3 h-3" />
                    </a>
                    {repo.homepage && (
                      <a href={repo.homepage} target="_blank" className="text-[10px] text-white/20 hover:text-white transition-colors font-mono">
                        DEMO
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="py-32 px-12 border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-20">
               <h3 className="text-5xl font-display font-light text-white tracking-tight">Toolkit<span className="text-white/30 italic">.</span></h3>
               <div className="h-[1px] flex-1 bg-white/10 mx-12"></div>
               <h2 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.4em]">Expertise</h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              {skills.map((skill, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white/[0.02] border border-white/10 p-8 rounded-3xl flex flex-col items-center justify-center gap-4 group transition-colors hover:border-white/30"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/30 group-hover:text-white transition-all duration-300">
                    {skill.icon}
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-sm text-white">{skill.name}</div>
                    <div className="text-[9px] text-white/20 uppercase tracking-widest font-bold mt-1">{skill.category}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Experience / Resume Teaser */}
        <section className="py-32 px-12 border-t border-white/5">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-4xl md:text-6xl font-display font-light mb-10 tracking-tight leading-tight text-white">
                Interested in working <span className="italic font-medium">together?</span>
              </h3>
              <p className="text-xl text-white/40 mb-12 font-light">
                Currently available for selected freelance projects and full-time inquiries.
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                 <a href="#contact" className="px-12 py-5 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-all uppercase tracking-widest text-xs">
                   Hire Me
                 </a>
                 <a href="https://github.com/ItsWrecker" target="_blank" className="px-12 py-5 border border-white/10 rounded-full font-bold hover:bg-white hover:text-black transition-all flex items-center gap-2 uppercase tracking-widest text-xs">
                   GitHub Profile
                 </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-32 px-12">
          <div className="max-w-7xl mx-auto">
             <div className="grid md:grid-cols-2 gap-24">
                <div>
                  <h2 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.4em] mb-4">Contact</h2>
                  <h3 className="text-6xl font-display font-light text-white mb-8 tracking-tighter">Get in<br /><span className="italic font-medium">Touch</span>.</h3>
                  <p className="text-xl text-white/40 mb-12 font-light leading-relaxed">
                    Have a project in mind or just want to say hi? Feel free to reach out. 
                  </p>
                  
                  <div className="space-y-8">
                    <a href="mailto:santoshmh07@gmail.com" className="flex items-center gap-6 group">
                      <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-white/30 group-hover:bg-white group-hover:text-black transition-all duration-500 border border-white/5">
                        <Mail className="w-8 h-8" />
                      </div>
                      <div>
                        <div className="text-[10px] text-white/20 uppercase tracking-widest font-bold mb-1">Email Me</div>
                        <div className="text-xl font-medium text-white group-hover:translate-x-1 transition-transform">santoshmh07@gmail.com</div>
                      </div>
                    </a>
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/10 p-12 rounded-[3.5rem]">
                   <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-white/30 px-2">Name</label>
                          <input type="text" placeholder="John Doe" className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 focus:outline-none focus:border-white/20 transition-colors text-white" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-white/30 px-2">Email</label>
                          <input type="email" placeholder="john@example.com" className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 focus:outline-none focus:border-white/20 transition-colors text-white" />
                        </div>
                      </div>
                      <button className="w-full py-5 bg-white text-black rounded-2xl font-bold hover:brightness-90 transition-all uppercase tracking-widest text-xs">
                        Send Message
                      </button>
                   </form>
                </div>
             </div>
          </div>
        </section>
      </main>

      {/* AI Chat Widget */}
      <div className="fixed bottom-8 right-8 z-[100]">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="absolute bottom-20 right-0 w-80 md:w-96 glass rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl h-[500px]"
            >
              <div className="p-6 bg-white text-black flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <div className="font-bold text-sm tracking-tighter">AI Assistant</div>
                    <div className="text-[8px] uppercase tracking-[0.2em] font-bold opacity-40">Gemini Systems</div>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="hover:bg-black/10 p-2 rounded-full transition-colors"><X className="w-5 h-5" /></button>
              </div>
              
              <div className="flex-grow overflow-y-auto p-6 space-y-4">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={cn(
                    "max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed",
                    msg.role === 'ai' ? "bg-white/5 text-gray-200 self-start rounded-tl-none border border-white/5" : "bg-brand text-white self-end ml-auto rounded-tr-none"
                  )}>
                    {msg.text}
                  </div>
                ))}
                {isTyping && (
                  <div className="bg-white/5 text-gray-400 self-start p-4 rounded-2xl rounded-tl-none border border-white/5 animate-pulse">
                    Thinking...
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-4 border-t border-white/5">
                <div className="relative">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                    placeholder="Ask me anything..." 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-4 pr-12 focus:outline-none focus:border-brand transition-colors text-sm"
                  />
                  <button 
                    onClick={handleSendChat}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand text-white rounded-xl hover:scale-105 transition-transform"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={cn(
            "w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500",
            isChatOpen ? "bg-white text-black rotate-90" : "bg-brand text-white"
          )}
        >
          {isChatOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
        </motion.button>
      </div>

      {/* Footer */}
      <footer className="py-16 px-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-end justify-between gap-12">
          <div className="flex flex-col gap-6">
            <div className="text-xl font-display font-medium tracking-[0.2em] text-white">WRECKER.</div>
            <div className="text-[10px] text-white/20 font-mono tracking-widest">
              LOC: 23.0225° N, 72.5714° E · INDIA
            </div>
          </div>
          <div className="text-white/20 text-[10px] uppercase tracking-[0.3em] font-light">
            © {new Date().getFullYear()} Santosh Mehta · Distributed Creativity
          </div>
          <div className="flex items-center gap-8">
            <a href="https://github.com/ItsWrecker" className="text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors">GitHub</a>
            <a href="#" className="text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors">LinkedIn</a>
            <a href="#" className="text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

