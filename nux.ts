export function steps(): { title: string, body: string }[] {
    return [
        {
            title: 'Welcome to Serenade!',
            body: '<p>This guide will walk you through an introduction to Serenade.</p>'
        },
        {
            title: 'Setup',
            body:
                "<p>You should keep Serenade open in a panel that's side-by-side with the code you're editing, " +
                "since you'll need to see what's displayed here.</p>"
        },
        {
            title: 'Tabs and alternatives',
            body:
                '<p>Start by pressing the Listen button above. Now, say "new tab" to create a new tab.</p>' +
                "<p>You might see a list of alternatives appear on screen. This list appears when Serenade isn't " +
                'exactly sure what you said. When it appears, you can say "clear" to clear the list and start over, ' +
                'continue speaking a command, or say "use" followed by the number you want to select, like "use one" ' +
                'or "use three".</p>'
        },
        {
            title: 'Save',
            body:
                '<p>Now, let\'s write some Python. First, say "save" to invoke the save dialog, then save the file ' +
                'as hello.py.</p>'
        },
        {
            title: 'Add import',
            body:
                '<p>Try saying "add import random" to add an import statement. Remember, you\'ll need to say ' +
                '"use one" in order to run the command, or "clear" to try again.</p>'
        },
        {
            title: 'Undo',
            body:
                '<p>If you accidentally select the wrong alternative, you can always say "undo" to go back. ' +
                '"redo" also works.</p>'
        },
        {
            title: 'Add function',
            body: '<p>Next, create a function by saying "add function get random", followed by a "use" command.</p>'
        },
        {
            title: 'Add parameter',
            body:
                '<p>You can add a parameter called "number" to your function by saying "add parameter number", ' +
                'followed by a "use" command.</p>'
        },
        {
            title: 'Add return',
            body: '<p>Let\'s give the function a body. Say "add return 4" to add a return statement.</p>'
        },
        {
            title: 'Cursor movement',
            body:
                '<p>You can move around the cursor with commands like "up", "next line", or "line one". ' +
                'Try saying "line one".</p>'
        },
        {
            title: 'Deletion',
            body: '<p>Now, to delete the import statement you added earlier, try saying "delete line".</p>'
        },
        {
            title: 'Learn more',
            body:
                "<p>That's it for our introduction! As a next step, take a look at the " +
                '<a href="https://docs.serenade.ai">Serenade guide</a> to learn more.</p>'
        }
    ];
}
