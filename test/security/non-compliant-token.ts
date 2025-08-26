import { initializeContract, registerOperators, coldRegisterValidator, CONFIG } from '../helpers/contract-helpers';
import { expect } from 'chai';

let ssvNetwork: any;

describe('Non-compliant ERC20 token handling', () => {
  beforeEach(async () => {
    const metadata = await initializeContract('FailingToken');
    ssvNetwork = metadata.ssvNetwork;
    await registerOperators(0, 4, CONFIG.minimalOperatorFee);
  });

  it('reverts when token transfer returns false', async () => {
    await expect(coldRegisterValidator()).to.be.rejectedWith('TokenTransferFailed');
  });
});
