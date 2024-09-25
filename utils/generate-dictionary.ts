//  TypeScript Dictionary Generator 

import * as fs from 'fs';
import * as path from 'path';

const dictionaryDir = path.join(__dirname, '..','dictionary');
const outputFile = path.join(__dirname, '..', 'index.ts');

// Function to convert filename to correct camelCase
function toCamelCase(str: string): string {
    // First, handle the case where the entire string is uppercase
    if (str === str.toUpperCase()) {
        str = str.toLowerCase();
    }
    
    // Then, apply camelCasing
    return str
        .split(/[-_]+/)
        .map((word, index) => {
            if (index === 0) {
                return word.toLowerCase();
            }
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join('');
}

// Function to validate JSON file
function validateJsonFile(filePath: string): boolean {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        JSON.parse(content);
        
        // Add any additional structure checks here
        const parsed = JSON.parse(content);
        if (typeof parsed !== 'object' || parsed === null) {
            console.error(`Error: ${filePath} is not a valid object`);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error(`Error validating ${filePath}: ${(error as Error).message}`);
        process.exit(1)
    }
}

// Read dictionary directory
const files = fs.readdirSync(dictionaryDir);

// Filter for .json files, validate them, and create import statements
const validFiles = files.filter(file => {
    if (path.extname(file) !== '.json') return false;
    const filePath = path.join(dictionaryDir, file);
    return validateJsonFile(filePath);
});

const imports = validFiles.map(file => {
    const baseName = path.basename(file, '.json');
    const variableName = toCamelCase(baseName);
    return `import ${variableName} from './dictionary/${file}'`;
});

// Create dictionary object
const dictionaryEntries = validFiles.map(file => {
    const baseName = path.basename(file, '.json');
    const variableName = toCamelCase(baseName);
    return `    ${variableName}`;
});

// Generate the output content
const content = `${imports.join('\n')}

export const dictionary = {
${dictionaryEntries.join(',\n')}
}
`;

// Write the generated content to the output file
fs.writeFileSync(outputFile, content);

console.log(`Dictionary file generated: ${outputFile}`);