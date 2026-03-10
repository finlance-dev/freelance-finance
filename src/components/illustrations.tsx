export function HeroIllustration({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Dashboard mockup */}
      <rect x="50" y="30" width="400" height="280" rx="16" fill="var(--card)" stroke="var(--border)" strokeWidth="2" />
      {/* Top bar */}
      <rect x="50" y="30" width="400" height="40" rx="16" fill="var(--secondary)" />
      <rect x="50" y="54" width="400" height="16" fill="var(--secondary)" />
      <circle cx="76" cy="50" r="6" fill="#ef4444" />
      <circle cx="96" cy="50" r="6" fill="#f59e0b" />
      <circle cx="116" cy="50" r="6" fill="#10b981" />
      {/* Sidebar */}
      <rect x="50" y="70" width="90" height="240" fill="var(--secondary)" opacity="0.5" />
      <rect x="62" y="90" width="66" height="8" rx="4" fill="var(--border)" />
      <rect x="62" y="110" width="50" height="8" rx="4" fill="var(--primary)" opacity="0.6" />
      <rect x="62" y="130" width="58" height="8" rx="4" fill="var(--border)" />
      <rect x="62" y="150" width="42" height="8" rx="4" fill="var(--border)" />
      {/* Stat cards */}
      <rect x="155" y="85" width="85" height="55" rx="10" fill="var(--card)" stroke="var(--border)" strokeWidth="1.5" />
      <rect x="165" y="95" width="40" height="6" rx="3" fill="var(--muted)" opacity="0.4" />
      <rect x="165" y="110" width="55" height="10" rx="3" fill="#10b981" opacity="0.7" />
      <rect x="253" y="85" width="85" height="55" rx="10" fill="var(--card)" stroke="var(--border)" strokeWidth="1.5" />
      <rect x="263" y="95" width="40" height="6" rx="3" fill="var(--muted)" opacity="0.4" />
      <rect x="263" y="110" width="55" height="10" rx="3" fill="#ef4444" opacity="0.7" />
      <rect x="351" y="85" width="85" height="55" rx="10" fill="var(--card)" stroke="var(--border)" strokeWidth="1.5" />
      <rect x="361" y="95" width="40" height="6" rx="3" fill="var(--muted)" opacity="0.4" />
      <rect x="361" y="110" width="55" height="10" rx="3" fill="var(--primary)" opacity="0.7" />
      {/* Bar chart */}
      <rect x="155" y="155" width="140" height="140" rx="10" fill="var(--card)" stroke="var(--border)" strokeWidth="1.5" />
      <rect x="170" y="250" width="16" height="30" rx="3" fill="#10b981" opacity="0.8" />
      <rect x="192" y="230" width="16" height="50" rx="3" fill="#10b981" opacity="0.8" />
      <rect x="214" y="210" width="16" height="70" rx="3" fill="#10b981" opacity="0.8" />
      <rect x="236" y="195" width="16" height="85" rx="3" fill="#10b981" opacity="0.8" />
      <rect x="258" y="220" width="16" height="60" rx="3" fill="#10b981" opacity="0.8" />
      {/* Pie chart */}
      <rect x="308" y="155" width="128" height="140" rx="10" fill="var(--card)" stroke="var(--border)" strokeWidth="1.5" />
      <circle cx="372" cy="220" r="35" fill="none" stroke="#6366f1" strokeWidth="12" strokeDasharray="80 140" />
      <circle cx="372" cy="220" r="35" fill="none" stroke="#10b981" strokeWidth="12" strokeDasharray="45 175" strokeDashoffset="-80" />
      <circle cx="372" cy="220" r="35" fill="none" stroke="#f59e0b" strokeWidth="12" strokeDasharray="35 185" strokeDashoffset="-125" />
      <circle cx="372" cy="220" r="35" fill="none" stroke="#ef4444" strokeWidth="12" strokeDasharray="60 160" strokeDashoffset="-160" />
      {/* Floating elements */}
      <g opacity="0.9">
        <rect x="20" y="200" width="50" height="50" rx="12" fill="#10b981" opacity="0.15" />
        <text x="32" y="232" fontSize="22" fill="#10b981">฿</text>
      </g>
      <g opacity="0.9">
        <rect x="430" y="100" width="50" height="50" rx="12" fill="#6366f1" opacity="0.15" />
        <text x="444" y="132" fontSize="20" fill="#6366f1">%</text>
      </g>
      <g opacity="0.8">
        <rect x="410" y="260" width="45" height="45" rx="10" fill="#f59e0b" opacity="0.15" />
        <path d="M425 278 L435 290 L445 275" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
      {/* Decorative dots */}
      <circle cx="30" y="80" r="4" fill="var(--primary)" opacity="0.2" />
      <circle cx="15" cy="150" r="3" fill="#10b981" opacity="0.3" />
      <circle cx="475" cy="200" r="5" fill="#f59e0b" opacity="0.2" />
      <circle cx="460" cy="50" r="3" fill="#ef4444" opacity="0.3" />
    </svg>
  );
}

