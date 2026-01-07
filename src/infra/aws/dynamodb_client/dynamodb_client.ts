import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { AwsRegion, AwsStage, newAwsConfig } from "../utils"

export class DynamoDBClientWrapper extends DynamoDBClient {
	constructor(region: AwsRegion, stage: AwsStage) {
		const config = newAwsConfig(region, stage)
		super(config)
	}
}