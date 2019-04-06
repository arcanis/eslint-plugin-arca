// This is my personal eslint configuration
// Feel free to use it if you like

var WARNING = 1;
var ERROR = 2;

module.exports = {

    plugins: [
        "arca",
    ],

    rules: {
        "arca/curly": [
            ERROR
        ],
        "arca/melted-constructs": [
            ERROR
        ],
        "arca/import-align": [
            ERROR
        ],
        "arca/import-ordering": [
            ERROR,
        ],
        "arca/newline-after-import-section": [
            ERROR,
        ],
        "arca/no-default-export": [
            ERROR
        ],
        "no-multiple-empty-lines": [
            ERROR,
            {max: 1}
        ],
        "no-trailing-spaces": [
            ERROR
        ]
    }

};
