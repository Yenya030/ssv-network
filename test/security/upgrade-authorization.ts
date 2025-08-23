import { owners, initializeContract } from '../helpers/contract-helpers';
import { expect } from 'chai';
import hre from 'hardhat';
import { Address } from 'viem';

// Ensures that only the contract owner can upgrade the SSVNetwork implementation
// A successful exploit would allow an attacker to take control of the network.

describe('Upgrade authorization', () => {
  let ssvNetwork: any;

  beforeEach(async () => {
    const metadata = await initializeContract();
    ssvNetwork = metadata.ssvNetwork;
  });

  it('reverts when a non-owner attempts to upgrade', async () => {
    const deployedSSVNetwork = await hre.viem.getContractAt('SSVNetwork', ssvNetwork.address as Address);
    const contractImpl = await hre.viem.deployContract('SSVNetworkBasicUpgrade', [], {
      client: owners[1].client,
    });

    await expect(
      deployedSSVNetwork.write.upgradeToAndCall([contractImpl.address, '0x'], { account: owners[1].account }),
    ).to.be.rejectedWith('Ownable: caller is not the owner');
  });
});
