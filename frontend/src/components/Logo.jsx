// Pastille « chapeau de diplômé » de la marque, avec son gland doré (maquette de l'en-tête).
export default function Logo() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="currentColor" />
      <path d="M7 13.5 16 9l9 4.5-9 4.5-9-4.5Z" fill="#fff" />
      <path d="M11 16v4.5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V16" stroke="#fff" strokeWidth="2" fill="none" />
      <path d="M24 14v5" stroke="#F0B415" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
