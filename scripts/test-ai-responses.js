const API_BASE = 'http://localhost:3000/api';

// Generate a simple UUID v4
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function testAIResponse(question, sessionId) {
  try {
    const { default: fetch } = await import('node-fetch');
    
    console.log(`\n🤖 Testing AI response for: "${question}"`);
    console.log('─'.repeat(60));

    const response = await fetch(`${API_BASE}/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: question,
        sessionId: sessionId
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    
    console.log('📝 AI Response:');
    console.log(data.response);
    
    if (data.sources && data.sources.length > 0) {
      console.log(`\n📚 Sources (${data.sources.length}):`);
      data.sources.forEach((source, index) => {
        console.log(`   ${index + 1}. ${source.title}`);
        if (source.category) console.log(`      Category: ${source.category}`);
        if (source.tags && source.tags.length > 0) {
          console.log(`      Tags: ${source.tags.join(', ')}`);
        }
        console.log(`      Relevant Content: ${source.relevantContent.substring(0, 100)}...`);
      });
    } else {
      console.log('\n📚 No sources referenced');
    }

    return data;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return null;
  }
}

async function createChatSession() {
  try {
    const { default: fetch } = await import('node-fetch');
    
    const response = await fetch(`${API_BASE}/chat/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    return data.sessionId;
  } catch (error) {
    console.error(`❌ Error creating session: ${error.message}`);
    return null;
  }
}

async function runTests() {
  console.log('🧪 Testing AI Responses with Knowledge Base Integration\n');

  // Create a chat session first
  console.log('📝 Creating chat session...');
  const sessionId = await createChatSession();
  
  if (!sessionId) {
    console.log('❌ Failed to create chat session. Exiting.');
    return;
  }
  
  console.log(`✅ Chat session created: ${sessionId}\n`);

  const testQuestions = [
    "What are the key principles of software architecture?",
    "How should I approach code reviews?",
    "What makes a good engineering leader?",
    "Tell me about microservices architecture",
    "How can I improve team communication?"
  ];

  for (const question of testQuestions) {
    await testAIResponse(question, sessionId);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between requests
  }

  console.log('\n✅ AI response testing complete!');
}

// Run the tests
runTests().catch(console.error);
