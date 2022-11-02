import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { IVpc, SubnetType } from 'aws-cdk-lib/aws-ec2';
import { Role } from 'aws-cdk-lib/aws-iam';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { LogLevel, NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import {
  ARecord,
  HostedZone,
  IHostedZone,
  RecordTarget,
} from 'aws-cdk-lib/aws-route53';
import {
  LoadBalancerTarget,
  ApiGateway,
} from 'aws-cdk-lib/aws-route53-targets';
import path = require('path');
import { prefixer } from '../../utils/utils';

export interface JobServiceOneProps extends StackProps {
  vpc: IVpc;
  lambdaRole: Role;
  restApi: any;
  hostedZone: IHostedZone;
}

export class JobServiceOne extends Stack {
  public readonly jobOneFunction: Function;
  constructor(scope: Stack, id: string, props: JobServiceOneProps) {
    super(scope, id, props);

    const { vpc, lambdaRole, restApi, hostedZone } = props;
    const fileBasePath = path.join(process.cwd(), '../../apps/api/src/app');

    this.jobOneFunction = new NodejsFunction(
      this,
      `${prefixer('job-one-function')}`,
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
        entry: `${fileBasePath}/job-one-function.ts`,
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

    const jobOneInt = new LambdaIntegration(this.jobOneFunction);
    const jobOneRes = restApi.root.addResource('job');
    jobOneRes.addMethod('POST', jobOneInt);

    // new ARecord(this, `${prefixer('job-one-a-record')}`, {
    //   recordName: 'thoughtful-service-1',
    //   zone: hostedZone,
    //   target: RecordTarget.fromAlias(new ApiGateway(restApi)),
    //   ttl: Duration.minutes(1),
    // });
  }
}
