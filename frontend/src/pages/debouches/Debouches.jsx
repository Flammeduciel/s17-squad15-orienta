/* Débouchés - route /debouches/:id (ticket P5).
   Maquette : template/index.html. */
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCareers, getPrograms } from '../../api/catalogue';
import Icon from '../../components/Icon';
import PageState from '../../components/PageState';
import ProgramCard from '../../components/ProgramCard';
import { useApi } from '../../hooks/useApi';
import { ROUTES } from '../../routes';
import { pluriel } from '../../utils/format';

// Le débouché demandé et les formations publiées qui y mènent.
async function loadCareer(id) {
  const [careers, programs] = await Promise.all([getCareers(), getPrograms()]);
  const career = careers.find((item) => item.id === id);
  if (!career) return { career: null, programs: [] };
  return { career, programs: programs.filter((program) => program.careers.includes(career.name)) };
}

function Debouches() {
  const { id } = useParams();
  const { data, loading, error, reload } = useApi(() => loadCareer(id), [id]);

  useEffect(() => {
    if (data?.career) document.title = `${data.career.name} · Orienta`;
  }, [data]);

  if (!data) return <PageState loading={loading} error={error} onRetry={reload} />;

  const { career, programs } = data;

  return (
    <div className="wrap detail">
      <Link className="back" to={ROUTES.accueil}>
        <Icon name="back" size={18} />
        Retour à l'accueil
      </Link>

      {career ? (
        <>
          <div className="dtitle">
            <div>
              <h1>{career.name}</h1>
              <p className="sub">
                {pluriel(programs.length, 'formation')} à Brazzaville{' '}
                {programs.length > 1 ? 'mènent' : 'mène'} à ce débouché.
              </p>
            </div>
          </div>
          <div className="grid" style={{ marginTop: 28 }}>
            {programs.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        </>
      ) : (
        <div className="empty" style={{ marginTop: 24 }}>
          <h3>Résultat introuvable</h3>
          <p>Aucune formation publiée ne mène à ce débouché pour l'instant.</p>
          <Link className="btn line" to={ROUTES.accueil}>
            Retour à l'accueil
          </Link>
        </div>
      )}
    </div>
  );
}

export default Debouches
