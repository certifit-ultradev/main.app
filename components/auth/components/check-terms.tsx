import { cn } from "@/lib/utils"
import { RegisterUserFirstStep } from "@/utils/types"
import { ErrorMessage } from "@hookform/error-message"
import { FieldErrors, UseFormRegister } from "react-hook-form"

interface CheckTermsProp {
    errors: FieldErrors<RegisterUserFirstStep>
    register: UseFormRegister<RegisterUserFirstStep>
}

export const CheckTerms = ({ register, errors }: CheckTermsProp) => {
    return (
        <div className={cn('relative mb-4')}>
            <input
                type='checkbox'
                {...register('checkTerms')}
            />
            <label>
                Acepto los {' '}
                <a href='/terminos-y-condiciones' target='_blank'>
                    términos y condiciones
                </a>
            </label>
            <ErrorMessage
                errors={errors}
                name='checkTerms'
                render={({ message }) => (
                    <p className={cn('text-red-500 text-sm text-left w-full')}>
                        {message}
                    </p>
                )}
            />
        </div>
    )
}