"use client";

import Image from "next/image";
import { DiagonalPattern } from "@/components/slant-dashes-svg";

export function ProofOfReserveLanding() {
  return (
    <section className="w-full bg-gray-50 py-20 relative">
      {/* Section content */}
      <div className="w-full max-w-[1800px] mx-auto px-16">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-lora font-normal text-[#004040] mb-6">
            <span className="font-bold">Proof</span> of Reserve
          </h2>
          <p className="text-lg font-noto-sans font-normal text-[#475569] max-w-3xl mx-auto leading-relaxed">
            Every token is fully backed 1:1 by investment-grade bond ETFs, held by
            qualified U.S. custodians for maximum security.
          </p>
        </div>

        {/* Vault Image with Company Logos */}
        <div className="flex justify-center items-center mb-20">
          <Image
            src="/landingpage/spout-reserve.svg"
            alt="Proof of Reserve Vault"
            width={900}
            height={600}
            className="w-full max-w-5xl h-auto"
          />
        </div>

        {/* Statistics Section */}
        <div className="relative bg-white border border-gray-300 rounded-lg shadow-sm px-8 py-6">
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

          {/* Bottom-left lock and diamond */}
          <div className="hidden lg:block absolute left-0 bottom-0 z-20">
            <Image
              src="/landingpage/spout-lock.svg"
              alt="Lock"
              width={56}
              height={56}
              className="w-14 h-14"
            />
          </div>
          <div className="hidden lg:block absolute -left-4 -bottom-4 z-30">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-blue-400">
              <path d="M12 2L22 12L12 22L2 12L12 2Z" stroke="currentColor" strokeWidth="3" fill="white"/>
            </svg>
          </div>

          {/* Bottom-right coins and diamond */}
          <div className="hidden lg:block absolute right-0 bottom-0 z-20">
            <Image
              src="/landingpage/spout-coins.svg"
              alt="Coins"
              width={56}
              height={56}
              className="w-14 h-14"
            />
          </div>
          <div className="hidden lg:block absolute -right-4 -bottom-4 z-30">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-blue-400">
              <path d="M12 2L22 12L12 22L2 12L12 2Z" stroke="currentColor" strokeWidth="3" fill="white"/>
            </svg>
          </div>

          <div className="flex items-center justify-center gap-6">
            {/* Assets On-Chain */}
            <div className="flex-1 flex items-center gap-3 border border-gray-200 rounded-lg px-6 py-4">
              <div className="flex items-center justify-center w-10 h-10">
                <Image
                  src="/landingpage/spout-bank.svg"
                  alt="Bank"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
              </div>
              <div>
                <div className="text-xl font-bold text-[#004040]">$200k</div>
                <div className="text-xs text-[#475569]">Assets On-Chain</div>
              </div>
            </div>

            {/* Investments Tokenized */}
            <div className="flex-1 flex items-center gap-3 border border-gray-200 rounded-lg px-6 py-4">
              <div className="flex items-center justify-center w-10 h-10">
                <Image
                  src="/landingpage/spout-category.svg"
                  alt="Category"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
              </div>
              <div>
                <div className="text-xl font-bold text-[#004040]">1,124</div>
                <div className="text-xs text-[#475569]">Investments Tokenized</div>
              </div>
            </div>

            {/* Proof-of-Reserve Verified */}
            <div className="flex-1 flex items-center gap-3 border border-gray-200 rounded-lg px-6 py-4">
              <div className="flex items-center justify-center w-10 h-10">
                <Image
                  src="/landingpage/spout-shield-tick.svg"
                  alt="Shield"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
              </div>
              <div>
                <div className="text-xl font-bold text-[#004040]">100%</div>
                <div className="text-xs text-[#475569]">Proof-of-Reserve Verified</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Diagonal blue lines at bottom */}
      <div className="relative z-10 w-full mt-20">
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

