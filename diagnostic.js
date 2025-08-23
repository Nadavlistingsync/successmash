// YN Young Network Diagnostic Script
// Copy and paste this entire script into the browser console

console.log('🔍 YN Young Network Diagnostic Script Starting...');

// Check if app is loaded
function checkAppStatus() {
    console.log('📊 Checking app status...');
    
    if (window.youngNetwork) {
        console.log('✅ YN Young Network app found');
        console.log('App details:', {
            supabaseEnabled: window.youngNetwork.supabaseEnabled,
            profilesCount: window.youngNetwork.profiles?.length || 0,
            votesCount: window.youngNetwork.votes?.length || 0,
            db: !!window.youngNetwork.db
        });
        return true;
    } else {
        console.log('❌ YN Young Network app not found');
        console.log('Available window properties:', Object.keys(window).filter(key => 
            key.includes('young') || key.includes('network') || key.includes('test') || key.includes('diagnose')
        ));
        return false;
    }
}

// Test database connection
async function testDatabaseConnection() {
    console.log('🔍 Testing database connection...');
    
    if (!window.youngNetwork) {
        console.log('❌ App not available');
        return { success: false, error: 'App not available' };
    }
    
    try {
        const result = await window.youngNetwork.testDatabaseConnection();
        console.log('Database connection result:', result);
        return result;
    } catch (error) {
        console.log('❌ Database connection test failed:', error);
        return { success: false, error: error.message };
    }
}

// Diagnose real-time
async function diagnoseRealTime() {
    console.log('🔍 Diagnosing real-time connection...');
    
    if (!window.youngNetwork) {
        console.log('❌ App not available');
        return { success: false, error: 'App not available' };
    }
    
    try {
        const result = await window.youngNetwork.diagnoseRealTime();
        console.log('Real-time diagnosis result:', result);
        return result;
    } catch (error) {
        console.log('❌ Real-time diagnosis failed:', error);
        return { success: false, error: error.message };
    }
}

// Check ELO scores
async function checkEloScores() {
    console.log('🔍 Checking ELO scores...');
    
    if (!window.youngNetwork) {
        console.log('❌ App not available');
        return { success: false, error: 'App not available' };
    }
    
    try {
        const result = await window.youngNetwork.forceRefreshAndCheckElo();
        console.log('ELO scores check result:', result);
        return result;
    } catch (error) {
        console.log('❌ ELO scores check failed:', error);
        return { success: false, error: error.message };
    }
}

// Force enable live mode
async function forceEnableLiveMode() {
    console.log('🔍 Force enabling live mode...');
    
    if (!window.youngNetwork) {
        console.log('❌ App not available');
        return { success: false, error: 'App not available' };
    }
    
    try {
        const result = await window.youngNetwork.forceEnableLiveMode();
        console.log('Live mode enable result:', result);
        return result;
    } catch (error) {
        console.log('❌ Live mode enable failed:', error);
        return { success: false, error: error.message };
    }
}

// Run all tests
async function runAllTests() {
    console.log('🔄 Running all diagnostic tests...');
    
    const results = {
        appStatus: checkAppStatus(),
        databaseConnection: await testDatabaseConnection(),
        realTimeDiagnosis: await diagnoseRealTime(),
        eloScores: await checkEloScores(),
        liveMode: await forceEnableLiveMode()
    };
    
    console.log('📊 All test results:', results);
    return results;
}

// Make functions available globally
window.diagnosticTest = {
    checkAppStatus,
    testDatabaseConnection,
    diagnoseRealTime,
    checkEloScores,
    forceEnableLiveMode,
    runAllTests
};

console.log('✅ Diagnostic functions loaded. Run:');
console.log('  diagnosticTest.checkAppStatus()');
console.log('  diagnosticTest.testDatabaseConnection()');
console.log('  diagnosticTest.diagnoseRealTime()');
console.log('  diagnosticTest.checkEloScores()');
console.log('  diagnosticTest.forceEnableLiveMode()');
console.log('  diagnosticTest.runAllTests()');

// Auto-run initial check
setTimeout(() => {
    console.log('🔄 Auto-running initial app status check...');
    checkAppStatus();
}, 1000);
