"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useScreenSize } from "@/hooks/use-screen-size";
import { JoinMailingList } from "./join-mailing-list";
import { PartnerTicker } from "./partner-ticker";
import Image from "next/image";
import { DiagonalPattern } from "@/components/slant-dashes-svg";

export function HeroSection() {
  const screenSize = useScreenSize();

  return (
    <section className="w-full flex flex-col relative min-h-screen overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:35px_35px]"></div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-[1800px] mx-auto px-16 pt-20 pb-0 flex flex-col lg:flex-row items-start justify-between gap-0">
        {/* Left column - Text content */}
        <div className="w-full lg:w-[55%] mb-12 lg:mb-0">
          <div className="max-w-5xl">
            {/* Main heading */}
            <h1 className="text-4xl lg:text-6xl font-lora font-normal text-[#004040] mb-8 leading-tight">
              The platform for what's next in<br />
              decentralized investing
            </h1>
            
            {/* Description */}
            <p className="text-xl lg:text-2xl font-noto-sans text-[#334155] mb-12 leading-relaxed">
              Spout makes U.S. investment-grade assets like bonds and equities available
              as secure, yield-bearing tokens, fully backed 1:1 by real ETFs.
            </p>
            
            {/* CTA Button */}
            <div className="mb-8">
              <Link href="/app">
                <Button
                  size="lg"
                  className="bg-[#004040] hover:bg-[#003030] data-[hovered]:bg-[#003030] text-white px-10 py-5 text-xl font-semibold rounded-none shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Launch Platform
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
            </div>
            
            {/* Secondary text */}
            <p className="text-base font-noto-sans text-[#6b7280] uppercase tracking-wide mb-8">
              [JOIN THE PLATFORM THAT'S MAKING TRADITIONAL CAPITAL MORE EFFICIENT]
            </p>
            
            {/* Mailing List */}
            <div className="max-w-md">
              <JoinMailingList />
            </div>
          </div>
        </div>

        {/* Right column - SVG graphic */}
        <div className="w-full lg:w-[45%] flex items-start justify-center lg:justify-end -mt-8">
          <div className="w-full max-w-md lg:max-w-xl">
            <Image
              src="/landingpage/spout-water-tokens.svg"
              alt="Spout Water Tokens"
              width={550}
              height={550}
              className="w-full"
              priority
            />
          </div>
        </div>
      </div>

      {/* Compatible Networks Section */}
      <div className="relative z-10 w-full max-w-[1800px] mx-auto px-16 mb-6">
        <PartnerTicker />
      </div>

      {/* Slant Dashes */}
      <div className="relative z-10 w-full mt-10">
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
