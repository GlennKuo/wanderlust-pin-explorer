import React, { useState, useEffect } from 'react';
import { Menu, X, Globe, DollarSign, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Check if we've scrolled past the banner (approximately 60vh)
      const scrollThreshold = window.innerHeight * 0.4;
      setIsScrolled(window.scrollY > scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { label: 'Destinations', href: '#destinations' },
    { label: 'Plan Trip', href: '#plan' },
    { label: 'Experiences', href: '#experiences' },
    { label: 'About', href: '#about' },
  ];

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'zh', label: '中文' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
  ];

  const currencies = [
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' },
    { code: 'JPY', symbol: '¥' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[10000] transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50'
          : 'bg-white/80 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-black text-primary">TravelPlanner</span>
            </a>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {menuItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    const targetId = item.href.replace('#', '');
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                      const navHeight = 80; // Navigation height + extra padding for better visibility
                      const elementPosition = targetElement.offsetTop - navHeight;
                      window.scrollTo({
                        top: elementPosition,
                        behavior: 'smooth'
                      });
                    }
                  }}
                  className="text-gray-700 hover:text-primary px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:bg-gray-50"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Sign In/Sign Up Buttons */}
            <div className="flex items-center space-x-3">
              <Button variant="ghost" className="text-gray-600 hover:text-primary font-semibold">
                Log in
              </Button>
              <Button variant="cta" className="font-semibold">
                Sign up
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="h-9 w-9 p-0"
            >
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white/95 backdrop-blur-md border-t border-gray-200/50">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  const targetId = item.href.replace('#', '');
                  const targetElement = document.getElementById(targetId);
                  if (targetElement) {
                    const navHeight = 80; // Navigation height + extra padding for better visibility
                    const elementPosition = targetElement.offsetTop - navHeight;
                    window.scrollTo({
                      top: elementPosition,
                      behavior: 'smooth'
                    });
                  }
                  setIsOpen(false);
                }}
                className="text-gray-700 hover:text-primary block px-3 py-2 rounded-md text-base font-semibold transition-all duration-200 hover:bg-gray-50"
              >
                {item.label}
              </a>
            ))}
            
            {/* Mobile Sign In */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="px-3 py-2 space-y-3">
                <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-primary font-semibold">
                  Log in
                </Button>
                <Button variant="cta" className="w-full font-semibold" onClick={() => setIsOpen(false)}>
                  Sign up
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};