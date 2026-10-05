import { request } from './http'

const toApiCourse = ({ nom, liens }) => ({
  name: nom,
  programs: liens.map(({ formation, annee }) => {
    const programId = Number(formation)
    if (!Number.isInteger(programId) || programId < 1) {
      throw new Error(`Identifiant de formation invalide : ${formation}`)
    }
    return { program_id: programId, year: annee }
  }),
})

const fromApiCourse = (course) => ({
  id: String(course.id),
  nom: course.name,
  liens: course.programs.map((program) => ({
    formation: String(program.program_id),
    annee: program.year,
  })),
})

const fromApiProgram = (program) => ({
  id: String(program.id),
  nom: program.name,
  institut: program.institute.short_name,
  diplome: program.degree.name,
  duree: program.duration,
})

export const listCours = async () => {
  const courses = await request('/admin/courses')
  if (!Array.isArray(courses)) throw new Error('Réponse invalide : la liste des cours est attendue.')
  return courses.map(fromApiCourse)
}

export const listFormations = async () => {
  const response = await request('/admin/programs')
  if (!response || !Array.isArray(response.items)) {
    throw new Error('Réponse invalide : la liste des formations est attendue.')
  }
  return response.items.map(fromApiProgram)
}

export const createCours = (body) =>
  request('/admin/courses', { method: 'POST', body: toApiCourse(body) })

export const updateCours = (id, body) =>
  request(`/admin/courses/${encodeURIComponent(id)}`, { method: 'PUT', body: toApiCourse(body) })

export const deleteCours = (id) =>
  request(`/admin/courses/${encodeURIComponent(id)}`, { method: 'DELETE' })
