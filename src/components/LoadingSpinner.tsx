import { cn } from '../lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'blue' | 'slate' | 'white'
  fullPage?: boolean
  label?: string
}

const sizeMap = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-4',
  lg: 'w-14 h-14 border-4',
}

const colorMap = {
  blue: 'border-gray-300 border-t-blue-500',
  slate: 'border-slate-200 border-t-slate-700',
  white: 'border-white/40 border-t-white',
}

const LoadingSpinner = ({
  size = 'md',
  color = 'blue',
  fullPage = false,
  label = 'Loading',
}: LoadingSpinnerProps) => {
  const spinner = (
    <div
      aria-hidden="true"
      className={cn(
        'rounded-full animate-spin',
        sizeMap[size],
        colorMap[color]
      )}
    />
  )

  const status = (
    <div
      className="inline-flex items-center justify-center"
      role="status"
      aria-live="polite"
    >
      {spinner}
      <span className="sr-only">{label}</span>
    </div>
  )

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
        {status}
      </div>
    )
  }

  return status
}

export default LoadingSpinner
