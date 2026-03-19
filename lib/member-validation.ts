import memberData from '../all-member-data.json'

export interface MemberData {
  gsaId: string
  name: string
  campus: string
}

// Fungsi untuk normalisasi string (menghilangkan spasi, case insensitive)
const normalizeString = (str: string): string => {
  return str.toLowerCase().replace(/\s+/g, '').trim()
}

// Fungsi untuk mencari member berdasarkan GSA ID
export const findMemberByGsaId = (gsaId: string): MemberData | null => {
  const normalizedGsaId = normalizeString(gsaId)
  return memberData.find(member => 
    normalizeString(member.gsaId) === normalizedGsaId
  ) || null
}

// Fungsi untuk validasi nama dengan toleransi typo
export const validateMemberName = (gsaId: string, inputName: string): {
  isValid: boolean
  expectedName?: string
  similarity?: number
} => {
  const member = findMemberByGsaId(gsaId)
  if (!member) {
    return { isValid: false }
  }

  const normalizedInput = normalizeString(inputName)
  const normalizedExpected = normalizeString(member.name)

  // Exact match
  if (normalizedInput === normalizedExpected) {
    return { isValid: true, expectedName: member.name }
  }

  // Calculate similarity using Levenshtein distance
  const similarity = calculateSimilarity(normalizedInput, normalizedExpected)
  
  // Allow 80% similarity or higher
  if (similarity >= 0.8) {
    return { 
      isValid: true, 
      expectedName: member.name,
      similarity 
    }
  }

  return { 
    isValid: false, 
    expectedName: member.name,
    similarity 
  }
}

// Fungsi untuk validasi kampus dengan toleransi typo
export const validateMemberCampus = (gsaId: string, inputCampus: string): {
  isValid: boolean
  expectedCampus?: string
  similarity?: number
} => {
  const member = findMemberByGsaId(gsaId)
  if (!member) {
    return { isValid: false }
  }

  const normalizedInput = normalizeString(inputCampus)
  const normalizedExpected = normalizeString(member.campus)

  // Exact match
  if (normalizedInput === normalizedExpected) {
    return { isValid: true, expectedCampus: member.campus }
  }

  // Calculate similarity
  const similarity = calculateSimilarity(normalizedInput, normalizedExpected)
  
  // Allow 75% similarity or higher for campus (more lenient due to variations)
  if (similarity >= 0.75) {
    return { 
      isValid: true, 
      expectedCampus: member.campus,
      similarity 
    }
  }

  return { 
    isValid: false, 
    expectedCampus: member.campus,
    similarity 
  }
}

// Fungsi untuk validasi lengkap member
export const validateMemberData = (gsaId: string, name: string, campus: string): {
  isValid: boolean
  errors: string[]
  suggestions: {
    name?: string
    campus?: string
  }
} => {
  const errors: string[] = []
  const suggestions: { name?: string; campus?: string } = {}

  const member = findMemberByGsaId(gsaId)
  if (!member) {
    errors.push('GSA ID tidak ditemukan dalam database member yang valid')
    return { isValid: false, errors, suggestions }
  }

  // Validate name
  const nameValidation = validateMemberName(gsaId, name)
  if (!nameValidation.isValid) {
    errors.push(`Nama tidak sesuai dengan data GSA ID. Nama yang terdaftar: "${nameValidation.expectedName}"`)
    suggestions.name = nameValidation.expectedName
  }

  // Validate campus
  const campusValidation = validateMemberCampus(gsaId, campus)
  if (!campusValidation.isValid) {
    errors.push(`Kampus tidak sesuai dengan data GSA ID. Kampus yang terdaftar: "${campusValidation.expectedCampus}"`)
    suggestions.campus = campusValidation.expectedCampus
  }

  return {
    isValid: errors.length === 0,
    errors,
    suggestions
  }
}

// Fungsi untuk menghitung similarity menggunakan Levenshtein distance
function calculateSimilarity(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))

  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i
  }

  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j
  }

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      )
    }
  }

  const maxLength = Math.max(str1.length, str2.length)
  return maxLength === 0 ? 1 : (maxLength - matrix[str2.length][str1.length]) / maxLength
}

// Fungsi untuk mendapatkan semua GSA ID yang valid
export const getAllValidGsaIds = (): string[] => {
  return memberData.map(member => member.gsaId)
}

// Fungsi untuk auto-complete nama dan kampus berdasarkan GSA ID
export const getAutoCompleteData = (gsaId: string): {
  name: string
  campus: string
} | null => {
  const member = findMemberByGsaId(gsaId)
  return member ? { name: member.name, campus: member.campus } : null
}