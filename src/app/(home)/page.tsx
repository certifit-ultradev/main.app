'use client'

import CircularProgress from "@/components/circular-progress-bar";
import { TopThreeCourses } from "@/components/course/top-courses";
import PublicNavbar from "@/components/public-navbar";
import Spinner from "@/components/spinner";
import { BoardIcon, LaptopIcon } from "@/components/svg/certifit-icons";
import { cn } from "@/lib/utils";
import Image from 'next/image'
import { Suspense } from "react";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa6";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorMessage } from "@hookform/error-message";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import PhoneInput from "react-phone-input-2";
import { FormError } from "@/components/form/form-error";

// Esquema de validación con Zod
const EmailDataSchema = z.object({
    nombre: z.string().min(1, "El nombre es obligatorio"),
    empresa: z.string().min(1, "La empresa es obligatoria"),
    email: z.string().email("El correo debe ser válido"),
    telefono: z.string().min(1, "El teléfono es obligatorio"),
    curso: z.string().min(1, "Selecciona un curso"),
    detalles: z.string().min(1, "Los detalles son obligatorios"),
    terminos: z.boolean().refine(val => val === true, "Debes aceptar los Términos y Condiciones"),
});

// Tipo inferido del esquema
type EmailDataFormValues = z.infer<typeof EmailDataSchema>;

// Tipo para la opción del curso
type CourseOption = {
    canonicalId: string;
    title: string;
};

