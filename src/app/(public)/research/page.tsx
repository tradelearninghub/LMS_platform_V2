import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: "Market Research",
  description: "Market Research is coming soon.",
};

export default function ResearchPage() {
  return (
    <div className="min-h-[80vh] bg-background pt-32 pb-24 px-6 relative overflow-hidden flex items-center justify-center">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-3xl mx-auto text-center relative z-10 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium tracking-wide uppercase bg-accent/10 text-accent border border-accent/20 rounded-full mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          Innovation Lab
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1] mb-8">
          Market <span className="text-accent">Research</span>
          <br />is coming soon.
        </h1>
        
        <p className="text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto mb-12">
          We are launching the research tab where you will get quick and real-time updates and knowledge about the market. Stay ahead with insights!
        </p>
        
        <Link 
          href="/" 
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
