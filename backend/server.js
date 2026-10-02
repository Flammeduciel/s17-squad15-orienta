const express = require('express');
const app = express();
const port = process.env.PORT || 4000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

/* Route attendue par le health check Dokploy (voir deploy.md). La version
   finale de l'API la déplacera dans un contrôleur dédié. */
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});