module.exports = {
    skipFiles: [
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