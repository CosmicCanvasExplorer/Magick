// Globals manager is a singleton that allows us to register global variables that can be accessed from anywhere in the codebase. This is useful for things like the editor, which needs to be accessible from anywhere in the codebase.
// TODO: This pattern is fine for now, but we should probably use a dependency injection through the interface or something
class GlobalsManager {
    globals = new Map();
    registerGlobal(name: string, value: any) {
        this.globals.set(name, value);
    }

    getGlobal(name: string) {
        return this.globals.get(name);
    }
}

export const globalsManager = new GlobalsManager();