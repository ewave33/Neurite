
/*
function connect(na, nb, length = 0.2, linkStrength = 0.1, linkStyle = {
    stroke: "none",
    "stroke-width": "0.005",
    fill: "lightcyan",
    opacity: "0.5"
}) {
    // Check if edge already exists
    if (na.edges.some(edge => edge.pts.includes(nb)) && nb.edges.some(edge => edge.pts.includes(na))) {
        return;
    }

    let edge = new Edge([na, nb], length, linkStrength, linkStyle);

    na.edges.push(edge);
    nb.edges.push(edge);

    edges.push(edge);
    return edge;
}

function connectRandom(n) {
    for (let i = 0; i < n; i++) {
        let a = Math.floor(Math.random() * nodes.length);
        let b = Math.floor(Math.random() * nodes.length);
        // Ensures both nodes have the connection
        connect(nodes[a], nodes[b]);
    }
}
*/

function connectDistance(na, nb, linkStrength = .1, linkStyle = {
    stroke: "none",
    "stroke-width": "0.005",
    fill: "lightcyan",
    opacity: "0.5"
}) {
    // Calculate the distance between the two nodes
    const dx = nb.pos.x - na.pos.x;
    const dy = nb.pos.y - na.pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Check if edge already exists
    const existingEdge = na.edges.find(edge => edge.pts.includes(nb) && nb.edges.includes(edge));
    if (existingEdge) {
        return existingEdge;
    }

    let edge = new Edge([na, nb], distance, linkStrength, linkStyle);

    na.edges.push(edge);
    nb.edges.push(edge);

    edges.push(edge);
    return edge;
}


function getConnectedNodes(node) {
    // Get the connected nodes
    let connectedNodes = node.edges ? node.edges
        .filter(edge => edge.pts && edge.pts.length === 2)
        .map(edge => edge.pts[0].uuid === node.uuid ? edge.pts[1] : edge.pts[0]) : [];

    // Check if connectedNodes have valid values and exclude the originating node itself
    connectedNodes = connectedNodes.filter(connectedNode =>
        connectedNode !== undefined &&
        connectedNode.uuid !== undefined &&
        connectedNode.uuid !== node.uuid);

    // console.log(`Identified ${connectedNodes.length} connected node(s)`);
    return connectedNodes;
}

function getNodeData(node) {
    const titleElement = node.content.querySelector("input.title-input");
    const title = titleElement ? titleElement.value : "No title found";
    const createdAt = node.createdAt;
    const isLLM = node.isLLM;  // Assuming you have this flag set on the node object.

    if (!createdAt) {
        console.warn(`getNodeData: Creation time for node ${node.uuid} is not defined.`);
    }

    if (isLLM) {
        // Handle AI nodes
        const lastPromptsAndResponses = getLastPromptsAndResponses(4, 400, node.id);
        const nodeInfo = `${tagValues.nodeTag} ${title} (AI Node)\nLast Prompts and Responses:${lastPromptsAndResponses}`;
        return nodeInfo;
    }

    // Check if the node contains an iframe editor
    let iframeElement = document.querySelector(`iframe[identifier='editor-${node.uuid}']`);
    if (iframeElement) {
        // Handle iframe editor content
        let iframeWindow = iframeElement.contentWindow;
        let htmlContent = iframeWindow.htmlEditor.getValue();
        let cssContent = iframeWindow.cssEditor.getValue();
        let jsContent = iframeWindow.jsEditor.getValue();

        const nodeInfo =
            `${tagValues.nodeTag} ${title}\n` +
            `Text Content: \n\`\`\`html\n${htmlContent}\n\`\`\`\n` +
            `\`\`\`css\n${cssContent}\n\`\`\`\n` +
            `\`\`\`javascript\n${jsContent}\n\`\`\``;
        return nodeInfo;
    } else {
        // Handle regular text content
        let contentText = getTextareaContentForNode(node);
        if (!contentText) {
            console.warn('No content found for node');
            return null;
        }
        const nodeInfo = `${tagValues.nodeTag} ${title}\nText Content: ${contentText}`;
        return nodeInfo;
    }
}

function topologicalSort(node, visited, stack, filterAfterLLM = false, branchUUID = undefined) {
    visited.add(node.uuid);

    // Push the node to the stack before checking the conditions.
    stack.push(node);

    if (node.isLLM) {
        if (branchUUID === null) {
            branchUUID = node.uuid;  // Assign new branch
        } else if (branchUUID !== node.uuid && branchUUID !== undefined) {
            // Different AI branch, so return after pushing the boundary node.
            return;
        }
    }

    let connectedNodes = getConnectedNodes(node);

    for (let connectedNode of connectedNodes) {
        if (visited.has(connectedNode.uuid)) continue;

        let nextFilterAfterLLM = connectedNode.isLLM ? true : filterAfterLLM;

        topologicalSort(connectedNode, visited, stack, nextFilterAfterLLM, branchUUID);
    }
}

function traverseConnectedNodes(node, callback, filterAfterLLM = false) {
    let visited = new Set();
    let stack = [];
    topologicalSort(node, visited, stack, filterAfterLLM, filterAfterLLM ? null : undefined);

    while (stack.length > 0) {
        let currentNode = stack.pop();

        if (currentNode.uuid === node.uuid) {
            continue;
        }

        callback(currentNode);
    }
}

function getAllConnectedNodesData(node, filterAfterLLM = false) {
    let allConnectedNodesData = [];

    traverseConnectedNodes(node, currentNode => {
        let currentNodeData = getNodeData(currentNode);
        allConnectedNodesData.push({ data: currentNodeData, isLLM: currentNode.isLLM });
    }, filterAfterLLM);

    return allConnectedNodesData;
}

function getAllConnectedNodes(node, filterAfterLLM = false) {
    let allConnectedNodes = [];

    traverseConnectedNodes(node, currentNode => {
        allConnectedNodes.push(currentNode);
    }, filterAfterLLM);

    return allConnectedNodes;
}