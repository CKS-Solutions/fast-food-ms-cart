import { Cart } from '@entities/cart'
import { CartStatus } from '@entities/cart.types'

jest.mock('@aws-sdk/lib-dynamodb', () => ({
  PutCommand: jest.fn(),
  QueryCommand: jest.fn(),
}))

jest.mock('@aws/dynamodb_client', () => ({
  DynamoDBClientWrapper: jest.fn(),
}))

import { CartRepository } from './cart_repository'
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'

describe('CartRepository', () => {
  let client: any
  let repo: CartRepository

  beforeEach(() => {
    client = {
      send: jest.fn().mockImplementation((params) => ({ params })),
    }
    repo = new CartRepository(client)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('create', () => {
    it('should send PutCommand', async () => {
      const cart = {} as Cart
      client.send.mockResolvedValue({})

      await repo.create(cart)
      expect(client.send).toHaveBeenCalledWith(expect.any(PutCommand))
    })
  })

  describe('findByCustomerId', () => {
    it('should return cart when found', async () => {
      const customerId = 'customer-123'
      const mockCart = {
        id: 'cart-123',
        status: CartStatus.Open,
        products: [],
        created_at: 1620000000000,
        updated_at: 1620000000000,
      } as Cart

      client.send.mockResolvedValue({ Items: [mockCart] })

      const result = await repo.findByCustomerId(customerId)
      expect(result).toEqual(mockCart)
      expect(client.send).toHaveBeenCalledWith(expect.any(QueryCommand))
    })

    it('should return null when no cart found', async () => {
      const customerId = 'customer-123'
      client.send.mockResolvedValue({ Items: [] })

      const result = await repo.findByCustomerId(customerId)
      expect(result).toBeNull()
    })
  })
})
