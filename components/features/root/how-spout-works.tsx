"use client";

import Image from "next/image";

const steps = [
  {
    number: "STEP 1",
    title: "Complete KYC",
    description:
      'Connect your wallet and complete KYC verification to access investment-grade assets. KYC ensures that we are completely compliant with every jurisdiction"',
    image: "/landingpage/spout-kyc.svg",
    imageAlt: "KYC Verification",
  },
  {
    number: "STEP 2",
    title: "Access Public Equities",
    description:
      "Connect your wallet and complete KYC verification to access investment-grade assets. Assets include highly trading equities, including Tesla, Microsoft, Coinbase, etc.",
    image: "/landingpage/spout-equities.svg",
    imageAlt: "Public Equities",
  },
  {
    number: "STEP 3",
    title: "Earn Stable Yields",
    description:
      "Receive consistent returns from underlying bond interest payments. Dividends are automatically reinvested into the respective assets.",
    image: "/landingpage/spout-money.svg",
    imageAlt: "Stable Yields",
  },
  {
    number: "STEP 4",
    title: "Utilize in DeFi with our Stablecoin",
    description:
      "Use your tokenized assets in DeFi protocols for lending, borrowing, and yield farming. Use your assets as collateral to mint our ERC20 stablecoin that can be used seamlessly across DeFi.",
    image: "/landingpage/spout-defi.svg",
    imageAlt: "DeFi Integration",
  },
  {
    number: "STEP 5",
    title: "Track Performance",
    description:
      "Monitor your portfolio with real-time analytics and transparent reporting. Trade assets with a UI similar to your traditional brokerage.",
    image: "/landingpage/spout-performance.svg",
    imageAlt: "Performance Tracking",
  },
];

export function HowSpoutWorks() {
  return (
    <section className="w-full bg-gray-50 py-20">
      <div className="w-full max-w-6xl mx-auto px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-lora font-normal text-[#004040] mb-6">
            How Spout works
          </h2>
          <p className="text-lg lg:text-xl font-noto-sans text-[#334155] max-w-4xl mx-auto">
            Spout bridges the gap between traditional finance and DeFi by tokenizing investment-grade corporate
            bonds, providing stable yields while maintaining the benefits of blockchain technology.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="relative space-y-0">
          {/* Decorative diamonds at corners of entire section */}
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

          {steps.map((step, index) => (
            <div
              key={index}
              className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch border border-gray-300 rounded-lg overflow-hidden mb-6 last:mb-0"
            >
              {/* Content - alternates left/right */}
              <div className={`flex items-center border-gray-300 py-6 px-6 ${index % 2 === 0 ? "lg:order-1 lg:border-r" : "lg:order-2 lg:border-l"}`}>
                <div>
                  <div className="inline-block bg-blue-100 text-[#004040] px-3 py-1.5 rounded text-sm font-semibold mb-3">
                    {step.number}
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-lora font-normal text-[#004040] mb-3">
                    {step.title}
                  </h3>
                  <p className="text-base lg:text-lg font-noto-sans font-normal text-[#475569] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Image - alternates right/left */}
              <div className={`flex justify-center items-center relative bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:35px_35px] px-6 py-6 ${index % 2 === 0 ? "lg:order-2" : "lg:order-1"}`}>
                {/* Gradient fade overlay - fades from bottom (visible) to top (hidden) */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent from-0% via-transparent via-75% to-gray-50 to-100% pointer-events-none"></div>
                <div className="w-full max-w-[250px] h-[250px] relative z-10 flex items-center justify-center">
                  <Image
                    src={step.image}
                    alt={step.imageAlt}
                    width={250}
                    height={250}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Diagonal blue lines at bottom */}
      <div className="relative z-10 w-full mt-40">
        <svg
          width="100%"
          height="40"
          viewBox="0 0 1440 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <pattern
            id="diagonalLinesHowWorks"
            x="0"
            y="0"
            width="20"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="0"
              y1="0"
              x2="20"
              y2="40"
              stroke="#A7C6ED"
              strokeWidth="2"
            />
          </pattern>
          <rect width="100%" height="40" fill="url(#diagonalLinesHowWorks)" />
        </svg>
      </div>
    </section>
  );
}

