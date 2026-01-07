import { OpenCartUseCase } from './open_cart'
import { CartStatus } from '@entities/cart.types'
import { HTTPConflict, HTTPNotFound } from '@utils/http'
import { ICartRepository } from '@ports/cart_repository'

describe('OpenCartUseCase', () => {
  let cartRepository: jest.Mocked<ICartRepository>
  let useCase: OpenCartUseCase

  beforeEach(() => {
    cartRepository = {
      create: jest.fn(),
      findByCustomerId: jest.fn(),
    } as jest.Mocked<ICartRepository>

    useCase = new OpenCartUseCase(cartRepository)
  })

  it('should throw HTTPConflict when cart already exists for the customer', async () => {
    const customerId = 'customer-123'
    cartRepository.findByCustomerId.mockResolvedValue({
      id: 'cart-123',
      status: CartStatus.Open,
      products: [],
      created_at: 1620000000000,
      updated_at: 1620000000000,
    } as any)

    const error = new HTTPConflict("Cart already exists for this customer")

    await expect(
      useCase.execute({ customerId })
    ).rejects.toThrow(error)
  })

  it('should create a new cart when none exists for the customer', async () => {
    const customerId = 'customer-123'
    cartRepository.findByCustomerId.mockResolvedValue(null)
    cartRepository.create.mockResolvedValue()
    const result = await useCase.execute({ customerId })

    expect(cartRepository.findByCustomerId).toHaveBeenCalledWith(customerId)
    expect(cartRepository.create).toHaveBeenCalled()
    expect(result).toHaveProperty('id')
  })

  it('should create a new cart when no customerId is provided', async () => {
    cartRepository.create.mockResolvedValue()
    const result = await useCase.execute({})
    expect(cartRepository.findByCustomerId).not.toHaveBeenCalled()
    expect(cartRepository.create).toHaveBeenCalled()
    expect(result).toHaveProperty('id')
  })
})
