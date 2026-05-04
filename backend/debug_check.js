import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function debug() {
  // Find ganesh and rake
  const { data: vendors } = await supabase.from('vendor').select('*').in('vendor_name', ['ganesh', 'rake']);
  console.log("=== ganesh/rake vendors ===");
  for (const v of (vendors || [])) {
    console.log(`  ${v.vendor_name}: id=${v.id}, shop_id=${v.shop_id}`);
  }

  // Find ALL purchases
  const { data: allPurchases } = await supabase.from('purchase').select('id, vendor_id, subtotal, total_amount, shop_id');
  console.log("\n=== ALL purchases ===");
  for (const p of (allPurchases || [])) {
    console.log(`  purchase ${p.id}: vendor=${p.vendor_id}, subtotal=${p.subtotal}, total=${p.total_amount}, shop=${p.shop_id}`);
  }

  // Now test: create a vendor and immediately create a purchase
  const testShopId = '616757a3-a216-4395-89d8-c053df485b48';
  
  console.log("\n=== SIMULATING FULL FLOW ===");
  
  // Step 1: Create vendor via API
  console.log("Step 1: POST /api/vendors");
  const vendorRes = await fetch('http://localhost:5000/api/vendors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-id': 'debug', 'x-shop-id': testShopId },
    body: JSON.stringify({ vendor_name: 'debug-test-' + Date.now(), phone: '1234567890' })
  });
  
  const vendorBody = await vendorRes.json();
  console.log("Vendor response status:", vendorRes.status);
  console.log("Vendor response body:", JSON.stringify(vendorBody, null, 2));
  
  if (!vendorBody.id) {
    console.log("ERROR: No vendor id returned!");
    return;
  }
  
  // Step 2: Create purchase via API
  console.log("\nStep 2: POST /api/orders/purchase");
  const purchaseRes = await fetch('http://localhost:5000/api/orders/purchase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-id': 'debug', 'x-shop-id': testShopId },
    body: JSON.stringify({
      shop_id: testShopId,
      vendor_id: vendorBody.id,
      subtotal: 5000,
      discount_amount: 500,
      total_amount: 4500,
      purchase_date: '2026-04-18',
      payment_due_date: '2026-04-30'
    })
  });
  
  const purchaseBody = await purchaseRes.json();
  console.log("Purchase response status:", purchaseRes.status);
  console.log("Purchase response body:", JSON.stringify(purchaseBody, null, 2));
  
  // Step 3: Verify by fetching vendor again
  console.log("\nStep 3: GET /api/vendors (verify enriched data)");
  const verifyRes = await fetch('http://localhost:5000/api/vendors', {
    headers: { 'x-user-id': 'debug', 'x-shop-id': testShopId }
  });
  const allVendors = await verifyRes.json();
  const found = allVendors.find(v => v.id === vendorBody.id);
  console.log("Verified vendor:", JSON.stringify(found, null, 2));
  
  // Cleanup: delete the test vendor
  await supabase.from('purchase').delete().eq('vendor_id', vendorBody.id);
  await supabase.from('vendor').delete().eq('id', vendorBody.id);
  console.log("\nCleanup done.");
}

debug().catch(console.error);
