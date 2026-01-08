import { InvokeCommand } from "@aws-sdk/client-lambda";

import { LambdaClientWrapper } from "@aws/lambda_client";
import { ILambdaAdapter } from "@ports/lambda";
import path from "path";

export class LambdaAdapter implements ILambdaAdapter {
  private readonly lambdaClient: LambdaClientWrapper;

  constructor(lambdaClient: LambdaClientWrapper) {
    this.lambdaClient = lambdaClient;
  }

  async invokeEvent(functionName: string, body: any): Promise<void> {
    const command = new InvokeCommand({
      FunctionName: functionName,
      Payload: Buffer.from(JSON.stringify({
        body,
      })),
      InvocationType: "Event",
    })

    await this.lambdaClient.send(command);
  }

  async invoke<T>(functionName: string, pathParams: any): Promise<T | null> {
    const command = new InvokeCommand({
      FunctionName: functionName,
      Payload: Buffer.from(JSON.stringify({
        pathParameters: pathParams,
      })),
      InvocationType: "RequestResponse",
    })

    const response = await this.lambdaClient.send(command);

    if (response.Payload) {
      const payloadString = Buffer.from(response.Payload).toString();
      const payload = JSON.parse(payloadString);
      return payload as T;
    }

    return null;
  }
}