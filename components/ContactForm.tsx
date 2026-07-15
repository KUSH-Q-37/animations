'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch('https://formspree.io/f/mdarvyal', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setStatus('success');
        form.reset();
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 bg-zinc-900/10 border border-[#00ff33] p-6 backdrop-blur-sm z-20 relative">
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-[#00ff33] font-mono text-[10px] tracking-widest uppercase select-none cursor-none!">
          Name
        </label>
        <input 
          type="text" 
          id="name" 
          name="name" 
          required 
          className="bg-black/50 border border-[#00ff33]/30 focus:border-[#00ff33] focus:outline-none text-white px-4 py-3 font-mono text-sm transition-colors duration-300 cursor-none" 
        />
      </div>
      
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-[#00ff33] font-mono text-[10px] tracking-widest uppercase select-none cursor-none!">
          Email Address
        </label>
        <input 
          type="email" 
          id="email" 
          name="email" 
          required 
          className="bg-black/50 border border-[#00ff33]/30 focus:border-[#00ff33] focus:outline-none text-white px-4 py-3 font-mono text-sm transition-colors duration-300 cursor-none" 
        />
      </div>
      
      <div className="flex flex-col gap-2">
        <label htmlFor="message" className="text-[#00ff33] font-mono text-[10px] tracking-widest uppercase select-none cursor-none!">
          Message
        </label>
        <textarea 
          id="message" 
          name="message" 
          rows={4} 
          required 
          className="bg-black/50 border border-[#00ff33]/30 focus:border-[#00ff33] focus:outline-none text-white px-4 py-3 font-mono text-sm transition-colors duration-300 resize-none cursor-none"
        ></textarea>
      </div>
      
      {/* 1. Hidden Native Submit Button */}
      <button type="submit" id="contact-submit-btn" className="hidden" />

      {/* 2. Visual Label acting as the button to bypass cursor hover effect */}
      <label 
        htmlFor="contact-submit-btn"
        className={`mt-2 bg-transparent hover:bg-[#00ff33] text-[#00ff33] hover:text-black border border-[#00ff33] font-mono text-xs tracking-[0.2em] uppercase py-4 transition-all duration-300 w-full select-none cursor-none text-center flex items-center justify-center ${
          status === 'loading' || status === 'success' ? 'opacity-50 pointer-events-none' : ''
        }`}
      >
        {status === 'idle' && 'Send Transmission'}
        {status === 'loading' && 'Transmitting...'}
        {status === 'success' && 'Transmission Received'}
        {status === 'error' && 'Error - Try Again'}
      </label>
    </form>
  );
}