import { useParams } from 'react-router-dom';
import BackLink from '../../components/BackLink';
import FormationCard from '../../components/FormationCard';
import PageIntrouvable from '../../components/PageIntrouvable';
import Status from '../../components/Status';
import { useFetch } from '../../hooks/useFetch';
import { plural } from '../../utils/format';

/* Débouché — route /debouches/:id (ticket P5).
   Le débouché est lisible dans l'adresse et la grille liste les formations qui y mènent.
   Maquette : template/index.html. */

function Debouches() {
  const { id } = useParams();
  const careers = useFetch('/careers').data ?? [];
  const { data, loading, error, reload } = useFetch('/programs', { career_id: id });
  const career = careers.find((careerItem) => careerItem.id === Number(id));

  if (careers.length > 0 && !career) {
    return (
      <PageIntrouvable title="Débouché introuvable" message="Ce débouché n'existe pas ou n'existe plus." />
    );
  }
  if (error || !career || !data) {
    return (
      <div className="wrap detail">
        <BackLink />
        <Status loading={loading} error={error} onRetry={reload} />
      </div>
    );
  }

  const count = data.items.length;

  return (
    <div className="wrap detail">
      <BackLink />
      <div className="dtitle">
        <div>
          <h1>{career.name}</h1>
          <p className="sub">
            <b>{plural(count, 'formation')}</b> qui mènent à ce débouché
          </p>
        </div>
      </div>

      {count > 0 ? (
        <div className="grid">
          {data.items.map((program) => (
            <FormationCard key={program.id} program={program} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <h3>Aucune formation publiée</h3>
          <p>Aucune formation ne mène pour l'instant à ce débouché.</p>
        </div>
      )}
    </div>
  );
}

export default Debouches;