export function LoginIllustration({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Person at desk */}
      <rect x="60" y="180" width="180" height="10" rx="5" fill="var(--border)" /> {/* Desk */}
      <rect x="80" y="130" width="100" height="50" rx="4" fill="var(--card)" stroke="var(--border)" strokeWidth="2" /> {/* Monitor */}
      <rect x="120" y="180" width="20" height="20" fill="var(--border)" /> {/* Stand */}
      <rect x="110" y="198" width="40" height="5" rx="2" fill="var(--border)" /> {/* Base */}
      {/* Screen content */}
      <rect x="92" y="142" width="35" height="4" rx="2" fill="#10b981" opacity="0.6" />
      <rect x="92" y="150" width="25" height="4" rx="2" fill="var(--primary)" opacity="0.6" />
      <rect x="92" y="158" width="30" height="4" rx="2" fill="#f59e0b" opacity="0.6" />
      <rect x="135" y="140" width="30" height="30" rx="4" fill="var(--primary)" opacity="0.1" />
      <text x="143" y="161" fontSize="16" fill="var(--primary)">฿</text>
      {/* Chair */}
      <ellipse cx="150" cy="250" rx="30" ry="8" fill="var(--secondary)" />
      <rect x="145" y="215" width="10" height="35" fill="var(--border)" />
      <rect x="125" y="210" width="50" height="8" rx="4" fill="var(--secondary)" stroke="var(--border)" strokeWidth="1" />
      {/* Person */}
      <circle cx="150" cy="110" r="18" fill="var(--primary)" opacity="0.2" /> {/* Head */}
      <circle cx="150" cy="110" r="15" fill="var(--primary)" opacity="0.15" />
      <path d="M135 130 Q150 145 165 130" fill="var(--primary)" opacity="0.15" /> {/* Shoulders */}
      {/* Floating coins */}
      <g opacity="0.6">
        <circle cx="45" cy="100" r="15" fill="#f59e0b" opacity="0.2" />
        <text x="39" y="106" fontSize="14" fill="#f59e0b">฿</text>
      </g>
      <g opacity="0.5">
        <circle cx="255" cy="80" r="12" fill="#10b981" opacity="0.2" />
        <text x="249" y="85" fontSize="12" fill="#10b981">฿</text>
      </g>
      <g opacity="0.4">
        <circle cx="240" cy="160" r="10" fill="var(--primary)" opacity="0.2" />
        <text x="235" y="164" fontSize="10" fill="var(--primary)">฿</text>
      </g>
      {/* Decorative */}
      <circle cx="50" cy="170" r="4" fill="#ef4444" opacity="0.2" />
      <circle cx="260" cy="120" r="3" fill="var(--primary)" opacity="0.3" />
      <circle cx="35" cy="140" r="2" fill="#10b981" opacity="0.3" />
    </svg>
  );
}

