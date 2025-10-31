import Home1Component from '../imports/1Home';
import svgPaths from '../imports/svg-jzw6dc5b6o';

interface HomeProps {
  onStart: () => void;
}

export function Home({ onStart }: HomeProps) {
  return (
    <div className="relative w-full h-full cursor-pointer" onClick={onStart}>
      <Home1Component />
      
      {/* Hide the static curtain from the imported component */}
      <div className="absolute h-[269px] left-[222px] top-[141px] w-[180px] bg-[#202020] z-[4]" />
      
      {/* Hide only the curtain-length vertical line (269px height at the curtain position) */}
      <div className="absolute left-[221px] top-[141px] w-[3px] h-[269px] bg-[#202020] z-[4]" />
      
      {/* Animated curtain overlay */}
      <div className="absolute h-[269px] left-[222px] top-[141px] w-[180px] animate-curtain pointer-events-none z-[5]">
        <div className="absolute inset-[-0.37%_-0.56%_-0.51%_-0.56%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 182 272">
            <path d={svgPaths.p26a53180} id="Vector 19" stroke="#FF9D47" strokeWidth="2" />
          </svg>
        </div>
      </div>
      
      {/* Blinking light overlay - red to green */}
      <div className="absolute left-[55px] size-[8px] top-[384px] animate-blink-color">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <circle cx="4" cy="4" fill="currentColor" r="4" />
        </svg>
      </div>

      <style jsx>{`
        @keyframes blinkColor {
          0%, 100% { color: #ef4444; }
          50% { color: #22c55e; }
        }
        @keyframes curtainMove {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(15px); }
        }
        .animate-blink-color {
          animation: blinkColor 1s infinite;
        }
        .animate-curtain {
          animation: curtainMove 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}