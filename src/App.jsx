import { useEffect, useMemo, useState } from 'react'

function App() {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [menu, setMenu] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [cart, setCart] = useState([])
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' })
  const [placing, setPlacing] = useState(false)
  const [orderResult, setOrderResult] = useState(null)

  const fetchMenu = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${baseUrl}/api/menu`)
      if (!res.ok) throw new Error(`Failed to load menu (${res.status})`)
      const data = await res.json()
      setMenu(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMenu()
  }, [])

  const addToCart = (pizza, size = 'Medium') => {
    const existingIndex = cart.findIndex(
      (c) => c.pizza_id === pizza.id && c.size === size
    )
    if (existingIndex >= 0) {
      const copy = [...cart]
      copy[existingIndex].quantity += 1
      setCart(copy)
    } else {
      setCart([
        ...cart,
        {
          pizza_id: pizza.id,
          name: pizza.name,
          size,
          quantity: 1,
          unit_price: pizza.price,
          toppings: [],
        },
      ])
    }
  }

  const updateQty = (idx, delta) => {
    const copy = [...cart]
    copy[idx].quantity += delta
    if (copy[idx].quantity <= 0) copy.splice(idx, 1)
    setCart(copy)
  }

  const totals = useMemo(() => {
    const subtotal = cart.reduce((s, i) => s + i.unit_price * i.quantity, 0)
    const tax = +(subtotal * 0.08).toFixed(2)
    const total = +(subtotal + tax).toFixed(2)
    return { subtotal: +subtotal.toFixed(2), tax, total }
  }, [cart])

  const placeOrder = async () => {
    if (!customer.name || !customer.phone || !customer.address) {
      alert('Please fill in name, phone, and address')
      return
    }
    if (cart.length === 0) {
      alert('Your cart is empty')
      return
    }
    setPlacing(true)
    setOrderResult(null)
    try {
      const res = await fetch(`${baseUrl}/api/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customer.name,
          phone: customer.phone,
          address: customer.address,
          items: cart,
        }),
      })
      if (!res.ok) throw new Error('Failed to place order')
      const data = await res.json()
      setOrderResult({ id: data.id, total: data.total })
      setCart([])
    } catch (e) {
      alert(e.message)
    } finally {
      setPlacing(false)
    }
  }

  const seedMenu = async () => {
    const samples = [
      {
        name: 'Margherita',
        description: 'Tomato, mozzarella, fresh basil',
        price: 10.99,
        vegetarian: true,
        spicy: false,
        image_url: 'https://images.unsplash.com/photo-1544989164-31dc3c645987?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Pepperoni',
        description: 'Pepperoni, mozzarella, tomato sauce',
        price: 12.49,
        vegetarian: false,
        spicy: false,
        image_url: 'https://images.unsplash.com/photo-1548365328-9f547fb0957d?q=80&w=800&auto=format&fit=crop',
      },
      {
        name: 'Diavola',
        description: 'Spicy salami, chili, tomato, mozzarella',
        price: 13.99,
        vegetarian: false,
        spicy: true,
        image_url: 'https://images.unsplash.com/photo-1600628421055-4d9d88b91a43?q=80&w=800&auto=format&fit=crop',
      },
    ]

    try {
      await Promise.all(
        samples.map((p) =>
          fetch(`${baseUrl}/api/menu`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(p),
          })
        )
      )
      await fetchMenu()
    } catch (e) {
      alert('Failed to add sample pizzas')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-rose-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-rose-600">Flames Pizzeria</h1>
          <div className="text-sm text-gray-600">
            Cart: <span className="font-semibold">{cart.reduce((s, i) => s + i.quantity, 0)}</span> items ·
            <span className="ml-1 font-semibold">${totals.total.toFixed(2)}</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-8">
        <section className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Menu</h2>
            <div className="flex items-center gap-2">
              <button
                className="text-sm text-gray-600 hover:text-gray-800 underline"
                onClick={fetchMenu}
              >
                Refresh
              </button>
              {menu.length === 0 && !loading && (
                <button
                  className="text-sm bg-rose-500 hover:bg-rose-600 text-white rounded px-3 py-1"
                  onClick={seedMenu}
                >
                  Add sample pizzas
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <p className="text-gray-600">Loading menu…</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : menu.length === 0 ? (
            <p className="text-gray-700">No pizzas yet. Use the button above to add samples.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {menu.map((p) => (
                <div key={p.id} className="bg-white rounded-lg shadow hover:shadow-md transition overflow-hidden">
                  {p.image_url && (
                    <img src={p.image_url} alt={p.name} className="h-36 w-full object-cover" />
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-800">{p.name}</h3>
                      <span className="text-rose-600 font-bold">${p.price.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 min-h-[2.5rem]">{p.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {p.vegetarian && (
                        <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">Veg</span>
                      )}
                      {p.spicy && (
                        <span className="text-xs px-2 py-0.5 rounded bg-orange-100 text-orange-700">Spicy</span>
                      )}
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {['Small','Medium','Large'].map((s) => (
                        <button
                          key={s}
                          onClick={() => addToCart(p, s)}
                          className="text-sm border rounded px-2 py-1 hover:bg-rose-50"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="md:col-span-1">
          <h2 className="text-xl font-bold mb-3">Your Order</h2>
          <div className="bg-white rounded-lg shadow p-4 space-y-3">
            {cart.length === 0 ? (
              <p className="text-gray-600">Your cart is empty.</p>
            ) : (
              <div className="space-y-3">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-800">{item.name} • {item.size}</p>
                      <p className="text-sm text-gray-600">${item.unit_price.toFixed(2)} × {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="w-7 h-7 rounded border" onClick={() => updateQty(idx, -1)}>-</button>
                      <button className="w-7 h-7 rounded border" onClick={() => updateQty(idx, 1)}>+</button>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-3 text-sm text-gray-700 space-y-1">
                  <div className="flex justify-between"><span>Subtotal</span><span>${totals.subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Tax</span><span>${totals.tax.toFixed(2)}</span></div>
                  <div className="flex justify-between font-semibold text-gray-900"><span>Total</span><span>${totals.total.toFixed(2)}</span></div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-4 mt-4 space-y-3">
            <h3 className="font-semibold">Delivery Details</h3>
            <input
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              placeholder="Full name"
              className="w-full border rounded px-3 py-2 text-sm"
            />
            <input
              value={customer.phone}
              onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
              placeholder="Phone"
              className="w-full border rounded px-3 py-2 text-sm"
            />
            <textarea
              value={customer.address}
              onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
              placeholder="Delivery address"
              rows={3}
              className="w-full border rounded px-3 py-2 text-sm"
            />
            <button
              disabled={placing || cart.length === 0}
              onClick={placeOrder}
              className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold rounded py-2"
            >
              {placing ? 'Placing…' : 'Place Order'}
            </button>
            {orderResult && (
              <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded p-2">
                Order placed! ID: {orderResult.id} · Total charged ${orderResult.total.toFixed(2)}
              </p>
            )}
          </div>
        </aside>
      </main>

      <footer className="py-6 text-center text-sm text-gray-500">
        Backend: <span className="font-mono">{baseUrl}</span>
      </footer>
    </div>
  )
}

export default App
