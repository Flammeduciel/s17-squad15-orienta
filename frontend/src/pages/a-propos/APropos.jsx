/* À propos - route /a-propos (ticket P7).
   Maquette : template/index.html. */
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon';
import { ROUTES } from '../../routes';
import { setSeo } from '../../utils/seo';

function APropos() {
  useEffect(() => {
    setSeo({
      title: 'À propos · Orienta Brazzaville',
      description:
        "Orienta centralise l'information sur les instituts privés de Brazzaville pour aider chaque bachelier à choisir sa formation : qui nous sommes et comment l'information est vérifiée.",
      path: '/a-propos',
    });
  }, []);

  return (
    <div className="wrap">
      <div className="about">
        <Link className="back" to={ROUTES.accueil}>
          <Icon name="back" size={18} />
          Retour à l'accueil
        </Link>
        <h1>Faire le bon choix d'orientation, sans courir la ville</h1>
        <p className="lead">
          Orienta centralise l'information sur les instituts privés de Brazzaville pour que chaque bachelier choisisse
          en connaissance de cause.
        </p>

        <section>
          <h2>Le problème</h2>
          <p>
            Chaque année, des milliers de jeunes Congolais obtiennent leur baccalauréat et doivent choisir un institut
            supérieur. Mais une grande partie des instituts privés n'a pas de site web : les familles doivent se
            déplacer d'un établissement à l'autre ou s'en remettre au bouche-à-oreille, sans certitude sur les
            formations réellement proposées, les diplômes délivrés ou les frais pratiqués.
          </p>
        </section>

        <section>
          <h2>Ce que fait Orienta</h2>
          <p>
            <b>Une fiche claire par formation</b> : diplôme préparé, durée, programme par année, métiers visés, frais
            détaillés et calendrier d'inscription. <b>Un badge d'agrément</b> affiché avec son numéro officiel pour
            chaque institut agréé. <b>Un contact direct</b> : WhatsApp, téléphone ou e-mail, sans créer de compte.
          </p>
        </section>

        <section>
          <h2>Pour qui&nbsp;?</h2>
          <p>
            <b>Pour les nouveaux bacheliers et leurs familles</b>, qui peuvent comparer les offres à distance,
            gratuitement et sans inscription. <b>Pour les instituts sérieux</b> sans site web, qui gagnent en visibilité
            auprès des futurs étudiants : notre équipe collecte et vérifie l'information avec eux, gratuitement.
          </p>
        </section>

        <section>
          <h2>Notre engagement sur l'information</h2>
          <p>
            Chaque fiche est renseignée avec l'institut lui-même et le numéro d'agrément est recopié du document
            officiel communiqué par l'établissement. Un institut non agréé apparaît sans badge : nous ne publions jamais
            d'information que nous ne pouvons pas sourcer. Les tarifs et calendriers sont ceux communiqués par
            l'institut et restent susceptibles d'évoluer : le secrétariat de l'établissement reste la référence finale.
          </p>
        </section>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link className="btn" to={ROUTES.accueil}>
            Voir les instituts
          </Link>
        </div>
      </div>
    </div>
  );
}

export default APropos
