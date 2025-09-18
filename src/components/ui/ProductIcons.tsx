export const ShampooIcon = ({ className = "w-6 h-6" }) => (
  <svg 
    className={className}
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="shampooGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#9333ea" />
        <stop offset="100%" stopColor="#c084fc" />
      </linearGradient>
    </defs>
    
    {/* Bottle body */}
    <path 
      d="M25 30 L25 80 Q25 85 30 85 L70 85 Q75 85 75 80 L75 30 Z" 
      fill="url(#shampooGradient)" 
      opacity="0.9"
    />
    
    {/* Bottle neck */}
    <rect x="35" y="15" width="30" height="15" rx="2" fill="url(#shampooGradient)" />
    
    {/* Pump dispenser */}
    <rect x="40" y="10" width="20" height="8" rx="4" fill="#7c3aed" />
    <rect x="47" y="5" width="6" height="8" rx="1" fill="#6d28d9" />
    
    {/* Liquid level */}
    <path 
      d="M30 35 L30 75 Q30 78 33 78 L67 78 Q70 78 70 75 L70 35 Z" 
      fill="#a855f7" 
      opacity="0.6"
    />
    
    {/* Bubbles */}
    <circle cx="40" cy="45" r="2" fill="#ffffff" opacity="0.7" />
    <circle cx="55" cy="55" r="1.5" fill="#ffffff" opacity="0.7" />
    <circle cx="45" cy="65" r="1" fill="#ffffff" opacity="0.7" />
    
    {/* Label */}
    <rect x="30" y="45" width="40" height="15" rx="2" fill="#ffffff" opacity="0.9" />
    <rect x="32" y="47" width="36" height="2" rx="1" fill="#7c3aed" />
    <rect x="32" y="51" width="25" height="1.5" rx="0.5" fill="#a855f7" />
    <rect x="32" y="54" width="30" height="1.5" rx="0.5" fill="#a855f7" />
  </svg>
);

export const ConditionerIcon = ({ className = "w-6 h-6" }) => (
  <svg 
    className={className}
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="conditionerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c084fc" />
        <stop offset="100%" stopColor="#e9d5ff" />
      </linearGradient>
    </defs>
    
    {/* Tube body */}
    <ellipse cx="50" cy="60" rx="22" ry="35" fill="url(#conditionerGradient)" />
    
    {/* Cap */}
    <ellipse cx="50" cy="25" rx="15" ry="8" fill="#7c3aed" />
    <ellipse cx="50" cy="22" rx="12" ry="6" fill="#6d28d9" />
    
    {/* Tube crimp */}
    <path d="M28 85 Q50 90 72 85" stroke="#9333ea" strokeWidth="2" fill="none" />
    <path d="M30 88 Q50 93 70 88" stroke="#9333ea" strokeWidth="1.5" fill="none" />
    
    {/* Product inside */}
    <ellipse cx="50" cy="60" rx="18" ry="30" fill="#d8b4fe" opacity="0.7" />
    
    {/* Label */}
    <rect x="35" y="45" width="30" height="20" rx="3" fill="#ffffff" opacity="0.95" />
    <rect x="37" y="48" width="26" height="2" rx="1" fill="#9333ea" />
    <rect x="37" y="52" width="18" height="1.5" rx="0.5" fill="#c084fc" />
    <rect x="37" y="55" width="22" height="1.5" rx="0.5" fill="#c084fc" />
    <rect x="37" y="58" width="15" height="1.5" rx="0.5" fill="#c084fc" />
    
    {/* Shine effect */}
    <ellipse cx="42" cy="45" rx="3" ry="8" fill="#ffffff" opacity="0.4" />
  </svg>
);

