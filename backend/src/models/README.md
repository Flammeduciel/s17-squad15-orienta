# models

Les requêtes SQL, un fichier par table ou groupe de tables (`institutes.js`,
`programs.js`…). Un modèle reçoit des valeurs simples et renvoie des lignes : il
ne connaît ni la requête HTTP ni la réponse.

Le premier fichier arrive avec la connexion PostgreSQL (bloc BK1).
