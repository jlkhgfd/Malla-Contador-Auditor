document.addEventListener('DOMContentLoaded', () => {
    const asignaturaCards = document.querySelectorAll('.asignatura-card');

    // Mapeo manual de prerrequisitos para facilitar la búsqueda inversa
    // Esto se podría construir dinámicamente si los datos estuvieran en un JSON/JS
    const prerrequisitosMap = {
        // Semestre 1
        'AUD8041': ['AUD8011', 'AUD8042'], // Sociedad y Entorno Legal de la Empresa abre Principios Contabilidad IFRS y Derecho Trabajo
        'AUD8051': ['AUD8052', 'AUD8071'], // Matemáticas I Adm y Negocios abre Matemáticas II y Finanzas Corto Plazo
        'AUD8061': ['AUD8062'], // Sociedad, Organización, Empresa y Personas abre Administración de Empresas
        'AUD8091': ['AUD8092'], // Sistemas Información y Comunicación I abre Sistemas Información y Comunicación II

        // Semestre 2
        'AUD8011': ['AUD8012'], // Principios de Contabilidad IFRS abre Procesos Contabilidad Básica IFRS
        'AUD8052': ['AUD8053', 'AUD8081'], // Matemáticas II Adm y Negocios abre Matemáticas III y Sociedad y Entorno Microeconómico
        'AUD8062': ['AUD8064'], // Administración de Empresas abre Comportamiento Organizacional
        'AUD8092': ['AUD8093'], // Sistemas Información y Comunicación II abre Sistemas Información y Comunicación III
        'CIG1001': ['CIG1002'], // Inglés General I abre Inglés General II

        // Semestre 3
        'AUD8012': ['AUD8013', 'AUD8021', 'AUD8801'], // Procesos Contabilidad Básica IFRS abre Procesos Contabilidad Intermedia, Contabilidad y Procesos de Costos, Inducción Laboral
        // 'AUD8041': ['AUD8042'], // NOTA: AUD8041 ya listado, pero se repite como prerequisito para AUD8042, AUD8044. Ya está arriba.
        'AUD8042': ['AUD8044'], // Derecho del Trabajo y Seguridad Social abre Derecho Tributario
        'AUD8053': [], // No abre nada directamente según el PDF para el siguiente semestre.
        'AUD8081': ['AUD8082'], // Sociedad y Entorno Microeconómico abre Sociedad y Entorno Macroeconómico
        'CIG1002': ['CIG1003'], // Inglés General II abre Inglés General III

        // Semestre 4
        'AUD8013': ['AUD8014', 'AUD8031', 'AUD8802'], // Procesos Contabilidad Intermedia IFRS abre Procesos Contabilidad Superior, Gestión Auditoría I, Práctica I
        'AUD8044': ['AUD8045'], // Derecho Tributario abre Derecho Tributario Empresas
        'AUD8021': ['AUD8025'], // Contabilidad y Procesos de Costos abre Gestión y Control Presupuestario
        'AUD8071': ['AUD8054', 'AUD8072'], // Finanzas de la Empresa Corto Plazo abre Estadísticas Auditoría y Negocios, Finanzas Largo Plazo
        'AUD8082': [], // No abre nada directamente según el PDF para el siguiente semestre.
        'AUD8801': ['AUD8802'], // Inducción laboral profesional abre Práctica I
        'CIG1003': ['AUD8115'], // Inglés General III abre Inglés Específico

        // Semestre 5
        'AUD8014': ['AUD8015'], // Procesos Contabilidad Superior IFRS abre Procesos Contabilidad Avanzada IFRS
        'AUD8045': ['AUD8031', 'AUD8033', 'AUD8047'], // Derecho Tributario Empresas abre Gestión Auditoría I, Auditoría Tributaria, Derecho Tributario Personas
        'AUD8025': [], // No abre nada directamente
        'AUD8054': [], // No abre nada directamente
        'AUD8064': ['AUD8065'], // Comportamiento Organizacional abre Dirección Estratégica de Empresas
        'AUD8115': [], // No abre nada directamente
        'AUD8802': ['AUD8803'], // Práctica I abre Práctica II

        // Semestre 6
        'AUD8015': [], // No abre nada directamente
        'AUD8047': [], // No abre nada directamente
        'AUD8031': ['AUD8032', 'AUD8033', 'AUD8034'], // Gestión en Auditoría I abre Auditoría y Seguridad Sistemas de Información, Auditoría Tributaria, Gestión en Auditoría II
        'AUD8072': ['AUD8073'], // Finanzas de la Empresa Largo Plazo abre Finanzas Corporativas
        'AUD8093': ['AUD8032'], // Sistemas de Información y Comunicación III abre Auditoría y Seguridad Sistemas de Información

        // Semestre 7
        'AUD8033': [], // No abre nada directamente
        'AUD8034': ['AUD8018', 'AUD8803'], // Gestión en Auditoría II abre Juego Auditoría Basado en Riesgos, Práctica II
        'AUD8073': ['AUD8074'], // Finanzas Corporativas abre Gestión de Riesgos
        'AUD8065': ['AUD8024'], // Dirección Estratégica de Empresas abre Control de Gestión Estratégico
        'AUD8032': ['AUD8035', 'AUD8036'], // Auditoría y Seguridad Sistemas de Información abre Auditorías Especiales, Auditoría Forense

        // Semestre 8
        'AUD8036': [], // No abre nada directamente
        'AUD8035': ['AUD8018'], // Auditorías Especiales abre Juego Auditoría Basado en Riesgos
        'AUD8074': ['AUD8018'], // Gestión de Riesgos abre Juego Auditoría Basado en Riesgos
        'AUD8024': [], // No abre nada directamente
        'AUD8803': [], // No abre nada directamente (ya que es la última práctica)

        // Semestre 9 (Asumiendo que los optativos no abren ramos específicos en el plan de estudios)
        'AUD8422': ['AUD8702'], // Metodología de la investigación abre Seminario de Título
    };

    // Objeto para almacenar los nombres de los ramos por su código, para mostrarlos al usuario
    const nombreRamos = {};
    asignaturaCards.forEach(card => {
        const codigoElement = card.querySelector('p strong');
        if (codigoElement) {
            const codigo = codigoElement.textContent.replace('Código: ', '').trim();
            const nombreElement = card.querySelector('h3');
            if (nombreElement) {
                const nombre = nombreElement.textContent.trim();
                nombreRamos[codigo] = nombre;
            }
        }
    });

    asignaturaCards.forEach(card => {
        card.addEventListener('click', () => {
            // Limpiar estados anteriores
            asignaturaCards.forEach(c => {
                c.classList.remove('clicked');
                c.classList.remove('abre-ramo');
            });

            // Disminuir intensidad del ramo clicado
            card.classList.add('clicked');

            const codigoRamoClicadoElement = card.querySelector('p strong');
            if (!codigoRamoClicadoElement) {
                console.error('No se encontró el elemento de código para el ramo clicado.');
                return;
            }
            const codigoRamoClicado = codigoRamoClicadoElement.textContent.replace('Código: ', '').trim();
            const ramosQueAbre = prerrequisitosMap[codigoRamoClicado] || [];

            if (ramosQueAbre.length > 0) {
                ramosQueAbre.forEach(codigoRamoAbierto => {
                    // Buscar la tarjeta de la asignatura que este ramo "abre"
                    // Nota: El selector ':contains' no es estándar CSS, es un hack simple.
                    // Una forma más robusta sería usar un atributo de datos para el código.
                    const ramoAbiertoCard = document.querySelector(`.asignatura-card p strong:contains("${codigoRamoAbierto}")`);
                    if (ramoAbiertoCard) {
                        ramoAbiertoCard.closest('.asignatura-card').classList.add('abre-ramo');
                    }
                });
            } else {
                // Puedes mostrar un mensaje si el ramo no abre nada
                console.log(`El ramo ${nombreRamos[codigoRamoClicado]} no es prerrequisito directo de otros ramos según el mapa.`);
            }
        });
    });

    // Polyfill básico para ':contains' para que el selector funcione en todos los navegadores
    // Esta es una solución simplificada. Para un uso más robusto, se recomienda
    // una estructura de datos más compleja o un enfoque diferente para la búsqueda.
    (function (originalQuerySelectorAll) {
        document.querySelectorAll = function(selector) {
            if (selector.includes(':contains(')) {
                const parts = selector.split(':contains(');
                const baseSelector = parts[0];
                const textToFind = parts[1].slice(0, -1).replace(/"/g, '').replace(/'/g, '');
                const elements = originalQuerySelectorAll.call(this, baseSelector);
                return Array.from(elements).filter(el => el.textContent.includes(textToFind));
            }
            return originalQuerySelectorAll.call(this, selector);
        };
    })(document.querySelectorAll);
});