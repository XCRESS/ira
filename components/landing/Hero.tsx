import { ArrowRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface HeroProps {
  onStartAssessment: () => void;
}

export const Hero = ({ onStartAssessment }: HeroProps) => {
  return (
    <div className="relative bg-brand-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center space-x-2 bg-brand-800 rounded-full px-4 py-1.5 mb-6 border border-brand-600">
              <TrendingUp className="w-4 h-4 text-gold-500" />
              <span className="text-sm font-medium text-brand-100">Trusted by Apollo Green Energy</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight mb-6">
              From Private Enterprise to <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-500 to-amber-300">Public Legacy</span>
            </h1>
            <p className="text-lg md:text-xl text-brand-100 mb-8 max-w-lg">
              Unlock your company's potential on BSE & NSE. Take the first step with our free AI-powered IRA Score™ eligibility check.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onStartAssessment}
                className="inline-flex items-center justify-center bg-gold-600 hover:bg-gold-500 text-white font-semibold px-8 py-4 rounded-lg transition-all shadow-lg hover:shadow-gold-500/20"
              >
                Check Eligibility Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <Link
                href="/methodology"
                className="inline-flex items-center justify-center text-white border border-brand-600 hover:bg-brand-800 font-medium px-8 py-4 rounded-lg transition-all"
              >
                Learn about IRA Tool
              </Link>
            </div>
          </div>
          
          <div className="relative hidden md:block">
            {/* Abstract Dashboard Graphic */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <div className="h-2 w-20 bg-white/40 rounded mb-2"></div>
                  <div className="h-2 w-12 bg-white/20 rounded"></div>
                </div>
                <div className="bg-green-500/20 text-green-300 px-3 py-1 rounded text-xs font-bold">IPO READY</div>
              </div>
              <div className="space-y-3">
                <div className="h-16 bg-gradient-to-r from-brand-600 to-brand-500 rounded-lg opacity-80 w-full"></div>
                <div className="h-16 bg-gradient-to-r from-brand-600 to-brand-500 rounded-lg opacity-60 w-3/4"></div>
                <div className="h-16 bg-gradient-to-r from-brand-600 to-brand-500 rounded-lg opacity-40 w-1/2"></div>
              </div>
              <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-end">
                <div>
                  <div className="text-sm text-brand-200">IRA Score</div>
                  <div className="text-3xl font-bold text-white">92/100</div>
                </div>
                <div className="h-10 w-10 bg-gold-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};