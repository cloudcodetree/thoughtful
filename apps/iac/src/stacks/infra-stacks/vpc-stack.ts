import { Stack } from 'aws-cdk-lib';
import { IVpc, SubnetType, Vpc, IIpAddresses } from 'aws-cdk-lib/aws-ec2';
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

    this.vpc = new Vpc(this, `${prefixer(name)}`, {
      natGateways: 1,
      maxAzs: 1,
      subnetConfiguration: [
        {
          name: 'private-subnet-1',
          subnetType: SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 24,
        },
        {
          name: 'public-subnet-1',
          subnetType: SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: 'isolated-subnet-1',
          subnetType: SubnetType.PRIVATE_ISOLATED,
          cidrMask: 24,
        },
      ],
    });
  }
}
