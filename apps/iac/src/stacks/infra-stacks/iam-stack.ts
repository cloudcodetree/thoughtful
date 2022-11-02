import { Stack, StackProps } from 'aws-cdk-lib';
import {
  Effect,
  ManagedPolicy,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';
import { prefixer } from '../../utils/utils';

export class IamStack extends Stack {
  readonly lambdaRole: Role;

  constructor(scope: Stack, id: string, props: StackProps) {
    super(scope, id, props);

    this.lambdaRole = new Role(this, `${prefixer('lambda-role')}`, {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
    });

    this.lambdaRole.addManagedPolicy(
      ManagedPolicy.fromManagedPolicyArn(
        this,
        `${prefixer('lambda-basic-exacution-role')}`,
        'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole'
      )
    );

    this.lambdaRole.addToPolicy(
      PolicyStatement.fromJson({
        Effect: Effect.ALLOW,
        Action: [
          'dynamodb:BatchGetItem',
          'dynamodb:BatchWriteItem',
          'dynamodb:ConditionCheckItem',
          'dynamodb:PutItem',
          'dynamodb:DescribeTable',
          'dynamodb:DeleteItem',
          'dynamodb:GetItem',
          'dynamodb:Scan',
          'dynamodb:Query',
          'dynamodb:UpdateItem',
        ],
        Resource: ['*'],
      })
    );
    this.lambdaRole.addToPolicy(
      PolicyStatement.fromJson({
        Effect: Effect.ALLOW,
        Action: [
          'ec2:DescribeNetworkInterfaces',
          'ec2:CreateNetworkInterface',
          'ec2:DeleteNetworkInterface',
          'ec2:DescribeInstances',
          'ec2:AttachNetworkInterface',
        ],
        Resource: ['*'],
      })
    );
  }
}
