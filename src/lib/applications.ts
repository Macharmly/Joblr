import { supabase } from './supabase'

export async function getApplications() {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      id,
      position,
      status,
      outcome,
      location,
      work_setup,
      employment_type,
      salary_min,
      salary_max,
      currency,
      source,
      date_posted,
      date_applied,
      deadline,
      priority,
      notes,
      created_at,
      companies:companies (
        id,
        name,
        website,
        industry,
        location
      )
    `)
    .order('created_at', { ascending: false })

  return { data, error }
}

type CreateApplicationInput = {
  companyName: string
  position: string
  status: string
  jobUrl: string
  location: string
  workSetup: string
  employmentType: string
  salaryMin: string
  salaryMax: string
  source: string
  dateApplied: string
  deadline: string
  priority: string
  notes: string
}

export async function createApplication(
  input: CreateApplicationInput,
  userId: string,
) {
  const companyName = input.companyName.trim()

  let companyId: string | null = null

  if (companyName) {
    const { data: existingCompany, error: companyLookupError } =
      await supabase
        .from('companies')
        .select('id')
        .eq('user_id', userId)
        .eq('name', companyName)
        .maybeSingle()

    if (companyLookupError) {
      return {
        data: null,
        error: companyLookupError,
      }
    }

    if (existingCompany) {
      companyId = existingCompany.id
    } else {
      const { data: newCompany, error: companyCreateError } =
        await supabase
          .from('companies')
          .insert({
            user_id: userId,
            name: companyName,
          })
          .select('id')
          .single()

      if (companyCreateError) {
        return {
          data: null,
          error: companyCreateError,
        }
      }

      companyId = newCompany.id
    }
  }

  const { data, error } = await supabase
    .from('applications')
    .insert({
      user_id: userId,
      company_id: companyId,
      position: input.position.trim(),
      status: input.status,
      job_url: input.jobUrl.trim() || null,
      location: input.location.trim() || null,
      work_setup: input.workSetup || null,
      employment_type: input.employmentType || null,
      salary_min: input.salaryMin
        ? Number(input.salaryMin)
        : null,
      salary_max: input.salaryMax
        ? Number(input.salaryMax)
        : null,
      source: input.source.trim() || null,
      date_applied: input.dateApplied || null,
      deadline: input.deadline || null,
      priority: input.priority,
      notes: input.notes.trim() || null,
    })
    .select()
    .single()

  return { data, error }
}

export async function updateApplication(
  applicationId: string,
  input: CreateApplicationInput,
) {
  const { data, error } = await supabase
    .from('applications')
    .update({
      position: input.position.trim(),
      status: input.status,
      job_url: input.jobUrl.trim() || null,
      location: input.location.trim() || null,
      work_setup: input.workSetup || null,
      employment_type: input.employmentType || null,
      salary_min: input.salaryMin
        ? Number(input.salaryMin)
        : null,
      salary_max: input.salaryMax
        ? Number(input.salaryMax)
        : null,
      source: input.source.trim() || null,
      date_applied: input.dateApplied || null,
      deadline: input.deadline || null,
      priority: input.priority,
      notes: input.notes.trim() || null,
    })
    .eq('id', applicationId)
    .select()
    .single()

  return { data, error }
}

export async function deleteApplication(applicationId: string) {
  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', applicationId)

  return { error }
}