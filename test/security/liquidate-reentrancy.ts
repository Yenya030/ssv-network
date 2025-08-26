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
import { encodeFunctionData } from 'viem';

let ssvNetwork: any, ssvViews: any, ssvToken: any;
let minDepositAmount: bigint;
let cluster: any;
let networkFee: bigint;

describe('Cluster liquidation reentrancy', () => {
  beforeEach(async () => {
    const metadata = await initializeContract('ReentrantTokenGeneric');
    ssvNetwork = metadata.ssvNetwork;
    ssvViews = metadata.ssvNetworkViews;
    ssvToken = metadata.ssvToken;

    await registerOperators(0, 14, CONFIG.minimalOperatorFee);

    networkFee = CONFIG.minimalOperatorFee;
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

  it('liquidate not vulnerable to token reentrancy', async () => {
    const callData = encodeFunctionData({
      abi: ssvNetwork.abi,
      functionName: 'liquidate',
      args: [cluster.owner, cluster.operatorIds, cluster.cluster],
    });

    await ssvToken.write.setReentrancyTarget([
      ssvNetwork.address,
      cluster.owner,
      callData,
    ]);

    const balanceBefore = await ssvToken.read.balanceOf([cluster.owner]);
    const claimable = await ssvViews.read.getBalance([
      cluster.owner,
      cluster.operatorIds,
      cluster.cluster,
    ]);

    await ssvNetwork.write.liquidate(
      [cluster.owner, cluster.operatorIds, cluster.cluster],
      { account: owners[4].account },
    );

    const balanceAfter = await ssvToken.read.balanceOf([cluster.owner]);
    const perBlockBurn = networkFee + CONFIG.minimalOperatorFee * 4n;
    expect(balanceAfter - balanceBefore).to.equal(claimable - perBlockBurn);
  });
});

