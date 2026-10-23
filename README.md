TurnoFácil

Demo de una aplicación responsive de reservas para profesionales y pequeños negocios. El sitio público presenta un estudio ficticio; el panel administrativo es una vista de ejemplo.

Funcionalidades:

Presentación pública, servicios, precios ilustrativos, preguntas frecuentes y contacto de demostración.

Flujo de reserva en tres pasos, selección de profesional, fecha y horarios calculados por duración.

Validación de datos y prevención de superposición con reservas activas en el almacenamiento local.

Consulta y cancelación local de reservas usando el correo electrónico.

Panel con reservas, estados, filtros, búsqueda, reprogramación, configuración de servicios, disponibilidad y listado de clientes.

Datos iniciales ficticios y navegación adaptable a celular.


Tecnologías
HTML5 semántico, CSS3 y JavaScript vanilla. No requiere paquetes ni proceso de compilación.

Instalación y uso:

Con Node.js instalado, ejecutá node server.js dentro de esta carpeta y abrí http://127.0.0.1:8000.

El servidor solo escucha en tu computadora y no instala dependencias.

Probá el flujo de reserva en la sección “Reservar turno”. Los datos de ejemplo empiezan al día siguiente.

Abrí admin.html para filtrar y modificar las reservas de demostración.

El botón “Restablecer datos de ejemplo” vuelve al estado inicial.

Configuración:
Los servicios, profesionales y datos ficticios iniciales están en js/data.js. Los horarios de trabajo ilustrativos se muestran en admin.html; la disponibilidad de reservas se calcula en js/main.js. La fecha se interpreta en la zona local del navegador.

