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

let ssvNetwork: any, ssvToken: any;
let minDepositAmount: bigint;
let cluster: any;

describe('Cluster self-liquidation bypass', () => {
  beforeEach(async () => {
    const metadata = await initializeContract();
    ssvNetwork = metadata.ssvNetwork;
    ssvToken = metadata.ssvToken;

    await registerOperators(0, 4, CONFIG.minimalOperatorFee);

    const networkFee = CONFIG.minimalOperatorFee;
    await ssvNetwork.write.updateNetworkFee([networkFee]);

    minDepositAmount = BigInt(CONFIG.minimalBlocksBeforeLiquidation) *
      (networkFee + CONFIG.minimalOperatorFee * 4n);

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

  it('allows cluster owner to liquidate healthy cluster', async () => {
    const ownerAccount = owners[4].account;
    const balanceBefore = await ssvToken.read.balanceOf([ownerAccount.address]);

    await ssvNetwork.write.liquidate(
      [cluster.owner, cluster.operatorIds, cluster.cluster],
      { account: ownerAccount },
    );

    const balanceAfter = await ssvToken.read.balanceOf([ownerAccount.address]);
    expect(balanceAfter).to.be.gt(balanceBefore);
  });
});
