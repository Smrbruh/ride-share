"use client";
import * as React from "react";
import { ChevronDown, Check, Search as SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
export interface SearchableSelectOption {
  value: string;
  label: string;
  description?: string;
}
interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
  emptyMessage?: string;
  disabled?: boolean;
  label?: string;
}
export function SearchableSelect({ options, value, onChange, placeholder = "Select...", loading, emptyMessage = "No results", disabled, label }: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const listboxId = React.useId();
  const filtered = React.useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return options;
    return options.filter((option) => option.label.toLowerCase().includes(term));
  }, [options, query]);
  const selected = options.find((option) => option.value === value);
  const activeOptionId = filtered[activeIndex] ? `${listboxId}-option-${filtered[activeIndex].value}` : undefined;
  const closeAndRefocus = React.useCallback(() => {
    setOpen(false);
    setQuery("");
    triggerRef.current?.focus();
  }, []);
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  React.useEffect(() => {
    if (open) {
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, filtered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(filtered.length - 1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const option = filtered[activeIndex];
      if (option) {
        onChange(option.value);
        closeAndRefocus();
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      closeAndRefocus();
    } else if (event.key === "Tab") {
      setOpen(false);
      setQuery("");
    }
  };
  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-label={label ?? placeholder}
        className="flex h-11 w-full items-center justify-between rounded-2xl border border-border bg-background px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={cn(!selected && "text-muted-foreground")}>{selected ? selected.label : placeholder}</span>
        <ChevronDown className="h-4 w-4 opacity-60" aria-hidden="true" />
      </button>
      {open ? (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-background shadow-lg animate-fade-in">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <SearchIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type to search"
              role="searchbox"
              aria-label="Search options"
              aria-controls={listboxId}
              aria-activedescendant={activeOptionId}
              autoComplete="off"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          <div id={listboxId} role="listbox" className="max-h-56 overflow-auto p-1">
            {loading ? (
              <p className="px-3 py-3 text-sm text-muted-foreground">Loading...</p>
            ) : filtered.length === 0 ? (
              <p className="px-3 py-3 text-sm text-muted-foreground">{emptyMessage}</p>
            ) : (
              filtered.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  id={`${listboxId}-option-${option.value}`}
                  role="option"
                  aria-selected={option.value === value}
                  onClick={() => {
                    onChange(option.value);
                    closeAndRefocus();
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm",
                    index === activeIndex && "bg-muted"
                  )}
                >
                  <span>
                    {option.label}
                    {option.description ? <span className="ml-2 text-xs text-muted-foreground">{option.description}</span> : null}
                  </span>
                  {option.value === value ? <Check className="h-4 w-4 text-accent" aria-hidden="true" /> : null}
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
