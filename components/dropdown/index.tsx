'use client'

import { useCallback, useState } from 'react'
import { DropdownProps } from './types'
import ListOfOptions from './components/optionList'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

function Dropdown(props: DropdownProps): JSX.Element {
  const {
    label,
    options,
    id = 'dropdown',
    hideChevron = false,
    optionContainerClass,
  } = props
  const [showOptions, setShowOptions] = useState<boolean>(false)

  const handleShowOptions = useCallback(() => {
    setShowOptions(!showOptions)
  }, [showOptions])

  return (
    <div className={cn('relative flex flex-col')}>
      <button
        id={id}
        data-dropdown-toggle='dropdown'
        className={cn('self-center text-text bg-transparent font-medium text-sm inline-flex items-center justify-around')}
        type='button'
        onClick={handleShowOptions}
      >
        {label}
        {!hideChevron && <ChevronDown className={cn('text-white ml-4')} />}
      </button>
      <ListOfOptions
        optionContainerClass={optionContainerClass}
        handleShowOptions={handleShowOptions}
        options={options}
        isOpen={showOptions}
      />
    </div>
  )
}

export default Dropdown
