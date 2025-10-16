"use client";

import Image from "next/image";
import Link from "next/link";
import { DiagonalPattern } from "@/components/slant-dashes-svg";

export function InTheNews() {
  const newsItems = [
    {
      logo: "/landingpage/spout-ap.webp",
      publication: "AP News",
      date: "JAN 15, 2025",
      url: "https://apnews.com/press-release/globenewswire-mobile/onepiece-labs-solana-accelerator-officially-launches-f2e8e0a2478df30533933fdfe8f07a5e",
    },
    {
      logo: "/landingpage/spout-business-insder.svg",
      publication: "Business Insider",
      date: "JAN 15, 2025",
      url: "https://markets.businessinsider.com/news/stocks/onepiece-labs-solana-accelerator-officially-launches-1035128439",
    },
    {
      logo: "/landingpage/marketwatch-spout.webp",
      publication: "MarketWatch",
      date: "JAN 15, 2025",
      url: "https://www.marketwatch.com/press-release/onepiece-labs-solana-accelerator-officially-launches-7b06ee13?mod=search_headline",
    },
  ];

  return (
    <section className="w-full bg-gray-50 py-20 relative">
      {/* Section content */}
      <div className="w-full max-w-[1800px] mx-auto px-4 md:px-8 lg:px-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-lora font-normal text-[#004040] mb-6">
            In the <span className="font-bold">News</span>
          </h2>
          <p className="text-lg font-noto-sans font-normal text-[#475569] max-w-3xl mx-auto leading-relaxed">
            Financial media outlets are highlighting our approach to secure, regulated<br />
            investing with real returns
          </p>
        </div>

        {/* News Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
          {newsItems.map((item, index) => (
            <div key={index} className="relative bg-white border border-gray-300 rounded-lg">
              {/* Top-left diamond */}
              <div className="absolute -left-4 -top-4 z-20">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-blue-400">
                  <path d="M12 2L22 12L12 22L2 12L12 2Z" stroke="currentColor" strokeWidth="3" fill="white"/>
                </svg>
              </div>

              {/* Top-right diamond */}
              <div className="absolute -right-4 -top-4 z-20">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-blue-400">
                  <path d="M12 2L22 12L12 22L2 12L12 2Z" stroke="currentColor" strokeWidth="3" fill="white"/>
                </svg>
              </div>

              {/* Bottom-left diamond */}
              <div className="absolute -left-4 -bottom-4 z-20">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-blue-400">
                  <path d="M12 2L22 12L12 22L2 12L12 2Z" stroke="currentColor" strokeWidth="3" fill="white"/>
                </svg>
              </div>

              {/* Bottom-right diamond */}
              <div className="absolute -right-4 -bottom-4 z-20">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-blue-400">
                  <path d="M12 2L22 12L12 22L2 12L12 2Z" stroke="currentColor" strokeWidth="3" fill="white"/>
                </svg>
              </div>

              {/* Card Content with rounded corners */}
              <div className="overflow-hidden rounded-lg">
                {/* Logo Area */}
                <div className="h-48 flex items-center justify-center p-8 bg-white">
                  <Image
                    src={item.logo}
                    alt={item.publication}
                    width={300}
                    height={120}
                    className="w-full h-auto max-h-32 object-contain"
                  />
                </div>

                {/* Publication Info */}
                <div className="p-4 md:p-6 border-t border-gray-300 flex items-center gap-2 md:gap-4">
                <Link
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 md:px-4 bg-blue-50 border border-blue-200 rounded text-[#004040] font-noto-sans text-sm md:text-base font-medium hover:bg-blue-100 transition-colors flex-shrink-0"
                >
                  <Image
                    src="/landingpage/spout-book.svg"
                    alt="Article"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                  {item.publication}
                </Link>
                <span className="text-xs md:text-sm font-noto-sans text-[#475569] ml-auto whitespace-nowrap">
                  {item.date}
                </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Diagonal blue lines at bottom */}
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

