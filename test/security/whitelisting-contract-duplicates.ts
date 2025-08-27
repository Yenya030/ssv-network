import hre from 'hardhat';
import { expect } from 'chai';
import { initializeContract, registerOperators, owners, CONFIG } from '../helpers/contract-helpers';

describe('Security: whitelisting contract duplicate operator IDs', () => {
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
  });

  it('allows unsorted or duplicate operator IDs when setting whitelisting contract', async () => {
    const contractAddr = await mockWhitelistingContract.address;
    await expect(
      ssvNetwork.write.setOperatorsWhitelistingContract([[2, 1, 1], contractAddr], {
        account: owners[1].account,
      })
    ).to.not.be.rejected;

    const operator1 = await ssvNetworkViews.read.getOperatorById([1]);
    const operator2 = await ssvNetworkViews.read.getOperatorById([2]);

    expect((operator1[3] as string).toLowerCase()).to.equal(contractAddr.toLowerCase());
    expect((operator2[3] as string).toLowerCase()).to.equal(contractAddr.toLowerCase());
  });
});

