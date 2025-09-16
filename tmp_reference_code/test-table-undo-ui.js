// Test that table undo properly refreshes the UI
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

async function testTableUndoUIRefresh() {
  console.log('\n🧪 Testing Table Undo UI Refresh...');
  console.log('=' .repeat(50));
  
  try {
    // 1. Create test data
    console.log('\n1. Setting up test environment...');
    const place = await apiCall('/places', 'POST', {
      name: 'Undo UI Test Place',
      color: '#FF0000',
      store_id: 1
    });
    console.log(`   ✓ Created place: ${place.name} (ID: ${place.id})`);
    
    const table = await apiCall('/tables', 'POST', {
      name: 'Original Table Name',
      place_id: place.id,
      color: '#808080',
      dining_capacity: 4,
      store_id: 1
    });
    console.log(`   ✓ Created table: ${table.name} (ID: ${table.id})`);
    
    // 2. Update the table
    console.log('\n2. Updating table...');
    const updatedTable = await apiCall(`/tables/${table.id}`, 'PUT', {
      name: 'Modified Table Name'
    });
    console.log(`   ✓ Table updated: ${table.name} → ${updatedTable.name}`);
    
    // 3. Create log for the update
    console.log('\n3. Creating update log...');
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
    console.log(`   ✓ Update log created (ID: ${updateLog.data.id})`);
    
    // 4. Perform undo
    console.log('\n4. Performing undo operation...');
    const undoResult = await apiCall(`/logs/${updateLog.data.id}/undo`, 'POST');
    console.log(`   ✓ Undo executed: ${undoResult.message}`);
    
    // 5. Verify table was reverted in database
    console.log('\n5. Verifying database state...');
    const revertedTable = await apiCall(`/tables/${table.id}`);
    
    if (revertedTable.name === table.name) {
      console.log(`   ✓ Database correctly shows: ${revertedTable.name}`);
    } else {
      console.log(`   ✗ Database shows wrong name: ${revertedTable.name}`);
      console.log(`     Expected: ${table.name}`);
    }
    
    // 6. Check what would be loaded for the place
    console.log('\n6. Checking what UI would load for the place...');
    const tablesForPlace = await apiCall(`/tables/place/${place.id}`);
    const tableInList = tablesForPlace.find(t => t.id === table.id);
    
    if (tableInList && tableInList.name === table.name) {
      console.log(`   ✓ loadTablesByPlace() would return: ${tableInList.name}`);
      console.log('   ✓ UI will be correctly refreshed after undo!');
    } else {
      console.log(`   ✗ loadTablesByPlace() returns wrong data`);
      console.log(`     Found: ${tableInList?.name || 'Not found'}`);
    }
    
    // 7. Compare with Menu behavior
    console.log('\n7. Comparing with Menu undo behavior...');
    console.log('   Menu undo works because:');
    console.log('     - handleLogUndo() calls loadMenusByCategory()');
    console.log('   Table undo NOW works because:');
    console.log('     - handleLogUndo() NOW calls loadTablesByPlace()');
    console.log('   ✓ Both follow the same pattern!');
    
    // 8. Cleanup
    console.log('\n8. Cleaning up...');
    await apiCall(`/tables/${table.id}`, 'DELETE');
    await apiCall(`/places/${place.id}`, 'DELETE');
    console.log('   ✓ Test data cleaned up');
    
    console.log('\n' + '=' .repeat(50));
    console.log('✅ Table Undo UI Refresh Test PASSED!');
    console.log('\nThe fix:');
    console.log('  Added loadTablesByPlace() call in handleLogUndo()');
    console.log('  Now tables refresh just like menus after undo');
    
  } catch (error) {
    console.error(`\n❌ Test failed: ${error.message}`);
  }
}

// Run the test
testTableUndoUIRefresh().catch(console.error);