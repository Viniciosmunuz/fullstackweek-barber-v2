/**
 * Ilustração da seção institucional: barbeiro atendendo um cliente na cadeira.
 *
 * Desenho original em SVG, não uma imagem: pesa poucos KB, fica nítido em
 * qualquer densidade de tela e acompanha a paleta sem precisar de arte extra.
 *
 * A composição é geométrica de propósito — silhuetas em grafite sobre o preto
 * do fundo, com o dourado reservado ao contorno da cadeira, à máquina e ao halo
 * da luminária. Sem tons roxos, e sem copiar a referência: aqui o
 * enquadramento é frontal e o cliente aparece de perfil na cadeira.
 */
const BarberIllustration = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 420 320"
    fill="none"
    role="img"
    aria-label="Ilustração de um barbeiro atendendo um cliente na cadeira"
    className={className}
  >
    <defs>
      <linearGradient id="bf-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#15151C" />
        <stop offset="100%" stopColor="#0B0B0F" />
      </linearGradient>
      <radialGradient id="bf-lamp" cx="50%" cy="0%" r="70%">
        <stop offset="0%" stopColor="#C9A227" stopOpacity="0.30" />
        <stop offset="100%" stopColor="#C9A227" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* luz da luminária */}
    <ellipse cx="232" cy="60" rx="150" ry="120" fill="url(#bf-lamp)" />

    {/* parede: prateleira e frascos */}
    <rect x="36" y="96" width="120" height="3" rx="1.5" fill="#2A2A35" />
    <rect x="52" y="74" width="12" height="22" rx="2.5" fill="#242430" />
    <rect x="70" y="66" width="10" height="30" rx="2.5" fill="#2A2A35" />
    <rect x="86" y="78" width="13" height="18" rx="2.5" fill="#242430" />
    <rect x="106" y="70" width="10" height="26" rx="2.5" fill="#2A2A35" />
    <rect x="122" y="80" width="14" height="16" rx="2.5" fill="#242430" />

    {/* espelho */}
    <rect
      x="286"
      y="60"
      width="92"
      height="112"
      rx="12"
      fill="#12121A"
      stroke="#2A2A35"
      strokeWidth="2"
    />
    <path d="M300 150 L332 104 L352 150 Z" fill="#1A1A24" />

    {/* luminária */}
    <path d="M232 0v30" stroke="#2A2A35" strokeWidth="3" />
    <path
      d="M206 30h52l-12 20h-28l-12-20Z"
      fill="#15151C"
      stroke="#C9A227"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <circle cx="232" cy="54" r="5" fill="#C9A227" opacity="0.85" />

    {/* piso */}
    <path d="M0 268h420v52H0z" fill="url(#bf-floor)" />
    <path d="M0 268h420" stroke="#2A2A35" strokeWidth="2" />

    {/* ---------------------------------------------------------------- */}
    {/* cadeira                                                           */}
    {/* ---------------------------------------------------------------- */}
    <path
      d="M150 268v-22a10 10 0 0 1 10-10h74a10 10 0 0 1 10 10v22"
      fill="#1A1A24"
      stroke="#C9A227"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <rect x="146" y="186" width="26" height="58" rx="10" fill="#20202B" />
    <path d="M196 268v22" stroke="#2A2A35" strokeWidth="6" strokeLinecap="round" />
    <path
      d="M172 292h48"
      stroke="#C9A227"
      strokeWidth="4"
      strokeLinecap="round"
      opacity="0.7"
    />

    {/* ---------------------------------------------------------------- */}
    {/* cliente sentado, de perfil                                        */}
    {/* ---------------------------------------------------------------- */}
    {/* capa */}
    <path
      d="M176 236c0-26 14-42 32-42s32 16 32 42v10h-64v-10Z"
      fill="#22222E"
      stroke="#33333F"
      strokeWidth="2"
    />
    {/* cabeça */}
    <circle cx="208" cy="176" r="24" fill="#2E2E3A" />
    {/* cabelo */}
    <path
      d="M186 170c2-14 11-22 22-22s20 8 22 22c-6-6-13-9-22-9s-16 3-22 9Z"
      fill="#15151C"
    />
    {/* barba */}
    <path
      d="M191 184c3 12 9 18 17 18s14-6 17-18c-4 6-10 9-17 9s-13-3-17-9Z"
      fill="#1A1A24"
    />

    {/* ---------------------------------------------------------------- */}
    {/* barbeiro em pé                                                    */}
    {/* ---------------------------------------------------------------- */}
    {/* pernas */}
    <path
      d="M282 268v-46h34v46"
      stroke="#22222E"
      strokeWidth="16"
      strokeLinecap="round"
    />
    {/* tronco / avental */}
    <path
      d="M272 154h54l8 74h-70l8-74Z"
      fill="#1E1E28"
      stroke="#33333F"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M288 154v74M310 154v74"
      stroke="#C9A227"
      strokeWidth="1.5"
      opacity="0.35"
    />
    {/* cabeça */}
    <circle cx="299" cy="130" r="22" fill="#2E2E3A" />
    <path
      d="M278 126c1-13 10-21 21-21s20 8 21 21c-6-6-12-9-21-9s-15 3-21 9Z"
      fill="#15151C"
    />
    {/* braço que segura a máquina */}
    <path
      d="M274 168c-14 6-26 12-34 20"
      stroke="#2E2E3A"
      strokeWidth="13"
      strokeLinecap="round"
    />
    {/* máquina de cortar */}
    <g transform="rotate(-28 240 190)">
      <rect x="228" y="182" width="26" height="14" rx="4" fill="#15151C" stroke="#C9A227" strokeWidth="2" />
      <path d="M222 186h6v6h-6z" fill="#C9A227" />
    </g>

    {/* bancada */}
    <rect x="24" y="212" width="104" height="8" rx="4" fill="#22222E" />
    <path d="M34 220v48M118 220v48" stroke="#22222E" strokeWidth="5" />
    {/* tesoura sobre a bancada */}
    <g opacity="0.9">
      <path
        d="M58 206l22-14M58 192l22 14"
        stroke="#C9A227"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="56" cy="207" r="3.5" stroke="#C9A227" strokeWidth="2" />
      <circle cx="56" cy="191" r="3.5" stroke="#C9A227" strokeWidth="2" />
    </g>
  </svg>
)

export default BarberIllustration
