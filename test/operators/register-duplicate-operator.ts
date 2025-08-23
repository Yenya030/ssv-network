import { expect } from 'chai';
import { initializeContract, owners, CONFIG, DataGenerator, ssvNetwork } from '../helpers/contract-helpers';

describe('Security: Operator registration', () => {
  beforeEach(async () => {
    await initializeContract();
  });

  it('prevents registering the same operator twice', async () => {
    const pk = DataGenerator.publicKey(1000);
    await ssvNetwork.write.registerOperator([pk, CONFIG.minimalOperatorFee, false], { account: owners[1].account });
    await expect(
      ssvNetwork.write.registerOperator([pk, CONFIG.minimalOperatorFee, false], { account: owners[2].account })
    ).to.be.rejectedWith('OperatorAlreadyExists');
  });
});
