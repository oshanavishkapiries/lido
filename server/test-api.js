// Test script for LIDO backend API
// Run with: node test-api.js

const API_BASE = 'http://localhost:3125/api/v1';

async function testAPI() {
    console.log('🧪 Testing LIDO Backend API...\n');

    try {
        // Test 1: Health Check
        console.log('1️⃣ Testing Health Check...');
        const healthResponse = await fetch(`${API_BASE}/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Health check:', healthData);
        console.log('');

        // Test 2: Create Session
        console.log('2️⃣ Creating a new session...');
        const createResponse = await fetch(`${API_BASE}/session/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionName: 'Test Meeting',
                hostName: 'Test Host',
                settings: {
                    allowAnonymous: true,
                    maxParticipants: 50,
                    enablePolls: true,
                    enableQA: true,
                    enableReactions: true
                }
            })
        });
        const createData = await createResponse.json();
        console.log('✅ Session created:', createData);

        if (createData.status !== 'success') {
            console.error('❌ Failed to create session');
            return;
        }

        const sessionId = createData.data.sessionId;
        console.log(`📝 Session ID: ${sessionId}\n`);

        // Test 3: Get Session
        console.log('3️⃣ Fetching session details...');
        const getResponse = await fetch(`${API_BASE}/session/${sessionId}`);
        const getData = await getResponse.json();
        console.log('✅ Session details:', JSON.stringify(getData.data, null, 2));
        console.log('');

        // Test 4: Join Session
        console.log('4️⃣ Adding a participant...');
        const joinResponse = await fetch(`${API_BASE}/session/${sessionId}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                participantName: 'Test Participant'
            })
        });
        const joinData = await joinResponse.json();
        console.log('✅ Participant joined:', joinData.status);
        console.log('');

        // Test 5: Get Participants
        console.log('5️⃣ Fetching participants...');
        const participantsResponse = await fetch(`${API_BASE}/session/${sessionId}/participants`);
        const participantsData = await participantsResponse.json();
        console.log('✅ Participants:', participantsData.data);
        console.log('');

        // Test 6: Create Poll
        console.log('6️⃣ Creating a poll...');
        const pollResponse = await fetch(`${API_BASE}/polls`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: sessionId,
                question: 'What time works best?',
                options: ['9 AM', '10 AM', '11 AM'],
                createdBy: 'Test Host',
                duration: 5
            })
        });
        const pollData = await pollResponse.json();
        console.log('✅ Poll created:', pollData.status);

        if (pollData.status === 'success') {
            const pollId = pollData.data._id;
            console.log(`📊 Poll ID: ${pollId}\n`);

            // Test 7: Vote on Poll
            console.log('7️⃣ Voting on poll...');
            const voteResponse = await fetch(`${API_BASE}/polls/${pollId}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    optionIndex: 1,
                    userName: 'Test Participant'
                })
            });
            const voteData = await voteResponse.json();
            console.log('✅ Vote recorded:', voteData.status);
            console.log('');

            // Test 8: Get Poll Results
            console.log('8️⃣ Fetching poll results...');
            const resultsResponse = await fetch(`${API_BASE}/polls/${pollId}/results`);
            const resultsData = await resultsResponse.json();
            console.log('✅ Poll results:', JSON.stringify(resultsData.data, null, 2));
            console.log('');
        }

        // Test 9: End Session
        console.log('9️⃣ Ending session...');
        const endResponse = await fetch(`${API_BASE}/session/${sessionId}/end`, {
            method: 'PUT'
        });
        const endData = await endResponse.json();
        console.log('✅ Session ended:', endData.status);
        console.log('');

        console.log('🎉 All tests completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error);
    }
}

// Run tests
testAPI();
