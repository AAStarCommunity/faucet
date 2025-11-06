/**
 * Dynamic contract loader for faucet page
 * Loads contracts directly from @aastar/shared-config without build step
 */

// Load contracts dynamically using import() for browser compatibility
window.loadContractsFromSharedConfig = async function() {
    try {
        // Try to load from CDN first
        const module = await import('https://cdn.skypack.dev/@aastar/shared-config');
        const { getAllV2Contracts } = module;
        
        // Get contracts
        const contracts = getAllV2Contracts();
        
        // Get version from package.json
        const packageInfo = await import('https://cdn.skypack.dev/@aastar/shared-config/package.json');
        const version = packageInfo.default?.version || '0.2.26';
        
        // Update global variables
        window.CONTRACT_METADATA = contracts.map(contract => ({
            ...contract,
            category: getCategory(contract.name)
        }));
        window.SHARED_CONFIG_VERSION = version;
        
        console.log(`✅ Loaded ${contracts.length} contracts from @aastar/shared-config v${version}`);
        
        return { contracts, version };
    } catch (error) {
        console.error('Failed to load from CDN, falling back to contracts.js:', error);
        
        // Fallback to contracts.js if it exists
        if (typeof window.CONTRACT_METADATA !== 'undefined') {
            console.log('✅ Using fallback contracts.js');
            return { 
                contracts: window.CONTRACT_METADATA, 
                version: window.SHARED_CONFIG_VERSION || 'unknown' 
            };
        }
        
        throw new Error('No contract data available');
    }
};

// Helper function to categorize contracts
function getCategory(contractName) {
    const categoryMap = {
        'GToken': 'core',
        'SuperPaymasterV2': 'core',
        'Registry': 'core',
        'GTokenStaking': 'core',
        'PaymasterFactory': 'core',
        'MySBT': 'tokens',
        'xPNTsFactory': 'tokens',
        'Mock USDT': 'testTokens',
        'aPNTs': 'testTokens',
        'bPNTs': 'testTokens',
    };
    return categoryMap[contractName] || 'other';
}