const fs = require('node:fs');
const app = require('./src/app');
const { port, uploadDir } = require('./src/config/env');

// Le dossier des images doit exister avant le premier dépôt.
fs.mkdirSync(uploadDir, { recursive: true });

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
