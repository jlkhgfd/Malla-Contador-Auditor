document.addEventListener('DOMContentLoaded', () => {
    const asignaturaCards = document.querySelectorAll('.asignatura-card');

    // --- NUEVO Y CRÍTICO: Mapeo de TODOS los prerrequisitos para CADA ramo ---
    // ¡IMPORTANTE!: ESTE MAPA DEBE SER COMPLETADO Y VERIFICADO POR TI
    // contra tu 'Plan 8.1.pdf' para asegurar la exactitud.
    // Cada entrada: 'CODIGO_RAMO_QUE_REQUIERE': ['PREREQUISITO1_NECESARIO', 'PREREQUISITO2_NECESARIO'],
    // Si no tiene prerrequisitos de otros ramos (ej. Admision), dejarlo como array vacío [].
    const prerequisitesOfCourse = {
        // Semestre 1 (Normalmente, solo requieren ADMISION, no otros ramos)
        'AUD8041': [],
        'AUD8051': [],
        'AUD8061': [],
        'AUD8091': [],
        'AUD8112': [],

        // Semestre 2
        'AUD8011': ['AUD8041'], // Ejemplo: Si Principios de Contabilidad IFRS (AUD8011) requiere Sociedad y Entorno Legal (AUD8041)
        'AUD8052': ['AUD8051'],
        'AUD8062': ['AUD8061'],
        'AUD8092': ['AUD8091'],
        'AUD8114': [], // Asume no tiene prerrequisitos de ramos
        'CIG1001': [], // Asume no tiene prerrequisitos de ramos

        // Semestre 3
        'AUD8012': ['AUD8011'],
        'AUD8042': ['AUD8041'],
        'AUD8053': ['AUD8052'],
        'AUD8081': ['AUD8052'],
        'CIG1002': ['CIG1001'],
        'CFG1_4': [], // Asume no tiene prerrequisitos de ramos

        // Semestre 4
        'AUD8013': ['AUD8012'],
        'AUD8044': ['AUD8042'],
        'AUD8021': ['AUD8012'],
        'AUD8071': ['AUD8051', 'AUD8062'], // EJEMPLO CON 2 PRERREQUISITOS: VERIFICA ESTO CON EL PDF
        'AUD8082': ['AUD8081'],
        'AUD8801': ['AUD8012'],
        'CIG1003': ['CIG1002'],

        // Semestre 5
        'AUD8014': ['AUD8013'],
        'AUD8045': ['AUD8044'],
        'AUD8025': ['AUD8021'],
        'AUD8054': ['AUD8071'], // VERIFICA
        'AUD8064': ['AUD8062'], // VERIFICA
        'AUD8115': ['CIG1003'],
        'AUD8802': ['AUD8801'],

        // Semestre 6
        'AUD8015': ['AUD8014'],
        'AUD8047': ['AUD8045'],
        'AUD8031': [], // VERIFICA
        'AUD8072': ['AUD8071'],
        'AUD8093': ['AUD8092'], // EJEMPLO: Si AUD8093 solo requiere AUD8092. Si requiere más, AGREGARLOS AQUÍ.
        'CFG2_4': [], // Asume no tiene prerrequisitos de ramos

        // Semestre 7
        'AUD8033': ['AUD8045', 'AUD8031'], // VERIFICA CON EL PDF (2 o más prerrequisitos)
        'AUD8034': ['AUD8031'], // VERIFICA
        'AUD8073': ['AUD8072'],
        'AUD8065': ['AUD8064'],
        'AUD8032': ['AUD8031', 'AUD8093'], // EJEMPLO: Verifica esto con el PDF (este podría ser el caso que mencionaste)
        'CFG3_4': [], // Asume no tiene prerrequisitos de ramos

        // Semestre 8
        'AUD8036': ['AUD8032'],
        'AUD8035': ['AUD8032'],
        'AUD8074': ['AUD8073'],
        'AUD8024': ['AUD8065'],
        'AUD8803': ['AUD8802', 'AUD8034'], // EJEMPLO CON 2 PRERREQUISITOS: VERIFICA ESTO CON EL PDF
        'CFG4_4': [], // Asume no tiene prerrequisitos de ramos

        // Semestre 9
        'AUD8_OPT1_3': [], // Asume de acuerdo con programa, no direct pre-req de otros ramos
        'AUD8_OPT2_3': [],
        'AUD8_OPT3_3': [],
        'AUD8422': [], // Prerrequisitos de créditos, no otros ramos específicos

        // Semestre 10
        'AUD8018': ['AUD8034', 'AUD8035', 'AUD8074'], // EJEMPLO CON MÚLTIPLES PRERREQUISITOS: VERIFICA ESTO CON EL PDF
        'AUD8702': ['AUD8422']
    };

    // Helper function para obtener el número de semestre de una tarjeta de ramo
    function getSemester(cardElement) {
        const semesterSection = cardElement.closest('.semestre');
        // Asegúrate de que tus secciones <section class="semestre"> tienen el atributo data-semestre="X"
        return parseInt(semesterSection.dataset.semestre);
    }

    // Función para limpiar SÓLO las clases y estilos temporales de resaltado
    function limpiarClasesYEstilosTemporales() {
        asignaturaCards.forEach(card => {
            card.classList.remove('clickeado', 'se-oscurece', 'abre-ramo');
            // Limpiar estilos inline que fueron aplicados dinámicamente por JS
            card.style.backgroundColor = '';
            card.style.borderColor = '';
            card.style.boxShadow = '';
            card.style.transform = '';
        });
    }

    // --- Evento para SELECCIONAR/DESELECCIONAR y RESALTAR relaciones (un solo clic) ---
    asignaturaCards.forEach(card => {
        card.addEventListener('click', (event) => {
            event.stopPropagation(); // Evita que el clic en la tarjeta se propague al body inmediatamente

            // Determinar si la tarjeta clickeada ya estaba 'clickeada' (naranja)
            const wasCurrentlyHighlighted = card.classList.contains('clickeado');

            // 1. Siempre limpiar *todos* los resaltados temporales de *todas* las tarjetas primero.
            limpiarClasesYEstilosTemporales();

            if (wasCurrentlyHighlighted) {
                // Si el usuario clickeó la misma tarjeta que ya estaba resaltada (naranja),
                // significa que quiere deseleccionarla. `limpiarClasesYEstilosTemporales()` ya hizo el trabajo.
                return; // Salir, ya que no se necesita seleccionar nada nuevo
            }

            // Si llegamos aquí, es porque se está seleccionando una *nueva* tarjeta para resaltar.
            // Solo resaltar si la tarjeta clickeada NO está 'aprobado'.
            if (!card.classList.contains('aprobado')) {
                // Aplicar clase 'clickeado' a la tarjeta recién seleccionada
                card.classList.add('clickeado');

                // Obtener los colores computados de la tarjeta clickeada (que ahora es naranja)
                const clickedCardComputedStyle = window.getComputedStyle(card);
                const clickedCardBgColor = clickedCardComputedStyle.backgroundColor;
                const clickedCardBorderColor = clickedCardComputedStyle.borderColor;

                const clickedCourseCode = card.dataset.codigo;
                if (!clickedCourseCode) {
                    console.error("La tarjeta clickeada no tiene un atributo data-codigo.");
                    return;
                }

                // Obtener el semestre del ramo clickeado
                const clickedSemester = getSemester(card);
                if (isNaN(clickedSemester)) {
                    console.error("No se pudo determinar el semestre del ramo clickeado.");
                    return;
                }


                // Iterar a través de TODAS las otras tarjetas para encontrar posibles sucesores
                asignaturaCards.forEach(potentialSuccessorCard => {
                    const potentialSuccessorCode = potentialSuccessorCard.dataset.codigo;

                    // Saltar la tarjeta clickeada y las tarjetas que ya están aprobadas
                    if (potentialSuccessorCard === card || potentialSuccessorCard.classList.contains('aprobado')) {
                        return;
                    }

                    // Obtener los prerrequisitos para este posible sucesor
                    const requiredPrereqs = prerequisitesOfCourse[potentialSuccessorCode];

                    if (requiredPrereqs && requiredPrereqs.length > 0) {
                        // 1. Verificar si el ramo clickeado es UNO de sus prerrequisitos
                        const isClickedCourseAPrereq = requiredPrereqs.includes(clickedCourseCode);

                        if (isClickedCourseAPrereq) {
                            // 2. Verificar si TODOS los demás prerrequisitos están cumplidos (aprobados)
                            const allOtherPrereqsMet = requiredPrereqs.every(prereqCode => {
                                if (prereqCode === clickedCourseCode) {
                                    return true; // El ramo clickeado cumple su parte
                                }
                                // Buscar el elemento DOM del prerrequisito y verificar si está aprobado
                                const prereqCard = document.querySelector(`div.asignatura-card[data-codigo="${prereqCode}"]`);
                                return prereqCard && prereqCard.classList.contains('aprobado');
                            });

                            if (allOtherPrereqsMet) {
                                // 3. Verificar si el sucesor está en el SEMESTRE INMEDIATO SIGUIENTE
                                const successorSemester = getSemester(potentialSuccessorCard);
                                if (!isNaN(successorSemester) && successorSemester === clickedSemester + 1) {
                                    potentialSuccessorCard.classList.add('abre-ramo'); // Añadir clase para estilo de borde/sombra
                                    potentialSuccessorCard.style.backgroundColor = clickedCardBgColor; // Color de fondo dinámico
                                    potentialSuccessorCard.style.borderColor = clickedCardBorderColor; // Color de borde dinámico
                                }
                            }
                        }
                    }
                });
            } else {
                // Si la tarjeta clickeada está 'aprobado', no debe disparar ningún resaltado.
                // Simplemente permanece en su estado 'aprobado' (gris).
            }
        });
    });

    // --- Evento para MARCAR/DESMARCAR como APROBADO (doble clic) ---
    asignaturaCards.forEach(card => {
        card.addEventListener('dblclick', (event) => {
            event.preventDefault();
            event.stopPropagation();

            card.classList.toggle('aprobado');

            // Después de cambiar el estado 'aprobado', limpiar cualquier resaltado temporal
            limpiarClasesYEstilosTemporales();
        });
    });

    // --- Evento para LIMPIAR todo el resaltado al hacer clic fuera de una tarjeta ---
    document.body.addEventListener('click', (event) => {
        if (!event.target.closest('.asignatura-card')) {
            limpiarClasesYEstilosTemporales();
        }
    });

    // Estado inicial al cargar la página: asegurar que no haya resaltados activos
    limpiarClasesYEstilosTemporales();
});
