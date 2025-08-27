import { expect } from 'chai';
import { ethers, upgrades } from 'hardhat';

// Test that initializing SSVNetworkViews with address(0) bricks the contract
// by making subsequent view calls revert.
describe('SSVNetworkViews: zero address initialization', function () {
  it('allows initializing with address(0), rendering views unusable', async function () {
    const [attacker] = await ethers.getSigners();
    const ViewsFactory = await ethers.getContractFactory('SSVNetworkViews');
    const proxy = await upgrades.deployProxy(ViewsFactory, [], {
      kind: 'uups',
      initializer: false,
    });
    await proxy.waitForDeployment();
    const views = await ethers.getContractAt('SSVNetworkViews', await proxy.getAddress(), attacker);

    await views.initialize(ethers.ZeroAddress);

    await expect(views.getNetworkFee()).to.be.reverted;
  });
});
