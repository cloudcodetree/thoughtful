import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { IVpc, SubnetType } from 'aws-cdk-lib/aws-ec2';
import { Role } from 'aws-cdk-lib/aws-iam';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { LogLevel, NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { IHostedZone } from 'aws-cdk-lib/aws-route53';
import path = require('path');
import { prefixer } from '../../utils/utils';

export interface JobServiceTwoProps extends StackProps {
  vpc: IVpc;
  lambdaRole: Role;
  restApi: any;
  hostedZone: IHostedZone;
}

export class JobServiceTwo extends Stack {
  public readonly jobTwoFunction: Function;
  constructor(scope: Stack, id: string, props: JobServiceTwoProps) {
    super(scope, id, props);

    const { vpc, lambdaRole, restApi, hostedZone } = props;
    const fileBasePath = path.join(process.cwd(), '../../apps/api/src/app');

    this.jobTwoFunction = new NodejsFunction(
      this,
      `${prefixer('job-two-function')}`,
      {
        runtime: Runtime.NODEJS_14_X,
        vpc,
        vpcSubnets: {
          subnetType: SubnetType.PRIVATE_WITH_EGRESS,
        },
        memorySize: 1024,
        role: lambdaRole,
        timeout: Duration.seconds(5),
        handler: 'handler',
        entry: `${fileBasePath}/job-two-function.ts`,
        logRetention: RetentionDays.ONE_DAY,
        environment: {
          ENV: `dev`,
          TABLE_NAME: `some-table`,
        },
        bundling: {
          target: 'es2020',
          externalModules: ['aws-sdk'],
          logLevel: LogLevel.INFO,
        },
      }
    );

    const jobTwoInt = new LambdaIntegration(this.jobTwoFunction);
    const jobTwoRes = restApi.root.addResource('start');
    jobTwoRes.addMethod('POST', jobTwoInt);
  }
}
