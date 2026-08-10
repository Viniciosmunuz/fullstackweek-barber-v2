/**
 * Cena da barbearia usada no banner da home.
 *
 * Desenho original em SVG, e não imagem: pesa poucos KB, fica nítido em
 * qualquer densidade e acompanha a paleta sem depender de arte externa.
 *
 * A composição é o barbeiro em pé finalizando o corte de um cliente sentado,
 * com luminária, quadro e prateleira compondo o fundo. Tudo em grafite sobre o
 * preto, com o dourado restrito à máquina, ao contorno da capa, à luz e aos
 * brilhos — sem roxo, ao contrário da referência original.
 */
const BarberIllustration = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 520 360"
    fill="none"
    role="img"
    aria-label="Ilustração de um barbeiro finalizando o corte de um cliente"
    className={className}
  >
    <defs>
      <radialGradient id="bf-halo" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#C9A227" stopOpacity="0.16" />
        <stop offset="70%" stopColor="#C9A227" stopOpacity="0.04" />
        <stop offset="100%" stopColor="#C9A227" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="bf-lampbeam" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#C9A227" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#C9A227" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="bf-cape" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#1C1C26" />
        <stop offset="100%" stopColor="#101018" />
      </linearGradient>
      <linearGradient id="bf-apron" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1A1A24" />
        <stop offset="100%" stopColor="#101017" />
      </linearGradient>
    </defs>

    {/* halo atrás das figuras */}
    <circle cx="292" cy="176" r="150" fill="url(#bf-halo)" />
    <path
      d="M182 272a150 150 0 0 1 60-176"
      stroke="#C9A227"
      strokeWidth="1.5"
      strokeOpacity="0.35"
      fill="none"
    />

    {/* ---------------------------------------------------------------- */}
    {/* CENÁRIO                                                           */}
    {/* ---------------------------------------------------------------- */}

    {/* luminária */}
    <path d="M446 20v26" stroke="#3A3A48" strokeWidth="3" />
    <path
      d="M424 46h44l-9 18h-26l-9-18Z"
      fill="#15151C"
      stroke="#C9A227"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <ellipse cx="446" cy="66" rx="9" ry="4" fill="#C9A227" opacity="0.9" />
    <path d="M428 68h36l26 78h-88l26-78Z" fill="url(#bf-lampbeam)" />

    {/* quadro na parede */}
    <rect
      x="392"
      y="104"
      width="86"
      height="74"
      rx="6"
      fill="#101017"
      stroke="#C9A227"
      strokeWidth="1.5"
      strokeOpacity="0.5"
    />
    <path
      d="M406 126h58M406 140h58M406 154h40"
      stroke="#C9A227"
      strokeWidth="3"
      strokeLinecap="round"
      strokeOpacity="0.75"
    />
    <path
      d="M430 166l8-6 8 6"
      stroke="#C9A227"
      strokeWidth="1.5"
      strokeOpacity="0.6"
      fill="none"
    />

    {/* prateleira com frascos */}
    <rect x="392" y="212" width="96" height="3" rx="1.5" fill="#2C2C38" />
    <rect x="402" y="188" width="14" height="24" rx="3" fill="#20202B" />
    <rect x="404" y="182" width="10" height="8" rx="2" fill="#C9A227" opacity="0.5" />
    <rect x="424" y="180" width="16" height="32" rx="3" fill="#242430" />
    <rect x="427" y="174" width="10" height="8" rx="2" fill="#C9A227" opacity="0.35" />
    <rect x="450" y="192" width="14" height="20" rx="3" fill="#20202B" />
    <rect x="470" y="186" width="12" height="26" rx="3" fill="#242430" />

    {/* brilhos */}
    <g fill="#C9A227">
      <path d="M200 92l3.5 8 8 3.5-8 3.5-3.5 8-3.5-8-8-3.5 8-3.5 3.5-8Z" opacity="0.9" />
      <path d="M348 62l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5 2.5-6Z" opacity="0.7" />
      <path d="M168 210l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z" opacity="0.55" />
      <circle cx="378" cy="86" r="2.5" opacity="0.6" />
      <circle cx="222" cy="140" r="2" opacity="0.45" />
    </g>

    {/* ---------------------------------------------------------------- */}
    {/* CLIENTE SENTADO                                                   */}
    {/* ---------------------------------------------------------------- */}

    {/* capa */}
    <path
      d="M268 232c0-34 22-56 52-56s52 22 52 56v96H268v-96Z"
      fill="url(#bf-cape)"
      stroke="#C9A227"
      strokeWidth="1.5"
      strokeOpacity="0.55"
    />
    {/* gola */}
    <path
      d="M300 186c6 8 13 12 20 12s14-4 20-12"
      stroke="#F5F5F5"
      strokeWidth="6"
      strokeLinecap="round"
      fill="none"
    />

    {/* pescoço */}
    <path d="M308 168h24v20h-24z" fill="#C9A88E" />
    {/* cabeça */}
    <ellipse cx="322" cy="146" rx="27" ry="30" fill="#E0BC9A" />
    {/* orelha */}
    <circle cx="299" cy="150" r="5" fill="#C9A88E" />
    {/* cabelo com topete */}
    <path
      d="M295 136c0-19 12-30 28-30 14 0 24 7 27 19 3 9 1 15-3 12-2-2-3-6-6-8-6-4-16-4-27 2-9 5-14 8-19 5Z"
      fill="#15151C"
    />
    {/* barba */}
    <path
      d="M300 152c1 16 9 26 22 26 9 0 15-5 19-13-5 4-11 6-18 6-9 0-17-6-23-19Z"
      fill="#1A1A24"
    />
    {/* traços do rosto */}
    <circle cx="332" cy="145" r="2" fill="#15151C" />
    <path
      d="M326 136c3-2 7-2 10 0"
      stroke="#15151C"
      strokeWidth="1.8"
      strokeLinecap="round"
      fill="none"
    />

    {/* ---------------------------------------------------------------- */}
    {/* BARBEIRO EM PÉ                                                    */}
    {/* ---------------------------------------------------------------- */}

    {/* torso e avental */}
    <path
      d="M196 214c0-26 16-44 40-44s40 18 40 44v114H196V214Z"
      fill="#1E1E28"
    />
    <path
      d="M212 206h48v122h-48z"
      fill="url(#bf-apron)"
      stroke="#C9A227"
      strokeWidth="1.5"
      strokeOpacity="0.45"
    />
    {/* alças do avental */}
    <path
      d="M222 206l10-20M250 206l-10-20"
      stroke="#C9A227"
      strokeWidth="3"
      strokeLinecap="round"
      strokeOpacity="0.8"
    />
    {/* bolso */}
    <rect
      x="222"
      y="268"
      width="28"
      height="22"
      rx="3"
      stroke="#C9A227"
      strokeWidth="1.5"
      strokeOpacity="0.5"
    />
    {/* monograma no avental */}
    <path
      d="M232 232v20M232 232h7a5 5 0 0 1 0 10h-7M232 242h8a5 5 0 0 1 0 10h-8"
      stroke="#C9A227"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.9"
    />

    {/* pescoço e cabeça */}
    <path d="M226 158h20v18h-20z" fill="#C9A88E" />
    <ellipse cx="236" cy="136" rx="26" ry="29" fill="#E0BC9A" />
    {/* cabelo penteado para trás */}
    <path
      d="M210 130c0-20 11-32 26-32s26 12 26 30c-4-4-6-11-12-14-7-4-15-1-22 4-8 6-13 12-18 12Z"
      fill="#15151C"
    />
    {/* barba curta */}
    <path
      d="M214 142c2 16 10 25 22 25s20-9 22-25c-5 6-12 10-22 10s-17-4-22-10Z"
      fill="#1A1A24"
    />
    <circle cx="246" cy="136" r="2" fill="#15151C" />
    <circle cx="228" cy="136" r="2" fill="#15151C" />

    {/* braço que segura a máquina */}
    <path
      d="M262 214c14-4 26-14 34-26"
      stroke="#1E1E28"
      strokeWidth="20"
      strokeLinecap="round"
    />
    <path
      d="M262 214c14-4 26-14 34-26"
      stroke="#E0BC9A"
      strokeWidth="11"
      strokeLinecap="round"
    />
    {/* mão */}
    <circle cx="298" cy="186" r="8" fill="#E0BC9A" />

    {/* máquina de cortar */}
    <g transform="rotate(-34 306 178)">
      <rect
        x="292"
        y="170"
        width="34"
        height="16"
        rx="4"
        fill="#15151C"
        stroke="#C9A227"
        strokeWidth="2"
      />
      <rect x="284" y="173" width="9" height="10" rx="2" fill="#C9A227" />
      <path
        d="M300 175h12"
        stroke="#C9A227"
        strokeWidth="1.5"
        strokeOpacity="0.7"
      />
    </g>

    {/* braço de apoio no ombro do cliente */}
    <path
      d="M272 232c16 2 30 8 40 18"
      stroke="#1E1E28"
      strokeWidth="18"
      strokeLinecap="round"
    />
    <path
      d="M300 246c6 2 11 5 15 9"
      stroke="#E0BC9A"
      strokeWidth="10"
      strokeLinecap="round"
    />

    {/* chão */}
    <path
      d="M120 328h400"
      stroke="#2C2C38"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

export default BarberIllustration
