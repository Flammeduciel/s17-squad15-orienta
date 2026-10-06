// Message affiché quand des données n'ont pas pu être chargées, avec un bouton
// pour réessayer. S'utilise à la place d'une liste ou d'une fiche.
export default function LoadError({ error, onRetry }) {
  return (
    <div className="empty" role="alert">
      <h3>Impossible de charger les données</h3>
      <p>
        {error?.status === 0
          ? 'Le serveur ne répond pas. Vérifie ta connexion, puis réessaie.'
          : 'Une erreur est survenue. Réessaie dans un instant.'}
      </p>
      {onRetry && (
        <button className="btn line" type="button" onClick={onRetry}>
          Réessayer
        </button>
      )}
    </div>
  );
}
