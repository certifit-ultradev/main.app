// app/terminos-y-condiciones/page.tsx

import type { Metadata } from 'next';
import Link from 'next/link';
import { cn } from '@/src/lib/utils';

export const metadata: Metadata = {
  title: 'Términos y Condiciones de Uso – CERTIFIT',
  description: 'Términos y condiciones que rigen el uso de la plataforma educativa CERTIFIT. Al usar nuestros servicios, usted acepta estos términos.',
};

export default function TermsAndConditionsPage() {
  return (
    // Estilos de Tailwind para el layout principal: contenedor centrado con padding.
    <main className={cn('container mx-auto px-4 py-12 md:px-6 lg:py-16')}>
      
      {/* 'prose': aplica estilos de cascada a todo el texto.
        'prose-lg': aumenta el tamaño de la fuente para mejorar la legibilidad.
        'mx-auto' y 'max-w-4xl': centran el contenido y limitan su ancho.
      */}
      <div className={cn('prose prose-lg mx-auto max-w-4xl')}>
        
        <h1>Términos y Condiciones de Uso – CERTIFIT</h1>
        
        {/* 'lead' es una clase de 'prose' que le da más énfasis al párrafo introductorio. */}
        <p className={cn('lead')}>
          Bienvenido(a) a CERTIFIT, una plataforma educativa en línea dedicada a la formación de entrenadores personales, profesionales y entusiastas del fitness, la salud y el deporte. Al acceder, navegar y utilizar nuestra plataforma, usted acepta estos Términos y Condiciones. Si no está de acuerdo con alguno de los puntos aquí establecidos, le solicitamos que no continúe utilizando nuestros servicios.
        </p>

        <p><strong>Fecha de entrada en vigor:</strong> 25 de septiembre de 2025</p>

        <hr />

        <h2>1. Información Legal</h2>
        <ul>
          <li><strong>Nombre legal de la empresa:</strong> CERTIFIT</li>
          <li><strong>Registro legal / NIT:</strong> 1004870869-0 (registrado bajo persona natural)</li>
          <li><strong>Dirección física:</strong> Carrera 2 #6-69, Armenia, Quindío, Colombia</li>
          <li><strong>Teléfono de contacto:</strong> +57 316 362 8828</li>
          <li><strong>Correo electrónico oficial:</strong> <Link href="mailto:certifit1@hotmail.com" className={cn('text-blue-600 hover:underline')}>certifit1@hotmail.com</Link></li>
        </ul>

        <h2>2. Uso de la Plataforma y Cuentas de Usuario</h2>
        <p>
          Para acceder a los cursos y contenidos, el usuario debe registrarse en la plataforma, proporcionando información veraz y actualizada, incluyendo su nombre completo y demás datos necesarios para la certificación.
        </p>
        <h3>El usuario se compromete a:</h3>
        <ul>
          <li>No compartir su cuenta, nombre de usuario ni contraseña con terceros.</li>
          <li>Mantener la confidencialidad de sus credenciales de acceso.</li>
          <li>Utilizar la plataforma exclusivamente con fines educativos y dentro de la legalidad.</li>
          <li>No descargar, copiar, distribuir ni compartir el contenido sin autorización expresa y por escrito de CERTIFIT.</li>
          <li>Mantener una conducta respetuosa y profesional en foros, chats y otros medios de comunicación.</li>
        </ul>
        <p>
          CERTIFIT podrá suspender o cancelar cualquier cuenta en caso de uso indebido de la plataforma, violación de estos Términos y Condiciones, o actividades fraudulentas o ilegales.
        </p>

        <h2>3. Propiedad Intelectual</h2>
        <p>
          Todo el contenido disponible en la plataforma, incluyendo videos, textos, imágenes, gráficos, documentos, quizzes y exámenes, es propiedad exclusiva de CERTIFIT y está protegido por las leyes nacionales e internacionales sobre propiedad intelectual.
        </p>
        <h3>Está terminantemente prohibido:</h3>
        <ul>
          <li>Copiar, reproducir, distribuir o vender el contenido, parcial o totalmente, sin autorización previa de CERTIFIT.</li>
          <li>Usar el contenido con fines comerciales o distintos a la formación personal.</li>
        </ul>
        <p>
          El acceso al material es personal e intransferible, válido solo durante la vigencia de la inscripción al curso.
        </p>

        <h2>4. Detalles de los Cursos</h2>
        <p>
          Nuestros cursos están enfocados en la formación integral en fitness, salud y deporte.
        </p>
        <ul>
          <li><strong>Formato:</strong> 100% online con videos, textos, quizzes y examen final.</li>
          <li><strong>Duración aproximada:</strong> 12 semanas (aproximadamente 60 horas).</li>
          <li><strong>Idioma:</strong> Español.</li>
          <li><strong>Público objetivo:</strong> estudiantes, entrenadores, profesionales de la salud y cualquier persona interesada en capacitarse en el área.</li>
        </ul>

        <h2>5. Pagos y Política de Reembolsos</h2>
        <h3>Moneda y métodos de pago</h3>
        <p>
          Todos los precios se expresan en pesos colombianos (COP) y son procesados mediante Wompi. Los métodos aceptados incluyen tarjeta de crédito, débito, transferencias bancarias, PayPal y Nequi.
        </p>
        <h3>Reembolsos</h3>
        <p>
          CERTIFIT no ofrece reembolsos una vez que el usuario ha accedido al contenido digital del curso. Si el usuario solicita un reembolso dentro de la primera hora posterior al pago y no ha ingresado al contenido, el reembolso será inmediato. Después de la primera hora, el proceso puede tardar entre 15 y 20 días hábiles. En situaciones excepcionales, como fallas técnicas atribuibles a CERTIFIT, el usuario podrá solicitar un reembolso dentro de las 48 horas posteriores al inconveniente, y CERTIFIT evaluará cada caso.
        </p>

        <h2>6. Aviso de Responsabilidad en Temas de Salud</h2>
        <p>
          La información y el contenido de los cursos de CERTIFIT tienen fines exclusivamente educativos. CERTIFIT no se hace responsable por lesiones, daños físicos o perjuicios derivados de la aplicación práctica de los conocimientos adquiridos, ni por los resultados obtenidos.
        </p>
        <p>
          <strong>Importante:</strong> Antes de iniciar cualquier programa de ejercicio o nutrición, especialmente si existe una condición médica, el usuario debe consultar con un médico o especialista.
        </p>

        <h2>7. Modificaciones y Actualizaciones</h2>
        <p>
          CERTIFIT se reserva el derecho de modificar o actualizar estos Términos y Condiciones en cualquier momento. Los cambios serán notificados a través de la plataforma y el uso continuo de nuestros servicios implica la aceptación de las actualizaciones.
        </p>

        <h2>8. Terminación del Servicio</h2>
        <p>
          CERTIFIT podrá suspender o cancelar la cuenta de cualquier usuario que infrinja estos términos, comparta su cuenta o el contenido, o realice actividades fraudulentas. En estos casos no se realizarán reembolsos.
        </p>

        <h2>9. Política de Tratamiento de Datos Personales</h2>
        <p>
          CERTIFIT cumple con la Ley 1581 de 2012 y el Decreto 1377 de 2013 sobre protección de datos personales.
        </p>
        <h3>Finalidades del tratamiento de datos:</h3>
        <ul>
          <li>Gestionar inscripción, participación y certificación en los cursos.</li>
          <li>Realizar comunicaciones académicas, informativas, administrativas y comerciales.</li>
          <li>Cumplir con obligaciones legales y contractuales.</li>
          <li>Evaluar la calidad y mejorar nuestros servicios.</li>
        </ul>
        <h3>Derechos del usuario:</h3>
        <p>
          Como titular de la información, usted tiene derecho a conocer, actualizar, rectificar sus datos, solicitar prueba de la autorización, ser informado sobre el uso de sus datos y revocar la autorización o solicitar la eliminación de sus datos.
        </p>
        <p>
          Puede ejercer estos derechos a través del correo <Link href="mailto:certifit1@hotmail.com" className={cn('text-blue-600 hover:underline')}>certifit1@hotmail.com</Link> o el teléfono +57 316 362 8828.
        </p>
        
        <hr />

        <h2>10. Contacto</h2>
        <p>
          Si tiene dudas sobre estos Términos y Condiciones, puede comunicarse a través de:
        </p>
        <ul>
          <li><strong>Correo electrónico:</strong> <Link href="mailto:certifit1@hotmail.com" className={cn('text-blue-600 hover:underline')}>certifit1@hotmail.com</Link></li>
          <li><strong>Teléfono:</strong> +57 316 362 8828</li>
          <li><strong>Dirección física:</strong> Carrera 2 #6-69, Armenia, Quindío, Colombia</li>
        </ul>

        <h2>11. Aceptación</h2>
        <p>
          Al registrarse, realizar un pago o utilizar la plataforma, el usuario declara que ha leído, comprendido y aceptado estos Términos y Condiciones y la Política de Tratamiento de Datos Personales.
        </p>
        
      </div>
    </main>
  );
}