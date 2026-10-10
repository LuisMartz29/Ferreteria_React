import { useEffect, useMemo, useState } from 'react'
import { Hammer, Plus, Search, Pencil, Trash2, Package, Boxes, CircleDollarSign, X, RefreshCw } from 'lucide-react'

const API = 'http://localhost:8080/productos'
const emptyForm = { nombre: '', categoria: 'Herramientas', precio: '', stock: '' }

export default function App() {
  const [productos, setProductos] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function cargarProductos() {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(API)
      if (!response.ok) throw new Error('El servidor respondió con un error.')
      setProductos(await response.json())
    } catch {
      setError('No se pudo conectar con el backend. Comprueba que Docker esté ejecutándose y espera unos segundos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargarProductos() }, [])

  const filtrados = useMemo(() => productos.filter(p =>
    `${p.nombre} ${p.categoria}`.toLowerCase().includes(query.toLowerCase())
  ), [productos, query])

  const valorInventario = productos.reduce((sum, p) => sum + Number(p.precio || 0) * Number(p.stock || 0), 0)
  const unidades = productos.reduce((sum, p) => sum + Number(p.stock || 0), 0)

  function cambiar(campo, valor) { setForm(actual => ({ ...actual, [campo]: valor })) }

  async function guardar(e) {
    e.preventDefault()
    setError('')
    setNotice('')
    const payload = { nombre: form.nombre.trim(), categoria: form.categoria.trim(), precio: Number(form.precio), stock: Number(form.stock) }
    if (!payload.nombre || !payload.categoria || form.precio === '' || form.stock === '' || payload.precio < 0 || payload.stock < 0) {
      setError('Completa todos los campos con valores válidos. Precio y stock no pueden ser negativos.')
      return
    }
    try {
      const response = await fetch(editingId ? `${API}/${editingId}` : API, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!response.ok) {
        const body = await response.text()
        throw new Error(body || 'No se pudo guardar el producto.')
      }
      setNotice(editingId ? 'Producto actualizado correctamente.' : 'Producto registrado correctamente.')
      setForm(emptyForm)
      setEditingId(null)
      await cargarProductos()
    } catch (err) {
      setError(err.message || 'No se pudo guardar. Verifica que el backend esté activo.')
    }
  }

  function editar(p) {
    setEditingId(p.id)
    setForm({ nombre: p.nombre, categoria: p.categoria, precio: String(p.precio), stock: String(p.stock) })
    setNotice('')
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function eliminar(p) {
    if (!window.confirm(`¿Seguro que deseas eliminar "${p.nombre}"?`)) return
    setError('')
    setNotice('')
    try {
      const response = await fetch(`${API}/${p.id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('No se pudo eliminar el producto.')
      setNotice('Producto eliminado correctamente.')
      if (editingId === p.id) cancelar()
      await cargarProductos()
    } catch (err) { setError(err.message) }
  }

  function cancelar() { setForm(emptyForm); setEditingId(null); setError(''); setNotice('') }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand"><div className="brand-icon"><Hammer size={24}/></div><div><strong>Ferro<span>Gestión</span></strong><small>SISTEMA DE FERRETERÍA</small></div></div>
        <div className="topbar-right"><span className="status-dot"></span> Inventario conectado</div>
      </header>

      <main className="main">
        <section className="welcome">
          <div><p className="eyebrow">PANEL DE CONTROL</p><h1>Gestión de productos</h1><p className="subtitle">Administra el inventario de tu ferretería desde un solo lugar.</p></div>
          <button className="secondary-btn" onClick={cargarProductos}><RefreshCw size={16}/> Actualizar</button>
        </section>

        <section className="stats">
          <article className="stat-card"><div className="stat-icon blue"><Package size={21}/></div><div><p>Productos registrados</p><strong>{productos.length}</strong><small>Tipos de producto</small></div></article>
          <article className="stat-card"><div className="stat-icon purple"><Boxes size={21}/></div><div><p>Unidades en stock</p><strong>{unidades.toLocaleString('es-GT')}</strong><small>Unidades disponibles</small></div></article>
          <article className="stat-card"><div className="stat-icon green"><CircleDollarSign size={21}/></div><div><p>Valor del inventario</p><strong>{valorInventario.toLocaleString('es-GT', { style: 'currency', currency: 'GTQ' })}</strong><small>Precio × existencia</small></div></article>
        </section>

        {(error || notice) && <div className={error ? 'alert error' : 'alert success'}>{error || notice}<button onClick={() => { setError(''); setNotice('') }} aria-label="Cerrar"><X size={16}/></button></div>}

        <section className="content-grid">
          <article className="panel form-panel">
            <div className="panel-heading"><div><h2>{editingId ? 'Editar producto' : 'Registrar producto'}</h2><p>{editingId ? 'Actualiza los datos del producto.' : 'Añade un nuevo artículo al inventario.'}</p></div><span className="heading-icon"><Plus size={19}/></span></div>
            <form onSubmit={guardar}>
              <label>Nombre del producto<input value={form.nombre} onChange={e => cambiar('nombre', e.target.value)} placeholder="Ej. Martillo de acero" maxLength="120" required /></label>
              <label>Categoría<select value={form.categoria} onChange={e => cambiar('categoria', e.target.value)}><option>Herramientas</option><option>Tornillería</option><option>Electricidad</option><option>Plomería</option><option>Construcción</option><option>Pintura</option><option>Seguridad</option><option>Otros</option></select></label>
              <div className="form-row"><label>Precio (Q)<input type="number" min="0" step="0.01" value={form.precio} onChange={e => cambiar('precio', e.target.value)} placeholder="0.00" required /></label><label>Stock (unidades)<input type="number" min="0" step="1" value={form.stock} onChange={e => cambiar('stock', e.target.value)} placeholder="0" required /></label></div>
              <button className="primary-btn submit-btn" type="submit"><Plus size={17}/>{editingId ? 'Guardar cambios' : 'Registrar producto'}</button>
              {editingId && <button className="cancel-btn" type="button" onClick={cancelar}>Cancelar edición</button>}
            </form>
            <div className="form-note"><span>i</span> Los datos se guardan en la base de datos MySQL.</div>
          </article>

          <article className="panel inventory-panel">
            <div className="panel-heading inventory-heading"><div><h2>Inventario</h2><p>Listado de productos registrados</p></div><span className="count-pill">{productos.length} productos</span></div>
            <div className="search-box"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por nombre o categoría..." /></div>
            {loading ? <div className="empty-state">Cargando inventario...</div> : filtrados.length === 0 ? <div className="empty-state"><Package size={30}/><strong>No hay productos para mostrar</strong><span>Registra un producto o cambia la búsqueda.</span></div> :
              <div className="table-wrap"><table><thead><tr><th>PRODUCTO</th><th>CATEGORÍA</th><th>PRECIO</th><th>STOCK</th><th>ACCIONES</th></tr></thead><tbody>{filtrados.map(p => <tr key={p.id}><td><div className="product-name"><span className="product-mini"><Hammer size={16}/></span><div><strong>{p.nombre}</strong><small>ID #{p.id}</small></div></div></td><td><span className="category">{p.categoria}</span></td><td className="price">{Number(p.precio).toLocaleString('es-GT', { style: 'currency', currency: 'GTQ' })}</td><td><span className={Number(p.stock) <= 5 ? 'stock low' : 'stock'}>{p.stock} uds.</span></td><td><div className="actions"><button className="icon-btn edit" title="Editar" onClick={() => editar(p)}><Pencil size={16}/></button><button className="icon-btn delete" title="Eliminar" onClick={() => eliminar(p)}><Trash2 size={16}/></button></div></td></tr>)}</tbody></table></div>}
            <div className="table-footer"><span>Mostrando {filtrados.length} de {productos.length} productos</span><span className="api-status"><span className="status-dot"></span> API REST</span></div>
          </article>
        </section>
        <footer>FerroGestión · Sistema de Gestión de Ferretería <span>React · Spring Boot · MySQL</span></footer>
      </main>
    </div>
  )
}
