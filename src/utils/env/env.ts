import { AwsRegion, AwsStage } from "@aws/utils"

export function getRegion(): AwsRegion {
	let region = process.env["REGION"]
	if (region === undefined || region === "") {
		region = AwsRegion.USEast1
	}

	return region as AwsRegion
}

export function getStage(): AwsStage {
	let stage = process.env["STAGE"]
	if (stage === undefined || stage === "") {
		stage = AwsStage.Local
	}

	return stage as AwsStage
}
