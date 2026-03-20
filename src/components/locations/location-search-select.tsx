"use client"

import { ChevronDown, Loader2, Search, X } from "lucide-react"
import { useDeferredValue, useEffect, useId, useRef, useState, type KeyboardEvent } from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

export type LocationSearchOption = {
  key: string
  label: string
  secondaryLabel?: string
}

type LocationSearchSelectProps = {
  label: string
  placeholder: string
  searchPlaceholder?: string
  helperText?: string
  emptyText?: string
  minQueryLength?: number
  required?: boolean
  disabled?: boolean
  selectedOption: LocationSearchOption | null
  onSelect: (option: LocationSearchOption) => void
  onClear?: () => void
  search: (query: string) => Promise<LocationSearchOption[]>
  tone?: "light" | "dark"
}

export function LocationSearchSelect({
  label,
  placeholder,
  searchPlaceholder,
  helperText,
  emptyText = "No matches found.",
  minQueryLength = 0,
  required = false,
  disabled = false,
  selectedOption,
  onSelect,
  onClear,
  search,
  tone = "light"
}: LocationSearchSelectProps) {
  const inputId = useId()
  const listboxId = `${inputId}-listbox`
  const containerRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const searchRef = useRef(search)
  const requestIdRef = useRef(0)
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const deferredQuery = useDeferredValue(query)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [options, setOptions] = useState<LocationSearchOption[]>([])

  useEffect(() => {
    searchRef.current = search
  }, [search])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    window.addEventListener("mousedown", handlePointerDown)
    return () => window.removeEventListener("mousedown", handlePointerDown)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    searchInputRef.current?.focus()
  }, [isOpen])

  useEffect(() => {
    if (disabled && isOpen) {
      setIsOpen(false)
    }
  }, [disabled, isOpen])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    if (deferredQuery.trim().length < minQueryLength) {
      setOptions([])
      setIsLoading(false)
      setActiveIndex(0)
      return
    }

    const nextRequestId = requestIdRef.current + 1
    requestIdRef.current = nextRequestId
    setIsLoading(true)

    searchRef.current(deferredQuery.trim())
      .then((nextOptions) => {
        if (requestIdRef.current !== nextRequestId) {
          return
        }

        setOptions(nextOptions)
        setActiveIndex(0)
      })
      .catch(() => {
        if (requestIdRef.current !== nextRequestId) {
          return
        }

        setOptions([])
      })
      .finally(() => {
        if (requestIdRef.current === nextRequestId) {
          setIsLoading(false)
        }
      })
  }, [deferredQuery, isOpen, minQueryLength])

  function openPanel() {
    if (disabled) {
      return
    }

    setIsOpen(true)
    setQuery("")
  }

  function closePanel() {
    setIsOpen(false)
    setQuery("")
    triggerRef.current?.focus()
  }

  function handleSelect(option: LocationSearchOption) {
    onSelect(option)
    closePanel()
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      openPanel()
    }
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActiveIndex((current) => Math.min(current + 1, Math.max(options.length - 1, 0)))
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveIndex((current) => Math.max(current - 1, 0))
    }

    if (event.key === "Enter" && options[activeIndex]) {
      event.preventDefault()
      handleSelect(options[activeIndex])
    }

    if (event.key === "Escape") {
      event.preventDefault()
      closePanel()
    }
  }

  const shouldShowQueryHint = deferredQuery.trim().length < minQueryLength
  const isDark = tone === "dark"

  return (
    <div className="relative space-y-2" ref={containerRef}>
      <div className="flex items-center justify-between gap-3">
        <label className={cn("text-sm font-medium", isDark ? "text-white" : "text-slate-900")} htmlFor={inputId}>
          {label}
          {required ? <span className="ml-1 text-[hsl(25,90%,55%)]">*</span> : null}
        </label>
        {selectedOption && onClear ? (
          <button
            className={cn(
              "text-xs font-medium transition",
              isDark ? "text-white/55 hover:text-white" : "text-slate-500 hover:text-slate-900"
            )}
            onClick={() => onClear()}
            type="button"
          >
            Clear
          </button>
        ) : null}
      </div>

      <button
        aria-controls={listboxId}
        aria-expanded={isOpen}
        className={cn(
          "flex min-h-11 w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60",
          isDark
            ? "border-white/10 bg-white/[0.04] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] focus-visible:ring-white/10"
            : "border-border/80 bg-white text-slate-900 focus-visible:ring-primary/10",
          isOpen
            ? isDark
              ? "border-[hsl(265,70%,65%)]/45 ring-4 ring-[hsl(265,70%,65%)]/12"
              : "border-primary/50 ring-4 ring-primary/10"
            : isDark
              ? "hover:border-white/20"
              : "hover:border-primary/30"
        )}
        disabled={disabled}
        id={inputId}
        onClick={() => (isOpen ? closePanel() : openPanel())}
        onKeyDown={handleTriggerKeyDown}
        ref={triggerRef}
        type="button"
      >
        <div className="min-w-0">
          {selectedOption ? (
            <>
              <p className="truncate font-medium">{selectedOption.label}</p>
              {selectedOption.secondaryLabel ? (
                <p className={cn("truncate text-xs", isDark ? "text-white/50" : "text-muted-foreground")}>
                  {selectedOption.secondaryLabel}
                </p>
              ) : null}
            </>
          ) : (
            <span className={cn(isDark ? "text-white/38" : "text-slate-400")}>{placeholder}</span>
          )}
        </div>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "h-4 w-4 shrink-0 transition",
            isDark ? "text-white/45" : "text-slate-400",
            isOpen ? "rotate-180" : ""
          )}
        />
      </button>

      {helperText ? <p className={cn("text-xs", isDark ? "text-white/55" : "text-slate-500")}>{helperText}</p> : null}

      {isOpen ? (
        <>
          <button
            aria-hidden="true"
            className="fixed inset-0 z-30 bg-black/40 sm:hidden"
            onClick={closePanel}
            type="button"
          />

          <div
            className={cn(
              "fixed inset-x-0 bottom-0 z-40 rounded-t-[2rem] border p-4 shadow-2xl sm:absolute sm:inset-auto sm:left-0 sm:right-0 sm:top-full sm:z-50 sm:mt-2 sm:rounded-[1.5rem]",
              isDark
                ? "border-white/10 bg-[hsl(265,25%,10%)]"
                : "border-slate-200 bg-white"
            )}
          >
            <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-white/10 sm:hidden" />

            <div className="space-y-3">
              <div className="relative">
                <Search
                  className={cn(
                    "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2",
                    isDark ? "text-white/45" : "text-slate-400"
                  )}
                />
                <Input
                  autoComplete="off"
                  className={cn(
                    "pl-9 pr-10",
                    isDark &&
                      "border-white/10 bg-white/[0.04] text-white placeholder:text-white/35 focus:border-[hsl(265,70%,65%)]/40 focus:ring-[hsl(265,70%,65%)]/10"
                  )}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder={searchPlaceholder ?? placeholder}
                  ref={searchInputRef}
                  value={query}
                />
                {query ? (
                  <button
                    aria-label={`Clear ${label.toLowerCase()} search`}
                    className={cn(
                      "absolute right-3 top-1/2 -translate-y-1/2 transition",
                      isDark ? "text-white/50 hover:text-white" : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => setQuery("")}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>

              <div
                className={cn(
                  "max-h-[45vh] overflow-y-auto rounded-[1.25rem] border p-2",
                  isDark ? "border-white/10 bg-black/10" : "border-slate-200 bg-slate-50"
                )}
              >
                {isLoading ? (
                  <div
                    className={cn(
                      "flex items-center justify-center gap-2 px-3 py-5 text-sm",
                      isDark ? "text-white/55" : "text-muted-foreground"
                    )}
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching...
                  </div>
                ) : shouldShowQueryHint ? (
                  <div className={cn("px-3 py-5 text-sm", isDark ? "text-white/55" : "text-muted-foreground")}>
                    Type at least {minQueryLength} character{minQueryLength === 1 ? "" : "s"}.
                  </div>
                ) : options.length === 0 ? (
                  <div className={cn("px-3 py-5 text-sm", isDark ? "text-white/55" : "text-muted-foreground")}>
                    {emptyText}
                  </div>
                ) : (
                  <ul aria-label={label} id={listboxId} role="listbox" className="space-y-1">
                    {options.map((option, index) => {
                      const isActive = index === activeIndex
                      const isSelected = selectedOption?.key === option.key

                      return (
                        <li key={option.key} role="option" aria-selected={isSelected}>
                          <button
                            className={cn(
                              "w-full rounded-[1rem] px-3 py-3 text-left transition",
                              isActive || isSelected
                                ? isDark
                                  ? "bg-[hsl(265,70%,65%)]/15 text-white"
                                  : "bg-[hsl(265,70%,65%)]/10 text-slate-900"
                                : isDark
                                  ? "text-foreground hover:bg-white/5"
                                  : "text-slate-700 hover:bg-white"
                            )}
                            onClick={() => handleSelect(option)}
                            onMouseEnter={() => setActiveIndex(index)}
                            type="button"
                          >
                            <p className="font-medium">{option.label}</p>
                            {option.secondaryLabel ? (
                              <p className={cn("text-xs", isDark ? "text-white/50" : "text-muted-foreground")}>
                                {option.secondaryLabel}
                              </p>
                            ) : null}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
