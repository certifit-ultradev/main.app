export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    return (
        <div className='items-center justify-center h-screen'>
            PaymentReview | ID recibido: <strong>{id}</strong>
        </div>
    );
};