export default function Home() {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<EmailDataFormValues>({
        resolver: zodResolver(EmailDataSchema),
    });
    const [error, setError] = useState<string>('');
    const [courses, setCourses] = useState<CourseOption[]>([]);

    useEffect(() => {
        async function fetchCourses() {
            try {
                const res = await fetch("/api/courses/top-three");
                const data = await res.json();
                console.log("res", data);
                setCourses(data);
            } catch (error) {
                console.error("Error al cargar cursos:", error);
            }
        }
        fetchCourses();
    }, []);

    const onSubmit = async (formData: EmailDataFormValues) => {
        // El valor del select 'curso' es el canonicalId del curso seleccionado.
        const canonicalId = formData.curso;
        try {
            const res = await fetch(`/api/courses/${canonicalId}/email`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });
            const result = await res.json();
            if (result.success === false) {
                setError(result.message || "Ocurrió un error al enviar el formulario, intente mas tard");
            }
            console.log("Respuesta de la API:", result);
        } catch (error) {
            setError("Ocurrió un error al enviar el formulario, intente mas tarde");
            console.error("Error al enviar el formulario:", error);
        }
    };

    return (
        <div className={cn('bg-[#121313]')}>
            <PublicNavbar />
            <section className={cn('nn:m-4 sm:m-8 md:m-16 py-10 sm:py-20 lg:py-24 px-4 sm:px-2 lg:px-8 rounded-3xl bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-[#3D629A33] via-[#1B1C1E]  to-[#141517]')}>
                <div className={cn('max-w-7xl mx-auto flex flex-col md:flex-row nn:flex-col-reverse xs:flex-col-reverse items-start md:items-center justify-between')}>
                    <div className={cn('w-full md:w-1/2 lg:w-1/2 space-y-4')}>
                        <div className={cn('flex-none justify-center nn:ml-2 ml-6 sm:ml-12 xs:items-center')}>
                            <h2 className={cn('text-white text-4xl sm:text-5xl md:text-6xl font-bold leading-tight')}>
                                Tu Ruta hacia una <br className={cn('hidden sm:block')} />
                                mejor versión de <br className={cn('hidden sm:block')} />
                                <span className={cn('inline-block')}>ti mismo</span>
                            </h2>
                            <p className={cn('text-gray-300 text-lg sm:text-xl max-w-md')}>
                                Certifit es la primera academia virtual enfocada en formar entrenadores personales altamente calificados.
                            </p>

                            <div className={cn('nn:flex nn:justify-center nn:w-full')}>
                                <a href="/dashboard" className={cn('inline-flex items-center mt-6 px-6 py-3 bg-[#0BBBE7] hover:bg-[#009fdf] font-semibold rounded-full transition-colors text-white')}>
                                    Explorar cursos <span className={cn('ml-2')}>→</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className={cn('relative w-full md:w-1/2 lg:w-1/2 mt-10 md:mt-0 flex justify-center md:justify-center nn:mb-10')}>
                        <div className={cn('relative')}>
                            <div className={cn('absolute inset-0 rounded-full border-[16px] border-gray-800')}></div>
                            <Image src="https://vnruzfzvnvdhb848.public.blob.vercel-storage.com/public/trainer_1-3XsmrTsq0RrcTtYZpXgf2EcVP4cyw6.png"
                                width={446}
                                height={447}
                                alt="Entrenador"
                                className={cn('relative z-9 rounded-full w-64 h-64 object-cover')} />

                            <div className={cn('absolute top-0 left-[-1rem] bg-white text-black p-2 rounded-lg shadow-md flex items-center space-x-1')}>
                                <div className={cn('flex items-center justify-center w-12 h-12 bg-[#0BBBE7] rounded-xl')}><LaptopIcon width={36} height={34} className={cn('')} /></div>
                                <div className={cn('flex flex-col text-sm font-medium')}>
                                    <span>1K+</span>
                                    <span className={cn('text-gray-700')}>Videos</span>
                                </div>
                            </div>

                            <div className={cn('absolute top-1/2 right-[-3rem] sm:right-[-4rem] bg-white text-black p-3 rounded-xl shadow-md flex flex-col items-center space-y-1 w-max transform -translate-y-1/2')}>
                                <div className={cn('w-8 h-8')}><CircularProgress progress={80} size={40} strokeWidth={6} /></div>
                                <span className={cn('text-sm font-medium text-gray-700')}>Cursos online</span>
                            </div>

                            <div className={cn('absolute bottom-0 left-0 sm:left-[-2rem] bg-white text-black p-3 rounded-xl shadow-md flex items-center space-x-2 w-max')}>
                                <div className={cn('flex items-center justify-center w-12 h-12 bg-[#0BBBE7] rounded-xl')}><BoardIcon width={36} height={34} className={cn('')} /></div>
                                <div className={cn('flex flex-col text-sm font-medium')}>
                                    <span>Variedad</span>
                                    <span className={cn('text-gray-700')}>Tutores</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section
                id="about-us"
                className={cn("text-white py-16 px-4 sm:px-6 lg:px-8")}
            >
                <div className={cn("flex flex-col max-w-7xl mx-auto")}>
                    <div className={cn("max-w-2xl mx-auto text-center mb-8")}>
                        <h2 className={cn("text-3xl sm:text-4xl font-bold")}>Acerca de nosotros</h2>
                    </div>

                    {/* Carrusel en pantallas pequeñas */}
                    <div
                        className={cn(
                            // contenedor general
                            "relative flex overflow-x-auto snap-x snap-mandatory gap-4",
                            // opcionalmente, en pantallas grandes podrías mostrarlo como grid:
                            // "lg:grid lg:grid-cols-3 lg:gap-8 lg:overflow-hidden"
                            "md:grid md:grid-cols-3 md:gap-8 md:overflow-hidden"
                        )}
                    >
                        {/* Slide 1 */}
                        <div
                            className={cn(
                                "snap-center flex-shrink-0 w-full md:w-auto",
                                "text-center px-4 py-2"
                            )}
                            style={{ scrollSnapAlign: "center" }}
                        >
                            <h3 className={cn("text-lg font-semibold text-white mb-2")}>
                                Nuestro líder
                            </h3>
                            <p className={cn("text-sm leading-relaxed text-gray-300")}>
                                José Garzón, fundador y CEO, es un joven colombiano apasionado por el deporte y por ayudar a otros a adoptar
                                hábitos saludables. Actualmente, está en Estados Unidos adquiriendo conocimientos para compartir con quienes
                                buscan crecer en todos los aspectos de la vida.
                            </p>
                        </div>

                        {/* Slide 2 */}
                        <div
                            className={cn(
                                "snap-center flex-shrink-0 w-full md:w-auto",
                                "text-center px-4 py-2"
                            )}
                            style={{ scrollSnapAlign: "center" }}
                        >
                            <h3 className={cn("text-lg font-semibold text-white mb-2")}>
                                Nuestra visión
                            </h3>
                            <p className={cn("text-sm leading-relaxed text-gray-300")}>
                                Cada persona tiene algo único que ofrecer. Si te apasiona el deporte y quieres aprender y compartir ese conocimiento,
                                estamos aquí para apoyarte. El éxito se construye con hábitos, y el deporte es la disciplina que distingue a quienes
                                buscan superarse de los que prefieren la zona de confort.
                            </p>
                        </div>

                        {/* Slide 3 */}
                        <div
                            className={cn(
                                "snap-center flex-shrink-0 w-full md:w-auto",
                                "text-center px-4 py-2"
                            )}
                            style={{ scrollSnapAlign: "center" }}
                        >
                            <h3 className={cn("text-lg font-semibold text-white mb-2")}>
                                Nuestro compromiso
                            </h3>
                            <p className={cn("text-sm leading-relaxed text-gray-300")}>
                                En CERTIFIT, transformamos vidas a través del deporte y la educación. Fundados por José Garzón, ofrecemos herramientas y
                                conocimientos de calidad para formar entrenadores personales. Más que una academia, somos una fuente de inspiración y motivación,
                                comprometidos a guiar a nuestros estudiantes hacia un futuro más saludable y pleno.
                            </p>
                        </div>
                    </div>

                    {/* Paginación (tres puntos fijos) */}
                    <div className="flex justify-center mt-4 space-x-2 md:hidden">
                        <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                    </div>
                </div>

            </section>

            <section id="courses" className={cn('text-white py-16 px-4 sm:px-6 lg:px-8')}>
                <div className={cn('max-w-7xl mx-auto')}>
                    <h2 id="top-courses" className={cn('text-3xl sm:text-4xl font-bold mb-4 text-center')}>Nuestros Cursos Destacados</h2>
                    <p className={cn('text-gray-300 mb-12 text-center max-w-2xl mx-auto')}>
                        Accede a cursos diseñados por entrenadores certificados con años de experiencia, garantizando un progreso seguro y efectivo.
                    </p>

                    <Suspense fallback={<Spinner />}>
                        <TopThreeCourses />
                    </Suspense>
                </div>
            </section>
            <section id="email-data" className={cn("nn:m-4 sm:m-8 md:m-16 py-10 sm:py-20 lg:py-24 px-4 sm:px-2 lg:px-8 rounded-3xl bg-gradient-to-tl from-[#1B1C1E] via-[#101113] to-[#141517]")}>
                <div className={cn("flex flex-col max-w-7xl nn:items-center lg:items-end mx-auto gap-8 mb-8")}>
                    <div className={cn("flex lg:justify-end")}>
                        <h2 className={cn("text-[#0BBBE7] text-xl font-semibold")}>Contáctanos</h2>
                    </div>
                    <div className={cn("flex lg:justify-end")}>
                        <p className={cn("text-white text-lg")}>Conéctate con un asesor para más información</p>
                    </div>
                </div>
                <div className={cn("max-w-7xl mx-auto flex flex-col md:flex-row items-start gap-8")}>
                    {/* Imagen de la izquierda (visible en pantallas md y superiores) */}
                    <div className={cn("w-full md:w-1/2 hidden md:flex")}>
                        <div className={cn("bg-black rounded-xl overflow-hidden shadow-xl relative")}>
                            <Image src="https://vnruzfzvnvdhb848.public.blob.vercel-storage.com/public/contacto-oJMlgDHcAo1MLaPAMXHcRSXrvm3iSN.png" alt="Imagen Contacto" className={cn("w-full h-auto object-cover rounded-xl")} width={458} height={586} />
                        </div>
                    </div>
                    {/* Formulario a la derecha */}
                    <div className={cn("w-full md:w-1/2 rounded-xl p-8 space-y-6")}>
                        <div className={cn('relative mb-4 text-white')}>
                            <FormError error={error} />
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)} className={cn("space-y-6")} encType="multipart/form-data">
                            <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4")}>
                                <div className={cn("flex flex-col")}>
                                    <label htmlFor="nombre" className={cn("text-sm text-gray-300 mb-1")}>Nombre*</label>
                                    <input type="text" id="nombre" {...register("nombre")} placeholder="Placeholder" className={cn("bg-[#0B0B0B] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#0BBBE7]")} />
                                    <ErrorMessage errors={errors} name="nombre" render={({ message }) => <p className={cn("text-red-500 text-sm")}>{message}</p>} />
                                </div>
                                <div className={cn("flex flex-col")}>
                                    <label htmlFor="empresa" className={cn("text-sm text-gray-300 mb-1")}>Empresa*</label>
                                    <input type="text" id="empresa" {...register("empresa")} placeholder="Placeholder" className={cn("bg-[#0B0B0B] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#0BBBE7]")} />
                                    <ErrorMessage errors={errors} name="empresa" render={({ message }) => <p className={cn("text-red-500 text-sm")}>{message}</p>} />
                                </div>
                            </div>
                            <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4")}>
                                <div className={cn("flex flex-col")}>
                                    <label htmlFor="email" className={cn("text-sm text-gray-300 mb-1")}>Correo electrónico*</label>
                                    <input type="email" id="email" {...register("email")} placeholder="Placeholder" className={cn("bg-[#0B0B0B] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#0BBBE7]")} />
                                    <ErrorMessage errors={errors} name="email" render={({ message }) => <p className={cn("text-red-500 text-sm")}>{message}</p>} />
                                </div>
                                <div className={cn("flex flex-col")}>
                                    <label htmlFor="telefono" className={cn("text-sm text-gray-300 mb-1")}>Teléfono*</label>
                                    <Controller
                                            control={control}
                                            name='telefono'
                                            render={({ field }) => (
                                                <PhoneInput
                                                    country={'co'}
                                                    value={field.value}
                                                    onChange={(value) => field.onChange(value)}
                                                    inputClass={cn(
                                                        'w-full bg-[#0B0B0B] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#0BBBE7]'
                                                    )}
                                                    containerClass={cn('w-full')}
                                                    inputProps={{
                                                        name: 'telefono',
                                                        required: true,
                                                    }}
                                                    specialLabel=''
                                                />
                                            )}
                                        />
                                    <ErrorMessage errors={errors} name="telefono" render={({ message }) => <p className={cn("text-red-500 text-sm")}>{message}</p>} />
                                </div>
                            </div>
                            <div className={cn("flex flex-col")}>
                                <label htmlFor="curso" className={cn("text-sm text-gray-300 mb-1")}>¿En qué curso estás interesado?*</label>
                                <div className={cn("relative")}>
                                    <select id="curso" {...register("curso")} className={cn("bg-[#0B0B0B] border border-gray-700 rounded-lg px-3 py-2 text-white w-full appearance-none focus:outline-none focus:border-[#0BBBE7]")}>
                                        <option value="">-- Selecciona un curso --</option>
                                        {courses.map((course) => (
                                            <option key={course.canonicalId} value={course.canonicalId}>
                                                {course.title}
                                            </option>
                                        ))}
                                    </select>
                                    <div className={cn("absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none")}>▼</div>
                                </div>
                                <ErrorMessage errors={errors} name="curso" render={({ message }) => <p className={cn("text-red-500 text-sm")}>{message}</p>} />
                            </div>
                            <div className={cn("flex flex-col")}>
                                <label htmlFor="detalles" className={cn("text-sm text-gray-300 mb-1")}>Detalles adicionales*</label>
                                <textarea id="detalles" {...register("detalles")} rows={4} placeholder="Escribe información que creas relevante" className={cn("bg-[#0B0B0B] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#0BBBE7]")}></textarea>
                                <ErrorMessage errors={errors} name="detalles" render={({ message }) => <p className={cn("text-red-500 text-sm")}>{message}</p>} />
                            </div>
                            <div className={cn("flex items-start space-x-2")}>
                                <input type="checkbox" id="terminos" {...register("terminos")} className={cn("w-4 h-4 text-[#0BBBE7] bg-[#0B0B0B] border border-gray-700 rounded focus:ring-0")} />
                                <label htmlFor="terminos" className={cn("text-sm text-gray-300")}>
                                    Al enviar este formulario, acepto los <a href="#" className={cn("text-[#0BBBE7] underline")}>Términos y condiciones</a> y la <a href="#" className={cn("text-[#0BBBE7] underline")}>Política de privacidad</a>
                                </label>
                                <ErrorMessage errors={errors} name="terminos" render={({ message }) => <p className={cn("text-red-500 text-sm")}>{message}</p>} />
                            </div>
                            <div className={cn("flex justify-end")}>
                                <Button type="submit" className={cn("bg-[#0BBBE7] text-black px-6 py-3 rounded-md hover:bg-[#009fdf] transition-colors")}>
                                    Enviar
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            <footer className={cn('bg-gradient-to-tr from-[#101113] via-[#1B1C1E] to-[#141517] text-white py-8')}>
                <div className={cn('max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-4 sm:px-6 lg:px-8')}>
                    <div className={cn('flex flex-col items-center md:items-start')}>
                        <div className={cn('mb-4')}>
                            <Image src='https://vnruzfzvnvdhb848.public.blob.vercel-storage.com/public/logo-Xm0liee8ZmpclDqhTaYAi5vKcHPiEz.png'
                                alt='logo'
                                width={200}
                                height={38}
                                className={cn('w-20 mb-6 text-left')}
                            />
                        </div>
                        <p className={cn('text-gray-400 text-sm')}>2024 Ultradevelopment, todos los derechos reservados</p>
                    </div>
                    <div className={cn('flex space-x-4 mt-4 md:mt-0')}>
                        <a href="#" className={cn('text-gray-400 hover:text-white transition-colors')}>
                            <FaInstagram width={20} height={20} />
                        </a>
                        <a href="#" className={cn('text-gray-400 hover:text-white transition-colors')}>
                            <FaFacebook width={20} height={20} />
                        </a>
                        <a href="#" className={cn('text-gray-400 hover:text-white transition-colors')}>
                            <FaTwitter width={20} height={20} />
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
