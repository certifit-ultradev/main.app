import { cn } from "@/lib/utils"

interface UserAvatarProps {
    userName?: string
}

function UserAvatar(props: UserAvatarProps) {
    const { userName } = props

    return (
        <div className={cn('flex border-l-[1px] border-font-primary pl-4')}>
            <div className={cn('relative')}>
                <span className={cn('top-0 left-9 absolute w-3.5 h-3.5 bg-green-400 border-2 border-font-primary rounded-full z-50')} />
                <div className={cn('relative w-14 h-14 overflow-hidden rounded-full bg-gray-600')}>
                    <svg
                        className={cn('absolute w-14 h-14 fill-gray-200 rounded-full -bottom-2')}
                        viewBox='0 0 20 20'
                        xmlns='http://www.w3.org/2000/svg'
                    >
                        <path
                            fillRule='evenodd'
                            d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z'
                            clipRule='evenodd'
                        ></path>
                    </svg>
                </div>
            </div>
            <div className={cn('flex flex-col justify-center ml-3')}>
                <span className={cn('font-semibold w-full invert')}>{userName}</span>
            </div>
        </div>
    )
}

export default UserAvatar
