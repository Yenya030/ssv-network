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
    const maxFee = 100;
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

  it("allows any address to update operator fee increase limit", async function () {
    const [attacker] = await ethers.getSigners();
    const Dao = await ethers.getContractFactory("SSVDAO");
    const dao = await Dao.deploy();
    const newLimit = 5;
    await expect(dao.connect(attacker).updateOperatorFeeIncreaseLimit(newLimit))
      .to.emit(dao, "OperatorFeeIncreaseLimitUpdated")
      .withArgs(newLimit);
  });

  it("allows any address to update declare operator fee period", async function () {
    const [attacker] = await ethers.getSigners();
    const Dao = await ethers.getContractFactory("SSVDAO");
    const dao = await Dao.deploy();
    const newPeriod = 1_000;
    await expect(dao.connect(attacker).updateDeclareOperatorFeePeriod(newPeriod))
      .to.emit(dao, "DeclareOperatorFeePeriodUpdated")
      .withArgs(newPeriod);
  });

  it("allows any address to update execute operator fee period", async function () {
    const [attacker] = await ethers.getSigners();
    const Dao = await ethers.getContractFactory("SSVDAO");
    const dao = await Dao.deploy();
    const newPeriod = 1_000;
    await expect(dao.connect(attacker).updateExecuteOperatorFeePeriod(newPeriod))
      .to.emit(dao, "ExecuteOperatorFeePeriodUpdated")
      .withArgs(newPeriod);
  });

  it("allows any address to update liquidation threshold period", async function () {
    const [attacker] = await ethers.getSigners();
    const Dao = await ethers.getContractFactory("SSVDAO");
    const dao = await Dao.deploy();
    const newThreshold = 100_800; // minimum allowed
    await expect(dao.connect(attacker).updateLiquidationThresholdPeriod(newThreshold))
      .to.emit(dao, "LiquidationThresholdPeriodUpdated")
      .withArgs(newThreshold);
  });

  it("allows any address to update minimum liquidation collateral", async function () {
    const [attacker] = await ethers.getSigners();
    const Dao = await ethers.getContractFactory("SSVDAO");
    const dao = await Dao.deploy();
    const amount = ethers.parseEther("1");
    await expect(dao.connect(attacker).updateMinimumLiquidationCollateral(amount))
      .to.emit(dao, "MinimumLiquidationCollateralUpdated")
      .withArgs(amount);
  });

});
