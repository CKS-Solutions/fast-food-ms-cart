import { AddProductsToCartContainerFactory } from './add_products_to_cart'
import { AwsRegion, AwsStage } from '@aws/utils'

jest.mock('@aws/dynamodb_client', () => ({
  DynamoDBClientWrapper: jest.fn(),
}))

jest.mock('@driven_dynamodb/cart_repository', () => ({
  CartRepository: jest.fn(),
}))

jest.mock('@usecases/add_products_to_cart', () => ({
  AddProductsToCartUseCase: jest.fn(),
}))

import { DynamoDBClientWrapper } from '@aws/dynamodb_client'
import { CartRepository } from '@driven_dynamodb/cart_repository'
import { AddProductsToCartUseCase } from '@usecases/add_products_to_cart'

describe('AddProductsToCartContainerFactory', () => {
  const region = AwsRegion.USEast1
  const stage = AwsStage.Local

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should correctly wire dependencies and expose usecase', () => {
    const factory = new AddProductsToCartContainerFactory(region, stage)

    expect(DynamoDBClientWrapper).toHaveBeenCalledTimes(1)
    expect(DynamoDBClientWrapper).toHaveBeenCalledWith(region, stage)

    const dynamoInstance = (DynamoDBClientWrapper as jest.Mock).mock.instances[0]

    expect(CartRepository).toHaveBeenCalledTimes(1)
    expect(CartRepository).toHaveBeenCalledWith(dynamoInstance)

    const repoInstance = (CartRepository as jest.Mock).mock.instances[0]

    expect(AddProductsToCartUseCase).toHaveBeenCalledTimes(1)
    expect(AddProductsToCartUseCase).toHaveBeenCalledWith(repoInstance)

    expect(factory.usecase).toBe(
      (AddProductsToCartUseCase as jest.Mock).mock.instances[0]
    )
  })
})
