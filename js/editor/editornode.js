function createEditorNode(title = '', sx = undefined, sy = undefined, x = undefined, y = undefined) {
    // Create the wrapper div
    let wrapperDiv = document.createElement('div');
    wrapperDiv.style.width = '1100px'; // Set width of the wrapper
    wrapperDiv.style.height = '600px'; // Set height of the wrapper 
    wrapperDiv.style.overflow = 'none';

    let htmlContent = `<!DOCTYPE html>
<html lang="en" class="custom-scrollbar">
<head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/codemirror@5/lib/codemirror.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/codemirror@5/theme/dracula.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/codemirror@5/addon/scroll/simplescrollbars.css">

    <script src="https://cdn.jsdelivr.net/npm/codemirror@5/lib/codemirror.js"></script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.62.3/addon/scroll/simplescrollbars.js"></script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.62.3/mode/htmlmixed/htmlmixed.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.62.3/mode/xml/xml.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.62.3/mode/css/css.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.62.3/mode/javascript/javascript.min.js"></script>

    <style type="text/css">
        .editorcontainer {
            box-sizing: border-box;
            width: 100%;
            min-width: 100%;
            margin: auto;
            /* Add any other styles you want for the container here... */
        }

        body {
            background-color: #1f1f21;
            margin: 0;
            padding: 0px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        #editor-wrapper {
            box-sizing: border-box;
            display: flex;
            justify-content: space-between;
            height: 90vh;
            width: calc(100% - 20px); /* 10px margin on left and right side */
            max-width: 1200px;
            margin-bottom: 0px;
            margin-left: 10px; /* Left margin */
            resize: vertical; /* Allows vertical resizing */
            overflow: hidden; /* Contains the children */
        }

        .draggable-bar {
            box-sizing: border-box;
            width: 10px;
            height: 100%;
            cursor: ew-resize; /* East-west cursor */
            background-color: #262737;
            flex: none; /* No flex-grow, no flex-shrink */
        }

        .dragging {
            cursor: ew-resize !important;
        }

        #vertical-resize-handle {
            height: 5px;
            width: 100%;
            cursor: ns-resize;
            background-color: #262737; /* You can style this to match your theme */
        }

        .vertical-dragging {
            cursor: ns-resize !important;
        }

        .editor-container {
            height: 100%; /* Take full height of parent */
            margin: 0px 0px;
            background-color: #222226;
            padding: 0px;
            position: relative; /* Ensuring the child takes this height */
            flex: none; /* Ensure equal space division */
        }

        .editor-label {
            color: #888;
            font-size: 12px;
            padding: 15px;
            padding-left: 5px; /* Adjust this to move the text to the left */
            background-color: #262737;
            display: inline;
            margin: 0;
            line-height: 30px;
        }

        .CodeMirror {
            font-size: 12px;
            height: calc(100% - 32px); /* Adjusted for label height */
            width: 100%;
            position: absolute; /* Take full height of parent */
            bottom: 0; /* Align to the bottom of the container */
            overflow: hidden; /* Hide scrollbars */
        }

        .CodeMirror-simplescroll-horizontal, .CodeMirror-simplescroll-vertical {
            background: #222226 !important;
        }

            .CodeMirror-simplescroll-horizontal div, .CodeMirror-simplescroll-vertical div {
                background: #3f3f3f !important;
                border: 1px solid #555555;
                width: 6px !important;
            }

        .CodeMirror-simplescroll-scrollbar div:hover {
            background: #555 !important;
        }

            .CodeMirror-simplescroll-scrollbar div:hover {
                background: #555 !important;
            }
        .CodeMirror-scrollbar-filler, .CodeMirror-gutter-filler {
            background-color: #222226;
        }

        .custom-scrollbar::-webkit-scrollbar {
            width: 10px;
            height: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #3f3f3f;
        }

            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #555;
            }

        .custom-scrollbar::-webkit-scrollbar-corner {
            background: transparent;
            border: none;
        }

        .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #888 transparent;
        }

            .custom-scrollbar:hover {
                scrollbar-color: #555 transparent;
            }

        .no-select {
            user-select: none;
            -webkit-user-select: none;
            -ms-user-select: none;
        }
    </style>
</head>
<body>
    <div id="editor-container-wrapper" class="editorcontainer">
        <div id="editor-wrapper" class="custom-scrollbar">
            <div class="editor-container">
                <div class="editor-label">html</div>
                <div id="htmlEditor"></div>
            </div>
            <div class="draggable-bar"></div>
            <div class="editor-container">
                <div class="editor-label">css</div>
                <div id="cssEditor"></div>
            </div>
            <div class="draggable-bar"></div>
            <div class="editor-container">
                <div class="editor-label">js</div>
                <div id="jsEditor"></div>
            </div>
        </div>
        <div id="vertical-resize-handle"></div>
    </div>
        <script>
            var htmlEditor = CodeMirror(document.getElementById('htmlEditor'), {
                mode: 'htmlmixed', theme: 'dracula', lineNumbers: true, lineWrapping: false, scrollbarStyle: 'simple'
            });
            var cssEditor = CodeMirror(document.getElementById('cssEditor'), {
                mode: 'css', theme: 'dracula', lineNumbers: true, lineWrapping: false, scrollbarStyle: 'simple'
            });
            var jsEditor = CodeMirror(document.getElementById('jsEditor'), {
                mode: 'javascript', theme: 'dracula', lineNumbers: true, lineWrapping: false, scrollbarStyle: 'simple'
            });

            function refreshEditors() {
                htmlEditor.refresh();
                cssEditor.refresh();
                jsEditor.refresh();
            }

            window.requestAnimationFrame(refreshEditors);

            const draggableBars = document.querySelectorAll('.draggable-bar');
            const editorContainers = document.querySelectorAll('.editor-container');
            const draggableBarWidths = Array.from(draggableBars).reduce((total, bar) => total + bar.offsetWidth, 0);
            const initialEditorWidth = (editorContainers[0].parentElement.offsetWidth - draggableBarWidths) / 3;

            editorContainers.forEach(container => container.style.width = initialEditorWidth + 'px');

            let initialWidths;
            let initialX;


            function onMouseMoveLeft(e) {
                const dx = e.clientX - initialX;
                const newHtmlWidth = initialWidths.htmlWidth + dx;
                const newCssWidth = initialWidths.cssWidth - dx;

                if (newHtmlWidth > 10 && newCssWidth > 10) {
                    editorContainers[0].style.width = newHtmlWidth + 'px';
                    editorContainers[1].style.width = newCssWidth + 'px';
                }
            }

            function onMouseMoveRight(e) {
                const dx = e.clientX - initialX;
                const newJsWidth = initialWidths.jsWidth - dx;
                const newCssWidth = initialWidths.cssWidth + dx;

                if (newJsWidth > 10 && newCssWidth > 10) {
                    editorContainers[2].style.width = newJsWidth + 'px';
                    editorContainers[1].style.width = newCssWidth + 'px';
                }
            }

            function onMouseDown(e) {
                initialX = e.clientX;
                initialWidths = {
                    htmlWidth: editorContainers[0].offsetWidth,
                    cssWidth: editorContainers[1].offsetWidth,
                    jsWidth: editorContainers[2].offsetWidth
                };

                document.body.classList.add('no-select', 'dragging'); // Added 'dragging'
                if (e.target === draggableBars[0]) {
                    document.addEventListener('mousemove', onMouseMoveLeft);
                    document.addEventListener('mouseup', onMouseUp);
                } else {
                    document.addEventListener('mousemove', onMouseMoveRight);
                    document.addEventListener('mouseup', onMouseUp);
                }
            }

            function onMouseUp() {
                document.body.classList.remove('no-select', 'dragging'); // Removed 'dragging'
                document.removeEventListener('mousemove', onMouseMoveLeft);
                document.removeEventListener('mousemove', onMouseMoveRight);
                document.removeEventListener('mouseup', onMouseUp);
            }

            draggableBars.forEach(bar => bar.addEventListener('mousedown', onMouseDown));

            // Function to update editor widths
            function updateEditorWidth() {
                const editorWrapperWidth = editorContainers[0].parentElement.offsetWidth;
                const newWidth = (editorWrapperWidth - draggableBarWidths) / 3;
                editorContainers.forEach(container => container.style.width = newWidth + 'px');
                refreshEditors();
            }

            // Initial call to set the size
            updateEditorWidth();

            var verticalResizeHandle = document.getElementById('vertical-resize-handle');
            var editorWrapper = document.getElementById('editor-wrapper');
            var startY;
            var startHeight;

            function onVerticalDragStart(e) {
                startY = e.clientY;
                startHeight = editorWrapper.offsetHeight;
                document.body.classList.add('vertical-dragging');
                document.addEventListener('mousemove', onVerticalDragMove);
                document.addEventListener('mouseup', onVerticalDragEnd);
            }

            function onVerticalDragMove(e) {
                var dy = e.clientY - startY;
                var newHeight = startHeight + dy;
                editorWrapper.style.height = newHeight + 'px';
                refreshEditors(); // Refresh the editors to update their size
            }

            function onVerticalDragEnd() {
                document.body.classList.remove('vertical-dragging');
                document.removeEventListener('mousemove', onVerticalDragMove);
                document.removeEventListener('mouseup', onVerticalDragEnd);
            }

            verticalResizeHandle.addEventListener('mousedown', onVerticalDragStart);
        </script>
</body>
</html>`;

    const customScrollbarStyles = `
    <style>
        body::-webkit-scrollbar {
            width: 10px;
            height: 10px;
        }
        body::-webkit-scrollbar-thumb {
            background: #3f3f3f;
        }
        body::-webkit-scrollbar-thumb:hover {
            background: #555;
        }
        body {
            scrollbar-width: thin;
            scrollbar-color: #888 transparent;
        }
        body:hover {
            scrollbar-color: #555 transparent;
        }
    </style>
`;


    // Concatenate the CSS with the HTML
    htmlContent += customScrollbarStyles;

    // Create the iframe element with a data URI as the src attribute
    let iframeElement = document.createElement('iframe');
    iframeElement.style.overflow = `none`;
    iframeElement.style.width = '100%';
    iframeElement.style.height = '100%';
    iframeElement.style.border = '0';
    iframeElement.style.background = '#222226';
    iframeElement.sandbox = 'allow-same-origin allow-scripts';
    iframeElement.src = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;


    iframeElement.srcdoc = htmlContent;

    // Append the iframe to the wrapper div
    wrapperDiv.appendChild(iframeElement);

    // Generate a unique identifier for the iframe using the node's uuid
    let node = addNodeAtNaturalScale(title, [wrapperDiv]); // Use the wrapper div here
    iframeElement.setAttribute('identifier', 'editor-' + node.uuid); // Store the identifier

    node.content.style.width = '400px'; // Set the width to match the wrapper
    node.content.style.height = '400px'; // Set the height to match the wrapper

    // Update the existing title of the node
    if (node.title) {
        node.title.value = title;
    }

    return node;
}