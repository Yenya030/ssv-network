import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('Delegatecall empty revert handling', function () {
  it('does not bubble up revert with empty data', async function () {
    const Reverter = await ethers.getContractFactory('EmptyReverter');
    const reverter = await Reverter.deploy();
    const Harness = await ethers.getContractFactory('DelegateCallHarness');
    const harness = await Harness.deploy();

    await expect(harness.callDelegate(reverter.getAddress())).to.not.be.reverted;
  });
});
