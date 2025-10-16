"use client";

import Image from "next/image";
import Link from "next/link";
import { DiagonalPattern } from "@/components/slant-dashes-svg";

export function CTASection() {
  return (
    <section className="w-full bg-gray-50 py-20 relative">
      {/* Section content */}
      <div className="w-full max-w-[1800px] mx-auto px-16">
        <div className="relative bg-white border border-gray-300 rounded-lg shadow-sm p-12">
          {/* Top-left diamond */}
          <div className="hidden lg:block absolute -left-4 -top-4 z-20">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-blue-400">
              <path d="M12 2L22 12L12 22L2 12L12 2Z" stroke="currentColor" strokeWidth="3" fill="white"/>
            </svg>
          </div>

          {/* Top-right diamond */}
          <div className="hidden lg:block absolute -right-4 -top-4 z-20">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-blue-400">
              <path d="M12 2L22 12L12 22L2 12L12 2Z" stroke="currentColor" strokeWidth="3" fill="white"/>
            </svg>
          </div>

          {/* Bottom-left diamond */}
          <div className="hidden lg:block absolute -left-4 -bottom-4 z-20">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-blue-400">
              <path d="M12 2L22 12L12 22L2 12L12 2Z" stroke="currentColor" strokeWidth="3" fill="white"/>
            </svg>
          </div>

          {/* Bottom-right diamond */}
          <div className="hidden lg:block absolute -right-4 -bottom-4 z-20">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-blue-400">
              <path d="M12 2L22 12L12 22L2 12L12 2Z" stroke="currentColor" strokeWidth="3" fill="white"/>
            </svg>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <h2 className="text-4xl lg:text-5xl font-lora font-normal text-[#004040] mb-6">
                Ready to Start Earning Stable Yields?
              </h2>
              <p className="text-lg font-noto-sans text-[#475569] mb-8 leading-relaxed">
                Join thousands of users who are already earning consistent returns from investment-grade corporate bonds on the blockchain.
              </p>
              <div className="flex gap-4">
                <Link href="/app">
                  <button className="px-8 py-3 bg-[#004040] text-white font-noto-sans font-medium rounded-lg hover:bg-[#003030] transition-colors">
                    Get Started
                  </button>
                </Link>
                <Link href="/company">
                  <button className="px-8 py-3 bg-white border border-gray-300 text-[#004040] font-noto-sans font-medium rounded-lg hover:bg-gray-50 transition-colors">
                    Contact Sales
                  </button>
                </Link>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <Image
                src="/landingpage/spout-wallstreet.png"
                alt="Stock Exchange Building"
                width={600}
                height={400}
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Diagonal blue lines at bottom */}
      <div className="absolute bottom-0 w-full z-10">
        <DiagonalPattern 
          width="100%" 
          height={34} 
          color="#A7C6ED" 
          strokeWidth={2} 
          spacing={14} 
        />
      </div>
    </section>
  );
}

