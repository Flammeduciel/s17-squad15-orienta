/* Favoris - route /favoris (ticket P3).
   Maquette : template/index.html. */
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPrograms } from '../../api/catalogue';
import Icon from '../../components/Icon';
import PageState from '../../components/PageState';
import ProgramCard from '../../components/ProgramCard';
import { useFavorites } from '../../context/favorites-context';
import { useApi } from '../../hooks/useApi';
import { ROUTES } from '../../routes';
import { pluriel } from '../../utils/format';
import { setSeo } from '../../utils/seo';

function Favoris() {
  const { favorites } = useFavorites();
  // Les favoris sont gardés dans le navigateur ; leurs fiches sont rechargées
  // depuis l'API, pour afficher des informations à jour.
  const { data: programs, loading, error, reload } = useApi(getPrograms, []);

  useEffect(() => {
    // Page personnelle : elle n'a pas à apparaître dans les moteurs de recherche.
    setSeo({
      title: 'Mes favoris · Orienta',
      description: 'Les formations que tu as mises de côté sur Orienta Brazzaville.',
      path: '/favoris',
      index: false,
    });
  }, []);

  if (!programs) return <PageState loading={loading} error={error} onRetry={reload} />;

  const list = programs.filter((program) => favorites.includes(program.id));

  return (
    <div className="wrap detail">
      <Link className="back" to={ROUTES.accueil}>
        <Icon name="back" size={18} />
        Retour à l'accueil
      </Link>

      <div className="dtitle">
        <div>
          <h1>Mes favoris</h1>
          <p className="sub">{pluriel(list.length, 'formation')} en favoris</p>
        </div>
      </div>

      <div className="grid" style={{ marginTop: 28 }}>
        {list.length === 0 && (
          <div className="empty">
            <h3>Aucun favori pour l'instant</h3>
            <p>Touche le cœur d'une formation pour la retrouver ici.</p>
            <Link className="btn line" to={ROUTES.accueil}>
              Voir les formations
            </Link>
          </div>
        )}
        {list.map((program) => (
          <ProgramCard key={program.id} program={program} />
        ))}
      </div>
    </div>
  );
}

export default Favoris
