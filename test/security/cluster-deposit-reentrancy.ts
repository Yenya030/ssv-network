import {
  owners,
  initializeContract,
  registerOperators,
  coldRegisterValidator,
  bulkRegisterValidators,
  CONFIG,
  DEFAULT_OPERATOR_IDS,
} from '../helpers/contract-helpers';
import { expect } from 'chai';
import { mine } from '@nomicfoundation/hardhat-network-helpers';

let ssvNetwork: any, ssvViews: any, ssvToken: any;
let minDepositAmount: bigint;
let cluster: any;

describe('Cluster deposit reentrancy', () => {
  beforeEach(async () => {
    const metadata = await initializeContract('ReentrantToken');
    ssvNetwork = metadata.ssvNetwork;
    ssvViews = metadata.ssvNetworkViews;
    ssvToken = metadata.ssvToken;

    await registerOperators(0, 14, CONFIG.minimalOperatorFee);

    const networkFee = CONFIG.minimalOperatorFee;
    await ssvNetwork.write.updateNetworkFee([networkFee]);

    minDepositAmount = BigInt(CONFIG.minimalBlocksBeforeLiquidation) * (networkFee + CONFIG.minimalOperatorFee * 4n);

    await coldRegisterValidator();

    cluster = (
      await bulkRegisterValidators(
        4,
        1,
        DEFAULT_OPERATOR_IDS[4],
        minDepositAmount,
        { validatorCount: 0, networkFeeIndex: 0, index: 0, balance: 0n, active: true },
      )
    ).args;

    await mine(10);
  });

  it('deposit not vulnerable to token reentrancy', async () => {
    const operatorId = 1n;
    await ssvToken.write.setReentrancyTarget([
      ssvNetwork.address,
      ssvNetwork.address,
      operatorId,
    ]);

    await ssvToken.write.approve([ssvNetwork.address, minDepositAmount], {
      account: owners[4].account,
    });

    const earningsBefore = await ssvViews.read.getOperatorEarnings([operatorId]);
    expect(earningsBefore).to.be.gt(0n);

    await ssvNetwork.write.deposit([
      cluster.owner,
      cluster.operatorIds,
      minDepositAmount,
      cluster.cluster,
    ], {
      account: owners[4].account,
    });

    const earningsAfter = await ssvViews.read.getOperatorEarnings([operatorId]);
    expect(earningsAfter).to.be.gt(0n);
  });
});
