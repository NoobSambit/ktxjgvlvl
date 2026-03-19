"use client"

import type { TrackerProvider } from "@/platform/integrations/trackers/base"
import { trackerProviderOptions } from "@/modules/trackers/provider-config"

type TrackerProviderPickerProps = {
  activeProvider?: TrackerProvider | null
  compactMobile?: boolean
  disabled?: boolean
  onSelect: (provider: TrackerProvider) => void
  selectedProvider: TrackerProvider
}

export function TrackerProviderPicker({
  activeProvider,
  compactMobile = false,
  disabled = false,
  onSelect,
  selectedProvider
}: TrackerProviderPickerProps) {
  return (
    <div
      className={
        compactMobile
          ? "flex gap-2 overflow-x-auto pb-1 scrollbar-hide sm:grid sm:grid-cols-3"
          : "grid gap-2 sm:grid-cols-3"
      }
    >
      {trackerProviderOptions.map((option) => {
        const isSelected = option.provider === selectedProvider
        const isLocked = Boolean(activeProvider) && activeProvider !== option.provider

        return (
          <button
            key={option.provider}
            className={[
              compactMobile ? "min-w-[11.5rem] shrink-0 sm:min-w-0" : "",
              "rounded-[1rem] border px-3 py-3 text-left transition",
              isSelected
                ? "border-[hsl(265,70%,68%)]/45 bg-[hsl(265,70%,68%)]/14 text-white"
                : "border-white/10 bg-white/[0.03] text-white/72 hover:border-white/18 hover:bg-white/[0.05]",
              isLocked || disabled ? "cursor-not-allowed opacity-55" : ""
            ].join(" ")}
            disabled={disabled || isLocked}
            onClick={() => onSelect(option.provider)}
            type="button"
          >
            <p className="text-sm font-semibold">{option.displayName}</p>
            <p className="mt-1 text-xs leading-5 text-white/56">{option.helperText}</p>
          </button>
        )
      })}
    </div>
  )
}
