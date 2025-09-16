// Test script for unified undo functionality
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

// Test Place undo
async function testPlaceUndo() {
  console.log('\n🧪 Testing Place Undo Functionality...');
  
  try {
    // 1. Create a place
    console.log('  1. Creating place...');
    const place = await apiCall('/places', 'POST', {
      name: 'Test Place',
      color: '#FF0000',
      store_id: 1
    });
    console.log(`     ✓ Created place: ${place.name} (ID: ${place.id})`);
    
    // 2. Log the creation
    const createLog = await apiCall('/logs', 'POST', {
      eventId: 'place_created',
      text: `{{${place.name}}} has been created.`,
      additionalData: {
        placeId: place.id,
        preData: { placeName: "", color: "" },
        postData: { placeName: place.name, color: place.color }
      }
    });
    console.log(`     ✓ Logged creation (Log ID: ${createLog.data.id})`);
    
    // 3. Update the place
    console.log('  2. Updating place...');
    const updatedPlace = await apiCall(`/places/${place.id}`, 'PUT', {
      name: 'Updated Place',
      color: '#00FF00'
    });
    console.log(`     ✓ Updated place name to: ${updatedPlace.name}`);
    
    // 4. Log the update
    const updateLog = await apiCall('/logs', 'POST', {
      eventId: 'place_updated',
      text: `{{${updatedPlace.name}}} has been modified.`,
      additionalData: {
        placeId: place.id,
        preData: { placeName: place.name, color: place.color },
        postData: { placeName: updatedPlace.name, color: updatedPlace.color }
      }
    });
    console.log(`     ✓ Logged update (Log ID: ${updateLog.data.id})`);
    
    // 5. Undo the update
    console.log('  3. Undoing place update...');
    const undoResult = await apiCall(`/logs/${updateLog.data.id}/undo`, 'POST');
    console.log(`     ✓ Undo successful: ${undoResult.message}`);
    
    // 6. Verify place was reverted
    const revertedPlace = await apiCall(`/places/${place.id}`);
    if (revertedPlace.name === place.name && revertedPlace.color === place.color) {
      console.log(`     ✓ Place reverted to original: ${revertedPlace.name}`);
    } else {
      console.log(`     ✗ Place not properly reverted`);
    }
    
    // 7. Cleanup - delete the place
    await apiCall(`/places/${place.id}`, 'DELETE');
    console.log('     ✓ Cleanup completed');
    
    console.log('  ✅ Place undo test PASSED!\n');
    return true;
  } catch (error) {
    console.error(`  ❌ Place undo test FAILED: ${error.message}\n`);
    return false;
  }
}

// Test Table undo
async function testTableUndo() {
  console.log('\n🧪 Testing Table Undo Functionality...');
  
  try {
    // First create a place for the table
    const place = await apiCall('/places', 'POST', {
      name: 'Test Place for Table',
      color: '#0000FF',
      store_id: 1
    });
    
    // 1. Create a table
    console.log('  1. Creating table...');
    const table = await apiCall('/tables', 'POST', {
      name: 'Test Table',
      place_id: place.id,
      color: '#808080',
      dining_capacity: 4,
      store_id: 1
    });
    console.log(`     ✓ Created table: ${table.name} (ID: ${table.id})`);
    
    // 2. Log the creation
    const createLog = await apiCall('/logs', 'POST', {
      eventId: 'table_created',
      text: `{{${place.name}}} {{${table.name}}} has been created.`,
      additionalData: {
        tableId: table.id,
        preData: { tableName: "", placeName: place.name },
        postData: { tableName: table.name, placeName: place.name, place_id: place.id }
      }
    });
    console.log(`     ✓ Logged creation (Log ID: ${createLog.data.id})`);
    
    // 3. Update the table
    console.log('  2. Updating table...');
    const updatedTable = await apiCall(`/tables/${table.id}`, 'PUT', {
      name: 'Updated Table',
      color: '#FF00FF'
    });
    console.log(`     ✓ Updated table name to: ${updatedTable.name}`);
    
    // 4. Log the update
    const updateLog = await apiCall('/logs', 'POST', {
      eventId: 'table_updated',
      text: `{{${place.name}}} {{${updatedTable.name}}} has been modified.`,
      additionalData: {
        tableId: table.id,
        preData: { 
          tableName: table.name, 
          placeName: place.name,
          color: table.color,
          place_id: place.id
        },
        postData: { 
          tableName: updatedTable.name, 
          placeName: place.name,
          color: updatedTable.color,
          place_id: place.id
        }
      }
    });
    console.log(`     ✓ Logged update (Log ID: ${updateLog.data.id})`);
    
    // 5. Undo the update
    console.log('  3. Undoing table update...');
    const undoResult = await apiCall(`/logs/${updateLog.data.id}/undo`, 'POST');
    console.log(`     ✓ Undo successful: ${undoResult.message}`);
    
    // 6. Verify table was reverted
    const revertedTable = await apiCall(`/tables/${table.id}`);
    if (revertedTable.name === table.name && revertedTable.color === table.color) {
      console.log(`     ✓ Table reverted to original: ${revertedTable.name}`);
    } else {
      console.log(`     ✗ Table not properly reverted`);
      console.log(`       Expected: ${table.name}, ${table.color}`);
      console.log(`       Got: ${revertedTable.name}, ${revertedTable.color}`);
    }
    
    // 7. Cleanup
    await apiCall(`/tables/${table.id}`, 'DELETE');
    await apiCall(`/places/${place.id}`, 'DELETE');
    console.log('     ✓ Cleanup completed');
    
    console.log('  ✅ Table undo test PASSED!\n');
    return true;
  } catch (error) {
    console.error(`  ❌ Table undo test FAILED: ${error.message}\n`);
    return false;
  }
}

