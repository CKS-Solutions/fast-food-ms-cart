import { ExpireCartsContainerFactory } from '@di/expire_carts'
import { handler } from './expire_carts'
import { HTTPNotFound, HTTPStatus } from '@utils/http'

jest.mock('@di/expire_carts', () => ({
  ExpireCartsContainerFactory: jest.fn(),
}))

describe('ExpireCarts Lambda', () => {
  const mockExecute = jest.fn()
  const containerMock = { usecase: { execute: mockExecute } }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(ExpireCartsContainerFactory as jest.Mock).mockImplementation(() => containerMock)
  })

  it('should call usecase.execute and return 200 on success', async () => {
    const response = await handler()

    expect(mockExecute).toHaveBeenCalledTimes(1)
    expect(response.statusCode).toBe(HTTPStatus.OK)
    expect(JSON.parse(response.body)).toEqual({ data: null })
  })

  it('should return error response if usecase throws HTTPError', async () => {
    const error = new HTTPNotFound('not found')
    mockExecute.mockRejectedValue(error)

    const response = await handler()

    expect(response.statusCode).toBe(HTTPStatus.NotFound)
    expect(JSON.parse(response.body)).toEqual({ message: 'not found' })
  })

  it('should return 500 if unknown error occurs', async () => {
    mockExecute.mockRejectedValue(new Error('unexpected'))

    const response = await handler()

    expect(response.statusCode).toBe(500)
    expect(JSON.parse(response.body)).toEqual({ message: 'Internal Server Error' })
  })
})
