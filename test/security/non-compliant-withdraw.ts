import { initializeContract } from '../helpers/contract-helpers';
import { expect } from 'chai';

let ssvNetwork: any;
let owner: any;

describe('Non-compliant ERC20 withdrawal', () => {
  beforeEach(async () => {
    const metadata = await initializeContract('FailingToken');
    ssvNetwork = metadata.ssvNetwork;
    owner = metadata.ssvContractsOwner;
  });

  it('reverts when token transfer returns false during withdrawal', async () => {
    await expect(
      ssvNetwork.write.withdrawNetworkEarnings([0n], { account: owner })
    ).to.be.rejectedWith('TokenTransferFailed');
  });
});
