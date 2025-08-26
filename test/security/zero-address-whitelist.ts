import { expect } from 'chai';
import { ethers } from 'hardhat';
import { initializeContract, registerOperators, owners, CONFIG } from '../helpers/contract-helpers';

describe('Security: zero address operator whitelist', () => {
  let ssvNetwork: any;

  beforeEach(async () => {
    const metadata = await initializeContract();
    ssvNetwork = metadata.ssvNetwork;
    await registerOperators(0, 1, CONFIG.minimalOperatorFee);
  });

  it('reverts when zero address is whitelisted', async () => {
    await expect(
      ssvNetwork.write.setOperatorsWhitelists([[1], [ethers.ZeroAddress]], {
        account: owners[0].account,
      }),
    ).to.be.rejectedWith('ZeroAddressNotAllowed');
  });
});
