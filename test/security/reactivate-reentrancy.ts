import {
  initializeContract,
  registerOperators,
  coldRegisterValidator,
  bulkRegisterValidators,
  liquidate,
  reactivate,
  CONFIG,
  DEFAULT_OPERATOR_IDS,
} from '../helpers/contract-helpers';
import { expect } from 'chai';
import { mine } from '@nomicfoundation/hardhat-network-helpers';

let ssvNetwork: any, ssvViews: any, ssvToken: any;
let minDepositAmount: bigint;
let cluster: any;
let operatorIds: any;

// Ensures that reactivation deposits are not vulnerable to token-triggered reentrancy

describe('Reactivation reentrancy protections', () => {
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

    // Register validators and capture the cluster data
    const registered = await bulkRegisterValidators(
      4,
      1,
      DEFAULT_OPERATOR_IDS[4],
      minDepositAmount,
      { validatorCount: 0, networkFeeIndex: 0, index: 0, balance: 0n, active: true },
    );
    cluster = registered.args.cluster;
    operatorIds = DEFAULT_OPERATOR_IDS[4];
    const ownerAddress = registered.args.owner;

    await mine(10);

    // Liquidate the cluster to enable reactivation later
    cluster = (await liquidate(ownerAddress, operatorIds, cluster)).cluster;
  });

  it('reactivate not vulnerable to token reentrancy', async () => {
    const operatorId = 1n;
    await ssvToken.write.setReentrancyTarget([
      ssvNetwork.address,
      ssvNetwork.address,
      operatorId,
    ]);

    const earningsBefore = await ssvViews.read.getOperatorEarnings([operatorId]);

    await reactivate(4, operatorIds, minDepositAmount, cluster);

    const earningsAfter = await ssvViews.read.getOperatorEarnings([operatorId]);
    expect(earningsAfter).to.be.gte(earningsBefore);
  });
});

