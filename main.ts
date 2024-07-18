import { Plugin, Notice, TFile } from 'obsidian';
import { ExampleModal, AddTaskModal, processTask } from './modals';

export default class MyPlugin extends Plugin {

    async onload() {
        this.addCommand({
            id: 'Process_Task',
            name: 'Process Task',
            callback: () => {
                new processTask(this.app, 'Tarea').open();
            }
        })

        this.addCommand({
            id: "Create_Gtd_Structure",
            name: "Create Gtd Structure",
            callback: () => this.createGtdStructure()
        });

        this.addCommand({
            id: 'Add_Task_Inbox',
            name: 'Add Task to Inbox',
            callback: () => {
                new AddTaskModal(this.app, (text) => this.addTextToIbox(text)).open();
            }
        });

        this.addRibbonIcon('package-plus', 'Add Task to Inbox', () => {
            new AddTaskModal(this.app, (text) => this.addTextToIbox(text)).open();
        });


        this.addCommand({
            id: "display-modal",
            name: "Display modal",
            callback: () => {
                new ExampleModal(this.app, (result) => {
                    new Notice(`Hello, ${result}!`);
                }).open();
            },
        });


        const item = this.addStatusBarItem();
        item.createEl("span", { text: "Hello from the status bar 👋" });


        this.addCommand({
            id: "print-greeting-to-console",
            name: "Print greeting to console",
            callback: () => {
                console.log("Hey, you!");
                new Notice('Hey, you!');

            },
        });

        this.addRibbonIcon('dice', 'Mostrar mensaje', () => {
            new Notice('Muestra un mensaje como toast');
        });

        /* MY TEST */
        // This adds a status bar item to the bottom of the app. Does not work on mobile apps.
        const statusBarItemEl = this.addStatusBarItem();
        statusBarItemEl.setText('Status Bar Text');
    }

    onunload() {
        console.log('unloading plugin');
    }

    //FUNCTIONS
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


    async addTextToIbox(text: string) {
        const filePath = 'GTD/Inbox.md';
        const file = this.app.vault.getAbstractFileByPath(filePath);

        if (file instanceof TFile && text.trim() !== '') {
            try {
                text = `- [ ] ${text}`;
                let content = await this.app.vault.read(file);

                const insertPosition = content.indexOf('# Done');
                if (insertPosition !== -1) {
                    const before = content.substring(0, insertPosition);
                    const after = content.substring(insertPosition);
                    content = before + text + '\n' + after;
                } else {
                    content += '\n' + text;
                }

                await this.app.vault.modify(file, content);
                new Notice('Task added to inbox');

            }
            catch (e) {
                new Notice('ERROR');

                console.log(`Error ${e}`)
            }

        }
    }
}