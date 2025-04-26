import { useCallback, MouseEventHandler } from 'react'

import { OptionProps } from '../../types'
import { cn } from '@/lib/utils'

function Option(props: OptionProps): JSX.Element {
  const { handleClick, label, value, handleShowOptions } = props

  const handleClickItem = useCallback<MouseEventHandler<HTMLLIElement>>((e) => {
    handleClick(e)

    handleShowOptions()
  }, [handleClick, handleShowOptions])

  return (
    <li value={value} onClick={handleClickItem}>
      <span
        className={cn('cursor-pointer block py-2 w-full px-10 hover:bg-gray-600')}
        data-value={value}
      >
        {label}
      </span>
    </li>
  )
}

export default Option
