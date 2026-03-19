// Tier validation utility
import finalData from '../Final-Data.json'
import { GSAID_LIST } from './gsa-ids'

export interface TierValidationResult {
  isValid: boolean
  message: string
  allowedTier?: string
  isGSAOnly?: boolean
}

export function validateTierForGSAID(gsaId: string, selectedTier: string): TierValidationResult {
  // Cek apakah GSA ID ada di daftar resmi GSAID.txt
  const isValidGSAID = GSAID_LIST.includes(gsaId.trim())
  
  if (!isValidGSAID) {
    return {
      isValid: false,
      message: "GSA ID tidak valid atau tidak terdaftar dalam sistem."
    }
  }

  // Cari data member berdasarkan GSA ID di Final-Data.json
  const memberData = finalData.find(member => member.GSAID === gsaId.trim())
  
  // Jika GSA ID ada di GSAID.txt tapi tidak ada di Final-Data.json
  // artinya mereka hanya Google Student Ambassador biasa (tanpa tier khusus)
  if (!memberData) {
    if (selectedTier) {
      return {
        isValid: false,
        message: "Berdasarkan data, kamu terdaftar hanya sebagai Google Student Ambassador tanpa tier khusus.\n\nSilakan kosongkan pilihan tier.",
        isGSAOnly: true
      }
    }
    return {
      isValid: true,
      message: "Valid - GSA tanpa tier khusus"
    }
  }
  
  // Jika tidak memilih tier (kosong), boleh
  if (!selectedTier) {
    return {
      isValid: true,
      message: "Valid - tidak memilih tier"
    }
  }
  
  // Cek apakah tier yang dipilih sesuai dengan data resmi
  if (memberData.Tier !== selectedTier) {
    return {
      isValid: false,
      message: `Tier yang kamu pilih (${selectedTier}) tidak sesuai dengan data resmi.\n\nBerdasarkan data, kamu terdaftar sebagai ${memberData.Tier}.\n\nSilakan pilih tier yang sesuai atau kosongkan pilihan tier.`,
      allowedTier: memberData.Tier
    }
  }
  
  return {
    isValid: true,
    message: "Tier valid sesuai data resmi"
  }
}

export function getAllowedTierForGSAID(gsaId: string): string | null {
  const memberData = finalData.find(member => member.GSAID === gsaId.trim())
  return memberData?.Tier || null
}

export function isGSAOnlyMember(gsaId: string): boolean {
  const isValidGSAID = GSAID_LIST.includes(gsaId.trim())
  const memberData = finalData.find(member => member.GSAID === gsaId.trim())
  return isValidGSAID && !memberData
}