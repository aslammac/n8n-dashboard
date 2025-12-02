const fs = require('fs');
const path = require('path');

const IMPORT_DIR = path.join(__dirname, '../import-workflows');
const PUBLIC_WORKFLOWS_DIR = path.join(__dirname, '../public/workflows');
const DATA_FILE = path.join(__dirname, '../src/data/workflows.json');

// Helper to create a slug from a string
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-')   // Replace multiple - with single -
        .replace(/^-+/, '')       // Trim - from start of text
        .replace(/-+$/, '');      // Trim - from end of text
}

// Helper to extract node names from n8n workflow
function extractNodes(workflowData) {
    if (!workflowData.nodes || !Array.isArray(workflowData.nodes)) {
        return [];
    }
    return [...new Set(workflowData.nodes.map(node => {
        // Extract readable name from type, e.g., "n8n-nodes-base.webhook" -> "Webhook"
        // Or just use the node name if it's descriptive
        return node.type.split('.').pop().replace(/([A-Z])/g, ' $1').trim();
    }))];
}

// Helper to recursively find JSON files
function getFiles(dir, fileList = [], rootDir = dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            getFiles(filePath, fileList, rootDir);
        } else if (file.endsWith('.json')) {
            // Determine category from subdirectory
            let category = "Uncategorized";
            const relativePath = path.relative(rootDir, dir);
            if (relativePath) {
                // Use the first subdirectory as the category
                category = relativePath.split(path.sep)[0];
                // Capitalize first letter
                category = category.charAt(0).toUpperCase() + category.slice(1);
            }

            fileList.push({
                path: filePath,
                category: category,
                filename: file
            });
        }
    });

    return fileList;
}

function importWorkflows() {
    // Ensure directories exist
    if (!fs.existsSync(IMPORT_DIR)) {
        console.log(`Creating import directory: ${IMPORT_DIR}`);
        fs.mkdirSync(IMPORT_DIR);
        console.log('Please place your .json workflow files in the "import-workflows" folder (you can use subfolders for categories) and run this script again.');
        return;
    }

    const filesToImport = getFiles(IMPORT_DIR);

    if (filesToImport.length === 0) {
        console.log('No .json files found in "import-workflows".');
        return;
    }

    let workflowsData = [];
    try {
        if (fs.existsSync(DATA_FILE)) {
            workflowsData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        }
    } catch (error) {
        console.error('Error reading existing data file:', error);
    }

    let importedCount = 0;

    filesToImport.forEach(fileObj => {
        const filePath = fileObj.path;
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const workflow = JSON.parse(content);

            // Basic validation
            if (!workflow.nodes) {
                console.warn(`Skipping ${fileObj.filename}: Invalid n8n workflow format (missing nodes).`);
                return;
            }

            let name = workflow.name || path.parse(fileObj.filename).name.replace(/_/g, ' ');

            // Remove leading numbers and separators (e.g. "0109_Name" -> "Name", "1. Name" -> "Name")
            name = name.replace(/^[\d\s_.-]+/, '');

            const id = slugify(name);

            // Check if already exists
            if (workflowsData.find(w => w.id === id)) {
                console.log(`Skipping ${fileObj.filename}: Workflow with ID "${id}" already exists.`);
                return;
            }

            const nodes = extractNodes(workflow);

            const newWorkflow = {
                id: id,
                name: name,
                description: "Imported workflow", // Default description
                category: fileObj.category,       // Use category from folder
                tags: ["Imported"],               // Default tag
                author: {
                    name: "Anonymous",
                    avatar: "",
                    url: "#"
                },
                downloads: 0,
                rating: 0,
                created: new Date().toISOString(),
                updated: new Date().toISOString(),
                nodes: nodes,
                nodeCount: workflow.nodes.length,
                complexity: "intermediate",
                workflow: workflow
            };

            workflowsData.push(newWorkflow);

            // Copy file to public/workflows
            fs.copyFileSync(filePath, path.join(PUBLIC_WORKFLOWS_DIR, `${id}.json`));

            importedCount++;
            console.log(`Imported: ${name} (Category: ${fileObj.category})`);

        } catch (error) {
            console.error(`Error processing ${fileObj.filename}:`, error);
        }
    });

    if (importedCount > 0) {
        fs.writeFileSync(DATA_FILE, JSON.stringify(workflowsData, null, 2));
        console.log(`\nSuccessfully imported ${importedCount} workflows!`);
        console.log('You can now edit src/data/workflows.json to refine descriptions.');
    } else {
        console.log('\nNo new workflows imported.');
    }
}

importWorkflows();
