import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import './App.css'

type Dificultad = 'FACIL' | 'MEDIA' | 'ALTA'

type Receta = {
  id: number
  nombre: string
  descripcion: string
  ingredientes: string[]
  pasos: string[]
  tiempoMinutos: number
  porciones: number
  categoria: string
  dificultad: Dificultad
  destacada: boolean
  fechaCreacion: string
  fechaActualizacion: string
}

type EstadoPantalla = 'loading' | 'ready' | 'error'

type RecetaMedia = {
  imageUrl: string
  accent: string
}

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8081/api/recetas').replace(/\/$/, '')
const API_FALLBACK_URL = (import.meta.env.VITE_API_FALLBACK_URL ?? 'http://localhost:8080/api/recetas').replace(
  /\/$/,
  '',
)
const ORDEN_CATEGORIAS = ['Desayuno', 'Almuerzo', 'Comida rapida', 'Cena']

const RECETA_MEDIA: Record<string, RecetaMedia> = {
  'Arroz con huevo y alinos': {
    imageUrl:
      'https://images.unsplash.com/photo-1768634003113-42903d7ffe1b?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1600',
    accent: '#c86b3c',
  },
  'Pastas con queso': {
    imageUrl:
      'https://images.unsplash.com/photo-1772131575610-6928faa7ee7f?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1600',
    accent: '#b65d37',
  },
  'Torta de pescado': {
    imageUrl:
      'https://images.unsplash.com/photo-1760047550367-3d72fa3053c5?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1600',
    accent: '#8d6b4a',
  },
  'Hamburguesa doble carne': {
    imageUrl:
      'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1600',
    accent: '#7e3428',
  },
  'Salchipapas mixta': {
    imageUrl:
      'https://images.unsplash.com/photo-1762284513010-b2040f181d33?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1600',
    accent: '#bb5335',
  },
  'Arepa con huevo': {
    imageUrl:
      'https://images.unsplash.com/photo-1776286952319-53e7320e0cd0?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1600',
    accent: '#c47b34',
  },
  'Omelette de jamon y queso': {
    imageUrl:
      'https://images.unsplash.com/photo-1776286952319-53e7320e0cd0?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1600',
    accent: '#d08a42',
  },
  'Pollo guisado con arroz': {
    imageUrl:
      'https://images.unsplash.com/photo-1744705221097-e068637fe5a6?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1600',
    accent: '#927345',
  },
  'Sandwich de pollo': {
    imageUrl:
      'https://images.unsplash.com/photo-1713636342682-fd6f2c7eb1cd?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1600',
    accent: '#88604a',
  },
  'Ensalada de atun': {
    imageUrl:
      'https://images.unsplash.com/photo-1768326119231-bf064c1b8fdf?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1600',
    accent: '#3f7a6a',
  },
  'Sopa de verduras': {
    imageUrl:
      'https://images.unsplash.com/photo-1744094127448-90d2a828ed08?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1600',
    accent: '#5d8f63',
  },
  'Empanadas caseras': {
    imageUrl:
      'https://images.unsplash.com/photo-1769254870299-338bfd99aabd?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1600',
    accent: '#ba6a36',
  },
}

const CATEGORIA_MEDIA: Record<string, RecetaMedia> = {
  Desayuno: {
    imageUrl:
      'https://images.unsplash.com/photo-1776286952319-53e7320e0cd0?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1600',
    accent: '#c47b34',
  },
  Almuerzo: {
    imageUrl:
      'https://images.unsplash.com/photo-1744705221097-e068637fe5a6?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1600',
    accent: '#927345',
  },
  'Comida rapida': {
    imageUrl:
      'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1600',
    accent: '#7e3428',
  },
  Cena: {
    imageUrl:
      'https://images.unsplash.com/photo-1744094127448-90d2a828ed08?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=1600',
    accent: '#5d8f63',
  },
}

function ordenarCategorias(categorias: string[]) {
  const unicas = [...new Set(categorias.filter(Boolean))]
  const ordenadas = ORDEN_CATEGORIAS.filter((categoria) => unicas.includes(categoria))
  const extras = unicas.filter((categoria) => !ORDEN_CATEGORIAS.includes(categoria))
  return [...ordenadas, ...extras]
}

function textoDificultad(dificultad: Dificultad) {
  if (dificultad === 'FACIL') return 'Facil'
  if (dificultad === 'MEDIA') return 'Media'
  return 'Alta'
}

function obtenerMedia(receta: Receta) {
  return (
    RECETA_MEDIA[receta.nombre] ??
    CATEGORIA_MEDIA[receta.categoria] ?? {
      imageUrl:
        'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=1600',
      accent: '#80503a',
    }
  )
}

