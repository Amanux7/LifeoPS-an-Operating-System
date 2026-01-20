import https from 'https';
import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    console.log('Checking models for Key:', key?.substring(0, 8) + '...');
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            if (res.statusCode !== 200) {
                console.error('❌ API Error:', res.statusCode, res.statusMessage);
                console.error('Body:', data);
                return;
            }
            try {
                const json = JSON.parse(data);
                console.log('\n✅ Available Generative Models:');
                let found = false;
                json.models?.forEach((m: any) => {
                    // Filter for chat/generation models
                    if (m.supportedGenerationMethods?.includes('generateContent')) {
                        console.log(`- ${m.name.replace('models/', '')}`);
                        found = true;
                    }
                });
                if (!found) console.log('No generateContent models found.');
            } catch (e) {
                console.error('Parse warning:', e);
                console.log(data); // print raw if parse fails
            }
        });
    }).on('error', (e) => {
        console.error('❌ Network Error:', e);
    });
}

listModels();