export const MaskIcon = ({ className = "w-6 h-6" }) => (
  <svg 
    className={className}
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="maskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7c3aed" />
        <stop offset="50%" stopColor="#9333ea" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
    </defs>
    
    {/* Jar body */}
    <path 
      d="M20 35 L20 75 Q20 82 27 82 L73 82 Q80 82 80 75 L80 35 Z" 
      fill="url(#maskGradient)" 
    />
    
    {/* Jar rim */}
    <ellipse cx="50" cy="35" rx="30" ry="5" fill="#6d28d9" />
    
    {/* Lid */}
    <ellipse cx="50" cy="30" rx="32" ry="6" fill="#5b21b6" />
    <ellipse cx="50" cy="27" rx="28" ry="5" fill="#4c1d95" />
    
    {/* Lid handle */}
    <circle cx="50" cy="27" r="4" fill="#2e1065" />
    <circle cx="50" cy="27" r="2" fill="#1e1b4b" />
    
    {/* Product inside */}
    <path 
      d="M25 40 L25 70 Q25 75 30 75 L70 75 Q75 75 75 70 L75 40 Z" 
      fill="#c084fc" 
      opacity="0.8"
    />
    
    {/* Texture in product */}
    <circle cx="35" cy="50" r="1.5" fill="#e9d5ff" opacity="0.6" />
    <circle cx="45" cy="45" r="1" fill="#e9d5ff" opacity="0.6" />
    <circle cx="55" cy="55" r="1.2" fill="#e9d5ff" opacity="0.6" />
    <circle cx="65" cy="48" r="0.8" fill="#e9d5ff" opacity="0.6" />
    <circle cx="40" cy="60" r="1" fill="#e9d5ff" opacity="0.6" />
    <circle cx="60" cy="62" r="1.3" fill="#e9d5ff" opacity="0.6" />
    
    {/* Label */}
    <rect x="30" y="55" width="40" height="12" rx="2" fill="#ffffff" opacity="0.95" />
    <rect x="32" y="57" width="36" height="2" rx="1" fill="#7c3aed" />
    <rect x="32" y="61" width="25" height="1.2" rx="0.5" fill="#9333ea" />
    <rect x="32" y="64" width="30" height="1.2" rx="0.5" fill="#9333ea" />
    
    {/* Reflection */}
    <ellipse cx="40" cy="45" rx="4" ry="12" fill="#ffffff" opacity="0.3" />
  </svg>
);

export const SerumIcon = ({ className = "w-6 h-6" }) => (
  <svg 
    className={className}
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="serumGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#a855f7" />
        <stop offset="100%" stopColor="#d8b4fe" />
      </linearGradient>
      <linearGradient id="serumLiquid" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#e9d5ff" />
        <stop offset="100%" stopColor="#f3e8ff" />
      </linearGradient>
    </defs>
    
    {/* Bottle body - elegant shape */}
    <path 
      d="M30 25 L30 70 Q30 75 35 75 L65 75 Q70 75 70 70 L70 25 Q70 20 65 20 L35 20 Q30 20 30 25 Z" 
      fill="url(#serumGradient)" 
      opacity="0.9"
    />
    
    {/* Dropper neck */}
    <rect x="42" y="15" width="16" height="8" rx="2" fill="#7c3aed" />
    
    {/* Dropper cap */}
    <ellipse cx="50" cy="15" rx="8" ry="3" fill="#6d28d9" />
    <ellipse cx="50" cy="12" rx="6" ry="2.5" fill="#5b21b6" />
    
    {/* Dropper tube */}
    <rect x="49" y="15" width="2" height="25" rx="1" fill="#4c1d95" opacity="0.8" />
    
    {/* Liquid inside */}
    <path 
      d="M35 30 L35 65 Q35 68 38 68 L62 68 Q65 68 65 65 L65 30 Z" 
      fill="url(#serumLiquid)" 
      opacity="0.7"
    />
    
    {/* Serum drops effect */}
    <circle cx="50" cy="8" r="1.5" fill="#e9d5ff" opacity="0.8" />
    <circle cx="52" cy="5" r="1" fill="#e9d5ff" opacity="0.6" />
    
    {/* Elegant label */}
    <rect x="35" y="40" width="30" height="20" rx="3" fill="#ffffff" opacity="0.95" />
    <rect x="37" y="43" width="26" height="1.5" rx="0.5" fill="#9333ea" />
    <rect x="37" y="47" width="20" height="1" rx="0.5" fill="#c084fc" />
    <rect x="37" y="50" width="24" height="1" rx="0.5" fill="#c084fc" />
    <rect x="37" y="53" width="18" height="1" rx="0.5" fill="#c084fc" />
    <rect x="37" y="56" width="22" height="1" rx="0.5" fill="#c084fc" />
    
    {/* Luxury shine */}
    <ellipse cx="42" cy="35" rx="2" ry="10" fill="#ffffff" opacity="0.4" />
    <ellipse cx="58" cy="45" rx="1.5" ry="8" fill="#ffffff" opacity="0.2" />
  </svg>
);

