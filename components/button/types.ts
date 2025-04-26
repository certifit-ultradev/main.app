import { MouseEventHandler, ReactNode } from 'react'

export interface ButtonProps {
  label: string | ReactNode
  handleClick?: MouseEventHandler<HTMLButtonElement>
  classes?: string
  overrideClass?: boolean
  isDisabled?: boolean
  type?: 'button' | 'submit' | 'reset' | undefined
}
