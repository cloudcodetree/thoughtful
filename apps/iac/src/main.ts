import { Stack, App, StackProps } from 'aws-cdk-lib';
import { JobServiceOne } from './stacks/api-stacks/job-service-one';
import { AcmStack } from './stacks/infra-stacks/acm-stack';
import { ApiGatewayStack } from './stacks/infra-stacks/api-gateway-stack';
import { IamStack } from './stacks/infra-stacks/iam-stack';
import { Route53Stack } from './stacks/infra-stacks/route53-stack';
import { VpcStack } from './stacks/infra-stacks/vpc-stack';
import { config, prefixer } from './utils/utils';

const app = new App();

const domainName = `cloudcodetree.com`;
const company = `thoughtful`;
const stage = `sandbox`;
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: 'us-east-2',
};

config(company, stage);

export interface MainStackProps extends StackProps {
  domainName: string;
  company: string;
  stage: string;
}

class MainStack extends Stack {
  readonly route53Stack: Route53Stack;
  readonly acmStack: AcmStack;
  readonly vpcOneStack: VpcStack;
  readonly vpcTwoStack: VpcStack;
  readonly apiGatewayOneStack: ApiGatewayStack;
  readonly apiGatewayTwoStack: ApiGatewayStack;
  readonly jobServiceOne: JobServiceOne;
  readonly jobServiceTwo: JobServiceOne;
  readonly iamStack: IamStack;

  constructor(scope: App, id: string, props: MainStackProps) {
    super(scope, id, props);

    this.route53Stack = new Route53Stack(
      this,
      `${prefixer('route53-stack')}`,
      props
    );

    this.acmStack = new AcmStack(this, `${prefixer('acm-stack')}`, {
      ...props,
      hostedZone: this.route53Stack.hostedZone,
    });

    this.iamStack = new IamStack(this, `${prefixer('iam-stack')}`, props);

    this.vpcOneStack = new VpcStack(this, `${prefixer('vpc-stack-1')}`, {
      ...props,
      name: 'vpc1',
    });

    this.apiGatewayOneStack = new ApiGatewayStack(
      this,
      `${prefixer('api-gateway-one')}`,
      {
        ...props,
        name: 'one',
        cert: this.acmStack.certificate,
        hostedZone: this.route53Stack.hostedZone,
        subdomainName: 'service1',
      }
    );

    this.jobServiceOne = new JobServiceOne(
      this,
      `${prefixer('job-service-one-stack')}`,
      {
        ...props,
        vpc: this.vpcOneStack.vpc,
        lambdaRole: this.iamStack.lambdaRole,
        restApi: this.apiGatewayOneStack.api,
        hostedZone: this.route53Stack.hostedZone,
      }
    );
  }
}

new MainStack(app, `${prefixer('main-stack')}`, {
  env,
  domainName,
  company,
  stage,
});
