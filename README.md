TurnoFácil
Portfolio demo de una aplicación responsive de reservas para profesionales y pequeños negocios. El sitio público presenta un estudio ficticio; el panel administrativo es una vista de ejemplo.

Funcionalidades
Presentación pública, servicios, precios ilustrativos, preguntas frecuentes y contacto de demostración.
Flujo de reserva en tres pasos, selección de profesional, fecha y horarios calculados por duración.
Validación de datos y prevención de superposición con reservas activas en el almacenamiento local.
Consulta y cancelación local de reservas usando el correo electrónico.
Panel con reservas, estados, filtros, búsqueda, reprogramación, configuración de servicios, disponibilidad y listado de clientes.
Datos iniciales ficticios y navegación adaptable a celular.
Tecnologías
HTML5 semántico, CSS3 y JavaScript vanilla. No requiere paquetes ni proceso de compilación.

Instalación y uso
Con Node.js instalado, ejecutá node server.js dentro de esta carpeta y abrí http://127.0.0.1:8000. El servidor solo escucha en tu computadora y no instala dependencias.
Probá el flujo de reserva en la sección “Reservar turno”. Los datos de ejemplo empiezan al día siguiente.
Abrí admin.html para filtrar y modificar las reservas de demostración.
El botón “Restablecer datos de ejemplo” vuelve al estado inicial.
Configuración
Los servicios, profesionales y datos ficticios iniciales están en js/data.js. Los horarios de trabajo ilustrativos se muestran en admin.html; la disponibilidad de reservas se calcula en js/main.js. La fecha se interpreta en la zona local del navegador.

Limitaciones de la demo
No procesa reservas reales ni envía correos, mensajes o notificaciones. La confirmación solo aparece en pantalla.
Las reservas y cambios se guardan en localStorage del navegador. No se sincronizan entre dispositivos o usuarios y pueden borrarse al limpiar los datos del sitio.
El panel no tiene autenticación y no es adecuado para administrar información real.
La comprobación de solapamientos se hace en el almacenamiento local y no es atómica entre pestañas; no garantiza exclusión concurrente. Para producción se requiere backend y base de datos con una operación atómica que reserve el horario, autenticación segura para el personal, autorización del lado del servidor y controles de privacidad.
Servicios y profesionales son ejemplos; los datos de contacto son ficticios.
