'use client'

import { useState, useEffect } from 'react';
import { Menu, X, ChevronDown, Globe, Building2, LogIn } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    if (pathname !== '/') {
      // If not on landing page, navigate there first
      router.push('/');
      // Wait for navigation, then scroll
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      // Already on landing page, just scroll
      const element = document.getElementById(sectionId);
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileMenuOpen(false);
  };

  // Pages with hero sections should have transparent header at top
  const pagesWithHero = ['/', '/methodology', '/privacy-policy', '/terms-of-service', '/sme-exchange-rules'];
  const hasHeroSection = pagesWithHero.includes(pathname);

  // Show solid background when scrolled OR when page doesn't have hero
  const showSolidBg = isScrolled || !hasHeroSection;

  return (
    <header className={`fixed w-full z-40 transition-all duration-300 ${showSolidBg ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <span className={`text-2xl font-serif font-bold ${showSolidBg ? 'text-brand-900' : 'text-white'}`}>
              IRA<span className="text-gold-500">Score</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <div className="relative group">
              <button
                className={`flex items-center text-sm font-medium hover:text-gold-500 transition-colors ${showSolidBg ? 'text-gray-700' : 'text-gray-200'}`}
              >
                Stock Exchanges <ChevronDown className="ml-1 w-4 h-4" />
              </button>

              {/* Dropdown Menu */}
              <div
                className="absolute left-0 mt-0 w-80 bg-white shadow-xl rounded-xl border border-gray-100 overflow-hidden hidden group-hover:block"
              >
                <div className="flex flex-col">
                  <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center text-brand-900 font-bold mb-2">
                      <Building2 className="w-4 h-4 mr-2 text-gold-500" />
                      INDIA
                    </div>
                    <ul className="space-y-1 pl-6">
                      <li className="text-sm text-gray-600 hover:text-brand-600 cursor-pointer">BSE (Bombay Stock Exchange)</li>
                      <li className="text-sm text-gray-600 hover:text-brand-600 cursor-pointer">NSE (National Stock Exchange)</li>
                      <li className="text-sm text-gray-600 hover:text-brand-600 cursor-pointer">BSE SME</li>
                      <li className="text-sm text-gray-600 hover:text-brand-600 cursor-pointer">NSE Emerge</li>
                    </ul>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center text-brand-900 font-bold mb-2">
                      <Globe className="w-4 h-4 mr-2 text-gold-500" />
                      GLOBAL
                    </div>
                    <ul className="space-y-1 pl-6">
                      <li className="text-sm text-gray-600 hover:text-brand-600 cursor-pointer">NASDAQ</li>
                      <li className="text-sm text-gray-600 hover:text-brand-600 cursor-pointer">NYSE</li>
                      <li className="text-sm text-gray-600 hover:text-brand-600 cursor-pointer">LSE (London)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => scrollToSection('how-it-works')}
              className={`text-sm font-medium hover:text-gold-500 transition-colors ${showSolidBg ? 'text-gray-700' : 'text-gray-200'}`}
            >
              How it Works
            </button>
            <button
              onClick={() => scrollToSection('success-stories')}
              className={`text-sm font-medium hover:text-gold-500 transition-colors ${showSolidBg ? 'text-gray-700' : 'text-gray-200'}`}
            >
              Success Stories
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className={`text-sm font-medium hover:text-gold-500 transition-colors ${showSolidBg ? 'text-gray-700' : 'text-gray-200'}`}
            >
              Contact
            </button>

            <Link
              href="/login"
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                isScrolled
                  ? 'bg-gold-600 text-white hover:bg-gold-500 shadow-md hover:shadow-lg'
                  : 'bg-gold-600 text-white hover:bg-gold-500 shadow-md hover:shadow-lg'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Login
            </Link>
          </nav>

          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={showSolidBg ? 'text-gray-900' : 'text-white'}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg border-t border-gray-100 py-4 px-4 flex flex-col space-y-4 max-h-[80vh] overflow-y-auto">
           <div className="font-bold text-gray-900 pb-2 border-b border-gray-100">Stock Exchanges</div>
           <div className="pl-4 space-y-2">
              <div className="text-xs font-bold text-gray-500">INDIA</div>
              <a href="#" className="block text-sm text-gray-800">BSE / NSE / SME</a>
              <div className="text-xs font-bold text-gray-500 mt-2">GLOBAL</div>
              <a href="#" className="block text-sm text-gray-800">NASDAQ / NYSE</a>
           </div>

           <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-gray-800 font-medium py-2 border-t border-gray-50 text-left"
            >
              How it Works
            </button>
            <button
              onClick={() => scrollToSection('success-stories')}
              className="text-gray-800 font-medium py-2 border-t border-gray-50 text-left"
            >
              Success Stories
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-gray-800 font-medium py-2 border-t border-gray-50 text-left"
            >
              Contact
            </button>

           <Link
             href="/login"
             className="flex items-center gap-2 justify-center px-8 py-4 rounded-lg bg-gold-600 text-white font-semibold hover:bg-gold-500 transition-all shadow-lg hover:shadow-gold-500/20 border-t border-gray-100 mt-2"
             onClick={() => setMobileMenuOpen(false)}
           >
             <LogIn className="w-5 h-5" />
             Login
           </Link>
        </div>
      )}
    </header>
  );
};