import { expect } from 'chai';
import { ethers, upgrades } from 'hardhat';

describe('Security: Unauthorized initialization of SSVNetworkViews', function () {
  it('allows arbitrary account to initialize and take ownership', async function () {
    const [deployer, attacker] = await ethers.getSigners();

    const ViewsFactory = await ethers.getContractFactory('SSVNetworkViews');
    const proxy = await upgrades.deployProxy(ViewsFactory, [], {
      kind: 'uups',
      initializer: false,
    });
    await proxy.waitForDeployment();
    const proxyAddress = await proxy.getAddress();

    const views = await ethers.getContractAt('SSVNetworkViews', proxyAddress, attacker);
    await views.initialize(attacker.address);

    expect(await views.owner()).to.equal(attacker.address);
  });
});
