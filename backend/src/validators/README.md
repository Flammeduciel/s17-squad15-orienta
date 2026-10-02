# validators

Le contrôle des paramètres et des corps de requête, un fichier par ressource.
Un validateur refuse une entrée incorrecte avec `httpError(400, …)` avant que le
contrôleur ne soit appelé.
