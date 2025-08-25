import { expect } from 'chai';
import hre from 'hardhat';
import { Address } from 'viem';
import { initializeContract, owners } from '../helpers/contract-helpers';

describe('Security: Unauthorized initializev2 after upgrade', () => {
  it('allows non-owner to call initializev2', async () => {
    const { ssvNetwork, ssvNetworkViews } = await initializeContract();

    const deployedSSVNetwork = await hre.viem.getContractAt('SSVNetwork', ssvNetwork.address as Address);

    const upgradeImpl = await hre.viem.deployContract(
      'contracts/test/SSVNetworkValidatorsPerOperator.sol:SSVNetworkValidatorsPerOperatorUpgrade',
      [],
    );

    await deployedSSVNetwork.write.upgradeTo([upgradeImpl.address]);

    const upgraded = await hre.viem.getContractAt(
      'contracts/test/SSVNetworkValidatorsPerOperator.sol:SSVNetworkValidatorsPerOperatorUpgrade',
      ssvNetwork.address as Address,
    );

    await upgraded.write.initializev2([999], { account: owners[1].account });

    expect(await ssvNetworkViews.read.getValidatorsPerOperatorLimit()).to.equal(999);
  });
});
