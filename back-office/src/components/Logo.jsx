// Pastille « chapeau de diplômé » de la marque. `inverse` = version blanche sur fond vert.
export default function Logo({ inverse = false }) {
  const stroke = inverse ? '#17693F' : '#fff';
  return (
    <svg className="mk" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill={inverse ? '#fff' : 'currentColor'} />
      <path d="M7 13.5 16 9l9 4.5-9 4.5-9-4.5Z" fill={stroke} />
      <path d="M11 16v4.5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V16" stroke={stroke} strokeWidth="2" fill="none" />
    </svg>
  );
}
