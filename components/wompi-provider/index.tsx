import Script from 'next/script';

interface WompiProviderProps {
    children: React.ReactNode
}

export default function WompiProvider({children}:WompiProviderProps) {
    return (
        <>
            <Script
                src="https://checkout.wompi.co/widget.js"
                strategy="lazyOnload"
            />
            {children}
        </>
    );
}