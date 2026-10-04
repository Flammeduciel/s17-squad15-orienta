import { useNavigate } from 'react-router-dom';
import { debouchePath } from '../routes';
import Icon from './Icon';

// Grille de débouchés cliquables : chacun ouvre les formations qui y mènent.
// names : noms à afficher ; careers : référentiel { id, name } de l'API.
export default function CareerButtons({ names, careers, style }) {
  const navigate = useNavigate();

  return (
    <div className="jobgrid" style={style}>
      {names.map((name) => {
        const career = careers.find((item) => item.name === name);
        return (
          <button
            className="job"
            type="button"
            key={name}
            onClick={() => career && navigate(debouchePath(career.id))}
          >
            <Icon name="brief" />
            {name}
          </button>
        );
      })}
    </div>
  );
}
