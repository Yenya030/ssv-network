import { expect } from 'chai';
import { ethers } from 'hardhat';
import { initializeContract, DataGenerator, owners } from '../helpers/contract-helpers';

// Demonstrates that operators can be registered with zero fee, enabling unbounded storage growth
// as an attacker can create unlimited operator entries without depositing tokens.

describe('Security: Free operator registration', () => {
  it('allows registering operators with zero fee', async () => {
    const { ssvNetwork, ssvNetworkViews } = await initializeContract();

    await ssvNetwork.write.registerOperator([DataGenerator.publicKey(0), 0n, false], {
      account: owners[1].account,
    });
    await ssvNetwork.write.registerOperator([DataGenerator.publicKey(1), 0n, false], {
      account: owners[1].account,
    });

    expect(await ssvNetworkViews.read.getOperatorById([2])).to.deep.equal([
      owners[1].account.address, // owner
      0n, // fee
      0, // validatorCount
      ethers.ZeroAddress, // whitelisted address
      false, // isPrivate
      true, // active
    ]);
  });
});