async function pedirJson<T>(ruta: string) {
  try {
    const respuestaPrincipal = await fetch(`${API_URL}${ruta}`)

    if (respuestaPrincipal.ok) {
      return (await respuestaPrincipal.json()) as T
    }
  } catch {
    // Si falla el primero, intentamos con el otro puerto.
  }

  const respuestaFallback = await fetch(`${API_FALLBACK_URL}${ruta}`)

  if (!respuestaFallback.ok) {
    throw new Error('No pude cargar las recetas desde el backend')
  }

  return (await respuestaFallback.json()) as T
}

function App() {
  const [recetas, setRecetas] = useState<Receta[]>([])
  const [categorias, setCategorias] = useState<string[]>([])
  const [destacadas, setDestacadas] = useState<Receta[]>([])
  const [rapidas, setRapidas] = useState<Receta[]>([])
  const [categoriaActiva, setCategoriaActiva] = useState('Todas')
  const [busqueda, setBusqueda] = useState('')
  const [estado, setEstado] = useState<EstadoPantalla>('loading')
  const [error, setError] = useState('')
  const [recetaAbiertaId, setRecetaAbiertaId] = useState<number | null>(null)

  useEffect(() => {
    let cancelado = false

    async function cargarRecetas() {
      setEstado('loading')
      setError('')

      try {
        const [dataRecetas, dataCategorias, dataDestacadas, dataRapidas] = await Promise.all([
          pedirJson<Receta[]>(''),
          pedirJson<string[]>('/categorias'),
          pedirJson<Receta[]>('/destacadas'),
          pedirJson<Receta[]>('/rapidas'),
        ])

        if (cancelado) {
          return
        }

        setRecetas(dataRecetas)
        setCategorias(ordenarCategorias(dataCategorias))
        setDestacadas(dataDestacadas)
        setRapidas(dataRapidas)
        setRecetaAbiertaId(dataRecetas[0]?.id ?? null)
        setEstado('ready')
      } catch (errorCargando) {
        if (cancelado) {
          return
        }

        setEstado('error')
        setError(errorCargando instanceof Error ? errorCargando.message : 'Paso algo raro cargando las recetas')
      }
    }

    cargarRecetas()

    return () => {
      cancelado = true
    }
  }, [])

  const categoriasOrdenadas = categorias.length
    ? categorias
    : ordenarCategorias(recetas.map((receta) => receta.categoria))

  const textoFiltro = busqueda.trim().toLowerCase()

  const recetasFiltradas = recetas.filter((receta) => {
    const coincideCategoria = categoriaActiva === 'Todas' || receta.categoria === categoriaActiva

    if (!coincideCategoria) {
      return false
    }

    if (!textoFiltro) {
      return true
    }

    const ingredientes = receta.ingredientes.join(' ').toLowerCase()

    return (
      receta.nombre.toLowerCase().includes(textoFiltro) ||
      receta.descripcion.toLowerCase().includes(textoFiltro) ||
      receta.categoria.toLowerCase().includes(textoFiltro) ||
      ingredientes.includes(textoFiltro)
    )
  })

  const secciones = categoriasOrdenadas
    .map((categoria) => ({
      categoria,
      recetas: recetasFiltradas.filter((receta) => receta.categoria === categoria),
    }))
    .filter((seccion) => seccion.recetas.length > 0)

  const tarjetasInicio = [...destacadas, ...rapidas]
    .filter((receta, index, lista) => lista.findIndex((item) => item.id === receta.id) === index)
    .slice(0, 4)

  const recetaHero = destacadas[0] ?? recetasFiltradas[0] ?? recetas[0] ?? null
  const mediaHero = recetaHero ? obtenerMedia(recetaHero) : null

  function enfocarReceta(id: number) {
    setRecetaAbiertaId(id)

    requestAnimationFrame(() => {
      const tarjeta = document.getElementById(`receta-${id}`)
      tarjeta?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }

  function alternarReceta(id: number) {
    setRecetaAbiertaId((actual) => (actual === id ? null : id))
  }

  function renderizarTarjeta(receta: Receta) {
    const abierta = recetaAbiertaId === receta.id
    const media = obtenerMedia(receta)

    return (
      <article
        id={`receta-${receta.id}`}
        key={receta.id}
        className={abierta ? 'recipe-card is-open' : 'recipe-card'}
        style={{ '--accent': media.accent } as CSSProperties}
      >
        <div className="recipe-card__image">
          <img src={media.imageUrl} alt={receta.nombre} loading="lazy" decoding="async" />
        </div>

        <div className="recipe-card__body">
          <div className="recipe-card__head">
            <div>
              <h3>{receta.nombre}</h3>
              <p>{receta.descripcion}</p>
            </div>
            {receta.destacada && <span className="recipe-badge">Top</span>}
          </div>

          <div className="recipe-meta">
            <span>{receta.categoria}</span>
            <span>{receta.tiempoMinutos} min</span>
            <span>{receta.porciones} porciones</span>
            <span>{textoDificultad(receta.dificultad)}</span>
          </div>

          <div className="ingredient-preview">
            {receta.ingredientes.slice(0, 4).map((ingrediente) => (
              <span key={ingrediente}>{ingrediente}</span>
            ))}
          </div>

          <button
            type="button"
            className="recipe-toggle"
            onClick={() => alternarReceta(receta.id)}
            aria-expanded={abierta}
          >
            {abierta ? 'Ocultar receta' : 'Ver receta completa'}
          </button>

          {abierta && (
            <div className="recipe-details">
              <div className="detail-block">
                <h4>Ingredientes</h4>
                <ul>
                  {receta.ingredientes.map((ingrediente) => (
                    <li key={ingrediente}>{ingrediente}</li>
                  ))}
                </ul>
              </div>

              <div className="detail-block">
                <h4>Preparacion</h4>
                <ol>
                  {receta.pasos.map((paso) => (
                    <li key={paso}>{paso}</li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>
      </article>
    )
  }

  return (
    <div className="page-shell">
      <main className="menu-page">
        <header className="hero-panel">
          <div className="hero-copy">
            <span className="hero-eyebrow">Carta casera</span>
            <h1>Recetas con sabor de casa</h1>
            <p>Todo el menu junto y visible rapido, sin tener que bajar tanto.</p>

            <div className="hero-stats">
              <span>{recetasFiltradas.length} recetas visibles</span>
              <span>{categoriasOrdenadas.length} categorias</span>
              <span>{destacadas.length} destacadas</span>
            </div>
          </div>

          {recetaHero && mediaHero && (
            <article className="hero-feature" style={{ '--accent': mediaHero.accent } as CSSProperties}>
              <img src={mediaHero.imageUrl} alt={recetaHero.nombre} loading="eager" />
              <div className="hero-feature__content">
                <span>Destacada</span>
                <h2>{recetaHero.nombre}</h2>
                <button type="button" onClick={() => enfocarReceta(recetaHero.id)}>
                  Ver receta
                </button>
              </div>
            </article>
          )}
        </header>

        <section className="toolbar">
          <label className="search-box" htmlFor="buscar-receta">
            <span>Buscar</span>
            <input
              id="buscar-receta"
              type="text"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="huevo, queso, atun..."
            />
          </label>

          <div className="filters">
            <button
              type="button"
              className={categoriaActiva === 'Todas' ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setCategoriaActiva('Todas')}
            >
              Todas
            </button>

            {categoriasOrdenadas.map((categoria) => (
              <button
                key={categoria}
                type="button"
                className={categoriaActiva === categoria ? 'filter-btn active' : 'filter-btn'}
                onClick={() => setCategoriaActiva(categoria)}
              >
                {categoria}
              </button>
            ))}
          </div>
        </section>

        {estado === 'loading' && (
          <section className="info-box">
            <h2>Cargando recetas...</h2>
          </section>
        )}

        {estado === 'error' && (
          <section className="info-box error-box">
            <h2>No cargaron las recetas</h2>
            <p>{error}</p>
          </section>
        )}

        {estado === 'ready' && (
          <>
            <section className="menu-layout">
              <div className="menu-sections">
                {secciones.length === 0 && (
                  <article className="info-box">
                    <h2>Sin resultados</h2>
                  </article>
                )}

                {secciones.map((seccion) => (
                  <section key={seccion.categoria} className="menu-section">
                    <div className="section-head">
                      <h2>{seccion.categoria}</h2>
                      <span>{seccion.recetas.length}</span>
                    </div>

                    <div className="cards-grid">{seccion.recetas.map((receta) => renderizarTarjeta(receta))}</div>
                  </section>
                ))}
              </div>
            </section>

            {tarjetasInicio.length > 0 && (
              <section className="highlight-block">
                <div className="section-head">
                  <h2>Para mirar rapido</h2>
                  <span>{tarjetasInicio.length}</span>
                </div>

                <div className="highlight-grid">
                  {tarjetasInicio.map((receta) => {
                    const media = obtenerMedia(receta)

                    return (
                      <button
                        key={receta.id}
                        type="button"
                        className="highlight-card"
                        onClick={() => enfocarReceta(receta.id)}
                        style={{ '--accent': media.accent } as CSSProperties}
                      >
                        <img src={media.imageUrl} alt={receta.nombre} loading="lazy" decoding="async" />
                        <div className="highlight-card__overlay">
                          <span>{receta.destacada ? 'Destacada' : 'Rapida'}</span>
                          <strong>{receta.nombre}</strong>
                          <small>
                            {receta.categoria} · {receta.tiempoMinutos} min
                          </small>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default App
