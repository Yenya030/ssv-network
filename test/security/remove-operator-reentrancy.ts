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
let networkFee: bigint, burnPerBlock: bigint, minDepositAmount: bigint;

describe('Operator removal reentrancy protections', () => {
  beforeEach(async () => {
    const metadata = await initializeContract('ReentrantToken');
    ssvNetwork = metadata.ssvNetwork;
    ssvViews = metadata.ssvNetworkViews;
    ssvToken = metadata.ssvToken;

    networkFee = CONFIG.minimalOperatorFee;
    await registerOperators(0, 14, CONFIG.minimalOperatorFee);

    burnPerBlock = CONFIG.minimalOperatorFee * 4n + networkFee;
    minDepositAmount = BigInt(CONFIG.minimalBlocksBeforeLiquidation) * burnPerBlock;

    await ssvNetwork.write.updateNetworkFee([networkFee]);

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

  it('removeOperator not vulnerable to token reentrancy', async () => {
    const operatorId = 1n;
    await ssvToken.write.setReentrancyTarget([
      ssvNetwork.address,
      owners[0].account.address,
      operatorId,
    ]);

    const earningsBefore = await ssvViews.read.getOperatorEarnings([operatorId]);
    expect(earningsBefore).to.be.gt(0n);

    await ssvNetwork.write.removeOperator([operatorId], { account: owners[0].account });

    const earningsAfter = await ssvViews.read.getOperatorEarnings([operatorId]);
    expect(earningsAfter).to.equal(0n);
  });
});
