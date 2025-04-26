import { MouseEventHandler, ReactElement } from 'react'

export type Options = Array<{
  label: string | ReactElement
  value: string
  handleClick: MouseEventHandler<HTMLElement>
}>

export interface DropdownProps {
  label: string | ReactElement
  options: Options
  id?: string
  hideChevron?: boolean
  optionContainerClass?: string
}

export interface OptionListProps {
  isOpen: boolean
  options: Options
  handleShowOptions: () => void
  optionContainerClass?: string
}

export interface OptionProps {
  value: string
  label: string | ReactElement
  handleClick: MouseEventHandler<HTMLElement>
  handleShowOptions: () => void
}
