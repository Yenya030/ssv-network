import { expect } from 'chai';
import { mine } from '@nomicfoundation/hardhat-network-helpers';
import {
  owners,
  initializeContract,
  registerOperators,
  coldRegisterValidator,
  bulkRegisterValidators,
  CONFIG,
  DEFAULT_OPERATOR_IDS,
} from '../helpers/contract-helpers';

describe('Operator zero amount earnings withdrawal', () => {
  let ssvNetwork: any;
  let ssvViews: any;

  beforeEach(async () => {
    const metadata = await initializeContract();
    ssvNetwork = metadata.ssvNetwork;
    ssvViews = metadata.ssvNetworkViews;

    await registerOperators(0, 4, CONFIG.minimalOperatorFee);

    const burnPerBlock = CONFIG.minimalOperatorFee * 4n;
    const minDepositAmount = BigInt(CONFIG.minimalBlocksBeforeLiquidation) * burnPerBlock;

    await coldRegisterValidator();
    await bulkRegisterValidators(
      4,
      1,
      DEFAULT_OPERATOR_IDS[4],
      minDepositAmount,
      { validatorCount: 0, networkFeeIndex: 0, index: 0, balance: 0n, active: true },
    );

    await mine(10);
  });

  it('withdrawOperatorEarnings with amount 0 withdraws all earnings for owner', async () => {
    const operatorId = 1n;
    const earningsBefore = await ssvViews.read.getOperatorEarnings([operatorId]);
    expect(earningsBefore).to.be.gt(0n);

    await ssvNetwork.write.withdrawOperatorEarnings([operatorId, 0n], {
      account: owners[0].account,
    });
    const earningsAfter = await ssvViews.read.getOperatorEarnings([operatorId]);
    expect(earningsAfter).to.equal(0n);
  });

  it('non-owner cannot withdraw operator earnings', async () => {
    const operatorId = 1n;
    await expect(
      ssvNetwork.write.withdrawOperatorEarnings([operatorId, 0n], {
        account: owners[1].account,
      }),
    ).to.be.rejectedWith('CallerNotOwnerWithData');
  });
});
