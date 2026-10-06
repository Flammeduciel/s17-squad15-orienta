import { errorMessage } from '../utils/format';

// Ce qu'une page affiche tant que ses données ne sont pas là :
// un message de chargement, ou l'erreur.
export default function PageState({ loading, error }) {
  if (loading) return <p style={{ color: 'var(--muted)' }}>Chargement…</p>;
  return (
    <div className="empty">
      <h3>Les données n'ont pas pu être chargées</h3>
      <p>{errorMessage(error)}</p>
    </div>
  );
}
