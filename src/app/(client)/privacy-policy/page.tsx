import type { Metadata } from 'next';
import Link from 'next/link';
import { cn } from '@/src/lib/utils'

export const metadata: Metadata = {
    title: 'Política de Privacidad – CERTIFIT',
    description: 'Conoce cómo CERTIFIT maneja y protege tus datos personales de acuerdo con la legislación vigente.',
};

const PrivacyPolicyPage = async () => {
    return (
        <main className={cn('container mx-auto px-4 py-12 md:px-6 lg:py-16')}>
            <div className={cn('prose prose-lg mx-auto max-w-4xl')}>

                <h1>Política de Tratamiento de Datos Personales – CERTIFIT</h1>

                <p>
                    En cumplimiento de lo dispuesto en la Ley 1581 de 2012 y sus decretos reglamentarios, CERTIFIT,
                    identificado como responsable del tratamiento de datos personales, informa a los titulares de
                    la información que los datos suministrados a través de nuestros formularios, plataformas digitales
                    o cualquier otro medio autorizado serán tratados conforme a esta política y a la normativa vigente.
                </p>

                <hr />

                <h2>1. Responsable del Tratamiento</h2>
                <ul>
                    <li><strong>Nombre:</strong> CERTIFIT</li>
                    <li>
                        <strong>Correo electrónico:</strong>
                        {/* Clases de Tailwind para el color del enlace y el efecto 'hover' */}
                        <Link href="mailto:certifit1@hotmail.com" className={cn('text-blue-600 hover:underline')}>
                            certifit1@hotmail.com
                        </Link>
                    </li>
                    <li><strong>Teléfono de contacto:</strong> 3163628828</li>
                    <li><strong>Dirección:</strong> Carrera 2, 6-69 Armenia</li>
                </ul>

                <hr />

                <h2>2. Finalidades del Tratamiento de Datos</h2>
                <p>
                    Los datos personales recolectados serán utilizados para los siguientes fines:
                </p>
                <ul>
                    <li>Gestionar la inscripción, participación y certificación en los cursos ofrecidos por CERTIFIT.</li>
                    <li>Contactar al titular para fines informativos, académicos, administrativos, comerciales y de seguimiento.</li>
                    <li>Enviar notificaciones sobre nuevos cursos, eventos, actualizaciones o beneficios.</li>
                    <li>Cumplir con obligaciones legales, contractuales y regulatorias.</li>
                    <li>Evaluar la calidad del servicio y realizar estudios internos de mejora.</li>
                </ul>

                {/* El resto del contenido seguirá heredando los estilos de 'prose' automáticamente */}

                <hr />

                <h2>3. Derechos del Titular</h2>
                <p>
                    El titular de los datos personales tiene derecho a:
                </p>
                <ul>
                    <li>Conocer, actualizar y rectificar sus datos.</li>
                    <li>Solicitar prueba de esta autorización.</li>
                    <li>Ser informado sobre el uso dado a sus datos.</li>
                    <li>Presentar quejas ante la autoridad competente por el uso indebido de sus datos.</li>
                    <li>Revocar la autorización y/o solicitar la supresión de los datos cuando lo considere pertinente, salvo que exista un deber legal o contractual que lo impida.</li>
                </ul>

                <hr />

                <h2>4. Seguridad de la Información</h2>
                <p>
                    CERTIFIT adoptará las medidas técnicas, humanas y administrativas necesarias para
                    garantizar la seguridad y confidencialidad de los datos personales, y evitar
                    su pérdida, adulteración, acceso no autorizado o uso indebido.
                </p>

                <hr />

                <h2>5. Procedimiento para el Ejercicio de Derechos</h2>
                <p>
                    El titular podrá ejercer sus derechos enviando una solicitud escrita al correo electrónico{' '}
                    <Link href="mailto:certifit1@hotmail.com" className={cn('text-blue-600 hover:underline')}>
                        certifit1@hotmail.com
                    </Link>
                    {' '}o a través de los canales dispuestos en nuestro sitio web. Las solicitudes serán
                    atendidas en los tiempos establecidos por la ley.
                </p>

                <hr />

                <h2>Vigencia de la Política</h2>
                <p>
                    Esta política rige a partir de su publicación y podrá ser actualizada en cualquier momento.
                    Cualquier cambio será informado oportunamente a través de nuestros canales oficiales.
                </p>

            </div>
        </main>
    );
}

export default PrivacyPolicyPage;