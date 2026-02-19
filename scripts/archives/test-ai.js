const http = require('http');

const API_URL = 'http://localhost:3000/api/ai';

async function testAI(action, data) {
    console.log(`\n--- Testing ${action} ---`);
    const body = JSON.stringify({ action, data });

    return new Promise((resolve, reject) => {
        const req = http.request(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            }
        }, (res) => {
            let responseData = '';
            res.on('data', (chunk) => responseData += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        const json = JSON.parse(responseData);
                        console.log(`✅ Success (${res.statusCode})`);
                        if (action === 'org-from-website') {
                            if (json.orgData) {
                                console.log('Result:', `${json.orgData.name} (${json.orgData.industry})`);
                                console.log('Description:', json.orgData.description);
                            } else {
                                console.log('Result: No orgData found in response');
                            }
                        } else {
                            if (json.investors) {
                                console.log('Result:', `${json.investors.length} investors found`);
                                json.investors.slice(0, 3).forEach(inv => console.log(` - ${inv.name} (${inv.type})`));
                            } else {
                                console.log('Result: No investors found in response');
                            }
                        }
                        resolve(json);
                    } catch (e) {
                        console.error('❌ JSON Parse Error:', responseData);
                        reject(e);
                    }
                } else {
                    console.error(`❌ Failed with status ${res.statusCode}`);
                    console.error('Error Body:', responseData);
                    reject(new Error(responseData));
                }
            });
        });

        req.on('error', (e) => {
            console.error(`❌ Request error: ${e.message}`);
            reject(e);
        });

        req.write(body);
        req.end();
    });
}

async function runTests() {
    console.log('Starting AI Integration Tests (GPT-5-mini with Web Search)...');
    console.log('Note: Each request might take 30-60 seconds due to web research.');

    try {
        // Test 1: Organization Research
        console.log('Test 1: Web-based Organization Research');
        await testAI('org-from-website', { websiteUrl: 'https://www.sap.com' });

        // Test 2: Investor Match
        console.log('\nTest 2: Deal-based Investor Matching');
        await testAI('investor-match', {
            dealName: 'Cloud Security Platform Expansion',
            industry: 'Cybersecurity',
            ticketSizeMin: 10000000,
            ticketSizeMax: 50000000
        });

        console.log('\n--- All tests completed successfully! ---');
    } catch (e) {
        console.error('\n--- Tests failed! ---');
        console.error(e);
        process.exit(1);
    }
}

runTests();
