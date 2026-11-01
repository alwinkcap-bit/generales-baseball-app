export function obtenerInsignia(aciertos, nivel) {
  if (aciertos === 7 && nivel === 'leyenda') {
    return 'LEYENDA MUNDIAL'
  }

  if (aciertos === 7) {
    return 'MAESTRO DEL BÉISBOL'
  }

  if (aciertos >= 5) {
    return 'EXPERTO DEL DIAMANTE'
  }

  if (aciertos >= 3) {
    return 'PROMESA DEL DIAMANTE'
  }

  return 'PRIMER DESAFÍO'
}


export async function generarTarjetaInsignia(nombre, insignia, nivel) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  const imagen = new Image()
  imagen.src = `${import.meta.env.BASE_URL}insignias/insignia-premium.png`

  await new Promise((resolve, reject) => {
    imagen.onload = resolve
    imagen.onerror = reject
  })

  canvas.width = imagen.naturalWidth
  canvas.height = imagen.naturalHeight

  const w = canvas.width
  const h = canvas.height
  const sx = w / 1122
  const sy = h / 1402

  ctx.drawImage(imagen, 0, 0, w, h)

  function placa(x, y, ancho, alto) {
    const px = x * sx
    const py = y * sy
    const pw = ancho * sx
    const ph = alto * sy

    const gradiente = ctx.createLinearGradient(px, py, px, py + ph)
    gradiente.addColorStop(0, '#102a49')
    gradiente.addColorStop(0.5, '#07182e')
    gradiente.addColorStop(1, '#102a49')

    ctx.fillStyle = gradiente
    ctx.fillRect(px, py, pw, ph)

    ctx.strokeStyle = '#dba64c'
    ctx.lineWidth = 3 * sx
    ctx.strokeRect(px, py, pw, ph)
  }


  // Placa premium para ocultar los textos fijos de la plantilla.
  const X = n => n * sx
  const Y = n => n * sy

  ctx.save()
  ctx.beginPath()
  ctx.moveTo(X(190), Y(715))
  ctx.lineTo(X(930), Y(715))
  ctx.lineTo(X(970), Y(790))
  ctx.lineTo(X(930), Y(965))
  ctx.lineTo(X(190), Y(965))
  ctx.lineTo(X(150), Y(790))
  ctx.closePath()

  const fondo = ctx.createLinearGradient(0, Y(715), 0, Y(965))
  fondo.addColorStop(0, '#17395b')
  fondo.addColorStop(0.45, '#061426')
  fondo.addColorStop(1, '#102b4b')

  ctx.fillStyle = fondo
  ctx.fill()

  ctx.shadowColor = '#ffb52e'
  ctx.shadowBlur = X(16)
  ctx.lineWidth = X(7)
  ctx.strokeStyle = '#e7a93b'
  ctx.stroke()

  ctx.shadowBlur = 0
  ctx.lineWidth = X(2)
  ctx.strokeStyle = '#fff1b5'
  ctx.stroke()
  ctx.restore()


  function textoPremium(texto, y, tamano, anchoMaximo) {
    ctx.save()
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `900 ${tamano * sy}px Arial, sans-serif`
    ctx.lineJoin = 'round'

    const centro = w / 2
    const posY = Y(y)
    const maxAncho = X(anchoMaximo)

    // Sombra sólida para crear profundidad 3D.
    ctx.shadowBlur = 0
    ctx.strokeStyle = '#020814'
    ctx.lineWidth = X(10)
    ctx.strokeText(texto, centro, posY + Y(7), maxAncho)

    ctx.fillStyle = '#74400e'
    ctx.fillText(texto, centro, posY + Y(7), maxAncho)

    // Borde metálico exterior.
    ctx.strokeStyle = '#7a3908'
    ctx.lineWidth = X(9)
    ctx.strokeText(texto, centro, posY, maxAncho)

    ctx.strokeStyle = '#fff0b5'
    ctx.lineWidth = X(4)
    ctx.strokeText(texto, centro, posY, maxAncho)

    // Relleno dorado con efecto metálico.
    const dorado = ctx.createLinearGradient(
      0, posY - Y(tamano / 2),
      0, posY + Y(tamano / 2)
    )

    dorado.addColorStop(0, '#fff8d8')
    dorado.addColorStop(0.25, '#ffe28a')
    dorado.addColorStop(0.48, '#c88722')
    dorado.addColorStop(0.55, '#fff2b2')
    dorado.addColorStop(0.8, '#d68a19')
    dorado.addColorStop(1, '#80400a')

    ctx.fillStyle = dorado
    ctx.fillText(texto, centro, posY, maxAncho)

    // Brillo controlado, sin difuminar las letras.
    ctx.shadowColor = '#ffd166'
    ctx.shadowBlur = X(3)
    ctx.strokeStyle = '#ffe9a1'
    ctx.lineWidth = X(1)
    ctx.strokeText(texto, centro, posY, maxAncho)

    ctx.restore()
  }

  function textoSecundario(texto, y, tamano, color) {
    ctx.save()
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `900 ${tamano * sy}px Arial, sans-serif`
    ctx.lineWidth = X(4)
    ctx.strokeStyle = '#000814'
    ctx.strokeText(texto, w / 2, Y(y), X(660))
    ctx.fillStyle = color
    ctx.fillText(texto, w / 2, Y(y), X(660))
    ctx.restore()
  }

  const nombreFinal = (nombre.trim() || 'JUGADOR').toUpperCase()

  textoPremium(nombreFinal, 790, 78, 690)
  textoSecundario(insignia, 877, 35, '#ffffff')
  textoSecundario(
    `NIVEL ${nivel.toUpperCase()}`,
    930,
    28,
    '#ffd36a'
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob)
      else reject(new Error('No se pudo generar la tarjeta'))
    }, 'image/png')
  })
}
