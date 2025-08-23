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

let ssvNetwork: any, ssvViews: any, reentrantToken: any;

describe('Reentrancy Protection', () => {
  beforeEach(async () => {
    const metadata = await initializeContract('contracts/test/mocks/ReentrantToken.sol:ReentrantToken');
    ssvNetwork = metadata.ssvNetwork;
    ssvViews = metadata.ssvNetworkViews;
    reentrantToken = metadata.ssvToken;

    await reentrantToken.write.setTarget([ssvNetwork.address]);

    await registerOperators(0, 14, CONFIG.minimalOperatorFee);

    const networkFee = CONFIG.minimalOperatorFee;
    const burnPerBlock = CONFIG.minimalOperatorFee * 4n + networkFee;
    const minDepositAmount = BigInt(CONFIG.minimalBlocksBeforeLiquidation) * burnPerBlock;

    await ssvNetwork.write.updateNetworkFee([networkFee]);

    await coldRegisterValidator();
    await bulkRegisterValidators(
      4,
      1,
      DEFAULT_OPERATOR_IDS[4],
      minDepositAmount,
      { validatorCount: 0, networkFeeIndex: 0, index: 0, balance: 0n, active: true },
      [],
    );
    await mine(10);
  });

  it('prevents reentrant withdrawal of network earnings', async () => {
    const initial = await ssvViews.read.getNetworkEarnings();
    const amount = initial / 2n;
    await reentrantToken.write.enableAttack([1n]);
    await ssvNetwork.write.withdrawNetworkEarnings([amount]);
    const finalBalance = await ssvViews.read.getNetworkEarnings();
    expect(finalBalance).to.be.gte(initial - amount);
  });
});

