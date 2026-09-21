const preguntasReto = [
  // BÉISBOL
  {
    pregunta: '¿Cuántas bases tiene un campo de béisbol?',
    opciones: ['Dos', 'Tres', 'Cuatro'],
    correcta: 2,
  },
  {
    pregunta: '¿Con qué se golpea la pelota?',
    opciones: ['Con un bate', 'Con un guante', 'Con un casco'],
    correcta: 0,
  },
  {
    pregunta: '¿Qué usamos para atrapar la pelota?',
    opciones: ['Un casco', 'Un guante', 'Una gorra'],
    correcta: 1,
  },
  {
    pregunta: '¿Quién lanza la pelota hacia el bateador?',
    opciones: ['El receptor', 'El jardinero', 'El lanzador'],
    correcta: 2,
  },
  {
    pregunta: '¿Quién se coloca detrás del bateador?',
    opciones: ['El receptor', 'El corredor', 'El jardinero'],
    correcta: 0,
  },
  {
    pregunta: '¿Qué jugador intenta golpear la pelota?',
    opciones: ['El árbitro', 'El bateador', 'El entrenador'],
    correcta: 1,
  },
  {
    pregunta: '¿Qué debe hacer el bateador después de conectar la pelota?',
    opciones: ['Sentarse', 'Correr a primera base', 'Soltar el casco'],
    correcta: 1,
  },
  {
    pregunta: '¿Cuál es la primera base que debe tocar el corredor?',
    opciones: ['Primera base', 'Segunda base', 'Tercera base'],
    correcta: 0,
  },
  {
    pregunta: '¿Cuántos outs terminan el turno ofensivo de un equipo?',
    opciones: ['Uno', 'Dos', 'Tres'],
    correcta: 2,
  },
  {
    pregunta: '¿Cómo se llama un batazo que permite recorrer todas las bases?',
    opciones: ['Home run', 'Strike', 'Foul'],
    correcta: 0,
  },
  {
    pregunta: '¿Quién toma las decisiones durante el juego?',
    opciones: ['El público', 'El árbitro', 'El vendedor'],
    correcta: 1,
  },
  {
    pregunta: '¿Qué significa “strike”?',
    opciones: [
      'Una carrera',
      'Un lanzamiento bueno no conectado',
      'Un cambio de jugador',
    ],
    correcta: 1,
  },
  {
    pregunta: '¿Qué ocurre después de tres strikes?',
    opciones: ['El bateador es out', 'Marca una carrera', 'Avanza dos bases'],
    correcta: 0,
  },
  {
    pregunta: '¿Cómo se llama la zona donde esperan los jugadores?',
    opciones: ['Dugout', 'Gradería', 'Jardín'],
    correcta: 0,
  },
  {
    pregunta: '¿Cómo se llama el espacio interior formado por las bases?',
    opciones: ['Diamante', 'Tribuna', 'Banquillo'],
    correcta: 0,
  },
  {
    pregunta: '¿Qué protege las manos del bateador?',
    opciones: ['Las medias', 'Los guantes de bateo', 'La gorra'],
    correcta: 1,
  },
  {
    pregunta: '¿Dónde se anota una carrera?',
    opciones: ['En segunda base', 'En el dugout', 'En home'],
    correcta: 2,
  },
  {
    pregunta: '¿Qué debe tocar el corredor para avanzar correctamente?',
    opciones: ['Las bases', 'La malla', 'El bate'],
    correcta: 0,
  },
  {
    pregunta: '¿Cómo se llama un batazo que sale fuera de las líneas?',
    opciones: ['Hit', 'Foul', 'Home run'],
    correcta: 1,
  },
  {
    pregunta: '¿Qué jugador defiende cerca de la primera base?',
    opciones: ['Primera base', 'Receptor', 'Bateador'],
    correcta: 0,
  },
  {
    pregunta: '¿Qué jugador defiende cerca de la segunda base?',
    opciones: ['Jardinero', 'Segunda base', 'Receptor'],
    correcta: 1,
  },
  {
    pregunta: '¿Qué jugador defiende cerca de la tercera base?',
    opciones: ['Tercera base', 'Lanzador', 'Árbitro'],
    correcta: 0,
  },
  {
    pregunta: '¿Dónde juegan los jardineros?',
    opciones: ['En las gradas', 'En el campo exterior', 'En el dugout'],
    correcta: 1,
  },
  {
    pregunta: '¿Qué necesita hacer la defensa para retirar a un corredor?',
    opciones: ['Hacer un out', 'Cambiar el uniforme', 'Pedir tiempo siempre'],
    correcta: 0,
  },
  {
    pregunta: '¿Cómo se llama un batazo que permite llegar a primera base?',
    opciones: ['Hit', 'Tiempo', 'Entrada'],
    correcta: 0,
  },
  {
    pregunta: '¿Qué equipo batea?',
    opciones: ['El equipo ofensivo', 'El equipo defensivo', 'Los árbitros'],
    correcta: 0,
  },
  {
    pregunta: '¿Qué equipo intenta hacer outs?',
    opciones: ['El público', 'El equipo defensivo', 'El equipo ofensivo'],
    correcta: 1,
  },
  {
    pregunta: '¿Cómo se llama cada parte de un juego de béisbol?',
    opciones: ['Entrada', 'Descanso', 'Partido'],
    correcta: 0,
  },
  {
    pregunta: '¿Qué se usa para marcar las líneas del terreno?',
    opciones: ['Agua', 'Cal', 'Arena mojada'],
    correcta: 1,
  },
  {
    pregunta: '¿Cuál es el objetivo del equipo ofensivo?',
    opciones: ['Anotar carreras', 'Esconder la pelota', 'Cambiar las bases'],
    correcta: 0,
  },

  // SEGURIDAD
  {
    pregunta: '¿Qué usamos para proteger la cabeza al batear?',
    opciones: ['Una gorra', 'Un casco', 'Un guante'],
    correcta: 1,
  },
  {
    pregunta: '¿Qué debemos hacer antes de entrenar?',
    opciones: ['Calentar', 'Dormir en el campo', 'Correr sin escuchar'],
    correcta: 0,
  },
  {
    pregunta: '¿Qué hacemos si sentimos dolor?',
    opciones: ['Seguimos sin avisar', 'Avisamos al entrenador', 'Nos escondemos'],
    correcta: 1,
  },
  {
    pregunta: '¿Cómo debemos dejar el bate después de usarlo?',
    opciones: ['Lanzándolo', 'En un lugar seguro', 'En medio del campo'],
    correcta: 1,
  },
  {
    pregunta: '¿Qué debemos tomar durante el entrenamiento?',
    opciones: ['Agua', 'Solo refresco', 'Nada'],
    correcta: 0,
  },
  {
    pregunta: '¿Qué hacemos cuando otro jugador está bateando?',
    opciones: [
      'Nos acercamos al bate',
      'Guardamos una distancia segura',
      'Corremos detrás de él',
    ],
    correcta: 1,
  },
  {
    pregunta: '¿Cómo deben estar los cordones de los zapatos?',
    opciones: ['Bien amarrados', 'Sueltos', 'Quitados'],
    correcta: 0,
  },
  {
    pregunta: '¿Qué hacemos si encontramos un objeto peligroso en el campo?',
    opciones: ['Jugamos con él', 'Lo ignoramos', 'Avisamos a un adulto'],
    correcta: 2,
  },
  {
    pregunta: '¿Cuándo podemos entrar al terreno?',
    opciones: [
      'Cuando lo indique el entrenador',
      'En cualquier momento',
      'Cuando nadie esté mirando',
    ],
    correcta: 0,
  },
  {
    pregunta: '¿Qué debemos revisar antes de usar un casco?',
    opciones: [
      'Que esté en buenas condiciones',
      'Que tenga tierra',
      'Que sea el más pesado',
    ],
    correcta: 0,
  },

  // VALORES Y TRABAJO EN EQUIPO
  {
    pregunta: 'Si un compañero se equivoca, ¿qué hacemos?',
    opciones: ['Nos burlamos', 'Lo animamos', 'Lo ignoramos'],
    correcta: 1,
  },
  {
    pregunta: '¿Qué hacemos cuando el entrenador explica?',
    opciones: ['Escuchamos con atención', 'Interrumpimos', 'Nos alejamos'],
    correcta: 0,
  },
  {
    pregunta: '¿Cómo tratamos a los compañeros?',
    opciones: ['Con respeto', 'Con burlas', 'Con gritos'],
    correcta: 0,
  },
  {
    pregunta: '¿Qué hacemos al terminar de usar el equipo?',
    opciones: ['Lo dejamos tirado', 'Lo guardamos', 'Lo escondemos'],
    correcta: 1,
  },
  {
    pregunta: '¿Qué hacemos cuando perdemos un juego?',
    opciones: [
      'Culpamos a otros',
      'Aprendemos y seguimos practicando',
      'Dejamos el equipo',
    ],
    correcta: 1,
  },
  {
    pregunta: '¿Qué hacemos cuando ganamos?',
    opciones: [
      'Respetamos al rival',
      'Nos burlamos',
      'Gritamos cosas ofensivas',
    ],
    correcta: 0,
  },
  {
    pregunta: '¿Qué significa trabajar en equipo?',
    opciones: [
      'Jugar solo',
      'Ayudarnos para lograr una meta',
      'No escuchar a nadie',
    ],
    correcta: 1,
  },
  {
    pregunta: '¿Qué valor demostramos al llegar puntuales?',
    opciones: ['Responsabilidad', 'Desorden', 'Impaciencia'],
    correcta: 0,
  },
  {
    pregunta: '¿Qué debemos hacer si no entendemos un ejercicio?',
    opciones: [
      'Preguntar con respeto',
      'Irnos del entrenamiento',
      'Molestar a los demás',
    ],
    correcta: 0,
  },
  {
    pregunta: '¿Cuál es el lema de Generales de Chitré?',
    opciones: [
      'Ganar a cualquier precio',
      'Un equipo, una familia, un legado',
      'Cada jugador por su lado',
    ],
    correcta: 1,
  },
];

export default preguntasReto;