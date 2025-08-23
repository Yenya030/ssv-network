import { initializeContract, owners } from '../helpers/contract-helpers';
import { expect } from 'chai';

describe('Security: updateModule access control', () => {
  let ssvNetwork: any;
  let ssvToken: any;

  beforeEach(async () => {
    const metadata = await initializeContract();
    ssvNetwork = metadata.ssvNetwork;
    ssvToken = metadata.ssvToken;
  });

  it('non-owner cannot update module', async () => {
    await expect(
      ssvNetwork.write.updateModule([0, ssvToken.address], { account: owners[1].account })
    ).to.be.rejectedWith('Ownable: caller is not the owner');
  });

  it('owner can update module', async () => {
    await expect(ssvNetwork.write.updateModule([0, ssvToken.address])).to.not.be.rejected;
  });
});
