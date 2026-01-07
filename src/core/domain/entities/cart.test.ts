import { Cart } from './cart'
import { CartStatus } from './cart.types'

jest.mock('node:crypto', () => ({
  randomUUID: jest.fn(() => 'uuid-123'),
}))

describe('Cart', () => {
  const NOW = 1620000000000

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(NOW)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('constructor', () => {
    it('should set properties correctly', () => {
      const cart = new Cart({
        id: 'cart-123',
        status: CartStatus.Open,
        customerId: 'customer-123',
        createdAt: 1620000000000,
        updatedAt: 1620000000000,
      })

      expect(cart.id).toBe('cart-123')
      expect(cart.status).toBe(CartStatus.Open)
      expect(cart.customer_id).toBe('customer-123')
      expect(cart.products).toEqual([])
      expect(cart.created_at).toBe(1620000000000)
      expect(cart.updated_at).toBe(1620000000000)
    })

    it('should handle products array', () => {
      const cart = new Cart({
        id: 'cart-123',
        status: CartStatus.Open,
        products: [{ product_id: 'prod-1', quantity: 2, price: 50 }],
        createdAt: 1620000000000,
        updatedAt: 1620000000000,
      })

      expect(cart.products).toEqual([{ product_id: 'prod-1', quantity: 2, price: 50 }])
    })

    it('should set expires_at to default if not provided', () => {
      const cart = Cart.create()

      expect(cart.expires_at).toBe(1620000000000 + 1 * 60 * 60 * 1000)
    })
  })

  describe('create', () => {
    it('should create a payment with default values', () => {
      const cart = Cart.create()

      expect(cart).toBeInstanceOf(Cart)

      expect(cart.id).toBe('uuid-123')
      expect(cart.status).toBe(CartStatus.Open)
      expect(cart.products).toEqual([])
    })

    it('should set created_at and updated_at to now', () => {
      const cart = Cart.create()

      expect(cart.created_at).toBe(NOW)
      expect(cart.updated_at).toBe(NOW)
    })

    it('should set customer_id if provided', () => {
      const cart = Cart.create('customer-123')
      expect(cart.customer_id).toBe('customer-123')
    })
  })

  describe('addProducts', () => {
    it('should add new products to the cart', () => {
      const cart = Cart.create()
      cart.addProducts([{ product_id: 'prod-1', quantity: 2, price: 50 }])

      expect(cart.products).toEqual([{ product_id: 'prod-1', quantity: 2, price: 50 }])
    })

    it('should update quantity and price of existing products', () => {
      const cart = Cart.create()
      cart.addProducts([{ product_id: 'prod-1', quantity: 2, price: 50 }])
      cart.addProducts([{ product_id: 'prod-1', quantity: 3, price: 60 }])

      expect(cart.products).toEqual([{ product_id: 'prod-1', quantity: 5, price: 60 }])
    })

    it('should update update_at and expires_at on adding products', () => {
      const cart = Cart.create()
      const initialExpiresAt = cart.expires_at

      jest.spyOn(Date, 'now').mockReturnValue(NOW + 5000)

      cart.addProducts([{ product_id: 'prod-1', quantity: 2, price: 50 }])

      expect(cart.updated_at).toBe(NOW + 5000)
      expect(cart.expires_at).toBe(initialExpiresAt! + 5000)
    })
  })

  describe('removeProducts', () => {
    it('should remove products from the cart', () => {
      const cart = Cart.create()
      cart.addProducts([
        { product_id: 'prod-1', quantity: 2, price: 50 },
        { product_id: 'prod-2', quantity: 1, price: 30 },
      ])

      cart.removeProducts(['prod-1'])

      expect(cart.products).toEqual([{ product_id: 'prod-2', quantity: 1, price: 30 }])
    })

    it('should do nothing if product to remove is not in the cart', () => {
      const cart = Cart.create()
      cart.addProducts([{ product_id: 'prod-1', quantity: 2, price: 50 }])

      cart.removeProducts(['prod-2'])

      expect(cart.products).toEqual([{ product_id: 'prod-1', quantity: 2, price: 50 }])
    })

    it('should update updated_at and expires_at on removing products', () => {
      const cart = Cart.create()
      cart.addProducts([
        { product_id: 'prod-1', quantity: 2, price: 50 },
        { product_id: 'prod-2', quantity: 1, price: 30 },
      ])
      const initialExpiresAt = cart.expires_at

      jest.spyOn(Date, 'now').mockReturnValue(NOW + 5000)

      cart.removeProducts(['prod-1'])

      expect(cart.updated_at).toBe(NOW + 5000)
      expect(cart.expires_at).toBe(initialExpiresAt! + 5000)
    })
  })

  describe('checkout', () => {
    it('should set cart status to Closed', () => {
      const cart = Cart.create()
      cart.checkout()

      expect(cart.status).toBe(CartStatus.Closed)
    })

    it('should update updated_at on checkout', () => {
      const cart = Cart.create()
      const initialUpdatedAt = cart.updated_at

      jest.spyOn(Date, 'now').mockReturnValue(NOW + 5000)

      cart.checkout()

      expect(cart.updated_at).toBe(NOW + 5000)
      expect(cart.updated_at).not.toBe(initialUpdatedAt)
    })

    it('should delete expires_at on checkout', () => {
      const cart = Cart.create()
      cart.checkout()

      expect(cart.expires_at).toBeUndefined()
    })
  })
})
