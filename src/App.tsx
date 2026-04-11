import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  db, 
  auth, 
  collection, 
  addDoc, 
  deleteDoc,
  doc,
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp, 
  signInWithPopup, 
  googleProvider,
  signOut
} from './firebase';
import { 
  Menu, 
  X, 
  Play, 
  Info, 
  Zap, 
  Film, 
  TrendingUp, 
  Layout, 
  Settings, 
  Edit3, 
  Search, 
  ArrowRight, 
  Plus,
  LogOut,
  Trash2
} from 'lucide-react';

// Types
interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  createdAt: any;
}

export default function App() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isContactSubmitting, setIsContactSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [portfolioForm, setPortfolioForm] = useState({ title: '', description: '', imageUrl: '', link: '' });

  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "muhammad.moeen.bsse-2024c@cecosian.edu.pk";

  useEffect(() => {
    // Auth listener
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setUser(user);
      setIsAdmin(user?.email === ADMIN_EMAIL);
    });

    // Portfolio listener
    const q = query(collection(db, 'portfolio'), orderBy('createdAt', 'desc'));
    const unsubscribePortfolio = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PortfolioItem[];
      setPortfolio(items);
    });

    return () => {
      unsubscribeAuth();
      unsubscribePortfolio();
    };
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleContactSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsContactSubmitting(true);
    try {
      await addDoc(collection(db, 'contacts'), {
        ...contactForm,
        createdAt: serverTimestamp()
      });
      setContactSuccess(true);
      setContactForm({ name: '', email: '', message: '' });
      setTimeout(() => setContactSuccess(false), 5000);
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setIsContactSubmitting(false);
    }
  };

  const handleAddPortfolio = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'portfolio'), {
        ...portfolioForm,
        createdAt: serverTimestamp()
      });
      setIsModalOpen(false);
      setPortfolioForm({ title: '', description: '', imageUrl: '', link: '' });
    } catch (error) {
      console.error("Failed to add portfolio item:", error);
    }
  };

  const handleDeletePortfolio = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteDoc(doc(db, 'portfolio', id));
    } catch (error) {
      console.error("Failed to delete portfolio item:", error);
    }
  };

  const scrollToContact = () => {
    const element = document.getElementById('contact');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-surface-dim text-on-surface selection:bg-primary-container selection:text-on-primary-container">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex justify-between items-center px-6 md:px-12 py-4 max-w-7xl mx-auto">
          <div className="text-2xl font-bold tracking-tighter text-white font-headline">Zerotosite</div>
          
          <div className="hidden md:flex items-center space-x-8">
            {['Services', 'Process', 'Portfolio', 'Contact'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-slate-400 hover:text-white transition-colors font-label text-sm uppercase tracking-wide">
                {item}
              </a>
            ))}
            {isAdmin && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 text-primary hover:text-white transition-colors font-label text-sm uppercase tracking-wide"
              >
                <Plus size={16} /> Add Project
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={scrollToContact}
              className="bg-primary-container text-on-primary-container px-6 py-2 rounded-lg font-bold hover:scale-105 active:scale-95 transition-all duration-200"
            >
              Get Started
            </button>
            {user && (
              <div className="flex items-center gap-3">
                <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full border border-white/10" />
                <button onClick={handleLogout} className="text-slate-400 hover:text-white transition-colors">
                  <LogOut size={20} />
                </button>
              </div>
            )}
            <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-surface-dim pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col space-y-6">
              {['Services', 'Process', 'Portfolio', 'Contact'].map((item) => (
                <a 
                  key={item} 
                  href={`#${item.toLowerCase()}`} 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-2xl font-headline font-bold text-white"
                >
                  {item}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <header className="relative w-full h-screen overflow-hidden flex items-center">
        <div className="absolute inset-0 z-0">
          <img 
            className="w-full h-full object-cover" 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000" 
            alt="Modern Office"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 cinematic-mask"></div>
          <div className="absolute inset-0 cinematic-mask-v h-1/2 bottom-0 top-auto"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-8 w-full">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl space-y-6"
          >
            <div className="flex items-center gap-2">
              <span className="bg-primary-container/20 text-primary-container px-3 py-1 rounded text-xs font-bold tracking-widest uppercase border border-primary-container/30">
                Zerotosite Originals
              </span>
            </div>
            <h1 className="font-headline text-5xl md:text-7xl font-extrabold text-white tracking-tighter leading-[1.1]">
              Digital Experiences <br/> <span className="text-primary-container">Curated for Impact.</span>
            </h1>
            <p className="text-on-surface-variant text-lg md:text-xl max-w-lg leading-relaxed">
              We don't just build websites; we direct digital journeys. High-end web design for brands that demand a premier presence.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button 
                onClick={scrollToContact}
                className="flex items-center gap-2 bg-white text-surface-dim px-8 py-3 rounded-lg font-bold hover:scale-105 transition-all"
              >
                <Play size={20} fill="currentColor" />
                Start Project
              </button>
              <button 
                onClick={() => document.getElementById('process')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 text-white px-8 py-3 rounded-lg font-bold hover:bg-white/20 transition-all"
              >
                <Info size={20} />
                Our Process
              </button>
            </div>
          </motion.div>
        </div>
      </header>

      <main>
        {/* Why Choose Us */}
        <section id="process" className="py-24 bg-surface-dim">
          <div className="max-w-7xl mx-auto px-8">
            <div className="mb-16">
              <span className="font-label text-primary-container font-semibold tracking-[0.2em] uppercase text-xs mb-2 block">Value Proposition</span>
              <h2 className="font-headline text-4xl font-bold text-white tracking-tight">Why Choose Us</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { icon: Zap, title: "Unmatched Speed", desc: "We deliver high-performance digital solutions at the speed of your business." },
                { icon: Film, title: "Cinematic Quality", desc: "Every pixel is curated with artistic precision, creating immersive visual narratives." },
                { icon: TrendingUp, title: "Business Growth", desc: "Our designs are strategic tools built to drive revenue and scale your digital authority." }
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="space-y-4"
                >
                  <div className="w-12 h-12 bg-primary-container/10 rounded-lg flex items-center justify-center">
                    <feature.icon className="text-primary-container" size={24} />
                  </div>
                  <h3 className="font-headline text-xl font-bold text-white">{feature.title}</h3>
                  <p className="text-on-surface-variant leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="services" className="py-24 bg-surface-container-low">
          <div className="max-w-7xl mx-auto px-8">
            <div className="mb-16 text-center max-w-3xl mx-auto">
              <span className="font-label text-primary-container font-semibold tracking-[0.2em] uppercase text-xs mb-2 block">Expertise</span>
              <h2 className="font-headline text-4xl font-bold text-white tracking-tight mb-4">Our Services</h2>
              <p className="text-on-surface-variant">Specialized services designed to elevate your brand from zero to site with precision and cinematic flair.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { icon: Layout, title: "Web Design", desc: "Bespoke digital experiences that tell your story through immersive visuals." },
                { icon: Settings, title: "Maintenance", desc: "Ongoing support and performance optimization to keep your digital presence sharp." },
                { icon: Edit3, title: "Copywriting", desc: "Compelling narratives and strategic messaging that resonate with your audience." },
                { icon: Search, title: "SEO", desc: "Advanced search engine optimization strategies to ensure your brand stands out." }
              ].map((service, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  className="bg-surface-container-high rounded-2xl p-8 border border-white/5 group hover:border-primary-container/30 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 bg-primary-container/10 rounded-xl flex items-center justify-center">
                      <service.icon className="text-primary-container" size={32} />
                    </div>
                    <ArrowRight className="text-slate-600 group-hover:text-primary-container transition-colors" />
                  </div>
                  <h3 className="font-headline text-2xl font-bold text-white mb-3">{service.title}</h3>
                  <p className="text-on-surface-variant leading-relaxed">{service.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Portfolio */}
        <section id="portfolio" className="py-24 bg-surface-dim">
          <div className="max-w-7xl mx-auto px-8">
            <div className="mb-16 flex justify-between items-end">
              <div>
                <span className="font-label text-primary-container font-semibold tracking-[0.2em] uppercase text-xs mb-2 block">Portfolio</span>
                <h2 className="font-headline text-4xl font-bold text-white tracking-tight">Recent Masterpieces</h2>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {portfolio.length > 0 ? (
                portfolio.map((item) => (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group relative bg-surface-container-high rounded-2xl overflow-hidden border border-white/5"
                  >
                    <div className="aspect-video overflow-hidden">
                      <img 
                        src={item.imageUrl} 
                        alt={item.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-white">{item.title}</h3>
                        {isAdmin && (
                          <button 
                            onClick={() => handleDeletePortfolio(item.id)}
                            className="text-slate-600 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                      <p className="text-on-surface-variant text-sm mb-4 line-clamp-2">{item.description}</p>
                      <a 
                        href={item.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary-container font-bold hover:gap-3 transition-all"
                      >
                        View Project <ArrowRight size={16} />
                      </a>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-white/10 rounded-2xl">
                  <p className="text-on-surface-variant">No projects added yet. {isAdmin ? "Click 'Add Project' to start." : ""}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section id="contact" className="py-24 bg-surface-container-low">
          <div className="max-w-7xl mx-auto px-8">
            <div className="bg-primary-container rounded-3xl p-8 md:p-16 flex flex-col lg:flex-row items-center gap-12 overflow-hidden relative">
              <div className="flex-1 z-10">
                <h2 className="font-headline text-4xl md:text-5xl font-bold text-on-primary-container mb-4">Ready to Direct?</h2>
                <p className="text-on-primary-container/80 text-lg mb-8 max-w-md">
                  Let's discuss your vision and see how Zerotosite can bring it to life with cinematic precision.
                </p>
                
                <form onSubmit={handleContactSubmit} className="space-y-4 max-w-md">
                  <input 
                    type="text" 
                    placeholder="Your Name" 
                    required
                    value={contactForm.name}
                    onChange={e => setContactForm({...contactForm, name: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-on-primary-container placeholder:text-on-primary-container/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                  />
                  <input 
                    type="email" 
                    placeholder="Your Email" 
                    required
                    value={contactForm.email}
                    onChange={e => setContactForm({...contactForm, email: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-on-primary-container placeholder:text-on-primary-container/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                  />
                  <textarea 
                    placeholder="Your Message" 
                    required
                    rows={4}
                    value={contactForm.message}
                    onChange={e => setContactForm({...contactForm, message: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-on-primary-container placeholder:text-on-primary-container/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all resize-none"
                  />
                  <button 
                    disabled={isContactSubmitting}
                    className="w-full bg-surface-dim text-white py-4 rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {isContactSubmitting ? "Sending..." : "Schedule a Call"}
                  </button>
                  {contactSuccess && (
                    <motion.p 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="text-on-primary-container font-bold text-center"
                    >
                      Message sent successfully!
                    </motion.p>
                  )}
                </form>
              </div>
              
              <div className="flex-1 relative hidden lg:block">
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800" 
                  alt="Team" 
                  className="rounded-2xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <div className="text-2xl font-bold tracking-tighter text-white font-headline">Zerotosite</div>
            <p className="text-slate-500 text-xs uppercase tracking-widest mt-1">Directing Digital Frontiers</p>
          </div>
          <div className="flex gap-8">
            {['Privacy', 'Terms', 'Twitter', 'LinkedIn'].map(link => (
              <a key={link} href="#" className="text-slate-500 hover:text-primary-container transition-colors text-sm uppercase tracking-wide">
                {link}
              </a>
            ))}
            {!user && (
              <button 
                onClick={handleLogin}
                className="text-slate-800 hover:text-slate-600 transition-colors text-sm uppercase tracking-wide"
              >
                Admin
              </button>
            )}
          </div>
          <p className="text-slate-500 text-sm">© 2024 Zerotosite Agency. All rights reserved.</p>
        </div>
      </footer>

      {/* Admin Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-surface-container-high w-full max-w-lg rounded-3xl p-8 border border-white/10 shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Add New Project</h2>
              <form onSubmit={handleAddPortfolio} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-slate-500 mb-1">Project Title</label>
                  <input 
                    type="text" 
                    required
                    value={portfolioForm.title}
                    onChange={e => setPortfolioForm({...portfolioForm, title: e.target.value})}
                    className="w-full bg-surface-dim border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary-container/50 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-slate-500 mb-1">Description</label>
                  <textarea 
                    required
                    rows={3}
                    value={portfolioForm.description}
                    onChange={e => setPortfolioForm({...portfolioForm, description: e.target.value})}
                    className="w-full bg-surface-dim border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary-container/50 outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-slate-500 mb-1">Image URL</label>
                  <input 
                    type="url" 
                    required
                    value={portfolioForm.imageUrl}
                    onChange={e => setPortfolioForm({...portfolioForm, imageUrl: e.target.value})}
                    className="w-full bg-surface-dim border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary-container/50 outline-none"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-slate-500 mb-1">Project Link</label>
                  <input 
                    type="url" 
                    value={portfolioForm.link}
                    onChange={e => setPortfolioForm({...portfolioForm, link: e.target.value})}
                    className="w-full bg-surface-dim border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary-container/50 outline-none"
                    placeholder="https://your-project.com"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 rounded-xl font-bold text-slate-400 hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-primary-container text-on-primary-container py-4 rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Add Project
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
