import { InvokeCommand } from "@aws-sdk/client-lambda";

import { LambdaClientWrapper } from "@aws/lambda_client";
import { ILambdaAdapter } from "@ports/lambda";

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
}