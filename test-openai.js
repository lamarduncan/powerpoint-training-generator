const OpenAI = require('openai');
require('dotenv').config();

async function testOpenAI() {
  console.log('🧪 Testing OpenAI API Connection...\n');
  
  // Check if API key exists
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
    console.log('❌ No OpenAI API key found in .env file');
    console.log('📝 Please add your API key to .env file:');
    console.log('   OPENAI_API_KEY=sk-proj-YOUR_NEW_KEY_HERE');
    return;
  }
  
  // Initialize OpenAI
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  
  try {
    console.log('🔗 Connecting to OpenAI API...');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a test assistant for the PowerPoint Training Generator."
        },
        {
          role: "user", 
          content: "Please confirm you can analyze content for creating training slides. Respond with just 'OpenAI integration successful for PowerPoint generation.'"
        }
      ],
      max_tokens: 50,
      temperature: 0
    });
    
    console.log('✅ OpenAI Response:', response.choices[0].message.content);
    console.log('🎉 AI-powered content analysis is ready!');
    console.log('💰 Cost per request: ~$0.03-0.06 (GPT-4 pricing)');
    
  } catch (error) {
    console.error('❌ OpenAI API Error:', error.message);
    
    if (error.message.includes('401')) {
      console.log('🔑 API key is invalid. Please check your key.');
    } else if (error.message.includes('429')) {
      console.log('⏰ Rate limit exceeded. Try again in a moment.');
    } else if (error.message.includes('quota')) {
      console.log('💳 Billing quota exceeded. Check your OpenAI account.');
    }
  }
}

testOpenAI();
