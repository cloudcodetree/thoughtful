import { Context, APIGatewayProxyCallback, APIGatewayEvent } from 'aws-lambda';

interface Request {
  name: string;
}
interface Response {
  name: string;
  id: number;
}
export const handler = (
  event: APIGatewayEvent,
  context: Context,
  callback: APIGatewayProxyCallback
): void => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Body: ${JSON.stringify(event.body, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);
  if (event.httpMethod === 'POST') {
    console.log('event.body', event.body);

    const request = JSON.parse(event.body) as Request;
    console.log('request', request);
    if (request.name) {
      const response: Response = {
        name: request.name,
        id: Math.floor(Math.random() * 1000),
      };
      console.log('response', response);
      callback(null, {
        statusCode: 200,
        body: JSON.stringify(response),
      });
    } else {
      callback(null, {
        statusCode: 400,
        body: JSON.stringify({
          message: 'invalid payload',
        }),
      });
    }
  } else {
    callback(null, {
      statusCode: 400,
      body: JSON.stringify({
        message: 'invalid method',
      }),
    });
  }
};
