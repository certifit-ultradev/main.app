import type { JSX } from 'react'

export interface LoaderProps {
  isLoading: boolean
  component?: JSX.Element | Array<JSX.Element> | null
}