export function SignupIllustration({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Rocket / Growth */}
      <path d="M150 60 L165 120 L150 110 L135 120 Z" fill="var(--primary)" opacity="0.7" /> {/* Rocket body */}
      <rect x="142" y="100" width="16" height="40" rx="6" fill="var(--primary)" opacity="0.5" />
      <path d="M138 135 L130 155 L142 140 Z" fill="#f59e0b" opacity="0.5" /> {/* Left fin */}
      <path d="M162 135 L170 155 L158 140 Z" fill="#f59e0b" opacity="0.5" /> {/* Right fin */}
      {/* Flame */}
      <ellipse cx="150" cy="148" rx="8" ry="15" fill="#ef4444" opacity="0.4" />
      <ellipse cx="150" cy="145" rx="5" ry="10" fill="#f59e0b" opacity="0.5" />
      {/* Chart going up */}
      <rect x="50" y="170" width="200" height="100" rx="12" fill="var(--card)" stroke="var(--border)" strokeWidth="1.5" />
      <polyline points="75,250 105,235 135,240 165,210 195,195 225,185" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="225" cy="185" r="5" fill="#10b981" />
      {/* Grid lines */}
      <line x1="70" y1="200" x2="235" y2="200" stroke="var(--border)" strokeWidth="0.5" />
      <line x1="70" y1="220" x2="235" y2="220" stroke="var(--border)" strokeWidth="0.5" />
      <line x1="70" y1="240" x2="235" y2="240" stroke="var(--border)" strokeWidth="0.5" />
      {/* Stars */}
      <g opacity="0.5">
        <circle cx="80" cy="80" r="3" fill="#f59e0b" />
        <circle cx="220" cy="90" r="2" fill="#f59e0b" />
        <circle cx="100" cy="50" r="2" fill="var(--primary)" />
        <circle cx="200" cy="60" r="3" fill="var(--primary)" />
        <circle cx="250" cy="140" r="2" fill="#10b981" />
        <circle cx="50" cy="130" r="2" fill="#10b981" />
      </g>
      {/* Coins floating */}
      <g opacity="0.4">
        <circle cx="60" cy="150" r="14" fill="#f59e0b" opacity="0.3" />
        <text x="54" y="155" fontSize="12" fill="#f59e0b">฿</text>
      </g>
      <g opacity="0.4">
        <circle cx="240" cy="155" r="12" fill="#10b981" opacity="0.3" />
        <text x="234" y="160" fontSize="12" fill="#10b981">฿</text>
      </g>
    </svg>
  );
}

export function EmptyTransactionsIllustration({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Receipt */}
      <rect x="55" y="15" width="90" height="110" rx="8" fill="var(--card)" stroke="var(--border)" strokeWidth="1.5" />
      <path d="M55 117 L60 125 L65 117 L70 125 L75 117 L80 125 L85 117 L90 125 L95 117 L100 125 L105 117 L110 125 L115 117 L120 125 L125 117 L130 125 L135 117 L140 125 L145 117" stroke="var(--border)" strokeWidth="1.5" fill="var(--card)" />
      {/* Receipt lines */}
      <rect x="70" y="30" width="60" height="5" rx="2" fill="var(--primary)" opacity="0.3" />
      <rect x="75" y="42" width="50" height="3" rx="1.5" fill="var(--border)" />
      <rect x="75" y="50" width="35" height="3" rx="1.5" fill="var(--border)" />
      <rect x="75" y="58" width="45" height="3" rx="1.5" fill="var(--border)" />
      <line x1="70" y1="68" x2="130" y2="68" stroke="var(--border)" strokeDasharray="3 2" />
      <rect x="75" y="75" width="40" height="3" rx="1.5" fill="var(--border)" />
      <rect x="100" y="85" width="30" height="6" rx="2" fill="#10b981" opacity="0.4" />
      {/* Plus icon */}
      <circle cx="145" cy="35" r="18" fill="var(--primary)" opacity="0.1" />
      <line x1="145" y1="27" x2="145" y2="43" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="137" y1="35" x2="153" y2="35" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" />
      {/* Coins */}
      <circle cx="40" cy="90" r="12" fill="#f59e0b" opacity="0.15" />
      <text x="35" y="95" fontSize="10" fill="#f59e0b" opacity="0.6">฿</text>
      <circle cx="165" cy="100" r="10" fill="#10b981" opacity="0.15" />
      <text x="160" y="104" fontSize="9" fill="#10b981" opacity="0.6">฿</text>
    </svg>
  );
}

