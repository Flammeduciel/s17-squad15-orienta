// Icônes de la maquette (traits 1,8 px). Chemins statiques, donc sûrs à injecter.
// Les icônes des domaines portent le slug du domaine (`sante`, `info`…) : un domaine
// ajouté plus tard par la Squad, sans icône ici, reçoit l'icône « all ».
const PATHS = {
  all: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  gestion: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  info: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M1 20h22M9 8l-2 2 2 2M15 8l2 2-2 2"/>',
  sante: '<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/>',
  btp: '<path d="M3 18h18v3H3zM5 18v-4a7 7 0 0 1 14 0v4M12 7V4M10 4h4"/>',
  com: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8"/>',
  logi: '<path d="M1 6h13v10H1zM14 10h4l4 4v2h-8z"/><circle cx="5" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
  droit: '<path d="M12 3v18M7 21h10M4 7h16M6 7l-3 7a3 3 0 0 0 6 0L6 7M18 7l-3 7a3 3 0 0 0 6 0l-3-7"/>',
  agro: '<path d="M5 21c0-9 5-15 15-16-1 10-7 15-15 16ZM5 21l8-8"/>',
  hotel: '<path d="M2 20V6M2 16h20v4M22 16v-4a3 3 0 0 0-3-3h-8v7"/><circle cx="6.5" cy="11.5" r="2"/>',
  petrole: '<path d="M12 2s7 7.5 7 12.5a7 7 0 0 1-14 0C5 9.5 12 2 12 2Z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  cap: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  moon: '<path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10Z"/>',
  brief: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
  pin: '<path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z"/><circle cx="12" cy="10" r="2.5"/>',
  cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/>',
  back: '<path d="M15 18l-6-6 6-6"/>',
  building: '<path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M16 9h2a2 2 0 0 1 2 2v10M2 21h20M8 7h4M8 11h4M8 15h4"/>',
  award: '<circle cx="12" cy="9" r="6"/><path d="M9 14.5 7.5 22l4.5-2.5 4.5 2.5L15 14.5"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/>',
};

export default function Icon({ name, className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: PATHS[name] ?? PATHS.all }}
    />
  );
}
