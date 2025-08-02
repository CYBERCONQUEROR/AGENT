import readlineSync from 'readline-sync' ;
import { GoogleGenAI } from '@google/genai';
import {exe} from 'child_process';
import {promisify} from 'util';
import {os} from 'os';   


const platform = os.platform ();

const asyncExecute = promisify(exe);

const history = [];
const ai = new GoogleGenAI({ apiKey: "AIzaSyAgm2Iz8iz-EBHadu_6ylT4q8wARoMqRmQ" });

async function executeCommand({commmand}) {
    try {
    const{stdout,stderr} = await asyncExecute(command);
    if (stderr){
        return `Error executing command: ${stderr}`;
    }
    return `Success: ${stdout} || Task completed successfully`;
    }
    catch (error){
        return `Error executing command: ${error.message}`;


    }
}

const executeCommandDeclaration = {
    name: 'executeCommand',
    description: 'Execute a shell command. ',
    parameters: {
        type: 'object',
        properties: {
            command: { type: 'string', description: ' ' },
        },
        required: ['command']
    }  
    
}


async function runAgent(userProblem) {

    history.push({ 
        role: "user", 
        parts:[{text:userProblem}] 
    });

    while (true) {

    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: history,
        config : {
            systemInstruction : `l`,


        
        tools: [{
             functionDeclarations : [executeCommandDeclaration] 
            
        }],
        },
        });


    if (response.functionCalls&&response.functionCalls.length > 0) {
        console.log(response.functionCalls[0]);
        const functionCall = response.functionCalls[0];
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