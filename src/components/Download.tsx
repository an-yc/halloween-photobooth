import { useState, useEffect } from 'react';
import Download6Component from '../imports/6Download';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface DownloadProps {
  photoStripUrl: string;
  onHome?: () => void;
}

export function Download({ photoStripUrl, onHome }: DownloadProps) {
  const [counter, setCounter] = useState<number>(0);
  const [hasIncremented, setHasIncremented] = useState(false);

  useEffect(() => {
    // Fetch and increment counter
    const initCounter = async () => {
      try {
        // Increment counter
        const incrementResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-47e2c83e/counter/increment`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (incrementResponse.ok) {
          const data = await incrementResponse.json();
          setCounter(data.count);
          setHasIncremented(true);
        } else {
          console.error('Failed to increment counter');
          // Fallback: just fetch current counter
          fetchCounter();
        }
      } catch (error) {
        console.error('Error with counter:', error);
        fetchCounter();
      }
    };

    const fetchCounter = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-47e2c83e/counter`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          setCounter(data.count);
        }
      } catch (error) {
        console.error('Error fetching counter:', error);
      }
    };

    initCounter();
  }, []);

  const handleDownload = () => {
    if (!photoStripUrl) return;

    const link = document.createElement('a');
    link.href = photoStripUrl;
    link.download = 'halloween-photobooth-2025.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleHome = () => {
    if (onHome) {
      onHome();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="relative w-full h-full">
      <Download6Component />
      
      {/* Hide the sample photo from the imported component */}
      <div className="absolute left-[17px] top-[169px] w-[167px] h-[473px] bg-[#202020] z-[5]" />
      
      {/* Overlay the actual photo strip preview - positioned where the sample was */}
      <div className="absolute left-[17px] top-[169px] w-[167px] h-[473px] overflow-hidden bg-white shadow-lg z-10">
        {photoStripUrl && (
          <img 
            src={photoStripUrl} 
            alt="Photo strip preview" 
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Download button - positioned to match the design */}
      <div 
        className="absolute left-[209px] top-[311px] w-[174px] h-[58px] cursor-pointer z-10"
        onClick={handleDownload}
      />

      {/* Home button - positioned to match the design */}
      <div 
        className="absolute left-[209px] top-[502px] w-[174px] h-[58px] cursor-pointer z-10"
        onClick={handleHome}
      />

      {/* Hide the legacy counter text from imported component */}
      <div className="absolute left-[158px] top-[628px] w-[229px] h-[35px] bg-[#202020] z-[9]" />
      
      {/* Counter display - replace the text in the design */}
      <div className="absolute left-[387px] top-[628px] translate-x-[-100%] w-[229px] text-right z-10">
        <p className="font-['Italianno:Regular',sans-serif] leading-[20px] text-[20px] text-white mb-0">
          cuttlefish captured counter: {counter}
        </p>
        <p className="font-['Italianno:Regular',sans-serif] leading-[20px] text-[20px] text-white">
          <a 
            href="https://www.instagram.com/chungchingkuk/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:underline"
          >
            @chungchingkuk
          </a>
        </p>
      </div>
    </div>
  );
}