import { Loader } from '@/components/loader'
import { SubmitButtonProps } from './types'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'

function SubmitButton(props: SubmitButtonProps): JSX.Element {
    const { label, isLoading, customClass = 'w-full bg-[#0BBBE7] text-white py-2 rounded-full hover:bg-[#009fdf] transition-colors', disabled, onClick } = props

    return (
        <Button
            type={onClick ? 'button' : 'submit'}
            onClick={onClick}
            disabled={disabled}
            className={cn(customClass, {
                'opacity-50 cursor-not-allowed': isLoading
            })}
        >
            {isLoading ? (
                <Loader className="h-7 w-7 " />
            ) : (
                label
            )}
        </Button>
    )
}

export default SubmitButton
