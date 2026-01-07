import { AddProductsToCartContainerFactory } from '@di/add_products_to_cart'
import { handler } from './add_products_to_cart'
import { HTTPNotFound, HTTPStatus } from '@utils/http'
import { APIGatewayProxyEvent } from 'aws-lambda'

jest.mock('@di/add_products_to_cart', () => ({
  AddProductsToCartContainerFactory: jest.fn(),
}))

describe('AddProductsToCart Lambda', () => {
  const mockExecute = jest.fn()
  const containerMock = { usecase: { execute: mockExecute } }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(AddProductsToCartContainerFactory as jest.Mock).mockImplementation(() => containerMock)
  })

  it('should return 400 when path parameter cart_id is missing', async () => {
    const event = { body: JSON.stringify({ products: [] }), pathParameters: {} } as any

    const response = await handler(event)

    expect(response.statusCode).toBe(HTTPStatus.BadRequest)
    expect(JSON.parse(response.body)).toEqual({ message: 'cartId path parameter is required' })
  })

  it('should return 400 when body is missing', async () => {
    const event = { body: null, pathParameters: { cart_id: 'cart-123' } } as any

    const response = await handler(event)

    expect(response.statusCode).toBe(HTTPStatus.BadRequest)
    expect(JSON.parse(response.body)).toEqual({ message: 'products array is required in the request body' })
  })

  it('should return 500 if request body is invalid', async () => {
    const event = { body: "invalid-json", pathParameters: { cart_id: 'cart-123' } } as any

    const response = await handler(event)

    expect(response.statusCode).toBe(500)
    expect(JSON.parse(response.body)).toEqual({ message: 'Internal Server Error' })
  })

  it('should call usecase.execute and return 200 on success', async () => {
    const event = {
      body: JSON.stringify({
        products: [{ id: 'prod-1', quantity: 2, price: 50 }],
      }),
      pathParameters: { cart_id: 'cart-123' },
    } as any

    const response = await handler(event)
    
    expect(mockExecute).toHaveBeenCalledWith('cart-123', [{ id: 'prod-1', quantity: 2, price: 50 }])
    expect(response.statusCode).toBe(HTTPStatus.OK)
    expect(JSON.parse(response.body)).toEqual({ data: { message: 'Products added to cart successfully' } })
  })

  it('should call usecase.execute with object body and return 200 on success', async () => {
    const event = {
      body: { products: [{ id: 'prod-1', quantity: 2, price: 50 }] },
      pathParameters: { cart_id: 'cart-123' },
    } as any

    const response = await handler(event)
    expect(mockExecute).toHaveBeenCalledWith('cart-123', [{ id: 'prod-1', quantity: 2, price: 50 }])
    expect(response.statusCode).toBe(HTTPStatus.OK)
    expect(JSON.parse(response.body)).toEqual({ data: { message: 'Products added to cart successfully' } })
  })

  it('should return error response if usecase throws HTTPError', async () => {
    const event = {
      body: { products: [{ id: 'prod-1', quantity: 2, price: 50 }] },
      pathParameters: { cart_id: 'cart-123' },
    } as any

    const error = new HTTPNotFound('not found')
    mockExecute.mockRejectedValue(error)

    const response = await handler(event)
    expect(response.statusCode).toBe(HTTPStatus.NotFound)
    expect(JSON.parse(response.body)).toEqual({ message: 'not found' })
  })

  it('should return 500 if unknown error occurs', async () => {
    const event = {
      body: { products: [{ id: 'prod-1', quantity: 2, price: 50 }] },
      pathParameters: { cart_id: 'cart-123' },
    } as any

    mockExecute.mockRejectedValue(new Error('unexpected'))

    const response = await handler(event)
    expect(response.statusCode).toBe(500)
    expect(JSON.parse(response.body)).toEqual({ message: 'Internal Server Error' })
  })
})
