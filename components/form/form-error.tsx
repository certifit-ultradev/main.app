import { cn } from '@/lib/utils';
import { FaCircleExclamation } from 'react-icons/fa6';
type FormErrorProps = { error: string | undefined };

export const FormError = ({ error }: FormErrorProps) => {
    return (
        error && (
            <div className={cn('bg-red-400/30 p-2 flex items-center w-full rounded-lg')}>
                <FaCircleExclamation size={20} className={cn('text-red-600')} />
                <p className={cn(' text-sm ml-1 text-red-700')}>{error}</p>
            </div>
        )
    );
};