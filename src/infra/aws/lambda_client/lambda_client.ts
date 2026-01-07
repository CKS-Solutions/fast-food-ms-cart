import { LambdaClient } from "@aws-sdk/client-lambda"
import { AwsRegion, AwsStage, newAwsConfig } from "../utils"

export class LambdaClientWrapper extends LambdaClient {
	constructor(region: AwsRegion, stage: AwsStage) {
		const config = newAwsConfig(region, stage)
		super(config)
	}
}