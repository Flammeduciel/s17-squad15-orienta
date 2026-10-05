import { request } from './http'

export const getFormation = (id) => request(`/programs/${encodeURIComponent(id)}`)