export const OilIcon = ({ className = "w-6 h-6" }) => (
  <svg 
    className={className}
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="oilGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#9333ea" />
        <stop offset="50%" stopColor="#c084fc" />
        <stop offset="100%" stopColor="#e9d5ff" />
      </linearGradient>
      <radialGradient id="oilLiquid" cx="50%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#f3e8ff" />
        <stop offset="100%" stopColor="#e9d5ff" />
      </radialGradient>
    </defs>
    
    {/* Bottle body - rounded elegant shape */}
    <ellipse cx="50" cy="55" rx="20" ry="30" fill="url(#oilGradient)" />
    
    {/* Bottle neck */}
    <rect x="45" y="20" width="10" height="15" rx="2" fill="#7c3aed" />
    
    {/* Cork/Cap */}
    <ellipse cx="50" cy="20" rx="6" ry="4" fill="#6d28d9" />
    <ellipse cx="50" cy="17" rx="5" ry="3" fill="#5b21b6" />
    <rect x="48" y="17" width="4" height="2" rx="1" fill="#4c1d95" />
    
    {/* Oil inside */}
    <ellipse cx="50" cy="55" rx="16" ry="25" fill="url(#oilLiquid)" opacity="0.8" />
    
    {/* Oil surface with slight curve */}
    <ellipse cx="50" cy="35" rx="16" ry="2" fill="#e9d5ff" opacity="0.9" />
    
    {/* Oil drops floating */}
    <circle cx="45" cy="45" r="1" fill="#f3e8ff" opacity="0.7" />
    <circle cx="55" cy="50" r="0.8" fill="#f3e8ff" opacity="0.7" />
    <circle cx="50" cy="60" r="1.2" fill="#f3e8ff" opacity="0.7" />
    <circle cx="42" cy="65" r="0.6" fill="#f3e8ff" opacity="0.7" />
    <circle cx="58" cy="62" r="0.9" fill="#f3e8ff" opacity="0.7" />
    
    {/* Elegant label */}
    <rect x="40" y="48" width="20" height="15" rx="2" fill="#ffffff" opacity="0.95" />
    <rect x="42" y="50" width="16" height="1.5" rx="0.5" fill="#9333ea" />
    <rect x="42" y="53" width="12" height="1" rx="0.5" fill="#c084fc" />
    <rect x="42" y="56" width="14" height="1" rx="0.5" fill="#c084fc" />
    <rect x="42" y="59" width="10" height="1" rx="0.5" fill="#c084fc" />
    
    {/* Premium shine effect */}
    <ellipse cx="58" cy="40" rx="2" ry="12" fill="#ffffff" opacity="0.4" />
    <ellipse cx="44" cy="50" rx="1.5" ry="8" fill="#ffffff" opacity="0.3" />
  </svg>
);

export const SprayIcon = ({ className = "w-6 h-6" }) => (
  <svg 
    className={className}
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="sprayGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7c3aed" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
    </defs>
    
    {/* Bottle body */}
    <rect x="25" y="30" width="50" height="55" rx="8" fill="url(#sprayGradient)" />
    
    {/* Trigger sprayer */}
    <path 
      d="M65 35 Q75 35 75 45 Q75 50 70 50 L65 50 Z" 
      fill="#6d28d9" 
    />
    
    {/* Trigger */}
    <path 
      d="M70 45 Q72 47 72 50 Q72 52 70 52 Q68 52 68 50 L68 47 Z" 
      fill="#5b21b6" 
    />
    
    {/* Nozzle */}
    <rect x="75" y="42" width="8" height="6" rx="2" fill="#4c1d95" />
    <rect x="83" y="44" width="4" height="2" rx="1" fill="#2e1065" />
    
    {/* Spray effect */}
    <circle cx="90" cy="45" r="1" fill="#c084fc" opacity="0.6" />
    <circle cx="92" cy="43" r="0.8" fill="#c084fc" opacity="0.5" />
    <circle cx="94" cy="47" r="0.6" fill="#c084fc" opacity="0.4" />
    <circle cx="91" cy="48" r="0.7" fill="#c084fc" opacity="0.3" />
    <circle cx="95" cy="44" r="0.5" fill="#c084fc" opacity="0.3" />
    
    {/* Product inside */}
    <rect x="30" y="35" width="40" height="45" rx="6" fill="#d8b4fe" opacity="0.7" />
    
    {/* Label */}
    <rect x="30" y="50" width="35" height="18" rx="2" fill="#ffffff" opacity="0.95" />
    <rect x="32" y="52" width="31" height="2" rx="1" fill="#7c3aed" />
    <rect x="32" y="56" width="22" height="1.5" rx="0.5" fill="#9333ea" />
    <rect x="32" y="59" width="26" height="1.5" rx="0.5" fill="#9333ea" />
    <rect x="32" y="62" width="18" height="1.5" rx="0.5" fill="#9333ea" />
    <rect x="32" y="65" width="24" height="1.5" rx="0.5" fill="#9333ea" />
    
    {/* Shine */}
    <ellipse cx="35" cy="45" rx="3" ry="15" fill="#ffffff" opacity="0.3" />
  </svg>
);