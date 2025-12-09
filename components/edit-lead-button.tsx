"use client"

import { useState } from "react"
import { Pencil } from "lucide-react"
import { useRouter } from "next/navigation"
import { EditLeadModal } from "./edit-lead-modal"
import type { LeadWithRelations } from "@/lib/types"

interface EditLeadButtonProps {
  lead: LeadWithRelations
}

export function EditLeadButton({ lead }: EditLeadButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  function handleSuccess() {
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-foreground/5 px-4 h-10 text-sm font-medium hover:bg-foreground/10 active:scale-95 transition-all"
      >
        <Pencil className="h-4 w-4" />
        <span className="hidden sm:inline">Edit</span>
      </button>

      {isOpen && (
        <EditLeadModal
          lead={lead}
          onClose={() => setIsOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}
