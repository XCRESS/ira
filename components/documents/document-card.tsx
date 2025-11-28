'use client'

import { FileText, Trash2, ExternalLink } from 'lucide-react'
import { deleteDocument } from '@/actions/documents'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import type { Document } from '@prisma/client'
import { useState } from 'react'

export function DocumentCard({
  document,
  canDelete,
}: {
  document: Document & { uploadedBy: { name: string; email: string } }
  canDelete: boolean
}) {
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this document?')) return

    setDeleting(true)

    try {
      const result = await deleteDocument({ documentId: document.id })

      if (result.success) {
        toast.success('Document deleted')
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error('Failed to delete document')
    } finally {
      setDeleting(false)
    }
  }

  const fileIcon =
    document.fileType === 'PDF' ? (
      <FileText className="w-8 h-8 text-red-500" />
    ) : (
      <FileText className="w-8 h-8 text-blue-500" />
    )

  return (
    <div className="glass rounded-xl p-4 flex items-start gap-3">
      {/* Icon */}
      <div className="flex-shrink-0">{fileIcon}</div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm truncate">{document.fileName}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-foreground/60">
            {(document.fileSize / 1024).toFixed(0)} KB
          </span>
          <span className="text-xs text-foreground/60">•</span>
          <span className="text-xs text-foreground/60">{document.fileType}</span>
        </div>
        <p className="text-xs text-foreground/60 mt-1">
          Uploaded by {document.uploadedBy.name}
        </p>
        <p className="text-xs text-foreground/60">
          {formatDistanceToNow(new Date(document.uploadedAt), {
            addSuffix: true,
          })}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <a
          href={document.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-lg p-2 text-sm hover:bg-foreground/5 active:scale-95 transition-all"
        >
          <ExternalLink className="w-4 h-4" />
        </a>

        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={`inline-flex items-center justify-center rounded-lg p-2 text-sm transition-all ${
              deleting
                ? 'cursor-not-allowed opacity-50'
                : 'hover:bg-red-500/10 active:scale-95'
            }`}
          >
            {deleting ? (
              <span className="w-4 h-4 animate-spin">⏳</span>
            ) : (
              <Trash2 className="w-4 h-4 text-red-500" />
            )}
          </button>
        )}
      </div>
    </div>
  )
}
