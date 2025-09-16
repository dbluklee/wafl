// Focused test for table undo functionality
const API_BASE_URL = 'http://localhost:3002/api';

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`API call failed: ${data.error || response.statusText}`);
  }
  
  return data;
}

// Test Table undo with all fields
async function testTableUndoComplete() {
  console.log('\n🧪 Testing Complete Table Undo Functionality...');
  
  try {
    // First create a place for the table
    const place = await apiCall('/places', 'POST', {
      name: 'Test Place for Complete Table Test',
      color: '#0000FF',
      store_id: 1
    });
    console.log(`  ✓ Created place: ${place.name} (ID: ${place.id})`);
    
    // 1. Create a table with all fields
    console.log('\n  1. Creating table with all fields...');
    const table = await apiCall('/tables', 'POST', {
      name: 'Original Table Name',
      place_id: place.id,
      color: '#808080',
      dining_capacity: 4,
      store_id: 1
    });
    console.log(`     ✓ Created table: ${table.name}`);
    console.log(`       - ID: ${table.id}`);
    console.log(`       - Color: ${table.color}`);
    console.log(`       - Capacity: ${table.dining_capacity}`);
    console.log(`       - Place ID: ${table.place_id}`);
    
    // 2. Update ONLY the table name
    console.log('\n  2. Updating ONLY table name...');
    const updatedTable = await apiCall(`/tables/${table.id}`, 'PUT', {
      name: 'Modified Table Name'
    });
    console.log(`     ✓ Updated table name to: ${updatedTable.name}`);
    console.log(`       - Color remains: ${updatedTable.color}`);
    console.log(`       - Capacity remains: ${updatedTable.dining_capacity}`);
    
    // 3. Log the update with complete metadata
    console.log('\n  3. Logging the update with complete metadata...');
    const updateLog = await apiCall('/logs', 'POST', {
      eventId: 'table_updated',
      text: `{{${place.name}}} {{${updatedTable.name}}} has been modified.`,
      additionalData: {
        tableId: table.id,
        preData: { 
          tableName: table.name, 
          placeName: place.name,
          color: table.color,
          place_id: table.place_id,
          store_id: table.store_id,
          dining_capacity: table.dining_capacity
        },
        postData: { 
          tableName: updatedTable.name, 
          placeName: place.name,
          color: updatedTable.color,
          place_id: updatedTable.place_id,
          store_id: updatedTable.store_id,
          dining_capacity: updatedTable.dining_capacity
        }
      }
    });
    console.log(`     ✓ Logged update (Log ID: ${updateLog.data.id})`);
    
    // 4. Undo the update
    console.log('\n  4. Performing undo...');
    const undoResult = await apiCall(`/logs/${updateLog.data.id}/undo`, 'POST');
    console.log(`     ✓ Undo successful: ${undoResult.message}`);
    
    // 5. Verify table was completely reverted
    console.log('\n  5. Verifying complete restoration...');
    const revertedTable = await apiCall(`/tables/${table.id}`);
    
    const checks = {
      name: revertedTable.name === table.name,
      color: revertedTable.color === table.color,
      capacity: revertedTable.dining_capacity === table.dining_capacity,
      place_id: revertedTable.place_id === table.place_id
    };
    
    console.log(`     ${checks.name ? '✓' : '✗'} Name reverted: ${revertedTable.name} (expected: ${table.name})`);
    console.log(`     ${checks.color ? '✓' : '✗'} Color preserved: ${revertedTable.color} (expected: ${table.color})`);
    console.log(`     ${checks.capacity ? '✓' : '✗'} Capacity preserved: ${revertedTable.dining_capacity} (expected: ${table.dining_capacity})`);
    console.log(`     ${checks.place_id ? '✓' : '✗'} Place ID preserved: ${revertedTable.place_id} (expected: ${table.place_id})`);
    
    const allPassed = Object.values(checks).every(v => v);
    
    // 6. Cleanup
    await apiCall(`/tables/${table.id}`, 'DELETE');
    await apiCall(`/places/${place.id}`, 'DELETE');
    console.log('\n     ✓ Cleanup completed');
    
    if (allPassed) {
      console.log('\n  ✅ Table undo test PASSED! All fields correctly preserved.\n');
      return true;
    } else {
      console.log('\n  ❌ Table undo test FAILED! Some fields were not preserved.\n');
      return false;
    }
  } catch (error) {
    console.error(`\n  ❌ Table undo test FAILED: ${error.message}\n`);
    return false;
  }
}

// Run the test
testTableUndoComplete().catch(console.error);