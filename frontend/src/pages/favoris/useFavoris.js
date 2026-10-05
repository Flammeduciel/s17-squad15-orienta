import { useSyncExternalStore } from 'react'
import { basculer, estFavori, getFavoris, subscribe } from './favorisStore'

/* Hook des favoris : se met à jour dès qu'un favori change, y compris depuis un autre onglet.
   const { favoris, estFavori, basculer } = useFavoris() */


export function useFavoris() {
  const favoris = useSyncExternalStore(subscribe, getFavoris)
  return { favoris, estFavori, basculer }
}