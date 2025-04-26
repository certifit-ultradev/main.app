import { useMemo } from 'react'

import Option from '../option'
import { OptionListProps } from '../../types'
import { cn } from '@/lib/utils'

function OptionList(props: OptionListProps): JSX.Element {
  const {
    isOpen,
    options,
    handleShowOptions,
    optionContainerClass = '',
  } = props

  const optionList = useMemo(
    () =>
      options.map(({ label, value, handleClick }, key) => (
        <Option
          key={key}
          label={label}
          value={value}
          handleClick={handleClick}
          handleShowOptions={handleShowOptions}
        />
      )),
    [options, handleShowOptions]
  )

  return (
    <div
      id='dropdown'
      className={cn({
        'z-10 bg-white divide-y divide-gray-300 rounded-lg shadow w-auto absolute mt-12':
          true,
        hidden: !isOpen,
        [optionContainerClass]: !!optionContainerClass,
      })}
    >
      <ul
        className={cn('py-2 text-sm text-text')}
        aria-labelledby='dropdownDefaultButton'
      >
        {optionList}
      </ul>
    </div>
  )
}

export default OptionList
