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
            <label htmlFor="terminos" className={cn("text-sm text-gray-500")}>
                Al enviar este formulario, acepto los <a href="/terms-of-service" className={cn("text-[#0BBBE7] underline")}>Términos y condiciones</a> y la <a href="/privacy-policy" className={cn("text-[#0BBBE7] underline")}>Política de privacidad</a>
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