import { cn } from '@/lib/utils'
import { ButtonProps } from './types'

function Button(props: ButtonProps) {
  const {
    isDisabled = false,
    handleClick = undefined,
    label,
    classes = '',
    overrideClass = false,
    type = 'button',
  } = props

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={handleClick}
      className={cn({
        'text-lg font-medium rounded-xl bg-button-color focus:outline-none focus:z-10 hover:bg-accent':
          true,
        'max-lg:w-full py-2.5 px-10 me-2 mb-2 bg-primary text-white':
          !overrideClass,
        [classes]: !!classes,
      })}
    >
      {label}
    </button>
  )
}

export default Button
