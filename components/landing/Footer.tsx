'use client'

import { Mail, MapPin, User } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export const Footer = () => {
  const router = useRouter();
  const pathname = usePathname();

  const scrollToSection = (sectionId: string) => {
    if (pathname !== '/') {
      router.push('/');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <footer className="bg-brand-900 text-white py-16 border-t border-brand-800" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2 space-y-6">
            <span className="text-3xl font-serif font-bold text-white block">
              IRA<span className="text-gold-500">Score</span>
            </span>
            <p className="text-brand-200 text-base max-w-sm leading-relaxed">
              Helping Indian companies bridge the gap between private success and public legacy. Your trusted partner for BSE & NSE listings.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h4 className="font-bold text-lg mb-6 text-gold-500">Quick Links</h4>
            <ul className="space-y-4 text-sm text-brand-100">
              <li>
                <button onClick={() => router.push('/')} className="hover:text-white hover:translate-x-1 transition-all inline-block text-left">
                  Eligibility Check
                </button>
              </li>
              <li>
                <button onClick={() => router.push('/methodology')} className="hover:text-white hover:translate-x-1 transition-all inline-block text-left">
                  Our Methodology
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('success-stories')} className="hover:text-white hover:translate-x-1 transition-all inline-block text-left">
                  Client Stories
                </button>
              </li>
              <li>
                <button onClick={() => router.push('/sme-exchange-rules')} className="hover:text-white hover:translate-x-1 transition-all inline-block text-left">
                  SME Exchange Rules
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="col-span-1">
            <h4 className="font-bold text-lg mb-6 text-gold-500">Contact Expert</h4>
            
            <div className="bg-brand-800/40 p-5 rounded-2xl border border-brand-700/50 backdrop-blur-sm hover:border-brand-600 transition-colors">
              {/* Person Info */}
              <div className="flex items-center space-x-4 mb-4">
                 <div className="h-12 w-12 rounded-full bg-brand-700 flex items-center justify-center shrink-0 border border-brand-600 shadow-inner">
                    <User className="w-6 h-6 text-gold-500" /> 
                 </div>
                 <div>
                   <p className="font-bold text-white text-lg leading-tight">Piyush Kumar</p>
                   <p className="text-brand-400 text-xs font-medium uppercase tracking-wider mt-1">IPO Advisor</p>
                 </div>
              </div>

              <div className="mb-5">
                  <div className="inline-block bg-brand-900/80 px-3 py-1.5 rounded-md border border-brand-700/50">
                    <p className="text-brand-200 text-xs font-medium">Senior Investment Banking Analyst</p>
                  </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-4 pt-4 border-t border-brand-700/50">
                <a href="mailto:piyush@cosmosfin.com" className="flex items-center group transition-all">
                  <div className="w-8 h-8 rounded-lg bg-brand-800 flex items-center justify-center mr-3 group-hover:bg-gold-600 transition-colors shrink-0 border border-brand-700 group-hover:border-gold-500">
                      <Mail className="w-4 h-4 text-gold-500 group-hover:text-white" />
                  </div>
                  <span className="text-sm text-brand-100 group-hover:text-white truncate font-medium">piyush@cosmosfin.com</span>
                </a>
                
                <div className="flex items-start group">
                  <div className="w-8 h-8 rounded-lg bg-brand-800 flex items-center justify-center mr-3 shrink-0 mt-0.5 border border-brand-700">
                      <MapPin className="w-4 h-4 text-gold-500" />
                  </div>
                  <span className="text-sm text-brand-100 leading-snug">C-756 NFC,<br/>New Delhi, 110025</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-brand-800 mt-16 pt-8 text-center text-xs text-brand-400 flex flex-col md:flex-row justify-between items-center">
          <p>© {new Date().getFullYear()} IRA Score Financial Services. All rights reserved.</p>
          <div className="mt-4 md:mt-0 space-x-6">
            <a href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};