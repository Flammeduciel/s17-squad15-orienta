import { useEffect, useState } from 'react';
import { request } from '../../api/http';
import FormationCard from '../../components/FormationCard';
import Status from '../../components/Status';
import { useFavoris } from '../../context/favoris-context';
import { plural } from '../../utils/format';

/* Favoris — route /favoris (ticket P3).
   Les favoris sont des identifiants gardés dans ce navigateur (contexte S5,
   clé « orienta-favs ») ; la page recharge leurs fiches depuis l'API et retire
   d'elle-même les formations qui n'existent plus. Maquette : template/index.html. */

// Recharge les fiches des formations gardées de côté, et compte celles qui n'existent plus.
async function recharger(ids) {
  const resultats = await Promise.allSettled(ids.map((id) => request(`/programs/${id}`)));
  const presentes = [];
  const disparues = [];
  resultats.forEach((resultat, index) => {
    if (resultat.status === 'fulfilled') presentes.push(resultat.value);
    else if ([400, 404].includes(resultat.reason?.status)) disparues.push(ids[index]);
  });
  return { presentes, disparues };
}

function Favoris() {
  const { ids, toggle } = useFavoris();
  const [etat, setEtat] = useState({ chargement: ids.length > 0, presentes: [], disparues: [] });

  useEffect(() => {
    if (ids.length === 0) return undefined;
    let annule = false;
    recharger(ids).then(({ presentes, disparues }) => {
      if (annule) return;
      setEtat({ chargement: false, presentes, disparues });
      // Les favoris dont la formation n'existe plus sont retirés pour de bon.
      disparues.forEach((id) => toggle(id));
    });
    return () => {
      annule = true;
    };
  }, [ids, toggle]);

  // La grille ne garde que les identifiants encore présents dans le contexte : retirer
  // un favori depuis la page le fait disparaître aussitôt.
  const visibles = etat.presentes.filter((program) => ids.includes(program.id));

  return (
    <div className="wrap detail">
      <div className="dtitle">
        <div>
          <h1>Mes favoris</h1>
          <p className="sub">
            Les formations que vous avez gardées de côté. Elles restent sur cet appareil.
          </p>
        </div>
      </div>

      {ids.length === 0 ? (
        <div className="empty">
          <h3>Aucun favori pour l'instant</h3>
          <p>Gardez une formation de côté avec le bouton ♥ pour la retrouver ici.</p>
        </div>
      ) : (
        <>
          {etat.chargement && <Status loading />}
          {etat.disparues.length > 0 && (
            <p className="ok" role="status">
              {plural(etat.disparues.length, 'formation')} n'existe
              {etat.disparues.length > 1 ? 'nt' : ''} plus et {etat.disparues.length > 1 ? 'ont été retirées' : 'a été retirée'} de vos favoris.
            </p>
          )}
          <div className="grid">
            {visibles.map((program) => (
              <FormationCard key={program.id} program={program} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Favoris;