export function EmptyClientsIllustration({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* People group */}
      <circle cx="100" cy="50" r="22" fill="var(--primary)" opacity="0.1" />
      <circle cx="100" cy="45" r="12" fill="var(--primary)" opacity="0.2" />
      <path d="M80 72 Q100 85 120 72" fill="var(--primary)" opacity="0.15" />
      {/* Left person */}
      <circle cx="58" cy="60" r="18" fill="#10b981" opacity="0.08" />
      <circle cx="58" cy="56" r="9" fill="#10b981" opacity="0.2" />
      <path d="M44 72 Q58 80 72 72" fill="#10b981" opacity="0.12" />
      {/* Right person */}
      <circle cx="142" cy="60" r="18" fill="#f59e0b" opacity="0.08" />
      <circle cx="142" cy="56" r="9" fill="#f59e0b" opacity="0.2" />
      <path d="M128 72 Q142 80 156 72" fill="#f59e0b" opacity="0.12" />
      {/* Connection lines */}
      <line x1="75" y1="58" x2="85" y2="52" stroke="var(--border)" strokeWidth="1" strokeDasharray="3 2" />
      <line x1="115" y1="52" x2="125" y2="58" stroke="var(--border)" strokeWidth="1" strokeDasharray="3 2" />
      {/* Cards */}
      <rect x="35" y="95" width="55" height="40" rx="8" fill="var(--card)" stroke="var(--border)" strokeWidth="1" />
      <rect x="42" y="103" width="30" height="4" rx="2" fill="var(--primary)" opacity="0.3" />
      <rect x="42" y="112" width="40" height="3" rx="1.5" fill="var(--border)" />
      <rect x="42" y="120" width="25" height="3" rx="1.5" fill="#10b981" opacity="0.4" />
      <rect x="110" y="95" width="55" height="40" rx="8" fill="var(--card)" stroke="var(--border)" strokeWidth="1" />
      <rect x="117" y="103" width="30" height="4" rx="2" fill="#f59e0b" opacity="0.3" />
      <rect x="117" y="112" width="40" height="3" rx="1.5" fill="var(--border)" />
      <rect x="117" y="120" width="25" height="3" rx="1.5" fill="#10b981" opacity="0.4" />
      {/* Plus */}
      <circle cx="175" cy="50" r="12" fill="var(--primary)" opacity="0.1" />
      <line x1="175" y1="44" x2="175" y2="56" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <line x1="169" y1="50" x2="181" y2="50" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

export function EmptyChartIllustration({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Chart area */}
      <line x1="30" y1="20" x2="30" y2="110" stroke="var(--border)" strokeWidth="1.5" /> {/* Y axis */}
      <line x1="30" y1="110" x2="175" y2="110" stroke="var(--border)" strokeWidth="1.5" /> {/* X axis */}
      {/* Grid */}
      <line x1="30" y1="40" x2="175" y2="40" stroke="var(--border)" strokeWidth="0.5" opacity="0.4" />
      <line x1="30" y1="60" x2="175" y2="60" stroke="var(--border)" strokeWidth="0.5" opacity="0.4" />
      <line x1="30" y1="80" x2="175" y2="80" stroke="var(--border)" strokeWidth="0.5" opacity="0.4" />
      {/* Dashed line (projected) */}
      <polyline points="40,95 65,80 90,85 115,60 140,45 165,35" stroke="var(--primary)" strokeWidth="2" strokeDasharray="5 4" strokeLinecap="round" opacity="0.4" />
      {/* Ghost bars */}
      <rect x="45" y="75" width="18" height="35" rx="3" fill="var(--primary)" opacity="0.08" />
      <rect x="75" y="60" width="18" height="50" rx="3" fill="var(--primary)" opacity="0.08" />
      <rect x="105" y="50" width="18" height="60" rx="3" fill="var(--primary)" opacity="0.08" />
      <rect x="135" y="40" width="18" height="70" rx="3" fill="var(--primary)" opacity="0.08" />
      {/* Question mark */}
      <circle cx="165" cy="25" r="10" fill="var(--primary)" opacity="0.1" />
      <text x="161" y="30" fontSize="13" fill="var(--primary)" opacity="0.4" fontWeight="bold">?</text>
    </svg>
  );
}

