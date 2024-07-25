export async function createGtdStructure() {
    const vault = this.app.vault;
    const basePath = 'GTD';

    const folders = [
        basePath,
        `${basePath}/1. Projects`,
        `${basePath}/2. Stay`,
        `${basePath}/3. Someday`,
        `${basePath}/4. Archive`
    ];

    const files = [
        { name: `${basePath}/Inbox.md`, data: '' },
        { name: `${basePath}/Documentation.md`, data: '' },
        { name: `${basePath}/Follow.md`, data: '' }
    ];

    try {
        for await (const folder of folders) {
            try {
                await vault.createFolder(folder);
    
            } catch (e) {
                console.log(`Folder ${folder} already exists.`);
            }
        }
    
        for await (const file of files) {
            const { name, data } = file;
            try {
                await vault.create(`${name}`, `${data}`);
            } catch (e) {
                console.log(`File file already exists.`);
            }
        }

        return true;
    }
    catch(e){
        return false;
    }
}