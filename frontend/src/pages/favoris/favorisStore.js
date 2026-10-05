/* P3, Favoris : magasin des formations favorites.
   - Les favoris sont gardés dans le navigateur (localStorage) : ils survivent au rechargement.
   - Pour chaque favori on garde un « instantané » de la formation (nom, institut, diplôme), afin
     d'afficher la liste même hors ligne. rechargerFavoris() le remet à jour depuis l'API.
   - Plusieurs onglets restent synchronisés. */

const KEY = 'orienta-favoris'
const listeners = new Set()

const texte = (v) =>
  v && typeof v === 'object' ? (v.nom ?? v.name ?? v.short_name ?? v.sigle ?? '') : (v ?? '')

// Ne garde de la formation que ce qui sert à l'affichage de la liste.
export const instantane = (f) => ({
  id: f.id,
  nom: f.nom ?? f.name ?? '',
  institut: texte(f.institut ?? f.institute),
  diplome: texte(f.diplome ?? f.degree),
})

function lire() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY))
    return Array.isArray(v) ? v.filter((x) => x && x.id != null) : []
  } catch {
    return []
  }
}

let etat = lire()

function ecrire(liste) {
  etat = liste
  try {
    localStorage.setItem(KEY, JSON.stringify(liste))
  } catch {
    /* stockage indisponible (navigation privée) : les favoris durent le temps de la session */
  }
  listeners.forEach((l) => l())
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY || e.key === null) {
      etat = lire()
      listeners.forEach((l) => l())
    }
  })
}

const meme = (a, b) => String(a) === String(b)

export const getFavoris = () => etat
export const estFavori = (id) => etat.some((f) => meme(f.id, id))

export function ajouter(formation) {
  if (estFavori(formation.id)) return
  ecrire([...etat, instantane(formation)])
}

export function retirer(id) {
  if (!estFavori(id)) return
  ecrire(etat.filter((f) => !meme(f.id, id)))
}

export function basculer(formation) {
  if (estFavori(formation.id)) retirer(formation.id)
  else ajouter(formation)
}

export function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/* Recharger depuis l'API : redemande chaque formation favorite.
   - trouvée        → son instantané est mis à jour
   - 404            → la formation n'existe plus : elle est retirée des favoris
   - autre erreur   → on garde l'ancien instantané (hors ligne, serveur en panne…)
   fetchOne(id) renvoie la formation (voir api/formations.js). Renvoie { retires, erreurs }. */
export async function rechargerFavoris(fetchOne) {
  const ids = etat.map((f) => f.id)
  const resultats = await Promise.allSettled(ids.map((id) => fetchOne(id)))

  const maj = new Map() // id → nouvel instantané, ou null si la formation n'existe plus
  let erreurs = 0
  resultats.forEach((r, i) => {
    if (r.status === 'fulfilled' && r.value) maj.set(String(ids[i]), instantane({ ...r.value, id: ids[i] }))
    else if (r.status === 'rejected' && r.reason?.status === 404) maj.set(String(ids[i]), null)
    else erreurs += 1
  })

  // Appliqué sur l'état courant : un favori ajouté ou retiré pendant l'attente n'est pas perdu.
  const avant = JSON.stringify(etat)
  const suivant = etat.flatMap((f) => {
    if (!maj.has(String(f.id))) return [f]
    const n = maj.get(String(f.id))
    return n ? [n] : []
  })
  if (JSON.stringify(suivant) !== avant) ecrire(suivant)

  const retires = [...maj.values()].filter((v) => v === null).length
  return { retires, erreurs }
}
