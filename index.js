import readlineSync from 'readline-sync' ;
import { GoogleGenAI } from '@google/genai';

const history = [];
const ai = new GoogleGenAI({ apiKey: "AIzaSyAgm2Iz8iz-EBHadu_6ylT4q8wARoMqRmQ" });

function sum({num1, num2}){
    return num1 + num2;
}

function prime({num}){
    if (num <= 1) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
    }
    return true;
}

async function getCryptoPrice({coin}) {
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`);
    const data = await response.json();
    return data[coin].usd;
}

const sumDeclaration = {
    name: 'sum',
    description: 'Sum two numbers',
    parameters: {
        type: 'object',
        properties: {
            num1: { type: 'number', description: 'First number' },
            num2: { type: 'number', description: 'Second number' }
        },
        required: ['num1', 'num2']
    }
        
}

const primeDeclaration = {
    name: 'prime',
    description: 'Check if a number is prime',
    parameters: {
        type: 'object',
        properties: {
            num: { type: 'number', description: 'Number to check' },
        },
        required: ['num']
    }
        
}

const getCryptoPriceDeclaration = {
    name: 'getCryptoPrice',
    description: 'Get the current price of a cryptocurrency',
    parameters: {
        type: 'object',
        properties: {
            coin: { type: 'string', description: 'Cryptocurrency ID (e.g., bitcoin, ethereum)' },
        },
        required: ['coin']
    }  
}

const availableTools= {
    sum : sum,
    prime : prime,      
    getCryptoPrice : getCryptoPrice
};



async function runAgent(userProblem) {

    history.push({ 
        role: "user", 
        parts:[{text:userProblem}] 
    });

    while (true) {

    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: history,
        tools: [
            { functionDeclaration: sumDeclaration },
            { functionDeclaration: primeDeclaration },
            { functionDeclaration: getCryptoPriceDeclaration }
        ]
        });


    if (response.functionCalls&&response.functionCalls.length > 0) {
        console.log(response.functionCalls[0]);
        // const functionCall = response.functionCalls[0];
        const {name,args} =response.functionCalls[0];
        const tool = availableTools[name];
        const result = await tool(args);
        const functionResponse = {
            name: name,
            response: {
                result: result,
            }
        };

        history.push({
            role: "model",
            parts: [
                { 
                    functionCall : response.functionCalls[0],
                }
            ]
    
        });
    }
        else {

        history.push({
            role: "model",
            parts: [{ text: response.text }]
        })

        console.log(response.text);
        break;
    }
}
}

async function main() {
    while (true) {
        const userProblem = readlineSync.question("Ask me anything --> ");
        await runAgent(userProblem);
    }
}

main ();