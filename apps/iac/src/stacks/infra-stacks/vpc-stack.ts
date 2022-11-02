import { Stack } from 'aws-cdk-lib';
import { IVpc, Vpc } from 'aws-cdk-lib/aws-ec2';
import { MainStackProps } from '../../main';
import { prefixer } from '../../utils/utils';

interface VpcStackProps extends MainStackProps {
  name: string;
}

export class VpcStack extends Stack {
  readonly vpc: IVpc;
  readonly name: string;

  constructor(scope: Stack, id: string, props: VpcStackProps) {
    super(scope, id, props);

    const { name } = props;

    this.vpc = new Vpc(this, `${prefixer(name)}`);
  }
}
