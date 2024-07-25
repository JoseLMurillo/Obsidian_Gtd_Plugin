import { Plugin, Notice, TFile } from 'obsidian';

// MODALS
import { ProcessInboxModal } from './modals/processInboxModal';
import { ExampleModal } from './modals/exampleModal';
import { AddTaskToInboxModal } from './modals/addTaskToInboxModal';
import { ProcessFileModal } from 'modals/processFileModal';
import { TaskManagerModal } from 'modals/taskManagerModal';

//FUNCTIONS
import { processInbox } from 'functions/processInbox';
import { createGtdStructure } from 'functions/createGtdStructure';

export default class MyPlugin extends Plugin {

    async onload() {
        this.addCommand({
            id: 'open-task-manager-modal',
            name: 'Open Task Manager Modal',
            callback: () => {
              new TaskManagerModal(this.app).open();
            }
          });

        this.addRibbonIcon('calendar-clock', 'Open Task Manager Modal', () => {
            new TaskManagerModal(this.app).open();
        });


        this.addCommand({
            id: 'process-someday',
            name: 'Process Someday',
            callback: () => {
              new ProcessFileModal(this.app).open();
            }
          });

        this.addRibbonIcon('arrow-down-up', 'Process Someday', () => {
            new ProcessFileModal(this.app).open();
        });


        this.addCommand({
            id: 'process-inbox',
            name: 'process Inbox',
            callback: () => {
                processInbox().then( tasks => {
                    new ProcessInboxModal(this.app, tasks).open();
                });
            }
          });

        this.addRibbonIcon('folder-output', 'process Inbox', () => {
            processInbox().then( tasks => {
                new ProcessInboxModal(this.app, tasks).open();
            });
        });


        this.addCommand({
            id: "Create_Gtd_Structure",
            name: "Create Gtd Structure",
            callback: () => {
                createGtdStructure().then( result => {
                    if(result){
                        new Notice('GTD structure created!');
                    }
                    else {
                        new Notice('Error');
                    }
                });
            }
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
