// Icônes Font Awesome (version gratuite, style « solid »). La bibliothèque est
// chargée une fois, dans main.jsx. Toutes les icônes : https://fontawesome.com/icons
//
//   <Icon name="search" />        nom court de l'application (liste ci-dessous)
//   <Icon name={domain.icon} />   nom Font Awesome direct, choisi dans le back-office
const NAMES = {
  all: 'border-all',
  search: 'magnifying-glass',
  sliders: 'sliders',
  cap: 'graduation-cap',
  clock: 'clock',
  moon: 'moon',
  brief: 'briefcase',
  pin: 'location-dot',
  cash: 'money-bill',
  back: 'chevron-left',
  building: 'building',
  award: 'award',
  check: 'check',
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
