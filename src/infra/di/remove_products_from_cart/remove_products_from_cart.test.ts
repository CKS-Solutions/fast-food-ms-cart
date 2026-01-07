import { RemoveProductsFromCartContainerFactory } from './remove_products_from_cart'
import { AwsRegion, AwsStage } from '@aws/utils'

jest.mock('@aws/dynamodb_client', () => ({
  DynamoDBClientWrapper: jest.fn(),
}))

jest.mock('@driven_dynamodb/cart_repository', () => ({
  CartRepository: jest.fn(),
}))

jest.mock('@usecases/remove_products_from_cart', () => ({
  RemoveProductsFromCartUseCase: jest.fn(),
}))

import { DynamoDBClientWrapper } from '@aws/dynamodb_client'
import { CartRepository } from '@driven_dynamodb/cart_repository'
import { RemoveProductsFromCartUseCase } from '@usecases/remove_products_from_cart'

describe('RemoveProductsFromCartContainerFactory', () => {
  const region = AwsRegion.USEast1
  const stage = AwsStage.Local

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should correctly wire dependencies and expose usecase', () => {
    const factory = new RemoveProductsFromCartContainerFactory(region, stage)

    expect(DynamoDBClientWrapper).toHaveBeenCalledTimes(1)
    expect(DynamoDBClientWrapper).toHaveBeenCalledWith(region, stage)

    const dynamoInstance = (DynamoDBClientWrapper as jest.Mock).mock.instances[0]

    expect(CartRepository).toHaveBeenCalledTimes(1)
    expect(CartRepository).toHaveBeenCalledWith(dynamoInstance)

    const repoInstance = (CartRepository as jest.Mock).mock.instances[0]

    expect(RemoveProductsFromCartUseCase).toHaveBeenCalledTimes(1)
    expect(RemoveProductsFromCartUseCase).toHaveBeenCalledWith(repoInstance)

    expect(factory.usecase).toBe(
      (RemoveProductsFromCartUseCase as jest.Mock).mock.instances[0]
    )
  })
})
