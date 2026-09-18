import React from 'react';

interface WLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showSlogan?: boolean;
  customLogoUrl?: string;
  customTitle?: string;
  customSubtitle?: string;
  className?: string;
}

export const WLogo: React.FC<WLogoProps> = ({
  size = 'md',
  showText = true,
  showSlogan = false,
  customLogoUrl,
  customTitle,
  customSubtitle,
  className = '',
}) => {
  // Check localStorage if custom logo was uploaded via Central
  const storedLogo = typeof window !== 'undefined' ? localStorage.getItem('wdriver_custom_logo') : null;
  const activeLogoUrl = customLogoUrl || storedLogo;

  const iconDimensions = {
    sm: { w: 32, h: 32, fontTitle: 'text-sm', fontSubtitle: 'text-[9px]', sloganSize: 'text-[8px]' },
    md: { w: 42, h: 42, fontTitle: 'text-base', fontSubtitle: 'text-[10px]', sloganSize: 'text-[9px]' },
    lg: { w: 56, h: 56, fontTitle: 'text-xl', fontSubtitle: 'text-xs', sloganSize: 'text-[10px]' },
    xl: { w: 84, h: 84, fontTitle: 'text-3xl', fontSubtitle: 'text-sm', sloganSize: 'text-xs' },
  }[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icon or Custom Uploaded Logo */}
      <div
        className="relative shrink-0 flex items-center justify-center rounded-xl p-[2px]"
        style={{
          width: iconDimensions.w,
          height: iconDimensions.h,
          background: 'linear-gradient(135deg, #e4e4e7 0%, #3f3f46 45%, #a1a1aa 75%, #18181b 100%)',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.6), 0 0 16px rgba(131, 214, 0, 0.22)',
        }}
      >
        <div className="w-full h-full rounded-[10px] bg-[#0d0f14] flex items-center justify-center overflow-hidden relative">
          {activeLogoUrl ? (
            <img
              src={activeLogoUrl}
              alt="W-DRIVER Logo"
              className="w-full h-full object-contain p-1"
              referrerPolicy="no-referrer"
            />
          ) : (
            <>
              {/* Subtle brushed metal background pattern */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#83d600_1px,transparent_1px)] [background-size:6px_6px]" />
              {/* Stylized W with green pear highway */}
              <svg viewBox="0 0 100 100" className="w-[84%] h-[84%] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                <defs>
                  <linearGradient id="wGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#9de61a" />
                    <stop offset="50%" stopColor="#83d600" />
                    <stop offset="100%" stopColor="#5ea000" />
                  </linearGradient>
                </defs>
                {/* Background W shape with organic rounded road stems */}
                <path
                  d="M18 22 C19 36, 28 62, 38 78 C41 82, 47 80, 50 74 C58 58, 66 38, 74 22 C79 22, 85 24, 85 28 C80 46, 68 74, 58 90 C53 96, 44 96, 39 88 C28 72, 17 48, 10 28 C9 24, 13 22, 18 22 Z"
                  fill="url(#wGreenGrad)"
                />
                {/* Right upward wing */}
                <path
                  d="M48 48 C55 36, 68 24, 82 22 C84 22, 86 26, 84 30 C76 44, 66 65, 58 78 C54 70, 50 58, 48 48 Z"
                  fill="url(#wGreenGrad)"
                />
                {/* Smooth curving highway lane with white dashed lines */}
                <path
                  d="M26 30 C34 52, 45 74, 52 82 C60 62, 70 42, 80 26"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="4"
                  strokeDasharray="6 4"
                  strokeLinecap="round"
                  className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                />
              </svg>
            </>
          )}
        </div>
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <div className={`font-black tracking-wider flex items-center gap-1 ${iconDimensions.fontTitle}`}>
            <span style={{ color: 'var(--verde-pera, #83d600)' }}>W-</span>
            <span className="text-white">DRIVER</span>
            <span className="text-[10px] text-[#83d600] font-mono font-bold ml-1 px-1 py-0.2 bg-[#83d600]/10 border border-[#83d600]/30 rounded">
              PB
            </span>
          </div>
          <span className={`text-[#94a3b8] font-medium tracking-tight ${iconDimensions.fontSubtitle}`}>
            {customSubtitle || 'AMÉRICA LATINA BRASIL JOÃO PESSOA-PB'}
          </span>
          {showSlogan && (
            <span className={`text-[#83d600] font-bold italic mt-0.5 tracking-tight ${iconDimensions.sloganSize}`}>
              “Quem escolhe preço corre riscos. Quem escolhe a W-DRIVER escolhe chegar bem!”
            </span>
          )}
        </div>
      )}
    </div>
  );
};
