import { expect } from 'chai';
import { initializeContract, owners, DataGenerator, CONFIG } from '../helpers/contract-helpers';

describe('Security: operator reduce fee access control', () => {
  let ssvNetwork: any;

  beforeEach(async () => {
    const metadata = await initializeContract();
    ssvNetwork = metadata.ssvNetwork;
    await ssvNetwork.write.registerOperator([
      DataGenerator.publicKey(0),
      CONFIG.minimalOperatorFee * 2n,
      true,
    ], { account: owners[0].account });
  });

  it('non-owner cannot reduce operator fee', async () => {
    await expect(
      ssvNetwork.write.reduceOperatorFee([1n, CONFIG.minimalOperatorFee], { account: owners[1].account })
    ).to.be.rejectedWith('CallerNotOwnerWithData');
  });

  it('operator owner can reduce fee', async () => {
    await expect(
      ssvNetwork.write.reduceOperatorFee([1n, CONFIG.minimalOperatorFee], { account: owners[0].account })
    ).to.not.be.rejected;
  });
});
