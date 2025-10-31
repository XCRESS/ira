import { FileQuestion, LucideIcon } from "lucide-react"
import Link from "next/link"

type Props = {
  icon?: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    href: string
  }
}

export function EmptyState({ icon: Icon = FileQuestion, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl p-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-foreground/5">
        <Icon className="h-8 w-8 text-foreground/50" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-foreground/70">{description}</p>
      {action && (
        <Link
          href={action.href}
          className="mt-6 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}