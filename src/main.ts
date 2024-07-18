import { Plugin, Notice } from 'obsidian';

export default class GTDAdmin extends Plugin {

    async createGtdStructure() {
        const vault = this.app.vault;
        const basePath = 'GTD';

        const folders = [
            basePath,
            `${basePath}/1. Proyects`,
            `${basePath}/2. Stay`,
            `${basePath}/3. Someday`,
            `${basePath}/4. archive`
        ];

        const files = [
            { name: `${basePath}/Inbox.md`, data: '' },
            { name: `${basePath}/Documentation.md`, data: '' },
            { name: `${basePath}/Follow.md`, data: '' }
        ];

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

        new Notice('GTD structure created!');
    }

    async onload() {
        this.addCommand({
            id: "Create_Gtd_Structure",
            name: "Create Gtd Structure",
            callback: () => this.createGtdStructure()
        });
    }

    onunload() {
        new Notice('GTDAdmin was disabled');
    }
}