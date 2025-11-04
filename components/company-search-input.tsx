'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { searchCompanies, type SearchResult } from '@/actions/probe42'
import { toast } from 'sonner'
import { PROBE42 } from '@/lib/constants'

interface CompanySearchInputProps {
  onSearchResults: (results: SearchResult[], hasMore: boolean) => void
  onDirectIdentifier: (identifier: string, type: 'CIN' | 'PAN' | 'LLPIN') => void
  onSearchStateChange: (isSearching: boolean) => void
  onQueryChange?: (query: string) => void
  placeholder?: string
  disabled?: boolean
}

export function CompanySearchInput({
  onSearchResults,
  onDirectIdentifier,
  onSearchStateChange,
  onQueryChange,
  placeholder = 'Search by company name or enter CIN/PAN/LLPIN',
  disabled = false,
}: CompanySearchInputProps) {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const requestIdRef = useRef(0)
  const onSearchResultsRef = useRef(onSearchResults)
  const onDirectIdentifierRef = useRef(onDirectIdentifier)
  const onSearchStateChangeRef = useRef(onSearchStateChange)
  const onQueryChangeRef = useRef(onQueryChange)

  // Keep refs updated
  useEffect(() => {
    onSearchResultsRef.current = onSearchResults
    onDirectIdentifierRef.current = onDirectIdentifier
    onSearchStateChangeRef.current = onSearchStateChange
    onQueryChangeRef.current = onQueryChange
  }, [onSearchResults, onDirectIdentifier, onSearchStateChange, onQueryChange])

  // Debounced search function with request ID tracking
  const performSearch = useCallback(
    async (searchQuery: string) => {
      // Increment request ID to track this request
      const currentRequestId = ++requestIdRef.current

      setIsSearching(true)
      onSearchStateChangeRef.current(true)

      try {
        const result = await searchCompanies(searchQuery)

        // Ignore if superseded by newer request
        if (currentRequestId !== requestIdRef.current) {
          return
        }

        if (!result.success) {
          toast.error(result.error || 'Unable to search companies')
          onSearchResultsRef.current([], false)
          return
        }

        // Check if it's a direct identifier
        if (result.isDirectIdentifier) {
          onDirectIdentifierRef.current(
            result.identifier!,
            result.identifierType as 'CIN' | 'PAN' | 'LLPIN'
          )
        } else {
          onSearchResultsRef.current(result.results || [], result.hasMore || false)
        }
      } catch (error) {
        // Only handle error for latest request
        if (currentRequestId === requestIdRef.current) {
          console.error('Search error:', error)
          toast.error('An unexpected error occurred')
          onSearchResultsRef.current([], false)
        }
      } finally {
        // Only update loading state for latest request
        if (currentRequestId === requestIdRef.current) {
          setIsSearching(false)
          onSearchStateChangeRef.current(false)
        }
      }
    },
    []
  )

  // Debounce effect
  useEffect(() => {
    const trimmedQuery = query.trim()

    if (trimmedQuery.length < PROBE42.MIN_SEARCH_LENGTH) {
      return
    }

    const timeoutId = setTimeout(() => {
      performSearch(trimmedQuery)
    }, PROBE42.DEBOUNCE_DELAY_MS)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [query, performSearch])

  const handleClear = () => {
    setQuery('')
    onQueryChangeRef.current?.('')
  }

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery)
    onQueryChangeRef.current?.(newQuery)
  }

  // Clear results when query becomes too short
  useEffect(() => {
    if (query.trim().length < PROBE42.MIN_SEARCH_LENGTH) {
      onSearchResultsRef.current([], false)
    }
  }, [query])

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full h-11 pl-10 pr-10 bg-background border border-input rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground animate-spin" />
        )}
        {!isSearching && query && (
          <button
            onClick={handleClear}
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Hint text */}
      {query.length > 0 && query.length < PROBE42.MIN_SEARCH_LENGTH && (
        <p className="mt-2 text-xs text-muted-foreground">
          Enter at least {PROBE42.MIN_SEARCH_LENGTH} characters to search
        </p>
      )}
    </div>
  )
}