import { Component } from 'react';

// Dernier filet de sécurité : une erreur de code dans une page affiche ce message
// au lieu d'une page blanche. Les erreurs d'API, elles, sont traitées par chaque page.
export default class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error(error);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <div className="page">
        <div className="empty" role="alert">
          <h3>Une erreur est survenue</h3>
          <p>La page n'a pas pu s'afficher. Rechargez-la pour réessayer.</p>
          <button className="btn line" type="button" onClick={() => window.location.reload()}>
            Recharger la page
          </button>
        </div>
      </div>
    );
  }
}
