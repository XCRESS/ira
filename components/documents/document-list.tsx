'use client'

import { DocumentCard } from './document-card'
import type { Document } from '@prisma/client'
import { FileX } from 'lucide-react'

export function DocumentList({
  documents,
  userRole,
  userId,
}: {
  documents: Array<Document & { uploadedBy: { name: string; email: string } }>
  userRole: 'ASSESSOR' | 'REVIEWER'
  userId: string
}) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileX className="w-12 h-12 text-foreground/20 mb-3" />
        <p className="text-foreground/60 text-sm">No documents uploaded yet</p>
        <p className="text-foreground/40 text-xs mt-1">
          Upload documents to get started
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <DocumentCard
          key={doc.id}
          document={doc}
          canDelete={userRole === 'REVIEWER' || doc.uploadedById === userId}
        />
      ))}
    </div>
  )
}
