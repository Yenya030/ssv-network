import { expect } from 'chai';
import { initializeContract, owners, CONFIG, registerOperators, ssvNetwork } from '../helpers/contract-helpers';

describe('Security: unsorted operator IDs in whitelist update', () => {
  beforeEach(async () => {
    await initializeContract();
    await registerOperators(1, 5, CONFIG.minimalOperatorFee);
  });

  it('setOperatorsWhitelists with unsorted operator IDs reverts', async () => {
    const unsortedOperatorIds = [1, 3, 2, 4, 5];
    const whitelistAddresses = owners.slice(0, 5).map(owner => owner.account.address);
    await expect(
      ssvNetwork.write.setOperatorsWhitelists([unsortedOperatorIds, whitelistAddresses], {
        account: owners[1].account,
      })
    ).to.be.rejectedWith('UnsortedOperatorsList');
  });
});
