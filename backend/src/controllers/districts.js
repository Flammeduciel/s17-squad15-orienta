const districts = require("../models/districts");

/** `GET /districts` : 200, les 9 arrondissements avec leur nombre de formations publiées. */
async function list(req, res) {
  res.json(await districts.list());
}

module.exports = { list };
