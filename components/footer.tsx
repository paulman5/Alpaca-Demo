"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUp } from "lucide-react";
import Image from "next/image";
interface LinkItem {
  href: string;
  label: string;
}

interface FooterProps {
  leftLinks: LinkItem[];
  rightLinks: LinkItem[];
  copyrightText: string;
  barCount?: number;
}

export const Footer: React.FC<FooterProps> = ({
  leftLinks,
  rightLinks,
  copyrightText,
}) => {
  const waveRefs = useRef<(HTMLDivElement | null)[]>([]);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.2 },
    );

    const currentFooterRef = footerRef.current;
    if (currentFooterRef) {
      observer.observe(currentFooterRef);
    }

    return () => {
      if (currentFooterRef) {
        observer.unobserve(currentFooterRef);
      }
    };
  }, []);

  useEffect(() => {
    let t = 0;

    const animateWave = () => {
      const waveElements = waveRefs.current;
      let offset = 0;

      waveElements.forEach((element, index) => {
        if (element) {
          offset += Math.max(0, 20 * Math.sin((t + index) * 0.3));
          element.style.transform = `translateY(${index + offset}px)`;
        }
      });

      t += 0.1;
      animationFrameRef.current = requestAnimationFrame(animateWave);
    };

    if (isVisible) {
      animateWave();
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isVisible]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      ref={footerRef}
      className="bg-gray-50 text-gray-900 relative flex flex-col w-full h-full justify-between select-none"
    >
      <div className="container mx-auto flex flex-col lg:flex-row justify-between w-full gap-12 py-12 px-6 lg:px-16 max-w-7xl">
        {/* Left side - Logo and copyright */}
        <div className="space-y-6 lg:max-w-xs">
          <div className="flex items-center mb-4">
            <Image
              src="/Spout_complete.png"
              alt="Spout Finance logo"
              width={150}
              height={40}
              className="h-10 w-auto"
            />
          </div>
          <p className="text-sm text-gray-600">
            {copyrightText}
          </p>
        </div>

        {/* Right side - Links grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-16">
          {/* Platform Column */}
          <div>
            <h4 className="font-semibold text-gray-400 mb-4 text-sm uppercase tracking-wider">
              PLATFORM
            </h4>
            <ul className="space-y-3">
              {leftLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-900 hover:text-[#004040] transition-colors duration-200 text-base"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="font-semibold text-gray-400 mb-4 text-sm uppercase tracking-wider">
              COMPANY
            </h4>
            <ul className="space-y-3">
              {rightLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-900 hover:text-[#004040] transition-colors duration-200 text-base"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Column */}
          <div>
            <h4 className="font-semibold text-gray-400 mb-4 text-sm uppercase tracking-wider">
              SOCIAL
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://www.linkedin.com/company/spoutfinance/posts/?feedView=all"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-900 hover:text-[#004040] transition-colors duration-200 text-base"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href="https://t.me/+BCqhsA4Nmv0wZDU5"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-900 hover:text-[#004040] transition-colors duration-200 text-base"
                >
                  Telegram
                </a>
              </li>
              <li>
                <a
                  href="https://x.com/0xspout"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-900 hover:text-[#004040] transition-colors duration-200 text-base"
                >
                  X
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Disclaimer Section */}
      <div className="border-t border-gray-300">
        <div className="container mx-auto px-6 lg:px-16 py-8 max-w-7xl">
          <h5 className="font-semibold text-gray-900 mb-3 text-base">
            Disclaimer
          </h5>
          <p className="text-sm text-gray-600 leading-relaxed">
            All provided information has been carefully researched and checked. In spite of taking due care, Spout does not accept any warranty for the information being correct, complete, and up to date.
          </p>
        </div>
      </div>
    </footer>
  );
};

// Default footer component with Spout Finance links
const DefaultFooter = () => {
  const leftLinks = [
    { href: "/app/trade", label: "Trading" },
  ];

  const rightLinks = [
    { href: "/company", label: "About Us" },
    {
      href: "https://drive.google.com/file/d/1fklbqmZhgxzIzXN0aEjsf2NFat2QdpFp/view",
      label: "Whitepaper",
    },
  ];

  return (
    <Footer
      leftLinks={leftLinks}
      rightLinks={rightLinks}
      copyrightText={`© ${new Date().getFullYear()} Spout Finance. All rights reserved.`}
      barCount={25}
    />
  );
};

export default DefaultFooter;
