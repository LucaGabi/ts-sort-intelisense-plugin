import * as ts_module from "typescript/lib/tsserverlibrary";

function init(modules: { typescript: typeof ts_module }) {
    const ts = modules.typescript;

    function create(info: ts.server.PluginCreateInfo) {

        let order = {};

        order[ts_module.ScriptElementKind.functionElement] = "zzz";
        order[ts_module.ScriptElementKind.localFunctionElement] = "zz";
        order[ts_module.ScriptElementKind.memberFunctionElement] = "z";
        order[ts_module.ScriptElementKind.callSignatureElement] = "z";
        order[ts_module.ScriptElementKind.callSignatureElement] = "z";

        // Diagnostic logging
        info.project.projectService.logger.info(`Plugin "ts-sort-intelisense" local loaded correctly`);

        // Set up decorator
        const proxy = Object.create(null) as ts.LanguageService;
        const oldLS = info.languageService;
        for (const k in oldLS) {
            proxy[k] = function () {
                return oldLS[k].apply(oldLS, arguments);
            }
        }

        proxy.getCompletionsAtPosition = (fileName, position) => {
            const prior = info.languageService.getCompletionsAtPosition(fileName, position, {})
                || <ts_module.WithMetadata<ts_module.CompletionInfo>>{
                    entries: [],
                    isGlobalCompletion: false,
                    isMemberCompletion: true,
                };

            prior.entries = prior.entries.sort((a, b) => {
                return ('' + a.kind).localeCompare(b.kind);
            });

            prior.entries = prior.entries.map(x => (x.sortText = order[x.kind] ?? x.kind, x));

            prior.entries.push(<ts_module.CompletionEntry>{
                kind: ts_module.ScriptElementKind.memberFunctionElement,
                insertText: 'g()',
                name: 'g',
                sortText: '_',
            });

            prior.entries.push(<ts_module.CompletionEntry>{
                kind: ts_module.ScriptElementKind.memberFunctionElement,
                insertText: 's()',
                name: 's',
                sortText: '_',
            });

            return prior;
        };

        return proxy;
    }

    return { create };
}

export = init;
