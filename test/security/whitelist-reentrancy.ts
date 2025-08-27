import hre from 'hardhat';
import { expect } from 'chai';
import { initializeContract, owners, DataGenerator, CONFIG } from '../helpers/contract-helpers';

describe('Security: whitelist reentrancy via getWhitelistedOperators', () => {
  let ssvNetwork: any;
  let ssvNetworkViews: any;
  let reentrantWhitelist: any;

  beforeEach(async () => {
    const metadata = await initializeContract();
    ssvNetwork = metadata.ssvNetwork;
    ssvNetworkViews = metadata.ssvNetworkViews;
    reentrantWhitelist = await hre.viem.deployContract('ReentrantUpdateNetworkFeeWhitelist', [ssvNetwork.address], {
      client: owners[0].client,
    });
    await ssvNetwork.write.registerOperator([DataGenerator.publicKey(0), CONFIG.minimalOperatorFee, true], {
      account: owners[1].account,
    });
    await ssvNetwork.write.setOperatorsWhitelistingContract([[1], await reentrantWhitelist.address], {
      account: owners[1].account,
    });
  });

  it('reentrancy attempt does not change network fee', async () => {
    const feeBefore = await ssvNetworkViews.read.getNetworkFee();
    const result = await ssvNetworkViews.read.getWhitelistedOperators([[1], owners[2].account.address]);
    expect(result).to.deep.equal([1n]);
    const feeAfter = await ssvNetworkViews.read.getNetworkFee();
    expect(feeAfter).to.equal(feeBefore);
  });
});

