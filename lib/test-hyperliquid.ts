// Quick test script to verify Hyperliquid API client
// Run with: npx tsx lib/test-hyperliquid.ts

import { fetchWalletData, getUserFills } from "./hyperliquid";

const TEST_ADDRESS = "0x102a618b36c32b338c03526255dcf2a39eb1897f";

async function testHyperliquidAPI() {
  console.log("Testing Hyperliquid API client...\n");
  
  try {
    console.log(`Fetching data for address: ${TEST_ADDRESS}`);
    
    // Test basic fills fetch
    console.log("\n1. Fetching fills...");
    const fills = await getUserFills(TEST_ADDRESS);
    console.log(`✓ Fetched ${fills.length} fills`);
    
    if (fills.length > 0) {
      const firstFill = fills[0];
      console.log("\nFirst fill:");
      console.log(`  Coin: ${firstFill.coin}`);
      console.log(`  Side: ${firstFill.side === "B" ? "Buy" : "Sell"}`);
      console.log(`  Size: ${firstFill.sz}`);
      console.log(`  Price: ${firstFill.px}`);
      console.log(`  Fee: ${firstFill.fee} ${firstFill.feeToken}`);
      console.log(`  Closed PnL: ${firstFill.closedPnl}`);
      console.log(`  Time: ${new Date(firstFill.time).toISOString()}`);
    }
    
    // Test full wallet data fetch
    console.log("\n2. Fetching complete wallet data...");
    const walletData = await fetchWalletData(TEST_ADDRESS);
    console.log(`✓ Fills: ${walletData.fills.length}`);
    console.log(`✓ Funding payments: ${walletData.funding.length}`);
    console.log(`✓ Clearinghouse state: ${walletData.clearinghouseState ? "Available" : "Not available"}`);
    
    if (walletData.clearinghouseState) {
      const { marginSummary, assetPositions } = walletData.clearinghouseState;
      console.log(`\nAccount Summary:`);
      console.log(`  Account Value: $${marginSummary.accountValue}`);
      console.log(`  Open Positions: ${assetPositions.length}`);
      
      if (assetPositions.length > 0) {
        console.log(`\nPositions:`);
        assetPositions.forEach(pos => {
          console.log(`  ${pos.coin}: ${pos.szi} (Entry: ${pos.entryPx || 'N/A'})`);
        });
      }
    }
    
    if (walletData.funding.length > 0) {
      const totalFundingPaid = walletData.funding.reduce((sum, f) => {
        const amount = Number(f.delta.usdc);
        return amount < 0 ? sum + Math.abs(amount) : sum;
      }, 0);
      const totalFundingReceived = walletData.funding.reduce((sum, f) => {
        const amount = Number(f.delta.usdc);
        return amount > 0 ? sum + amount : sum;
      }, 0);
      console.log(`\nFunding Summary:`);
      console.log(`  Total Paid: $${totalFundingPaid.toFixed(2)}`);
      console.log(`  Total Received: $${totalFundingReceived.toFixed(2)}`);
      console.log(`  Net: $${(totalFundingReceived - totalFundingPaid).toFixed(2)}`);
    }
    
    console.log("\n✅ All tests passed!");
    
  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exit(1);
  }
}

testHyperliquidAPI();
