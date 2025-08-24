import {
  initializeContract,
  registerOperators,
  bulkRegisterValidators,
  deposit,
  CONFIG,
  owners,
  DEFAULT_OPERATOR_IDS,
} from '../helpers/contract-helpers';
import { expect } from 'chai';
import { mine } from '@nomicfoundation/hardhat-network-helpers';

let ssvNetwork: any, ssvViews: any, ssvToken: any;
let networkFee: bigint, burnPerBlock: bigint, minDepositAmount: bigint; 
let cluster: any;

describe('Deposit reentrancy protections', () => {
  beforeEach(async () => {
    const metadata = await initializeContract('ReentrantToken');
    ssvNetwork = metadata.ssvNetwork;
    ssvViews = metadata.ssvNetworkViews;
    ssvToken = metadata.ssvToken;

    await registerOperators(0, 4, CONFIG.minimalOperatorFee);

    networkFee = CONFIG.minimalOperatorFee;
    burnPerBlock = CONFIG.minimalOperatorFee * 4n + networkFee;
    minDepositAmount = BigInt(CONFIG.minimalBlocksBeforeLiquidation) * burnPerBlock;

    await ssvNetwork.write.updateNetworkFee([networkFee]);

    const registered = await bulkRegisterValidators(
      0,
      1,
      DEFAULT_OPERATOR_IDS[4],
      minDepositAmount,
      { validatorCount: 0, networkFeeIndex: 0, index: 0, balance: 0n, active: true },
    );
    cluster = registered.args.cluster;

    await mine(10);
  });

  it('deposit not vulnerable to token reentrancy', async () => {
    const operatorId = 1n;
    await ssvToken.write.setReentrancyTarget([
      ssvNetwork.address,
      ssvNetwork.address,
      operatorId,
    ]);

    const earningsBefore = await ssvViews.read.getOperatorEarnings([operatorId]);

    await deposit(
      0,
      owners[0].account.address,
      DEFAULT_OPERATOR_IDS[4],
      minDepositAmount,
      cluster,
    );

    const earningsAfter = await ssvViews.read.getOperatorEarnings([operatorId]);
    expect(earningsAfter).to.be.gte(earningsBefore);
  });
});
