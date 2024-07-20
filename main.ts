import { Plugin, Notice, TFile } from 'obsidian';

// MODALS
import { ProcessInboxModal } from './modals/processInboxModal';
import { ExampleModal } from './modals/exampleModal';
import { AddTaskToInboxModal } from './modals/addTaskToInboxModal';
import { ProcessSomedayModal } from 'modals/processSomedayModal';


export default class MyPlugin extends Plugin {

    async processInbox() {
        let tasks: string[];
        const filePath = 'GTD/Inbox.md';
        try {
          const fileContent = await this.app.vault.adapter.read(filePath);
          const tasks = fileContent.split('\n').filter(line => line.startsWith('- [ ]'));
          //this.tasks = tasks;

          new ProcessInboxModal(this.app, tasks).open();
        } catch (error) {
          console.error('Failed to read file:', error);
        }
      }

      //
    async onload() {

        this.addCommand({
            id: 'process-someday',
            name: 'Process Someday',
            callback: () => {
              new ProcessSomedayModal(this.app).open();
            }
          });

        this.addRibbonIcon('arrow-down-up', 'Process Someday', () => {
            new ProcessSomedayModal(this.app).open();
        });

        this.addCommand({
            id: 'process-inbox',
            name: 'process Inbox',
            callback: () => {
              this.processInbox();
            }
          });

        this.addRibbonIcon('folder-output', 'process Inbox', () => {
            this.processInbox();
        });


        /* **************************************************** */

        this.addCommand({
            id: "Create_Gtd_Structure",
            name: "Create Gtd Structure",
            callback: () => this.createGtdStructure()
        });

        this.addCommand({
            id: 'Add_Task_Inbox',
            name: 'Add Task to Inbox',
            callback: () => {
                new AddTaskToInboxModal(this.app, (text) => this.addTaskToIbox(text)).open();
            }
        });

        this.addRibbonIcon('package-plus', 'Add Task to Inbox', () => {
            new AddTaskToInboxModal(this.app, (text) => this.addTaskToIbox(text)).open();
        });

        /* **************************************************** */


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

        /* MY TEST */
        // This adds a status bar item to the bottom of the app. Does not work on mobile apps.
        const statusBarItemEl = this.addStatusBarItem();
        statusBarItemEl.setText('Status Bar Text');
    }

    onunload() {
        new Notice('unloading plugin');
    }

    //FUNCTIONS
    async createGtdStructure() {
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

    async addTaskToIbox(text: string) {
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
