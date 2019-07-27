export function steps(): {title: string, body: string}[] {
    return [
        {
            title: 'Welcome to Serenade!',
            body: '<p>This guide will walk you through writing your first code with voice.</p>'
        },
        {
            title: 'Setup',
            body: '<p>You should keep Serenade open in a panel that\'s side-by-side with the code you\'re editing, ' +
                'since you\'ll need to see what\'s displayed here.</p>'
        },
        {
            title: 'Alternatives',
            body: '<p>As you speak, you\'ll see a list of alternatives appear below. ' +
                'This list appears when Serenade isn\'t exactly sure what you said. ' +
                'When it appears, you can say "clear" to clear the list and start over, ' +
                'or "use" followed by the number you want to select, like "use one" or "use three".</p>' +
                '<p>You can also pause while speaking, and Serenade will wait for you; there\'s no need to ' +
                'try to say an entire command in one breath.</p>'
        },
        {
            title: 'Adding code',
            body: '<p>Now, let\'s write some Python with voice. First, create a new Python file called hello.py. ' +
                'Then, press the "Listen" button above. Try saying:</p>' +
                '<code>add import random</code>' +
                '<p>To select an alternative, say "use" followed by the number you want. ' +
                'Or, you can say "clear" to try again.</p>'
        },
        {
            title: 'Undo',
            body: '<p>If you accidentally select the wrong alternative, you can always say "undo" to go back. ' +
                '"redo" also works.</p>'
        },
        {
            title: 'Add function',
            body: '<p>Next, create a new function by saying:</p>' +
                '<code>add function get random</code>' +
                '<p>Then, select which alternative you want with a "use" command.</p>'
        },
        {
            title: 'Add parameter',
            body: '<p>Add a parameter called "number" to that function by saying:</p>' +
                '<code>add parameter number</code>' +
                '<p>Then, say a "use" command.</p>'
        },
        {
            title: 'Add return',
            body: '<p>Let\'s give the function a body. Add a return statement by saying:</p>' +
                '<code>add return 4</code>' +
                '<p>Then, say a "use" command.</p>'
        },
        {
            title: 'Cursor movement',
            body: '<p>You can move around the cursor with commands like "up", "next line", or "line one". ' +
                'Try saying:</p>' +
                '<code>line one</code>'
        },
        {
            title: 'Deletion',
            body: '<p>Now, to delete the import statement you added earlier, say:</p>' +
                '<code>delete line</code>'
        },
        {
            title: 'Learn more',
            body: '<p>That\'s it for our introduction! As a next step, take a look at the ' +
                '<a href="https://docs.serenade.ai">Serenade guide</a> to learn more.</p>'
        }
    ];
}
