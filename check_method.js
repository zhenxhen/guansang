const { OpenAI } = require('openai'); const openai = new OpenAI({apiKey: 'test'}); console.log(typeof openai.responses.create);
