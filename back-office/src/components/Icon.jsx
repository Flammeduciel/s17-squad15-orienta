// Icônes de la maquette (traits 1,8 px). Chemins statiques, donc sûrs à injecter.
const PATHS = {
  gauge: '<path d="M12 14 8 9"/><path d="M20.5 17a9 9 0 1 0-17 0"/><path d="M4 21h16"/>',
  building: '<path d="M4 21V4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v17M15 9h4a1 1 0 0 1 1 1v11M3 21h18M8 7h3M8 11h3M8 15h3"/>',
  cap: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14Z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
  award: '<circle cx="12" cy="9" r="6"/><path d="M9 14.5 7.5 22l4.5-2.5 4.5 2.5L15 14.5"/>',
  brief: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  moon: '<path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10Z"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
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
      dangerouslySetInnerHTML={{ __html: PATHS[name] ?? '' }}
    />
  );
}
