import { AwsRegion, AwsStage } from '../utils'

const mockConfig = { region: 'us-east-1' }

jest.mock('../utils', () => ({
  AwsRegion: {
    USEast1: 'us-east-1',
  },
  AwsStage: {
    Local: 'local',
  },
  newAwsConfig: jest.fn(() => mockConfig),
}))

const DynamoDBClientMock = jest.fn()

jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: DynamoDBClientMock,
}))

import { DynamoDBClientWrapper } from './dynamodb_client'
import { newAwsConfig } from '../utils'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

describe('DynamoDBClientWrapper', () => {
  const region = AwsRegion.USEast1
  const stage = AwsStage.Local

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create DynamoDBClient with aws config based on region and stage', () => {
    new DynamoDBClientWrapper(region, stage)

    expect(newAwsConfig).toHaveBeenCalledWith(region, stage)
    expect(DynamoDBClient).toHaveBeenCalledWith(mockConfig)
  })
})
