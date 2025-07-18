// app/terminos-y-condiciones/page.tsx

import type { Metadata } from 'next';
import Link from 'next/link';
import { cn } from '@/src/lib/utils'

export const metadata: Metadata = {
  title: 'Términos y Condiciones – CERTIFIT',
  description: 'Términos y condiciones de uso de los servicios y sitio web de CERTIFIT. Al usar nuestros servicios, usted acepta estos términos.',
};

export default function TermsAndConditionsPage() {
  return (
    // Estilos de Tailwind para el layout principal: contenedor centrado con padding.
    <main className={cn('container mx-auto px-4 py-12 md:px-6 lg:py-16')}>
      
      {/* 'prose': aplica estilos de cascada a todo el texto.
        'prose-lg': aumenta ligeramente el tamaño de la fuente para mejorar la legibilidad.
        'mx-auto' y 'max-w-4xl': centran el contenido y limitan su ancho.
      */}
      <div className={cn('prose prose-lg mx-auto max-w-4xl')}>
        
        <h1>Términos y Condiciones de CERTIFIT</h1>
        
        {/* 'lead' es una clase de 'prose' que le da más énfasis al párrafo introductorio. */}
        <p className={cn('lead')}>
          A continuación se describen los términos y condiciones generales y la autorización para el tratamiento de datos personales que rigen el uso de los servicios ofrecidos en nuestro sitio web.
        </p>

        <hr />

        <h2>1. Aceptación y Autorización de Tratamiento de Datos (Habeas Data)</h2>
        
        <p>
          Al aceptar estos términos y condiciones, usted autoriza de manera expresa, voluntaria, previa, informada e inequívoca a CERTIFIT, en calidad de responsable del tratamiento de datos personales, para que recolecte, almacene, use, circule, procese, actualice y suprima los datos personales que ha suministrado a través de este sitio web o cualquier otro medio autorizado.
        </p>

        <h3>Finalidades del Tratamiento</h3>
        <p>
          La información recopilada será utilizada con las siguientes finalidades:
        </p>
        <ul>
          <li>Procesar solicitudes de inscripción, certificación, consultas o cualquier otro trámite relacionado con los servicios ofrecidos por CERTIFIT.</li>
          <li>Contactarlo para efectos de información comercial, académica, administrativa y de servicio al cliente.</li>
          <li>Cumplir con obligaciones legales, contractuales y regulatorias.</li>
          <li>Realizar encuestas de satisfacción, análisis estadísticos y estudios de mercado.</li>
          <li>Compartir datos con aliados estratégicos o proveedores autorizados, únicamente para el cumplimiento de las finalidades aquí descritas.</li>
        </ul>

        {/* El resto de los elementos de texto heredarán los estilos de 'prose' */}

        <h3>Sus Derechos como Titular de los Datos</h3>
        <p>
          Como titular de la información, usted tiene derecho a:
        </p>
        <ul>
          <li>Conocer, actualizar, rectificar y suprimir sus datos personales.</li>
          <li>Solicitar prueba de la autorización otorgada.</li>
          <li>Ser informado sobre el uso que se ha dado a sus datos.</li>
          <li>Presentar quejas ante la Superintendencia de Industria y Comercio u otra autoridad competente por infracciones a la ley.</li>
        </ul>
        <p>
          Para ejercer estos derechos, podrá contactar a CERTIFIT a través del correo electrónico: {/* Estilos de Tailwind para el enlace */} <Link href="mailto:certifit1@hotmail.com" className={cn('text-blue-600 hover:underline')}>certifit1@hotmail.com</Link> o mediante los canales dispuestos en la sección de contacto.
        </p>

        <h3>Cumplimiento Normativo y Seguridad</h3>
        <p>
          CERTIFIT garantiza que el tratamiento de datos personales se realizará bajo estrictas medidas de seguridad, conforme a lo dispuesto en la Ley 1581 de 2012 (o legislación vigente aplicable), su Decreto Reglamentario 1377 de 2013 y demás normativas sobre protección de datos personales.
        </p>
        
        <div className={cn('my-12 rounded-lg border border-yellow-300 bg-yellow-50 p-6 not-prose')}>
          <h3 className={cn('mt-0 text-xl font-bold text-yellow-900')}>
            Secciones Recomendadas para Completar
          </h3>
          <p className={cn('text-yellow-800')}>
            <strong>Nota importante:</strong> Los términos y condiciones actuales se centran en el tratamiento de datos. Para ofrecer un servicio robusto y proteger legalmente su negocio, es fundamental desarrollar y añadir las siguientes cláusulas:
          </p>
          <ul className={cn('list-disc space-y-2 pl-5 text-yellow-800')}>
            <li>
              <strong>Uso de la Plataforma y los Cursos:</strong> Describir las reglas para el uso de las cuentas de usuario (ej. prohibir compartir cuentas), el acceso a los cursos y el comportamiento esperado de los usuarios.
            </li>
            <li>
              <strong>Propiedad Intelectual:</strong> Especificar que todo el contenido de los cursos (videos, documentos, etc.) es propiedad de CERTIFIT y no puede ser copiado ni distribuido.
            </li>
            <li>
              <strong>Pagos, Precios y Reembolsos:</strong> Detallar los métodos de pago, la moneda, los impuestos aplicables y, muy importante, la política de devoluciones o cancelaciones de los cursos.
            </li>
            <li>
              <strong>Limitación de Responsabilidad:</strong> Incluir un descargo de responsabilidad indicando que el contenido sobre fitness y salud es de carácter informativo y no reemplaza la asesoría de un profesional médico o deportivo.
            </li>
            <li>
              <strong>Modificaciones y Terminación del Servicio:</strong> Reservarse el derecho de modificar los términos o de suspender una cuenta de usuario si se incumplen las condiciones.
            </li>
          </ul>
        </div>
        {/* --- FIN DE LA SECCIÓN DE MARCADORES --- */}
        
        <hr />

        <h2>2. Declaración de Aceptación</h2>
        <p>
          Al hacer clic en &quot;Aceptar&quot; o al utilizar nuestros servicios, usted declara que ha leído y comprendido la política de tratamiento de datos personales de CERTIFIT y que otorga su autorización para el tratamiento de sus datos y acepta los términos y condiciones conforme a lo aquí establecido.
        </p>
        
      </div>
    </main>
  );
}