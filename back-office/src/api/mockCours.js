// Faux backend « cours », uniquement pour le développement (VITE_USE_MOCK_API=true).
// Les données sont gardées dans le navigateur ; supprimer la clé « orienta-bo-cours »
// du localStorage remet le jeu de démonstration.
import { ApiError } from './http'
import { SEED_COURS, SEED_FORMATIONS } from './mockData'

const KEY = 'orienta-bo-cours'
const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms))
const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY))
    if (Array.isArray(saved)) return saved
  } catch {
    /* stockage illisible : on repart du jeu de démonstration */
  }
  return structuredClone(SEED_COURS)
}

function save(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    /* stockage indisponible : les changements durent le temps de la session */
  }
}

function checkName(list, nom, selfId) {
  if (!String(nom ?? '').trim()) throw new ApiError(400, "L'intitulé est obligatoire.")
  if (list.some((c) => c.id !== selfId && norm(c.nom) === norm(nom))) {
    throw new ApiError(409, 'Ce cours existe déjà au catalogue.')
  }
}

export async function listCours() {
  await delay()
  return load()
}

export async function listFormations() {
  await delay()
  return structuredClone(SEED_FORMATIONS)
}

export async function createCours({ nom, liens }) {
  await delay()
  const list = load()
  checkName(list, nom)
  const cours = { id: `c${Date.now()}`, nom: nom.trim(), liens }
  save([...list, cours])
  return cours
}

export async function updateCours(id, { nom, liens }) {
  await delay()
  const list = load()
  const cours = list.find((c) => c.id === id)
  if (!cours) throw new ApiError(404, 'Cours introuvable.')
  checkName(list, nom, id)
  Object.assign(cours, { nom: nom.trim(), liens })
  save(list)
  return cours
}

export async function deleteCours(id) {
  await delay()
  save(load().filter((c) => c.id !== id))
  return { ok: true }
}
