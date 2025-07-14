document.addEventListener('DOMContentLoaded', () => {
    const asignaturaCards = document.querySelectorAll('.asignatura-card');

    // Mapeo de prerrequisitos: qué ramos ABRE cada ramo.
    const prerrequisitosMap = {
        // Semestre 1
        'AUD8041': ['AUD8011', 'AUD8042'],
        'AUD8051': ['AUD8052', 'AUD8071'],
        'AUD8061': ['AUD8062'],
        'AUD8091': ['AUD8092'],
        'AUD8112': [],

        // Semestre 2
        'AUD8011': ['AUD8012'],
        'AUD8052': ['AUD8053', 'AUD8081'],
        'AUD8062': ['AUD8064', 'AUD8071'],
        'AUD8092': ['AUD8093'],
        'AUD8114': [],
        'CIG1001': ['CIG1002'],

        // Semestre 3
        'AUD8012': ['AUD8013', 'AUD8021', 'AUD8801'],
        'AUD8042': ['AUD8044'],
        'AUD8053': [],
        'AUD8081': ['AUD8082'],
        'CIG1002': ['CIG1003'],
        'CFG1_4': [],

        // Semestre 4
        'AUD8013': ['AUD8014'],
        'AUD8044': ['AUD8045'],
        'AUD8021': ['AUD8025'],
        'AUD8071': ['AUD8054', 'AUD8072'],
        'AUD8082': [],
        'AUD8801': ['AUD8802'],
        'CIG1003': ['AUD8115'],

        // Semestre 5
        'AUD8014': ['AUD8015'],
        'AUD8045': ['AUD8047', 'AUD8033'],
        'AUD8025': [],
        'AUD8054': [],
        'AUD8064': ['AUD8065'],
        'AUD8115': [],
        'AUD8802': ['AUD8803'],

        // Semestre 6
        'AUD8015': [],
        'AUD8047': [],
        'AUD8031': ['AUD8033', 'AUD8034', 'AUD8032'],
        'AUD8072': ['AUD8073'],
        'AUD8093': ['AUD8032'],
        'CFG2_4': [],

        // Semestre 7
        'AUD8033': [],
        'AUD8034': ['AUD8803', 'AUD8018'],
        'AUD8073': ['AUD8074'],
        'AUD8065': ['AUD8024'],
        'AUD8032': ['AUD8036', 'AUD8035'],
        'CFG3_4': [],

        // Semestre 8
        'AUD8036': [],
        'AUD8035': ['AUD8018'],
        'AUD8074': ['AUD8018'],
        'AUD8024': [],
        'AUD8803': [],
        'CFG4_4': [],

        // Semestre 9
        'AUD8_OPT1_3': [],
        'AUD8_OPT2_3': [],
        'AUD8_OPT3_3': [],
        'AUD8422': ['AUD8702'],

        // Semestre 10
        'AUD8018': [],
        'AUD8702': []
    };

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

                // Oscurecer las otras tarjetas NO aprobadas, excluyendo la recién clickeada
                asignaturaCards.forEach(otherCard => {
                    if (otherCard !== card && !otherCard.classList.contains('aprobado')) {
                        otherCard.classList.add('se-oscurece');
                    }
                });

                // Resaltar los sucesores directos con el color de la tarjeta clickeada
                const codigoRamoClicado = card.dataset.codigo;
                if (codigoRamoClicado) {
                    const sucesoresDirectos = prerrequisitosMap.hasOwnProperty(codigoRamoClicado) ? prerrequisitosMap[`${codigoRamoClicado}`] : [];
                    sucesoresDirectos.forEach(sucesorCodigo => {
                        const sucesorCard = document.querySelector(`div.asignatura-card[data-codigo="${sucesorCodigo}"]`);
                        if (sucesorCard && !sucesorCard.classList.contains('aprobado')) {
                            sucesorCard.classList.add('abre-ramo'); // Añadir clase para estilo de borde/sombra
                            sucesorCard.style.backgroundColor = clickedCardBgColor; // Color de fondo dinámico
                            sucesorCard.style.borderColor = clickedCardBorderColor; // Color de borde dinámico
                        }
                    });
                }
            } else {
                // Si la tarjeta clickeada está 'aprobado', no debe disparar ningún resaltado.
                // Simplemente permanece en su estado 'aprobado' (gris).
                // `limpiarClasesYEstilosTemporales()` ya eliminó cualquier resaltado anterior.
            }
        });
    });

    // --- Evento para MARCAR/DESMARCAR como APROBADO (doble clic) ---
    asignaturaCards.forEach(card => {
        card.addEventListener('dblclick', (event) => {
            event.preventDefault(); // Evitar el comportamiento predeterminado del doble clic (ej. selección de texto)
            event.stopPropagation(); // Evitar que el evento de clic normal se dispare

            card.classList.toggle('aprobado'); // Alternar la clase 'aprobado'

            // Después de cambiar el estado 'aprobado', limpiar cualquier resaltado temporal
            // para reflejar el nuevo estado de forma limpia.
            limpiarClasesYEstilosTemporales();
            // Si la tarjeta acaba de ser desaprobada, el usuario tendrá que hacer un clic normal para seleccionarla.
        });
    });

    // --- Evento para LIMPIAR todo el resaltado al hacer clic fuera de una tarjeta ---
    document.body.addEventListener('click', (event) => {
        // Si el clic no fue dentro de una tarjeta de asignatura
        if (!event.target.closest('.asignatura-card')) {
            limpiarClasesYEstilosTemporales();
        }
    });

    // Estado inicial al cargar la página: asegurar que no haya resaltados activos
    limpiarClasesYEstilosTemporales();
});
