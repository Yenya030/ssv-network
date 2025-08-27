import hre from 'hardhat';
import { expect } from 'chai';
import { initializeContract, registerOperators, owners, CONFIG } from '../helpers/contract-helpers';

describe('Security: whitelisting contract removal duplicate operator IDs', () => {
  let ssvNetwork: any;
  let ssvNetworkViews: any;
  let mockWhitelistingContract: any;

  beforeEach(async () => {
    const metadata = await initializeContract();
    ssvNetwork = metadata.ssvNetwork;
    ssvNetworkViews = metadata.ssvNetworkViews;
    mockWhitelistingContract = await hre.viem.deployContract('MockWhitelistingContract', [[]], {
      client: owners[0].client,
    });
    await registerOperators(1, 2, CONFIG.minimalOperatorFee);
    const contractAddr = await mockWhitelistingContract.address;
    await ssvNetwork.write.setOperatorsWhitelistingContract([[1, 2], contractAddr], {
      account: owners[1].account,
    });
  });

  it('allows unsorted or duplicate operator IDs when removing whitelisting contract', async () => {
    await expect(
      ssvNetwork.write.removeOperatorsWhitelistingContract([[2, 1, 1]], {
        account: owners[1].account,
      }),
    ).to.not.be.rejected;

    const operator1 = await ssvNetworkViews.read.getOperatorById([1]);
    const operator2 = await ssvNetworkViews.read.getOperatorById([2]);
    expect(operator1[3]).to.equal(hre.ethers.ZeroAddress);
    expect(operator2[3]).to.equal(hre.ethers.ZeroAddress);
  });
});
