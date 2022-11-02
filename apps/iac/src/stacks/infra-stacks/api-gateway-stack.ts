import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Cors, EndpointType, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { ARecord, IHostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { ApiGateway } from 'aws-cdk-lib/aws-route53-targets';
import { prefixer } from '../../utils/utils';

export interface ApiGatewayStackProps extends StackProps {
  name: string;
  subdomainName: string;
  domainName: string;
  cert: ICertificate;
  hostedZone: IHostedZone;
}

export class ApiGatewayStack extends Stack {
  readonly api: RestApi;
  constructor(scope: Stack, id: string, props: ApiGatewayStackProps) {
    super(scope, id, props);

    const { name, subdomainName, domainName, cert, hostedZone } = props;
    this.api = new RestApi(this, `${prefixer('api-gateway')}-${name}`, {
      description: 'example api gateway',
      deployOptions: {
        stageName: 'dev',
        tracingEnabled: true,
      },
      endpointTypes: [EndpointType.REGIONAL],
      defaultCorsPreflightOptions: {
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
        ],
        allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowCredentials: true,
        allowOrigins: Cors.ALL_ORIGINS,
      },
      domainName: {
        domainName: `${subdomainName}.${domainName}`,
        certificate: cert,
      },
    });
    this.api.root.addMethod('ANY');
    new ARecord(this, `${prefixer(name + '-alias-record')}`, {
      recordName: `${subdomainName}.${domainName}`,
      zone: hostedZone,
      target: RecordTarget.fromAlias(new ApiGateway(this.api)),
    });
    new CfnOutput(this, 'apiUrl', { value: this.api.url });
  }
}
