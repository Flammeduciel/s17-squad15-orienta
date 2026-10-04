// Icônes Font Awesome (version gratuite, style « solid »). La bibliothèque est
// chargée une fois, dans main.jsx. Toutes les icônes : https://fontawesome.com/icons
//
//   <Icon name="search" />        nom court de l'application (liste ci-dessous)
//   <Icon name={domain.icon} />   nom Font Awesome direct, choisi dans le back-office
const NAMES = {
  gauge: 'gauge',
  building: 'building',
  cap: 'graduation-cap',
  book: 'book',
  award: 'award',
  brief: 'briefcase',
  list: 'list',
  grid: 'border-all',
  user: 'user',
  logout: 'right-from-bracket',
  moon: 'moon',
  eye: 'eye',
  menu: 'bars',
  check: 'check',
  x: 'xmark',
  plus: 'plus',
  pencil: 'pen',
  trash: 'trash',
  search: 'magnifying-glass',
  upload: 'upload',
  back: 'chevron-left',
  pin: 'location-dot',
};

export default function Icon({ name, className = '', size }) {
  const icon = NAMES[name] ?? name ?? 'shapes';
  return (
    <i
      className={`icon fa-solid fa-${icon} ${className}`}
      style={size ? { fontSize: size } : undefined}
      aria-hidden="true"
    />
  );
}
