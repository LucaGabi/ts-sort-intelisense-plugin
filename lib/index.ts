import * as ts_module from "../node_modules/typescript/lib/tsserverlibrary";

function init(modules: { typescript: typeof ts_module }) {
    const ts = modules.typescript;

    function create(info: ts.server.PluginCreateInfo) {

        // Diagnostic logging
        info.project.projectService.logger.info(`Plugin "ts-sort-intelisense" loaded correctly`);

        // Set up decorator
        const proxy = Object.create(null) as ts.LanguageService;
        const oldLS = info.languageService;
        for (const k in oldLS) {
            (<any>proxy)[k] = function () {
                return oldLS[k].apply(oldLS, arguments);
            }
        }

        // Remove specified entries from completion list
        proxy.getCompletionsAtPosition = (fileName, position) => {
            const prior = info.languageService.getCompletionsAtPosition(fileName, position, {});
            const oldLength = prior.entries.length;
            prior.entries = prior.entries.sort((a, b) => {
                return ('' + a.kind).localeCompare(b.kind);
            })

            // Sample logging for diagnostic purposes
            // if (oldLength !== prior.entries.length) {
            //     info.project.projectService.logger.info(`Removed ${oldLength - prior.entries.length} entries from the completion list`);
            // }

            return prior;
        };

        return proxy;
    }

    return { create };
}

export = init;
