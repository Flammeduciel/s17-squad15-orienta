// Cartes fantômes affichées dans une grille pendant le chargement : la page
// garde sa forme en attendant les vraies cartes.
export default function SkeletonCards({ count = 6 }) {
  return Array.from({ length: count }, (_, index) => (
    <div className="skel" key={index} aria-hidden="true">
      <span className="skel-cover" />
      <span className="skel-line" />
      <span className="skel-line short" />
    </div>
  ));
}
