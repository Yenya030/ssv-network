import { ethers } from "hardhat";
import { expect } from "chai";

describe("SSVDAO module access control", function () {
  it("allows any address to update network fee", async function () {
    const [attacker] = await ethers.getSigners();
    const Dao = await ethers.getContractFactory("SSVDAO");
    const dao = await Dao.deploy();
    const fee = 10_000_000; // valid minimum unit
    await expect(dao.connect(attacker).updateNetworkFee(fee)).to.emit(dao, "NetworkFeeUpdated").withArgs(0, fee);
  });

  it("allows any address to update maximum operator fee", async function () {
    const [attacker] = await ethers.getSigners();
    const Dao = await ethers.getContractFactory("SSVDAO");
    const dao = await Dao.deploy();
    const maxFee = 5_000_000; // arbitrary value
    await expect(dao.connect(attacker).updateMaximumOperatorFee(maxFee))
      .to.emit(dao, "OperatorMaximumFeeUpdated")
      .withArgs(maxFee);
  });

  it("restricts minting of SSVToken to owner", async function () {
    const [, attacker] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("SSVToken");
    const token = await Token.deploy();
    await expect(token.connect(attacker).mint(attacker.address, 1)).to.be.revertedWith("Ownable: caller is not the owner");
  });
});
