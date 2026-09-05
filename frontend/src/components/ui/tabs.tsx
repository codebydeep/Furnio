import * as React from "react"
import { cn } from "@/lib/utils"

/* ── Tabs context ──────────────────────────────────────────── */
interface TabsCtx { active: string; setActive: (v: string) => void }
const TabsContext = React.createContext<TabsCtx>({ active: '', setActive: () => {} })

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue: string
  value?: string
  onValueChange?: (v: string) => void
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ defaultValue, value, onValueChange, className, children, ...props }, ref) => {
    const [internal, setInternal] = React.useState(defaultValue)
    const active = value ?? internal
    const setActive = (v: string) => { setInternal(v); onValueChange?.(v) }
    return (
      <TabsContext.Provider value={{ active, setActive }}>
        <div ref={ref} className={cn("w-full", className)} {...props}>{children}</div>
      </TabsContext.Provider>
    )
  }
)
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="tablist"
      className={cn(
        "inline-flex h-9 items-center gap-1 rounded-lg bg-[var(--surface-2)] p-1 text-[var(--text-muted)]",
        className
      )}
      {...props}
    />
  )
)
TabsList.displayName = "TabsList"

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { value: string }
const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, children, ...props }, ref) => {
    const { active, setActive } = React.useContext(TabsContext)
    const isActive = active === value
    return (
      <button
        ref={ref}
        role="tab"
        aria-selected={isActive}
        onClick={() => setActive(value)}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          isActive
            ? "bg-[var(--surface)] text-[var(--text)] shadow-sm"
            : "hover:text-[var(--text)]",
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
TabsTrigger.displayName = "TabsTrigger"

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> { value: string }
const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, ...props }, ref) => {
    const { active } = React.useContext(TabsContext)
    if (active !== value) return null
    return (
      <div
        ref={ref}
        role="tabpanel"
        className={cn("mt-2 focus-visible:outline-none", className)}
        {...props}
      />
    )
  }
)
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
