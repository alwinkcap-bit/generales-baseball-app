import React, { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import preguntasBasicas from './PreguntasReto'
import preguntasRetoNiveles11a20 from './PreguntasRetoNiveles11a20'
import preguntasRetoNivel21 from './PreguntasRetoNivel21'
import './RetoDigital.css'

const reglasIntermedias = [
  {
    pregunta: '¿Cuándo se acredita una base por bolas?',
    correcta: 'Después de cuatro bolas',
    distractores: ['Después de dos strikes', 'Después de tres fouls']
  },
  {
    pregunta: '¿Qué sucede si una pelota elevada es atrapada antes de tocar el suelo?',
    correcta: 'El bateador es out',
    distractores: ['El bateador recibe dos bases', 'Se declara foul automáticamente']
  },
  {
    pregunta: '¿Qué es un doble play?',
    correcta: 'Dos outs en una misma jugada',
    distractores: ['Dos hits consecutivos', 'Dos carreras del mismo jugador']
  },
  {
    pregunta: '¿Qué es un toque de sacrificio?',
    correcta: 'Un toque para avanzar a un corredor',
    distractores: ['Un batazo para buscar jonrón', 'Un lanzamiento intencional']
  },
  {
    pregunta: '¿Qué significa robar una base?',
    correcta: 'Avanzar durante el lanzamiento sin que exista batazo',
    distractores: ['Mover físicamente una base', 'Avanzar después de un foul']
  },
  {
    pregunta: '¿Qué jugador cubre normalmente el home?',
    correcta: 'El receptor',
    distractores: ['El campocorto', 'El jardinero central']
  },
  {
    pregunta: '¿Cuándo puede avanzar un corredor después de un fly atrapado?',
    correcta: 'Después de retocar su base',
    distractores: ['Antes de que llegue la pelota', 'Solamente después de dos outs']
  },
  {
    pregunta: '¿Qué indica una pelota fair?',
    correcta: 'Que permanece dentro del terreno válido',
    distractores: ['Que fue lanzada muy rápido', 'Que pasó detrás del receptor']
  },
  {
    pregunta: '¿Qué es una jugada forzada?',
    correcta: 'El corredor debe avanzar porque otro corredor ocupa su base',
    distractores: ['El corredor decide no avanzar', 'El árbitro obliga a cambiar al lanzador']
  },
  {
    pregunta: '¿Qué posición juega entre segunda y tercera base?',
    correcta: 'Campocorto',
    distractores: ['Receptor', 'Jardinero derecho']
  },
  {
    pregunta: '¿Qué significa RBI?',
    correcta: 'Carrera impulsada',
    distractores: ['Base robada', 'Entrada lanzada']
  },
  {
    pregunta: '¿Qué significa ERA para un lanzador?',
    correcta: 'Promedio de carreras limpias permitidas',
    distractores: ['Cantidad de errores defensivos', 'Promedio de bateo']
  },
  {
    pregunta: '¿Qué es un balk?',
    correcta: 'Un movimiento ilegal del lanzador con corredores en base',
    distractores: ['Un batazo fuera del estadio', 'Una atrapada realizada contra la pared']
  },
  {
    pregunta: '¿Qué es interferencia ofensiva?',
    correcta: 'Cuando la ofensiva impide ilegalmente una jugada defensiva',
    distractores: ['Cuando llueve durante el partido', 'Cuando el lanzador pide tiempo']
  },
  {
    pregunta: '¿Qué es una selección del fildeador?',
    correcta: 'Una jugada en la que la defensa intenta retirar a otro corredor',
    distractores: ['Un cambio obligatorio de jardinero', 'Una base por bolas intencional']
  }
]

const situacionesAvanzadas = [
  {
    pregunta: 'Corredor en tercera y menos de dos outs: ¿qué batazo suele permitir una carrera de sacrificio?',
    correcta: 'Un elevado profundo al jardín',
    distractores: ['Un foul detrás de home', 'Un rodado directo al receptor']
  },
  {
    pregunta: 'Con corredor en primera y rodado al campocorto, ¿cuál es una opción común para iniciar doble play?',
    correcta: 'Tirar a segunda base',
    distractores: ['Tirar directamente al jardín', 'Conservar siempre la pelota']
  },
  {
    pregunta: '¿Por qué un bateador puede acortar su swing con dos strikes?',
    correcta: 'Para aumentar el contacto con la pelota',
    distractores: ['Para abandonar el turno', 'Para recibir una base automática']
  },
  {
    pregunta: '¿Cuál es el objetivo principal de un cambio de velocidad?',
    correcta: 'Alterar el ritmo y engañar al bateador',
    distractores: ['Lanzar siempre más alto', 'Hacer que la pelota sea foul']
  },
  {
    pregunta: '¿Qué debe hacer un jardinero antes de lanzar a una base?',
    correcta: 'Alinear el cuerpo y realizar un relevo preciso',
    distractores: ['Lanzar de espaldas', 'Esperar que todos los corredores anoten']
  },
  {
    pregunta: 'Con dos outs, ¿por qué los corredores suelen salir al contacto?',
    correcta: 'Porque no necesitan esperar una posible atrapada',
    distractores: ['Porque el inning ya terminó', 'Porque no pueden ser retirados']
  },
  {
    pregunta: '¿Qué busca la defensa al realizar un corte y relevo?',
    correcta: 'Reducir la distancia y controlar el avance de corredores',
    distractores: ['Cambiar el conteo del bateador', 'Eliminar una carrera ya anotada']
  },
  {
    pregunta: '¿Cuándo conviene lanzar al cutoff?',
    correcta: 'Cuando el tiro directo sería largo o impreciso',
    distractores: ['Después de cada strike', 'Solamente cuando no hay corredores']
  },
  {
    pregunta: '¿Qué ventaja ofrece batear detrás del corredor?',
    correcta: 'Puede permitir que avance con menor riesgo',
    distractores: ['Convierte automáticamente el batazo en jonrón', 'Elimina un out anterior']
  },
  {
    pregunta: '¿Qué busca un lanzador trabajando las esquinas de la zona?',
    correcta: 'Provocar contacto débil o swings fallidos',
    distractores: ['Conceder bases por bolas', 'Evitar que el receptor toque la pelota']
  },
  {
    pregunta: '¿Cuál es la responsabilidad principal del campocorto en un rodado entre segunda y tercera?',
    correcta: 'Atacar la pelota y completar el out disponible',
    distractores: ['Cubrir siempre el home', 'Permanecer inmóvil']
  },
  {
    pregunta: '¿Por qué la comunicación es importante en un elevado entre dos defensores?',
    correcta: 'Evita choques y asegura quién realizará la atrapada',
    distractores: ['Cambia el valor del batazo', 'Permite cuatro outs en la entrada']
  }
]

function crearPregunta(pregunta, correcta, distractores, semilla) {
  const posicion = semilla % 3
  const opciones = [...distractores.slice(0, 2)]
  opciones.splice(posicion, 0, correcta)

  return {
    pregunta,
    opciones,
    correcta: posicion
  }
}

function preguntaEstadistica(tipo, nivel, indice) {
  const ajuste = nivel + indice

  if (tipo === 0) {
    const turnos = 20 + ajuste
    const hits = Math.max(5, Math.floor(turnos * (0.22 + (indice % 5) * 0.015)))
    const promedio = (hits / turnos).toFixed(3)

    return crearPregunta(
      `Un bateador conecta ${hits} hits en ${turnos} turnos. ¿Cuál es su promedio?`,
      promedio,
      [
        ((hits + 2) / turnos).toFixed(3),
        (hits / (turnos + 5)).toFixed(3)
      ],
      ajuste
    )
  }

  if (tipo === 1) {
    const entradas = 9 + (indice % 5) * 3
    const carreras = 1 + (ajuste % 6)
    const efectividad = ((carreras * 9) / entradas).toFixed(2)

    return crearPregunta(
      `Un lanzador permite ${carreras} carreras limpias en ${entradas} entradas. ¿Cuál es su ERA?`,
      efectividad,
      [
        ((carreras * 7) / entradas).toFixed(2),
        ((carreras * 10) / entradas).toFixed(2)
      ],
      ajuste
    )
  }

  if (tipo === 2) {
    const sencillos = 3 + (indice % 4)
    const dobles = 2 + (nivel % 3)
    const triples = 1
    const jonrones = 1 + (indice % 2)
    const bases = sencillos + dobles * 2 + triples * 3 + jonrones * 4

    return crearPregunta(
      `¿Cuántas bases totales producen ${sencillos} sencillos, ${dobles} dobles, ${triples} triple y ${jonrones} jonrón(es)?`,
      String(bases),
      [String(bases - 3), String(bases + 4)],
      ajuste
    )
  }

  if (tipo === 3) {
    const ganados = 8 + (ajuste % 12)
    const perdidos = 3 + (indice % 7)
    const total = ganados + perdidos
    const porcentaje = (ganados / total).toFixed(3)

    return crearPregunta(
      `Un equipo tiene ${ganados} victorias y ${perdidos} derrotas. ¿Cuál es su porcentaje de victorias?`,
      porcentaje,
      [
        (perdidos / total).toFixed(3),
        (ganados / (total + 2)).toFixed(3)
      ],
      ajuste
    )
  }

  if (tipo === 4) {
    const oportunidades = 25 + ajuste
    const errores = 1 + (indice % 4)
    const exitosas = oportunidades - errores
    const fildeo = (exitosas / oportunidades).toFixed(3)

    return crearPregunta(
      `Un defensor completa ${exitosas} jugadas de ${oportunidades} oportunidades. ¿Cuál es su porcentaje de fildeo?`,
      fildeo,
      [
        (errores / oportunidades).toFixed(3),
        (exitosas / (oportunidades + 3)).toFixed(3)
      ],
      ajuste
    )
  }

  const carreras = 2 + (ajuste % 5)
  const innings = 3 + (indice % 5)

  return crearPregunta(
    `Si un equipo anota ${carreras} carreras por entrada durante ${innings} entradas, ¿cuántas carreras suma?`,
    String(carreras * innings),
    [
      String(carreras + innings),
      String(carreras * innings + carreras)
    ],
    ajuste
  )
}

function convertirPreguntaBanco(base, nivel, indice) {
  if (base.opciones) {
    return {
      ...base,
      id: `nivel-${nivel}-pregunta-${indice + 1}`
    }
  }

  return {
    ...crearPregunta(
      base.pregunta,
      base.correcta,
      base.distractores,
      nivel * 10 + indice
    ),
    id: `nivel-${nivel}-pregunta-${indice + 1}`
  }
}

function generarPreguntaUnica(nivel, indice, tipo) {
  const semillaGlobal = (nivel - 1) * 10 + indice + 1

  return {
    ...preguntaEstadistica(
      tipo % 6,
      semillaGlobal * 7,
      semillaGlobal
    ),
    id: `nivel-${nivel}-pregunta-${indice + 1}`
  }
}


const hitosHistoriaBeisbol = [
  { anio: 1845, hecho: 'Se redactaron las reglas Knickerbocker', detalle: 'Alexander Cartwright y el club Knickerbocker ayudaron a organizar reglas tempranas del béisbol.' },
  { anio: 1846, hecho: 'Se disputó un reconocido juego bajo las reglas Knickerbocker', detalle: 'El encuentro se celebró en Hoboken, Nueva Jersey.' },
  { anio: 1869, hecho: 'Los Cincinnati Red Stockings se convirtieron en el primer equipo abiertamente profesional', detalle: 'Sus jugadores recibían salario por jugar.' },
  { anio: 1876, hecho: 'Se fundó la Liga Nacional', detalle: 'La National League es la liga profesional activa más antigua.' },
  { anio: 1903, hecho: 'Se jugó la primera Serie Mundial moderna', detalle: 'Boston derrotó a Pittsburgh en aquella serie.' },
  { anio: 1912, hecho: 'Se inauguró Fenway Park', detalle: 'El estadio de Boston continúa siendo utilizado por los Red Sox.' },
  { anio: 1920, hecho: 'Rube Foster fundó la Negro National League', detalle: 'La liga ofreció una estructura profesional para jugadores afroamericanos.' },
  { anio: 1933, hecho: 'Se celebró el primer Juego de Estrellas de MLB', detalle: 'El primer All-Star Game se jugó en Chicago.' },
  { anio: 1936, hecho: 'Fue elegida la primera clase del Salón de la Fama', detalle: 'Incluyó figuras como Ty Cobb, Babe Ruth y Honus Wagner.' },
  { anio: 1947, hecho: 'Jackie Robinson rompió la barrera racial moderna de MLB', detalle: 'Debutó con los Brooklyn Dodgers el 15 de abril.' },
  { anio: 1953, hecho: 'Los Braves se trasladaron de Boston a Milwaukee', detalle: 'El traslado inició una nueva etapa de cambios de ciudades en MLB.' },
  { anio: 1955, hecho: 'Los Brooklyn Dodgers ganaron su primera Serie Mundial', detalle: 'Derrotaron a los New York Yankees.' },
  { anio: 1958, hecho: 'Dodgers y Giants comenzaron a jugar en California', detalle: 'Las franquicias se mudaron desde Nueva York a la costa oeste.' },
  { anio: 1969, hecho: 'MLB comenzó a utilizar divisiones y Series de Campeonato', detalle: 'La postemporada se amplió antes de la Serie Mundial.' },
  { anio: 1973, hecho: 'La Liga Americana adoptó el bateador designado', detalle: 'La regla permitió batear por el lanzador.' },
  { anio: 1977, hecho: 'Debutaron Toronto Blue Jays y Seattle Mariners', detalle: 'Ambos equipos ingresaron durante una expansión de MLB.' },
  { anio: 1992, hecho: 'Toronto se convirtió en el primer campeón de Serie Mundial fuera de Estados Unidos', detalle: 'Los Blue Jays conquistaron el campeonato.' },
  { anio: 1994, hecho: 'Una huelga provocó la cancelación de la Serie Mundial', detalle: 'Fue la primera Serie Mundial cancelada desde 1904.' },
  { anio: 1997, hecho: 'Comenzaron los juegos interligas en temporada regular', detalle: 'Equipos de la Liga Americana y Nacional comenzaron a enfrentarse durante la campaña.' },
  { anio: 2006, hecho: 'Se disputó el primer Clásico Mundial de Béisbol', detalle: 'Japón ganó la primera edición del torneo.' },
  { anio: 2020, hecho: 'MLB reconoció siete Ligas Negras como Grandes Ligas', detalle: 'Los registros comprendidos entre 1920 y 1948 recibieron condición de Grandes Ligas.' },
  { anio: 2022, hecho: 'El bateador designado se aplicó permanentemente en ambas ligas', detalle: 'La Liga Nacional adoptó la regla de manera permanente.' },
  { anio: 2023, hecho: 'MLB introdujo el reloj de lanzamiento', detalle: 'La medida buscó mejorar el ritmo y reducir la duración de los juegos.' }
]

const paresHistoriaBeisbol = hitosHistoriaBeisbol.flatMap(
  (primero, indice) =>
    hitosHistoriaBeisbol
      .slice(indice + 1)
      .map((segundo) => [primero, segundo])
)

function generarPreguntaHistoria(nivel, indice) {
  const posicion = (nivel - 61) * 10 + indice
  const [primero, segundo] = paresHistoriaBeisbol[posicion]
  const diferencia = segundo.anio - primero.anio

  if (posicion % 2 === 0) {
    return {
      ...crearPregunta(
        `¿Cuál de estos acontecimientos ocurrió primero en la historia del béisbol?`,
        primero.hecho,
        [
          segundo.hecho,
          'Ambos acontecimientos ocurrieron el mismo año'
        ],
        posicion
      ),
      id: `historia-${posicion + 1}`,
      explicacion:
        `${primero.hecho} ocurrió en ${primero.anio}. ${primero.detalle}`
    }
  }

  return {
    ...crearPregunta(
      `¿Cuántos años transcurrieron entre “${primero.hecho}” y “${segundo.hecho}”?`,
      `${diferencia} años`,
      [
        `${diferencia + 5} años`,
        `${Math.max(1, diferencia - 3)} años`
      ],
      posicion
    ),
    id: `historia-${posicion + 1}`,
    explicacion:
      `El primer acontecimiento ocurrió en ${primero.anio} y el segundo en ${segundo.anio}.`
  }
}


const hitosGrandesLigas = [
  { anio: 1927, hecho: 'Babe Ruth conectó 60 jonrones en una temporada', detalle: 'La marca permaneció como récord de una temporada en MLB durante 34 años.' },
  { anio: 1939, hecho: 'Lou Gehrig pronunció su famoso discurso de despedida', detalle: 'El histórico jugador de los Yankees se retiró debido a una enfermedad.' },
  { anio: 1941, hecho: 'Joe DiMaggio logró una racha de 56 juegos conectando hit', detalle: 'La racha continúa siendo el récord de MLB.' },
  { anio: 1947, hecho: 'Jackie Robinson ganó el premio al Novato del Año', detalle: 'Fue su primera temporada con los Brooklyn Dodgers.' },
  { anio: 1954, hecho: 'Willie Mays realizó “The Catch” en la Serie Mundial', detalle: 'La atrapada es una de las jugadas defensivas más famosas de la historia.' },
  { anio: 1955, hecho: 'Humberto Robinson se convirtió en el primer panameño en jugar en MLB', detalle: 'El lanzador abrió el camino para futuras generaciones de peloteros panameños.' },
  { anio: 1956, hecho: 'Don Larsen lanzó un juego perfecto en la Serie Mundial', detalle: 'Lo consiguió con los Yankees frente a los Dodgers.' },
  { anio: 1961, hecho: 'Roger Maris conectó 61 jonrones', detalle: 'Superó la marca de 60 jonrones de Babe Ruth.' },
  { anio: 1966, hecho: 'Frank Robinson ganó la Triple Corona de bateo', detalle: 'Lideró la Liga Americana en promedio, jonrones y carreras impulsadas.' },
  { anio: 1967, hecho: 'Rod Carew ganó el premio al Novato del Año', detalle: 'El panameño inició una destacada carrera en Grandes Ligas.' },
  { anio: 1968, hecho: 'Bob Gibson registró efectividad de 1.12', detalle: 'Su histórica temporada ayudó a impulsar cambios en la altura del montículo.' },
  { anio: 1974, hecho: 'Hank Aaron conectó su jonrón número 715', detalle: 'Con ese batazo superó el récord de carrera de Babe Ruth.' },
  { anio: 1975, hecho: 'Frank Robinson se convirtió en el primer dirigente afroamericano de MLB', detalle: 'Fue jugador y dirigente de Cleveland.' },
  { anio: 1985, hecho: 'Pete Rose superó el récord de hits de Ty Cobb', detalle: 'Terminó su carrera con 4,256 imparables.' },
  { anio: 1988, hecho: 'Kirk Gibson conectó su histórico jonrón en la Serie Mundial', detalle: 'El batazo decidió el primer juego para los Dodgers.' },
  { anio: 1995, hecho: 'Mariano Rivera debutó en Grandes Ligas', detalle: 'El panameño se convertiría en uno de los mejores cerradores de la historia.' },
  { anio: 1998, hecho: 'Mark McGwire conectó 70 jonrones', detalle: 'Superó entonces la marca de Roger Maris.' },
  { anio: 2001, hecho: 'Barry Bonds conectó 73 jonrones', detalle: 'Es la marca oficial de MLB para una temporada.' },
  { anio: 2004, hecho: 'Ichiro Suzuki logró 262 hits en una temporada', detalle: 'Estableció el récord moderno de imparables en una campaña.' },
  { anio: 2011, hecho: 'Mariano Rivera estableció el récord de juegos salvados de MLB', detalle: 'Terminó su carrera con 652 salvamentos.' },
  { anio: 2012, hecho: 'Miguel Cabrera ganó la Triple Corona de bateo', detalle: 'Fue la primera Triple Corona de MLB desde 1967.' },
  { anio: 2016, hecho: 'Chicago Cubs ganó la Serie Mundial después de 108 años', detalle: 'Derrotó a Cleveland en siete juegos.' },
  { anio: 2019, hecho: 'Mariano Rivera fue elegido unánimemente al Salón de la Fama', detalle: 'Fue el primer jugador elegido con el 100 % de los votos.' },
  { anio: 2022, hecho: 'Aaron Judge conectó 62 jonrones', detalle: 'Estableció el récord de una temporada de la Liga Americana.' },
  { anio: 2024, hecho: 'Shohei Ohtani logró la primera temporada de 50 jonrones y 50 bases robadas', detalle: 'Se convirtió en el primer integrante del club 50-50.' }
]

const paresGrandesLigas = hitosGrandesLigas.flatMap(
  (primero, indice) =>
    hitosGrandesLigas
      .slice(indice + 1)
      .map((segundo) => [primero, segundo])
)

function generarPreguntaGrandesLigas(nivel, indice) {
  const posicion = (nivel - 81) * 10 + indice
  const [primero, segundo] = paresGrandesLigas[posicion]
  const diferencia = segundo.anio - primero.anio
  const tipo = posicion % 3

  if (tipo === 0) {
    return {
      ...crearPregunta(
        '¿Cuál de estos hitos de Grandes Ligas ocurrió primero?',
        primero.hecho,
        [
          segundo.hecho,
          'Los dos ocurrieron durante la misma temporada'
        ],
        posicion
      ),
      id: `mlb-${posicion + 1}`,
      explicacion:
        `${primero.hecho} ocurrió en ${primero.anio}. ${primero.detalle}`
    }
  }

  if (tipo === 1) {
    return {
      ...crearPregunta(
        `¿Cuántos años transcurrieron entre “${primero.hecho}” y “${segundo.hecho}”?`,
        `${diferencia} años`,
        [
          `${diferencia + 4} años`,
          `${Math.max(1, diferencia - 2)} años`
        ],
        posicion
      ),
      id: `mlb-${posicion + 1}`,
      explicacion:
        `Los acontecimientos ocurrieron en ${primero.anio} y ${segundo.anio}.`
    }
  }

  return {
    ...crearPregunta(
      `¿En qué año ocurrió este hecho: “${primero.hecho}”?`,
      String(primero.anio),
      [
        String(segundo.anio),
        String(primero.anio + 3)
      ],
      posicion
    ),
    id: `mlb-${posicion + 1}`,
    explicacion:
      `${primero.hecho} ocurrió en ${primero.anio}. ${primero.detalle}`
  }
}

function generarNivel(nivel) {
  if (nivel === 21) {
    return preguntasRetoNivel21
  }

  if (nivel >= 11 && nivel <= 20) {
    const inicio = (nivel - 11) * 10

    return preguntasRetoNiveles11a20.slice(
      inicio,
      inicio + 10
    )
  }

  return Array.from({ length: 10 }, (_, indice) => {
    if (nivel <= 20) {
      const posicion = (nivel - 1) * 10 + indice

      if (posicion < preguntasBasicas.length) {
        return convertirPreguntaBanco(
          preguntasBasicas[posicion],
          nivel,
          indice
        )
      }

      return generarPreguntaUnica(nivel, indice, indice)
    }

    if (nivel <= 40) {
      const posicion = (nivel - 21) * 10 + indice

      if (posicion < reglasIntermedias.length) {
        return convertirPreguntaBanco(
          reglasIntermedias[posicion],
          nivel,
          indice
        )
      }

      return generarPreguntaUnica(nivel, indice, indice + 1)
    }

    if (nivel <= 60) {
      const posicion = (nivel - 41) * 10 + indice

      if (posicion < situacionesAvanzadas.length) {
        return convertirPreguntaBanco(
          situacionesAvanzadas[posicion],
          nivel,
          indice
        )
      }

      return generarPreguntaUnica(nivel, indice, indice + 2)
    }

    if (nivel >= 61 && nivel <= 80) {
      return generarPreguntaHistoria(nivel, indice)
    }

    if (nivel >= 81 && nivel <= 100) {
      return generarPreguntaGrandesLigas(nivel, indice)
    }

    return generarPreguntaUnica(nivel, indice, indice + 3)
  })
}

function comprobarPreguntasDuplicadas() {
  const preguntas = Array.from(
    { length: 100 },
    (_, indice) => generarNivel(indice + 1)
  ).flat()

  const textos = preguntas.map((item) =>
    item.pregunta.trim().toLowerCase()
  )

  const duplicadas = textos.filter(
    (texto, indice) => textos.indexOf(texto) !== indice
  )

  if (duplicadas.length > 0) {
    console.warn(
      'Preguntas repetidas encontradas:',
      [...new Set(duplicadas)]
    )
  }

  return duplicadas.length === 0
}

comprobarPreguntasDuplicadas()

export default function RetoDigital({ onCerrar }) {
  const [nivelDesbloqueado, setNivelDesbloqueado] = useState(() => {
    const guardado = Number(
      window.localStorage.getItem('generales-reto-nivel') || 1
    )

    return Math.min(100, Math.max(1, guardado))
  })

  const [nivel, setNivel] = useState(null)
  const [preguntaActual, setPreguntaActual] = useState(0)
  const [aciertos, setAciertos] = useState(0)
  const [seleccionada, setSeleccionada] = useState(null)
  const [terminado, setTerminado] = useState(false)
  const [tiempo, setTiempo] = useState(10)

  const preguntas = useMemo(
    () => (nivel ? generarNivel(nivel) : []),
    [nivel]
  )

  function comenzarNivel(numero) {
    if (numero > nivelDesbloqueado) return

    setNivel(numero)
    setPreguntaActual(0)
    setAciertos(0)
    setSeleccionada(null)
    setTerminado(false)
    setTiempo(10)
  }

  function responder(indice) {
    if (seleccionada !== null) return

    setSeleccionada(indice)

    const correcta = preguntas[preguntaActual].correcta === indice
    const nuevosAciertos = aciertos + (correcta ? 1 : 0)

    window.setTimeout(() => {
      if (preguntaActual >= 9) {
        setAciertos(nuevosAciertos)
        setTerminado(true)

        if (
          nuevosAciertos >= 7 &&
          nivel < 100 &&
          nivel >= nivelDesbloqueado
        ) {
          const nuevoNivel = nivel + 1
          setNivelDesbloqueado(nuevoNivel)
          window.localStorage.setItem(
            'generales-reto-nivel',
            String(nuevoNivel)
          )
        }

        return
      }

      setAciertos(nuevosAciertos)
      setPreguntaActual((actual) => actual + 1)
      setSeleccionada(null)
      setTiempo(10)
    }, 750)
  }

  useEffect(() => {
    if (!nivel || terminado || seleccionada !== null) return

    if (tiempo <= 0) {
      responder(-1)
      return
    }

    const temporizador = window.setTimeout(() => {
      setTiempo((actual) => Math.max(0, actual - 1))
    }, 1000)

    return () => window.clearTimeout(temporizador)
  }, [tiempo, nivel, terminado, seleccionada, preguntaActual])

  function estrellas() {
    if (aciertos === 10) return 3
    if (aciertos >= 8) return 2
    if (aciertos >= 7) return 1
    return 0
  }

  return createPortal(
    <div className="reto-digital-fondo">
      <section className="reto-digital">
        <header className="reto-digital-header">
          <div>
            <small>GENERALES DE CHITRÉ</small>
            <h2>🏆 Reto Digital</h2>
            <p>100 niveles de conocimiento sobre béisbol</p>
          </div>

          <button type="button" onClick={onCerrar}>×</button>
        </header>

        {!nivel ? (
          <>
            <div className="reto-digital-progreso">
              <span>NIVEL ALCANZADO</span>
              <strong>{nivelDesbloqueado} / 100</strong>
              <div>
                <i
                  style={{
                    width: `${nivelDesbloqueado}%`
                  }}
                ></i>
              </div>
            </div>

            <div className="reto-digital-niveles">
              {Array.from({ length: 100 }, (_, indice) => {
                const numero = indice + 1
                const bloqueado = numero > nivelDesbloqueado

                return (
                  <button
                    type="button"
                    key={numero}
                    disabled={bloqueado}
                    className={
                      numero === nivelDesbloqueado ? 'actual' : ''
                    }
                    onClick={() => comenzarNivel(numero)}
                  >
                    <small>NIVEL</small>
                    <strong>{numero}</strong>
                    <span>{bloqueado ? '🔒' : '⚾'}</span>
                  </button>
                )
              })}
            </div>
          </>
        ) : terminado ? (
          <div className="reto-digital-resultado">
            <span className="reto-digital-trofeo">
              {aciertos >= 7 ? '🏆' : '💪'}
            </span>

            <small>NIVEL {nivel} COMPLETADO</small>
            <h3>
              {aciertos >= 7
                ? '¡Excelente trabajo!'
                : 'Sigue practicando'}
            </h3>

            <div className="reto-digital-estrellas">
              {[1, 2, 3].map((estrella) => (
                <span
                  key={estrella}
                  className={estrella <= estrellas() ? 'ganada' : ''}
                >
                  ★
                </span>
              ))}
            </div>

            <strong>{aciertos} de 10 respuestas correctas</strong>

            <p>
              {aciertos >= 7
                ? nivel === 100
                  ? '¡Completaste todos los niveles!'
                  : 'Has desbloqueado el siguiente nivel.'
                : 'Necesitas 7 respuestas correctas para avanzar.'}
            </p>

            <div>
              <button
                type="button"
                onClick={() => comenzarNivel(nivel)}
              >
                Repetir nivel
              </button>

              {aciertos >= 7 && nivel < 100 && (
                <button
                  type="button"
                  onClick={() => comenzarNivel(nivel + 1)}
                >
                  Siguiente nivel →
                </button>
              )}

              <button type="button" onClick={() => setNivel(null)}>
                Ver niveles
              </button>
            </div>
          </div>
        ) : (
          <div className="reto-digital-pregunta">
            <div className="reto-digital-pregunta-info">
              <span>NIVEL {nivel}</span>
              <strong>
                PREGUNTA {preguntaActual + 1} / 10
              </strong>
              <b>{aciertos} ACIERTOS</b>

              <span
                className={`reto-digital-tiempo ${
                  tiempo <= 3 ? 'urgente' : ''
                }`}
              >
                ⏱ {tiempo}s
              </span>
            </div>

            <div
              className={`reto-digital-tiempo-barra ${
                tiempo <= 3 ? 'urgente' : ''
              }`}
              aria-label={`${tiempo} segundos restantes`}
            >
              <i
                style={{
                  width: `${tiempo * 10}%`
                }}
              ></i>
            </div>

            <div className="reto-digital-barra">
              <i
                style={{
                  width: `${(preguntaActual + 1) * 10}%`
                }}
              ></i>
            </div>

            <h3>{preguntas[preguntaActual].pregunta}</h3>

            <div className="reto-digital-opciones">
              {preguntas[preguntaActual].opciones.map(
                (opcion, indice) => {
                  let clase = ''

                  if (seleccionada !== null) {
                    if (
                      indice === preguntas[preguntaActual].correcta
                    ) {
                      clase = 'correcta'
                    } else if (indice === seleccionada) {
                      clase = 'incorrecta'
                    }
                  }

                  return (
                    <button
                      type="button"
                      key={`${opcion}-${indice}`}
                      className={clase}
                      onClick={() => responder(indice)}
                      disabled={seleccionada !== null}
                    >
                      <span>{String.fromCharCode(65 + indice)}</span>
                      {opcion}
                    </button>
                  )
                }
              )}
            </div>

            {seleccionada !== null &&
              preguntas[preguntaActual].explicacion && (
                <div className="reto-digital-explicacion">
                  <strong>Explicación</strong>
                  <p>
                    {preguntas[preguntaActual].explicacion}
                  </p>
                </div>
              )}
          </div>
        )}
      </section>
    </div>,
    document.body
  )
}