export function TaxIllustration({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Calculator */}
      <rect x="60" y="20" width="80" height="110" rx="12" fill="var(--card)" stroke="var(--border)" strokeWidth="2" />
      {/* Screen */}
      <rect x="70" y="30" width="60" height="25" rx="6" fill="var(--secondary)" />
      <text x="90" y="48" fontSize="14" fill="#10b981" fontFamily="monospace" opacity="0.8">฿</text>
      <rect x="100" y="42" width="22" height="5" rx="2" fill="#10b981" opacity="0.5" />
      {/* Buttons */}
      <rect x="72" y="64" width="14" height="11" rx="3" fill="var(--primary)" opacity="0.2" />
      <rect x="93" y="64" width="14" height="11" rx="3" fill="var(--primary)" opacity="0.2" />
      <rect x="114" y="64" width="14" height="11" rx="3" fill="var(--primary)" opacity="0.2" />
      <rect x="72" y="82" width="14" height="11" rx="3" fill="var(--border)" />
      <rect x="93" y="82" width="14" height="11" rx="3" fill="var(--border)" />
      <rect x="114" y="82" width="14" height="11" rx="3" fill="var(--border)" />
      <rect x="72" y="100" width="14" height="11" rx="3" fill="var(--border)" />
      <rect x="93" y="100" width="14" height="11" rx="3" fill="var(--border)" />
      <rect x="114" y="100" width="14" height="11" rx="3" fill="#10b981" opacity="0.3" />
      {/* Tax document */}
      <rect x="145" y="55" width="40" height="52" rx="5" fill="var(--card)" stroke="var(--border)" strokeWidth="1.5" />
      <rect x="152" y="63" width="26" height="3" rx="1.5" fill="var(--primary)" opacity="0.3" />
      <rect x="152" y="70" width="20" height="3" rx="1.5" fill="var(--border)" />
      <rect x="152" y="77" width="24" height="3" rx="1.5" fill="var(--border)" />
      <rect x="152" y="84" width="18" height="3" rx="1.5" fill="var(--border)" />
      <line x1="152" y1="92" x2="178" y2="92" stroke="var(--border)" />
      <rect x="160" y="96" width="16" height="5" rx="2" fill="#f59e0b" opacity="0.4" />
      {/* Percentage */}
      <circle cx="35" cy="55" r="18" fill="#f59e0b" opacity="0.1" />
      <text x="25" y="61" fontSize="15" fill="#f59e0b" opacity="0.6" fontWeight="bold">%</text>
      {/* Coins */}
      <circle cx="45" cy="120" r="10" fill="#10b981" opacity="0.12" />
      <text x="40" y="124" fontSize="9" fill="#10b981" opacity="0.5">฿</text>
      <circle cx="165" cy="130" r="8" fill="var(--primary)" opacity="0.12" />
      <text x="161" y="134" fontSize="8" fill="var(--primary)" opacity="0.5">฿</text>
    </svg>
  );
}
