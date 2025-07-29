module.exports = {
    skipFiles: [
        'mocks',
        'interface',
        'token'
    ],
    modifierWhitelist: [
        'onlyInitializing',
        'initializer',
        'nonReentrant',
        'whenNotPaused'
    ]
};