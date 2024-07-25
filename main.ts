import { Plugin, Notice } from 'obsidian';

// MODALS
import { ProcessInboxModal } from './modals/processInboxModal';
import { AddTaskToInboxModal } from './modals/addTaskToInboxModal';
import { ProcessFileModal } from 'modals/processFileModal';
import { TaskManagerModal } from 'modals/taskManagerModal';

//FUNCTIONS
import { processInbox } from 'functions/processInbox';
import { createGtdStructure } from 'functions/createGtdStructure';

export default class MyPlugin extends Plugin {

    async onload() {
        this.addCommand({
            id: "Create_Gtd_Structure",
            name: "Create Gtd Structure",
            callback: () => {
                createGtdStructure().then(result => {
                    if (result) {
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
                new AddTaskToInboxModal(this.app).open();
            }
        });

        this.addRibbonIcon('package-plus', 'Add Task to Inbox', () => {
            new AddTaskToInboxModal(this.app).open();
        });
        

        this.addCommand({
            id: 'open-task-manager',
            name: 'Open Task Manager',
            callback: () => {
                new TaskManagerModal(this.app).open();
            }
        });

        this.addRibbonIcon('calendar-clock', 'Open Task Manager', () => {
            new TaskManagerModal(this.app).open();
        });


        this.addCommand({
            id: 'process-file',
            name: 'Process File',
            callback: () => {
                new ProcessFileModal(this.app).open();
            }
        });

        this.addRibbonIcon('arrow-down-up', 'Process File', () => {
            new ProcessFileModal(this.app).open();
        });


        this.addCommand({
            id: 'process-inbox',
            name: 'Process Inbox',
            callback: () => {
                processInbox().then(tasks => {
                    new ProcessInboxModal(this.app, tasks).open();
                });
            }
        });

        this.addRibbonIcon('folder-output', 'Process Inbox', () => {
            processInbox().then(tasks => {
                new ProcessInboxModal(this.app, tasks).open();
            });
        });



    }


    onunload() {
        new Notice('unloading plugin');
    }
}
