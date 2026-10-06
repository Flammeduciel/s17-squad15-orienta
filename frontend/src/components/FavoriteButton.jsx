import { useFavorites } from '../context/favorites-context';

// Cœur posé sur la carte d'une formation.
export default function FavoriteButton({ programId }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const on = isFavorite(programId);

  return (
    <button
      className="heart"
      type="button"
      aria-pressed={on}
      aria-label={`${on ? 'Retirer des' : 'Ajouter aux'} favoris`}
      onClick={() => toggleFavorite(programId)}
    >
      <svg viewBox="0 0 24 24">
        <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
      </svg>
    </button>
  );
}
