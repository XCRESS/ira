'use client'

import { Building2, FileText, ChevronRight, X } from 'lucide-react'
import { type SearchResult } from '@/actions/probe42'

interface CompanySearchResultsProps {
  results: SearchResult[]
  isOpen: boolean
  onClose: () => void
  onSelectCompany: (result: SearchResult) => void
  hasMore: boolean
  isLoading?: boolean
  query: string
}

function CompanyResultCard({
  result,
  onSelect,
}: {
  result: SearchResult
  onSelect: () => void
}) {
  const isCompany = result.type === 'company'

  return (
    <button
      onClick={onSelect}
      className="w-full p-4 flex items-start gap-4 text-left glass rounded-xl hover:bg-foreground/5 active:bg-foreground/10 transition-colors group"
    >
      <div className="mt-1 size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        {isCompany ? (
          <Building2 className="size-5 text-primary" />
        ) : (
          <FileText className="size-5 text-primary" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-medium text-sm leading-tight line-clamp-2">
            {result.legalName}
          </h3>
          <ChevronRight className="size-4 text-foreground/30 group-hover:text-foreground/60 transition-colors shrink-0 mt-0.5" />
        </div>

        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className="px-2 py-1 rounded-md bg-foreground/10 text-xs font-mono">
            {result.identifier}
          </span>
          {result.status && (
            <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs">
              {result.status}
            </span>
          )}
          <span className="text-xs text-foreground/60">
            {isCompany ? 'Company' : 'LLP'}
          </span>
        </div>
      </div>
    </button>
  )
}

function ResultsContent({
  results,
  onSelectCompany,
  isLoading,
}: Omit<CompanySearchResultsProps, 'isOpen' | 'onClose' | 'query' | 'hasMore'>) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-foreground/60">Searching...</p>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="size-12 rounded-full bg-foreground/5 flex items-center justify-center">
          <Building2 className="size-6 text-foreground/60" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">No companies found</p>
          <p className="text-xs text-foreground/60 mt-1">
            Try a different search term or enter manually
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-2">
      <div className="space-y-2">
        {results.map((result, index) => (
          <CompanyResultCard
            key={`${result.identifier}-${index}`}
            result={result}
            onSelect={() => onSelectCompany(result)}
          />
        ))}
      </div>
    </div>
  )
}

export function CompanySearchResults({
  results,
  isOpen,
  onClose,
  onSelectCompany,
  hasMore,
  isLoading = false,
  query,
}: CompanySearchResultsProps) {
  if (!isOpen) return null

  return (
    <div className="relative mt-2">
      {/* Inline results below search bar */}
      <div className="glass rounded-xl border border-foreground/10 overflow-hidden">
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4 border-b border-foreground/10">
          <div className="flex-1">
            <p className="text-sm font-medium">
              {isLoading ? (
                'Searching...'
              ) : results.length > 0 ? (
                <>Found {results.length} {results.length === 1 ? 'result' : 'results'} for &quot;{query}&quot;</>
              ) : (
                `No results found for "${query}"`
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-2 p-2 rounded-lg hover:bg-foreground/5 active:bg-foreground/10 transition-colors"
            aria-label="Close results"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Results content */}
        <div className="max-h-[60vh] overflow-y-auto">
          <ResultsContent
            results={results}
            onSelectCompany={onSelectCompany}
            isLoading={isLoading}
          />
        </div>

        {hasMore && results.length > 0 && (
          <div className="p-4 border-t border-foreground/10 bg-foreground/5">
            <p className="text-xs text-foreground/60 text-center">
              Showing top {results.length} results. Refine your search for more specific results.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}