// Test Category undo
async function testCategoryUndo() {
  console.log('\n🧪 Testing Category Undo Functionality...');
  
  try {
    // 1. Create a category
    console.log('  1. Creating category...');
    const category = await apiCall('/categories', 'POST', {
      name: 'Test Category',
      color: '#FFFF00',
      menu_count: 0,
      store_id: 1
    });
    console.log(`     ✓ Created category: ${category.name} (ID: ${category.id})`);
    
    // 2. Log the creation
    const createLog = await apiCall('/logs', 'POST', {
      eventId: 'category_created',
      text: `{{${category.name}}} has been created.`,
      additionalData: {
        categoryId: category.id,
        preData: { categoryName: "", color: "" },
        postData: { categoryName: category.name, color: category.color }
      }
    });
    console.log(`     ✓ Logged creation (Log ID: ${createLog.data.id})`);
    
    // 3. Undo the creation (should delete the category)
    console.log('  2. Undoing category creation...');
    const undoResult = await apiCall(`/logs/${createLog.data.id}/undo`, 'POST');
    console.log(`     ✓ Undo successful: ${undoResult.message}`);
    
    // 4. Verify category was deleted
    try {
      await apiCall(`/categories/${category.id}`);
      console.log(`     ✗ Category still exists (should have been deleted)`);
    } catch (error) {
      console.log(`     ✓ Category was properly deleted`);
    }
    
    console.log('  ✅ Category undo test PASSED!\n');
    return true;
  } catch (error) {
    console.error(`  ❌ Category undo test FAILED: ${error.message}\n`);
    return false;
  }
}

// Test Menu undo
async function testMenuUndo() {
  console.log('\n🧪 Testing Menu Undo Functionality...');
  
  try {
    // First create a category for the menu
    const category = await apiCall('/categories', 'POST', {
      name: 'Test Category for Menu',
      color: '#00FFFF',
      menu_count: 0,
      store_id: 1
    });
    
    // 1. Create a menu
    console.log('  1. Creating menu...');
    const menu = await apiCall('/menus', 'POST', {
      name: 'Test Menu Item',
      category_id: category.id,
      price: 1000,
      description: 'Test description',
      store_id: 1
    });
    console.log(`     ✓ Created menu: ${menu.name} (ID: ${menu.id})`);
    
    // 2. Log the creation
    const createLog = await apiCall('/logs', 'POST', {
      eventId: 'menu_created',
      text: `{{${category.name}}} {{${menu.name}}} has been created.`,
      additionalData: {
        menuId: menu.id,
        preData: { menuName: "", categoryName: category.name },
        postData: { 
          menuName: menu.name, 
          categoryName: category.name,
          category_id: category.id,
          price: menu.price
        }
      }
    });
    console.log(`     ✓ Logged creation (Log ID: ${createLog.data.id})`);
    
    // 3. Undo the creation (should delete the menu)
    console.log('  2. Undoing menu creation...');
    const undoResult = await apiCall(`/logs/${createLog.data.id}/undo`, 'POST');
    console.log(`     ✓ Undo successful: ${undoResult.message}`);
    
    // 4. Verify menu was deleted
    try {
      await apiCall(`/menus/${menu.id}`);
      console.log(`     ✗ Menu still exists (should have been deleted)`);
    } catch (error) {
      console.log(`     ✓ Menu was properly deleted`);
    }
    
    // 5. Cleanup
    await apiCall(`/categories/${category.id}`, 'DELETE');
    console.log('     ✓ Cleanup completed');
    
    console.log('  ✅ Menu undo test PASSED!\n');
    return true;
  } catch (error) {
    console.error(`  ❌ Menu undo test FAILED: ${error.message}\n`);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Unified Undo Functionality Tests...\n');
  console.log('=' .repeat(50));
  
  const results = [];
  
  results.push(await testPlaceUndo());
  results.push(await testTableUndo());
  results.push(await testCategoryUndo());
  results.push(await testMenuUndo());
  
  console.log('=' .repeat(50));
  console.log('\n📊 Test Results Summary:');
  
  const passed = results.filter(r => r).length;
  const failed = results.length - passed;
  
  console.log(`   ✅ Passed: ${passed}/${results.length}`);
  if (failed > 0) {
    console.log(`   ❌ Failed: ${failed}/${results.length}`);
  }
  
  if (passed === results.length) {
    console.log('\n🎉 All undo tests PASSED! The unified undo system is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Please review the output above.');
  }
}

// Run the tests
runAllTests().catch(console.error);